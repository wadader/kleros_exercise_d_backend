import { Server as httpServer } from "http";
import { Server } from "socket.io";
import {
  GameServer,
  GameSocket,
  Game_ClientToServerEvents,
  Game_ServerToClientEvents,
} from "./types";
import { env_Vars } from "../../../config/init";
import { CorsOptions } from "cors";
// import { corsOptions } from "../../..";

const allowedOrigins = env_Vars.app.ALLOWED_ORIGINS.split(",");

const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

export class GameIo {
  gameServer: GameServer;
  constructor(express_Server: httpServer) {
    console.log(
      "constructing head to head socket: this messsage should only appear once"
    );
    this.gameServer = new Server<
      Game_ClientToServerEvents,
      Game_ServerToClientEvents,
      {},
      {}
    >(express_Server, {
      cors: corsOptions,
      connectionStateRecovery: {
        maxDisconnectionDuration: FIVE_MINUTES,
      },
    });

    const onConnection = (socket: GameSocket) => {
      socket.on("disconnect", (reason) => {
        console.log("disconnect-reason:", reason);
        if (reason === "server namespace disconnect") return;
      });

      socket.on("game:creator:created", (gameIdentifier) => {
        socket.join(gameIdentifier);
      });

      socket.on("game:joiner:joined", (gameIdentifier) => {
        socket.join(gameIdentifier);
      });
    };

    this.gameServer.on("connection", onConnection);
  }
}

const FIVE_MINUTES = 300_000;
