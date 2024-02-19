import { Request, Response } from "express";
import { encodePacked, isAddressEqual, keccak256 } from "viem";
import { EthAddress, EthHash, isEthAddress } from "../../types/web3";
import { games } from "../../config/init";
import {
  GameOverReqBody,
  JoinerTimedOutResponse,
  Moves,
  SolveGameResponse,
  Winner,
  isCreateGameReqBody,
  isGameOverReqBody,
  isJoinGameReqBody,
  isSolveGameReqBody,
} from "./types";
import { RPS_ARTIFACT } from "../../artifacts/RPS";
import { gameIo } from "../..";

// side-effect: contract created without this e.g: through etherscan etc. cannot be used.
// with more time, add a feature for submitting create-contract-transactions which has not initially gone through this
export const createGame = async (req: Request, res: Response) => {
  try {
    const createGameReqBody = req.body;
    if (!isCreateGameReqBody(createGameReqBody))
      return res
        .status(400)
        .json({ message: "request not formatted correctly" });

    const { gameCreationTxHash, salt, userAddress } = createGameReqBody;

    const txReceipt = await games.publicClient.waitForTransactionReceipt({
      hash: gameCreationTxHash,
    });

    if (!isAddressEqual(txReceipt.from, userAddress))
      return res
        .status(401)
        .json({ message: "contract creator is not sender" });

    const createdGameAddress = txReceipt.contractAddress;

    if (!createdGameAddress || !isEthAddress(createdGameAddress))
      return res.status(400).json({ message: "contract not created" });

    const isFetchedByteCodeCorrect = await getIsFetchedByteCodeCorrect(
      createdGameAddress
    );

    if (!isFetchedByteCodeCorrect)
      return res.status(400).json({ message: "incorrect contract created" });

    const creatorIdentifier = await games.insertGameAndGetCreatorIdentifier(
      gameCreationTxHash,
      salt,
      createdGameAddress,
      userAddress
    );

    const lastAction = await games.getContractLastAction(createdGameAddress);

    return res.status(201).json({
      ok: true,
      message: "game record saved",
      creatorIdentifier,
      createdGameAddress,
      lastAction,
    });
  } catch (e) {
    console.error("createGame-error:", e);
    return res.status(500);
  }
};

export const joinGame = async (req: Request, res: Response) => {
  try {
    const joinGameReqBody = req.body;
    if (!isJoinGameReqBody(joinGameReqBody))
      return res
        .status(400)
        .json({ message: "request not formatted correctly" });

    const { userAddress, contractAddress, playGameTxHash } = joinGameReqBody;

    const creatorIdentifier = await validateJoinerAndReturnCreatorIdentifier(
      playGameTxHash,
      contractAddress,
      userAddress,
      res
    );

    if (!creatorIdentifier) return;

    const joinerIdentifier = games.saveAndReturnJoinerIdentifier(
      contractAddress,
      userAddress
    );

    games.gameIdentifers.set(contractAddress, {
      creatorIdentifier,
      joinerIdentifier,
    });

    const lastAction = await games.getContractLastAction(contractAddress);

    gameIo.gameServer.to(creatorIdentifier).emit("game:joiner-played");

    res.status(200).json({
      ok: true,
      message: "joiner played game",
      lastAction,
      joinerIdentifier,
    });
  } catch (e) {
    console.error("joinGame-error:", e);
    return res.status(500);
  }
};

export const getGamesForJoiner = async (req: Request, res: Response) => {
  try {
    const joinerAddress = req.query.joinerAddress;
    if (!isEthAddress(joinerAddress))
      return res
        .status(400)
        .json({ message: "joinerAddress not formatted correctly" });

    const gamesForJoiner = await games.getGamesForJoinerAddress(joinerAddress);

    return res.status(200).json({ gamesForJoiner });
  } catch (e) {
    console.error("getGamesForJoiner-error:", e);
    return res.status(500);
  }
};

export const endGame = async (req: Request, res: Response) => {
  try {
    const gameOverReqBody = req.body;

    if (!isGameOverReqBody(gameOverReqBody))
      return res
        .status(400)
        .json({ message: "request not formatted correctly" });

    const { userAddress, contractAddress, hasCreatorTimedOut } =
      gameOverReqBody;

    const identifiers = games.gameIdentifers.get(contractAddress);

    if (identifiers === undefined)
      return res.status(400).json({ message: "no corresponding contract" });

    const isTxToSmartContract = await getIsTxToSmartContract(
      gameOverReqBody,
      res
    );

    if (!isTxToSmartContract) return false;

    const joinerAddressPromise = games.getJoinerAddressForGame(contractAddress);
    const contractCreatorAddressPromise =
      games.getContractCreator(contractAddress);

    const [joinerAddress, contractCreator] = await Promise.all([
      joinerAddressPromise,
      contractCreatorAddressPromise,
    ]);

    if (
      joinerAddress !== null &&
      isAddressEqual(userAddress, joinerAddress) &&
      hasCreatorTimedOut
    ) {
      return creatorHasTimedOut(contractAddress, res);
    }

    if (isAddressEqual(userAddress, contractCreator)) {
      return endGameAsCreator(gameOverReqBody, res);
    }
  } catch (e) {
    console.error("createGame-error:", e);
    return res.status(500);
  }
};

async function getIsTxToSmartContract(
  gameOverReqBody: GameOverReqBody,
  res: Response
): Promise<boolean> {
  const { userAddress, contractAddress, gameEndTxHash } = gameOverReqBody;

  const txDetails = await games.publicClient.getTransaction({
    hash: gameEndTxHash,
  });

  const { from, to } = txDetails;

  if (
    !isAddressEqual(from, userAddress) ||
    to === null ||
    !isAddressEqual(to, contractAddress)
  ) {
    res.status(400).json({ message: "incorrect tx sent" });
    return false;
  }

  return true;
}

async function creatorHasTimedOut(contractAddress: EthAddress, res: Response) {
  const identifiers = games.gameIdentifers.get(contractAddress);
  if (identifiers === undefined) throw "game not created";

  const canTimeOut = await validateCreatorCanTimeOut(contractAddress, res);

  if (!canTimeOut) return;

  await games.gameOver(contractAddress);

  res.status(200).json({ creatorHasTimedOut: true, message: "game over" });

  gameIo.gameServer
    .to(identifiers.creatorIdentifier)
    .emit("game:joiner-creatorTimedOut");

  games.gameIdentifers.delete(contractAddress);
}

async function validateCreatorCanTimeOut(
  contractAddress: EthAddress,
  res: Response
): Promise<boolean> {
  const c2Promise = games.publicClient.readContract({
    address: contractAddress,
    abi: RPS_ARTIFACT.abi,
    functionName: "c2",
  });

  const lastActionPromise = games.publicClient.readContract({
    address: contractAddress,
    abi: RPS_ARTIFACT.abi,
    functionName: "lastAction",
  });

  const [c2, lastAction] = await Promise.all([c2Promise, lastActionPromise]);
  if (c2 === Moves.Null) {
    res.status(400).json({ message: "joiner hasn't played yet" });
    return false;
  }
  const timeNowInSeconds = Date.now() / 1000;

  const hasTimeoutTimePassed =
    timeNowInSeconds > Number(lastAction) + CONTRACT_TIMEOUT + bufferTime;

  if (!hasTimeoutTimePassed) {
    res.status(400).json({
      message: "cannot timeout yet",
    });
    return false;
  }

  return true;
}

async function endGameAsCreator(
  gameOverReqBody: GameOverReqBody,
  res: Response
) {
  const { contractAddress } = gameOverReqBody;
  const c2 = await games.publicClient.readContract({
    address: contractAddress,
    abi: RPS_ARTIFACT.abi,
    functionName: "c2",
  });

  if (c2 === Moves.Null) {
    const canTimeOut = await validateJoinerCanTimeOut(contractAddress, res);
    if (!canTimeOut) return;

    await games.gameOver(contractAddress);

    // cannot inform joiner via sockets as they have not interacted with the backend yet

    const joinerTimedOutResponse: JoinerTimedOutResponse = {
      joinerHasTimedOut: true,
      message: "game over",
    };

    res.status(200).json(joinerTimedOutResponse);

    games.gameIdentifers.delete(contractAddress);
  } else {
    solveGame(gameOverReqBody, c2, res);
  }
}

async function validateJoinerCanTimeOut(
  contractAddress: EthAddress,
  res: Response
): Promise<boolean> {
  const lastAction = await games.publicClient.readContract({
    address: contractAddress,
    abi: RPS_ARTIFACT.abi,
    functionName: "lastAction",
  });
  const timeNowInSeconds = Date.now() / 1000;

  const hasTimeoutTimePassed =
    timeNowInSeconds > Number(lastAction) + CONTRACT_TIMEOUT + bufferTime;

  if (!hasTimeoutTimePassed) {
    res.status(400).json({ message: "cannot timeout yet" });
    return false;
  }

  return true;
}

async function solveGame(
  gameOverReqBody: GameOverReqBody,
  c2: number,
  res: Response
) {
  if (!isSolveGameReqBody(gameOverReqBody))
    return res
      .status(400)
      .json({ message: "solve game request not properly formatter" });

  const {
    contractAddress,
    creatorMove,
    userAddress: creatorAddress,
  } = gameOverReqBody;

  const identifiers = games.gameIdentifers.get(contractAddress);
  if (!identifiers || !identifiers.joinerIdentifier) {
    throw "player or joiner not found";
  }

  const c1Hash = await games.publicClient.readContract({
    address: contractAddress,
    abi: RPS_ARTIFACT.abi,
    functionName: "c1Hash",
  });

  const { move, salt } = creatorMove;

  const hashedMove = keccak256(
    encodePacked(["uint8", "uint256"], [move, BigInt(salt)])
  );

  if (c1Hash !== hashedMove)
    return res
      .status(400)
      .json({ message: "hash of creator doesn't match up" });

  const winner = win(move, c2);

  await games.gameOver(contractAddress);

  let winnerAddress: EthAddress | undefined = undefined;

  if (winner === "creator") winnerAddress = creatorAddress;
  else if (winner === "joiner") {
    const joinerAddress = await games.getJoinerAddressForGame(contractAddress);
    if (joinerAddress && isEthAddress(joinerAddress))
      winnerAddress = joinerAddress;
  }

  const solveGameResponse: SolveGameResponse = {
    solved: true,
    winner,
    winnerAddress,
  };

  res.status(200).json(solveGameResponse);

  gameIo.gameServer
    .to(identifiers.joinerIdentifier)
    .emit("game:creator-solved", winner, winnerAddress);

  games.gameIdentifers.delete(contractAddress);
}

async function getIsFetchedByteCodeCorrect(
  contractAddr: EthAddress
): Promise<boolean> {
  const fetchedBytecode = await games.publicClient.getBytecode({
    address: contractAddr,
  });
  if (fetchedBytecode === RPS_ARTIFACT.deployedBytecode) return true;
  return false;
}

async function validateJoinerAndReturnCreatorIdentifier(
  playGameTxHash: EthHash,
  contractAddress: EthAddress,
  userAddress: EthAddress,
  res: Response
): Promise<false | string> {
  // check identifiers first - it's fast and cheap
  const identifiers = games.gameIdentifers.get(contractAddress);

  if (identifiers === undefined) {
    res.status(400).json({ message: "no corresponding contract" });
    return false;
  }

  // then validate blockchain details
  const txDetailsPromise = games.publicClient.getTransaction({
    hash: playGameTxHash,
  });

  const joinerMovePromise = games.publicClient.readContract({
    address: contractAddress,
    abi: RPS_ARTIFACT.abi,
    functionName: "c2",
  });

  const joinerAddressPromise = games.publicClient.readContract({
    address: contractAddress,
    abi: RPS_ARTIFACT.abi,
    functionName: "j2",
  });

  const [txDetails, joinerMove, joinerAddress] = await Promise.all([
    txDetailsPromise,
    joinerMovePromise,
    joinerAddressPromise,
  ]);

  const { from, to } = txDetails;

  if (!isAddressEqual(joinerAddress, userAddress)) {
    res
      .status(401)
      .json({ message: "joiner address cannot play this contract" });
    return false;
  }

  if (
    !isAddressEqual(from, userAddress) ||
    to === null ||
    !isAddressEqual(to, contractAddress)
  ) {
    res.status(400).json({ message: "incorrect tx sent" });
    return false;
  }

  if (joinerMove === Moves.Null) {
    res.status(400).json({ message: "move not played" });
    return false;
  }

  return identifiers.creatorIdentifier;
}

function win(move1: Moves, move2: Moves): Winner {
  if (move1 === move2) {
    return "draw";
  } else if (move1 === Moves.Null) {
    return "incomplete";
  } else if (
    (move1 === Moves.Rock &&
      (move2 === Moves.Scissors || move2 === Moves.Lizard)) ||
    (move1 === Moves.Paper &&
      (move2 === Moves.Rock || move2 === Moves.Spock)) ||
    (move1 === Moves.Scissors &&
      (move2 === Moves.Paper || move2 === Moves.Lizard)) ||
    (move1 === Moves.Spock &&
      (move2 === Moves.Scissors || move2 === Moves.Rock)) ||
    (move1 === Moves.Lizard && (move2 === Moves.Spock || move2 === Moves.Paper))
  ) {
    return "creator";
  } else {
    return "joiner";
  }
}

// as the contract TIMEOUT is fixed, I am declaring the value here as a const. For a varying value, I could fetch from the contract when using it;
const FIVE_MINUTES_IN_SECONDS = 300;
const CONTRACT_TIMEOUT = FIVE_MINUTES_IN_SECONDS;

// block.timestamp is accurate to ~10 seconds, so we have a bit of a buffer
const FIVE_SECONDS = 5;
const bufferTime = FIVE_SECONDS;
