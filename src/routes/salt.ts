import { Router } from "express";
import { generateSalt } from "../controllers/salt";
import { verifyUser } from "../middleware/authentication/siwe";

export const saltRouter = Router();

saltRouter.post("/salt", verifyUser, generateSalt);
