import { Request, Response } from "express";
import { salt } from "../config/init";
import { isEthAddress } from "../types/web3";

export const generateSalt = async (req: Request, res: Response) => {
  try {
    const userAddress = req.body.userAddress as unknown;

    if (!userAddress || !isEthAddress(userAddress))
      return res.status(401).json({ message: "not authenticated" });
    const generatedSalt = await salt.generateSaltForUser(userAddress);
    return res.status(201).json({ salt: generatedSalt });
  } catch (_error) {
    console.error("generateSalt-error:", _error);
    res.status(500).json({ ok: false });
  }
};
