import { Router } from "express";

import { logout, attachNonce, verifyMessage } from "../controllers/siwe";

export const siweRouter = Router();

siweRouter.get("/nonce", attachNonce);
siweRouter.post("/verify", verifyMessage);
siweRouter.post("/logout", logout);
