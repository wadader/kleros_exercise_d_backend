import { Request, Response } from "express";
import { generateNonce, SiweMessage } from "siwe";
import { logins } from "../../config/init";

export const attachNonce = async (req: Request, res: Response) => {
  req.session.nonce = generateNonce();
  req.session.save();
  res.status(200).send(req.session.nonce);
};

export const verifyMessage = async (req: Request, res: Response) => {
  try {
    const { message, signature } = req.body;

    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    const messageNonce = fields.data.nonce;

    console.log("messageNonce:", messageNonce);
    console.log("fields.data.nonce:", fields.data.nonce);
    console.log("fields.data:", fields.data);

    if (messageNonce !== req.session.nonce)
      return res.status(422).json({ message: "Invalid nonce." });

    if (await logins.getDoesNonceExist(messageNonce))
      return res.status(403).json({ message: "nonce used" });

    req.session.siwe = fields;

    logins.saveNonce(fields.data.nonce);

    req.session.save();
    res.json({ ok: true });
  } catch (_error) {
    console.error("verifyMessage-error:", _error);
    res.status(401).json({ ok: false });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    req.session.destroy((err) => {
      if (err) throw err;
      return res.json({ ok: true });
    });
  } catch (_error) {
    console.error("Logout-error:", _error);
    res.status(500).json({ ok: false });
  }
};
