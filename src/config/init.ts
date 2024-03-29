import { drizzle } from "drizzle-orm/postgres-js";
import { Env_Vars } from "./env";
import { EnvClassConstructorArgs } from "./types";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDrizzleDb } from "../database/database";
import { Salt } from "../models/salt";
import { Login } from "../middleware/authentication/login";
import { Game } from "../models/games";
import { Encryption } from "../utils/Encryption";

const envArg: EnvClassConstructorArgs = {
  infuraEnv: {
    INFURA_ENDPOINT: process.env.INFURA_ENDPOINT,
  },
  appEnv: {
    BACKEND_PORT: process.env.BACKEND_PORT,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

  },
  dbEnv: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE_NAME: process.env.DB_DATABASE_NAME,
    PORT: process.env.DB_PORT,
  },
  socketEnv: {
    SOCKET_KEY: process.env.SOCKET_KEY,
  },
  siweEnv: {
    SIWE_SESSION_SECRET: process.env.SIWE_SESSION_SECRET,
  },
};

export const env_Vars = new Env_Vars(envArg);

let salt: Salt;
let logins: Login;
let games: Game;
let encryptor: Encryption;

export async function init() {
  try {
    // for migrations
    const { HOST, PORT, DATABASE_NAME, USER, PASSWORD } = env_Vars.db;

    const migrationClient = drizzle(
      postgres({
        max: 1,
        host: HOST,
        port: PORT,
        database: DATABASE_NAME,
        username: USER,
        password: PASSWORD,
      })
    );

    // this will automatically run needed migrations on the database
    await migrate(migrationClient, {
      migrationsFolder: "./src/database/drizzle/schema/generated",
    });
    console.log("completed migrations");

    salt = new Salt();
    logins = new Login();
    games = new Game(env_Vars.infura.INFURA_ENDPOINT);
    encryptor = new Encryption(env_Vars.socket.SOCKET_KEY);
  } catch (err) {
    console.error("migrations failed:", err);
    throw err;
  }
}

// disable init while generating migrations
if (!(process.env.NODE_ENV === "migration")) init();

const drizzleDb = getDrizzleDb(env_Vars.db);

export { salt, logins, games, encryptor, drizzleDb };
