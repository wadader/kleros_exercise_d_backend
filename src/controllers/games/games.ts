import { Request, Response } from "express";
import { isAddressEqual } from "viem";
import { isEthAddress } from "../../types/web3";
import { games } from "../../config/init";
import { isCreateGameReqBody, isJoinGameReqBody } from "./types";
import { RPS_ARTIFACT } from "../../artifacts/RPS";
import { gameIo } from "../..";

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

    const creatorIdentifier = await games.insertGameAndGetCreatorIdentifier(
      gameCreationTxHash,
      salt,
      createdGameAddress,
      userAddress
    );

    const lastAction = await games.getContractLastAction(createdGameAddress);

    return res
      .status(201)
      .json({
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

    const {
      userAddress,
      contractAddress,
      playGameTxHash: txHash,
    } = joinGameReqBody;

    const txDetails = await games.publicClient.getTransaction({
      hash: txHash,
    });

    const { from, to } = txDetails;

    const joinerAddress = await games.publicClient.readContract({
      address: contractAddress,
      abi: RPS_ARTIFACT.abi,
      functionName: "j2",
    });

    if (!isAddressEqual(joinerAddress, userAddress))
      return res
        .status(401)
        .json({ message: "joiner address cannot play this contract" });

    if (from !== userAddress && to !== contractAddress)
      return res.status(400).json({ message: "incorrect tx sent" });

    res.status(200).json({ ok: true, message: "joiner played game" });

    const identifiers = games.gameIdentifers.get(contractAddress);

    if (identifiers)
      gameIo.gameServer
        .to(identifiers.creatorIdentifier)
        .emit("game:joiner-played");
  } catch (e) {
    console.error("createGame-error:", e);
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
    console.error("createGame-error:", e);
    return res.status(500);
  }
};
