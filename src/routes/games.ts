import { Router } from "express";
import { verifyUser } from "../middleware/authentication/siwe";
import {
  createGame,
  getGamesForJoiner,
  joinGame,
} from "../controllers/games/games";

export const gameRouter = Router();

gameRouter.post("/game", verifyUser, createGame);
gameRouter.post("/move", verifyUser, joinGame);
gameRouter.get("/game", getGamesForJoiner);
