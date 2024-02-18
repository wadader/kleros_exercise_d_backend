import { Router } from "express";
import { verifyUser } from "../middleware/authentication/siwe";
import {
  createGame,
  endGame,
  getGamesForJoiner,
  joinGame,
} from "../controllers/games/games";

export const gameRouter = Router();

gameRouter.post("/game", verifyUser, createGame);
gameRouter.post("/move", verifyUser, joinGame);
gameRouter.post("/over", verifyUser, endGame);
gameRouter.get("/game", getGamesForJoiner);
