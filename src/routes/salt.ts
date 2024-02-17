import { Router } from "express";
import { verifyUser } from "../middleware/authentication/siwe";
import { generateSalt, getSaltForGame } from "../controllers/salt/salt";

export const saltRouter = Router();

saltRouter.post("/salt", verifyUser, generateSalt);
saltRouter.get("/salt", verifyUser, getSaltForGame);
