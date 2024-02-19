import { Request, Response } from "express";
import { salt } from "../../config/init";

export const generateSalt = async (_req: Request, res: Response) => {
  try {
    const generatedSalt = salt.getNewSalt();
    return res.status(201).json({ salt: generatedSalt });
  } catch (_error) {
    console.error("generateSalt-error:", _error);
    res.status(500).json({ ok: false });
  }
};
