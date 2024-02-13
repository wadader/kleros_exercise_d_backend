import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import { env_Vars } from "./config/init";
import { authRouter } from "./middleware/authentication/thirdwebAuth";
import { CorsOptions } from "cors";

const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Hello world",
  });
});

app.use(express.json());

export const corsOptions: CorsOptions = {
  origin: [
    `https://${env_Vars.Auth.THIRDWEB_AUTH_DOMAIN}`,
    `http://${env_Vars.Auth.THIRDWEB_AUTH_DOMAIN}`,
    "http://localhost:5174",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/v1/auth", authRouter);

app.get("*", function (_req: Request, res: Response) {
  console.log("404ing");
  res.status(404).json({ status: "404" });
});

// railway provides this PORT directly
const PORT = process.env.PORT || env_Vars.app.BACKEND_PORT;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} - rpslz`);
});
