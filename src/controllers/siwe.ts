import { Request, Response } from "express";

import { generateNonce, SiweMessage } from "siwe";

export const attachNonce = async (
  req: Request,
  res: Response
  // next: NextFunction
) => {
  req.session.nonce = generateNonce();
  req.session.save();
  res.status(200).send(req.session.nonce);
};

export const verifyMessage = async (req: Request, res: Response) => {
  try {
    const { message, signature } = req.body;

    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (fields.data.nonce !== req.session.nonce)
      return res.status(422).json({ message: "Invalid nonce." });

    req.session.siwe = fields;

    req.session.save();
    res.json({ ok: true });
  } catch (_error) {
    console.error("verifyMessage-error:", _error);
    res.status(401).json({ ok: false });
  }
};
