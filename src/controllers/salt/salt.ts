import { Request, Response } from "express";
import { isEthAddress } from "../../types/web3";
import { salt } from "../../config/init";

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

export const getSaltForGame = async (req: Request, res: Response) => {
  try {
    const contractAddress = req.query.contractAddress as unknown;
    const userAddress = req.body.userAddress as unknown; // this comes from the auth middleware

    if (!isEthAddress(contractAddress))
      return res.status(400).json({ message: "contractAddress incorrect" });

    if (!isEthAddress(userAddress))
      return res.status(401).json({ message: "not signed in" });

    const saltForGame = await salt.getSaltForGame(contractAddress, userAddress);

    if (!saltForGame)
      return res.status(400).json({ message: "no salt for game" });

    return res.status(200).json({ salt: saltForGame });
  } catch (_error) {
    console.error("getSaltForGame-error:", _error);
    res.status(500).json({ ok: false });
  }
};
