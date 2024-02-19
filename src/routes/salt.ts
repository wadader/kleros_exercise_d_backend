import { Router } from "express";
import { generateSalt } from "../controllers/salt/salt";

export const saltRouter = Router();

saltRouter.post("/salt", generateSalt);
