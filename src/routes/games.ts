import { Router } from "express";
import { verifyUser } from "../middleware/authentication/siwe";
import { createGame } from "../controllers/games";

export const gameRouter = Router();

gameRouter.post("/game", verifyUser, createGame);
