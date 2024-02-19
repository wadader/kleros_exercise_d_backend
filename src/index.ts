import express from "express";
import { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { SiweResponse } from "siwe";
import Session from "express-session";

import { env_Vars } from "./config/init";
import { siweRouter } from "./routes/auth/siwe";
import { saltRouter } from "./routes/salt";
import { gameRouter } from "./routes/games";
import { GameIo } from "./controllers/games/socket/socket";

const app = express();

// Augment express-session with a custom SessionData object
declare module "express-session" {
  interface SessionData {
    nonce: string;
    siwe: SiweResponse;
  }
}

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Hello world",
  });
});

app.use(express.json());

const allowedOrigins = env_Vars.app.ALLOWED_ORIGINS.split(",");

export const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  Session({
    name: "siwe",
    secret: env_Vars.siwe.SIWE_SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", sameSite: 'none' },
  })
);

app.use("/api/v1/auth", siweRouter);
app.use("/api/v1/salt", saltRouter);
app.use("/api/v1/game", gameRouter);

app.get("*", function (_req: Request, res: Response) {
  console.log("404ing");
  res.status(404).json({ status: "404" });
});

// railway provides this PORT directly
const PORT = process.env.PORT || env_Vars.app.BACKEND_PORT;

let gameIo: GameIo;

const express_Server = app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} - rpslz`);
  gameIo = new GameIo(express_Server);
});

export { gameIo };
