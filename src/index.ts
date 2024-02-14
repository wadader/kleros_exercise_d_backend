import express from "express";
import { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { SiweResponse } from "siwe";
import Session from "express-session";

import { env_Vars } from "./config/init";
import { siweRouter } from "./routes/auth/siwe";
import { saltRouter } from "./routes/salt";

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

export const corsOptions: CorsOptions = {
  origin: ["http://localhost:5174", "http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  Session({
    name: "siwe",
    secret: "siwe-secret",
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: "lax" },
  })
);

app.use("/api/v1/auth", siweRouter);
app.use("/api/v1/salt", saltRouter);


app.get("*", function (_req: Request, res: Response) {
  console.log("_req.params", _req.params);
  console.log("404ing");
  res.status(404).json({ status: "404" });
});

// railway provides this PORT directly
const PORT = process.env.PORT || env_Vars.app.BACKEND_PORT;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} - rpslz`);
});
