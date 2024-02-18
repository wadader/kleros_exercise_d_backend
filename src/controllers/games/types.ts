import { EthAddress, EthHash, isEthAddress, isHash } from "../../types/web3";

function isAuthenticatedRequest(_obj: unknown): _obj is AuthenticatedRequest {
  if (typeof _obj !== "object" || _obj === null) {
    return false;
  }

  if ("userAddress" in _obj && isEthAddress(_obj.userAddress)) return true;
  return false;
}

function isCreateGameReqBody(_obj: unknown): _obj is CreateGameReqBody {
  if (!isAuthenticatedRequest(_obj)) return false;
  if (
    "gameCreationTxHash" in _obj &&
    typeof _obj.gameCreationTxHash === "string" &&
    isHash(_obj.gameCreationTxHash) &&
    "salt" in _obj &&
    typeof _obj.salt === "string"
  )
    return true;
  return false;
}

function isJoinGameReqBody(_obj: unknown): _obj is JoinGameReqBody {
  if (!isAuthenticatedRequest(_obj)) return false;

  if (
    "contractAddress" in _obj &&
    isEthAddress(_obj.contractAddress) &&
    "playGameTxHash" in _obj &&
    isHash(_obj.playGameTxHash)
  )
    return true;
  return false;
}

function isGameOverReqBody(_obj: unknown): _obj is GameOverReqBody {
  if (!isAuthenticatedRequest(_obj)) return false;

  if (
    "contractAddress" in _obj &&
    isEthAddress(_obj.contractAddress) &&
    "gameEndTxHash" in _obj &&
    isHash(_obj.gameEndTxHash)
  )
    return true;
  return false;
}

function isSolveGameReqBody(_obj: unknown): _obj is SolveGameReqBody {
  if (!isGameOverReqBody(_obj)) return false;

  if ("creatorMove" in _obj && "move") {
    const creatorMoveObj = _obj.creatorMove;
    if (typeof creatorMoveObj !== "object" || creatorMoveObj === null) {
      return false;
    }
    if (
      "move" in creatorMoveObj &&
      typeof creatorMoveObj.move === "number" &&
      isValidMove(creatorMoveObj.move) &&
      "salt" in creatorMoveObj &&
      typeof creatorMoveObj.salt === "string"
    )
      return true;
  }

  return false;
}

function isValidMove(moveOption: number | null): moveOption is Moves {
  if (moveOption === null) return false;
  if (moveOption in Moves) return true;
  return false;
}

interface CreateGameReqBody extends AuthenticatedRequest {
  gameCreationTxHash: EthHash;
  salt: string;
}

interface JoinGameReqBody extends AuthenticatedRequest {
  contractAddress: EthAddress;
  playGameTxHash: EthHash;
}

interface SolveGameReqBody extends GameOverReqBody {
  creatorMove: {
    move: Moves;
    salt: string;
  };
}

interface GameOverReqBody extends AuthenticatedRequest {
  contractAddress: EthAddress;
  gameEndTxHash: EthHash;
  hasCreatorTimedOut?: true; // this discriminator is required in the case joiner and creator are the same
}

interface AuthenticatedRequest {
  userAddress: EthAddress; // this comes from the auth middleware
}

enum Moves {
  Null,
  Rock,
  Paper,
  Scissors,
  Spock,
  Lizard,
}

type Winner = "draw" | "incomplete" | "creator" | "joiner";

interface SolveGameResponse {
  solved: true;
  winner: Winner;
  winnerAddress?: EthAddress;
}

interface JoinerTimedOutResponse {
  joinerHasTimedOut: true;
  message: "game over";
}

export {
  isCreateGameReqBody,
  isJoinGameReqBody,
  isGameOverReqBody,
  isSolveGameReqBody,
  Moves,
};

export type {
  GameOverReqBody,
  SolveGameReqBody,
  Winner,
  SolveGameResponse,
  JoinerTimedOutResponse,
};
