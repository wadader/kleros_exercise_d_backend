import { EthAddress, Hash, isEthAddress, isHash } from "../../types/web3";

function isCreateGameReqBody(_obj: unknown): _obj is CreateGameReqBody {
  if (typeof _obj !== "object" || _obj === null) {
    return false;
  }

  if (
    "gameCreationTxHash" in _obj &&
    typeof _obj.gameCreationTxHash === "string" &&
    isHash(_obj.gameCreationTxHash) &&
    "salt" in _obj &&
    typeof _obj.salt === "string" &&
    "userAddress" in _obj &&
    isEthAddress(_obj.userAddress)
  )
    return true;
  return false;
}

interface CreateGameReqBody {
  gameCreationTxHash: Hash;
  salt: string;
  userAddress: EthAddress; // this comes from the auth middleware
}

function isJoinGameReqBody(_obj: unknown): _obj is JoinGameReqBody {
  if (typeof _obj !== "object" || _obj === null) {
    return false;
  }

  if (
    "userAddress" in _obj &&
    isEthAddress(_obj.userAddress) &&
    "contractAddress" in _obj &&
    isEthAddress(_obj.contractAddress) &&
    "playGameTxHash" in _obj &&
    isHash(_obj.playGameTxHash)
  )
    return true;
  return false;
}

interface JoinGameReqBody {
  contractAddress: EthAddress;
  playGameTxHash: Hash;
  userAddress: EthAddress; // this comes from the auth middleware
}

export { isCreateGameReqBody, isJoinGameReqBody };
