import { Request, Response } from "express";
import { isAddressEqual, isHash } from "viem";
import { EthAddress, Hash, isEthAddress } from "../../types/web3";
import { games } from "../../config/init";

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

    console.log("txReceipt:", txReceipt);
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

    return res
      .status(201)
      .json({ ok: true, message: "game record saved", creatorIdentifier });
  } catch (e) {
    console.error("createGame-error:", e);
    return res.status(500);
  }
};

interface CreateGameReqBody {
  gameCreationTxHash: Hash;
  salt: string;
  userAddress: EthAddress; // this comes from the auth middleware
}

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