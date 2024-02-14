import { Router } from "express";

import { attachNonce, verifyMessage } from "../controllers/siwe";

export const siweRouter = Router();

siweRouter.get("/nonce", attachNonce);
siweRouter.post("/verify", verifyMessage);
