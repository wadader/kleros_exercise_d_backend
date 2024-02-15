import { Server, Socket } from "socket.io";

export interface Game_ClientToServerEvents {
  "game:creator:created": (gameIdentifier: string) => void;
  "game:joiner:joined": (gameIdentifier: string) => void;
}

export interface Game_ServerToClientEvents {
  "game:joiner-played": () => void;
  "game:creator-solved": () => void;
}

export type GameServer = Server<
  Game_ClientToServerEvents,
  Game_ServerToClientEvents,
  {},
  {}
>;

export type GameSocket = Socket<
  Game_ClientToServerEvents,
  Game_ServerToClientEvents,
  {},
  {}
>;
