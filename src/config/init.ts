import { drizzle } from "drizzle-orm/postgres-js";
import { Env_Vars } from "./env";
import { EnvClassConstructorArgs } from "./types";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDrizzleDb } from "../database/database";

const envArg: EnvClassConstructorArgs = {
  infuraEnv: {
    INFURA_ENDPOINT: process.env.INFURA_ENDPOINT,
  },
  appEnv: {
    BACKEND_PORT: process.env.BACKEND_PORT,
  },
  randomEnv: { RANDOM_SEED: process.env.RANDOM_SEED },
  dbEnv: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE_NAME: process.env.DB_DATABASE_NAME,
    PORT: process.env.DB_PORT,
  },
  authEnv: {
    THIRDWEB_AUTH_PRIVATE_KEY: process.env.THIRDWEB_AUTH_PRIVATE_KEY,
    THIRDWEB_AUTH_DOMAIN: process.env.THIRDWEB_AUTH_DOMAIN,
  },
};

export const env_Vars = new Env_Vars(envArg);

export async function init() {
  try {
    // for migrations
    const { HOST, PORT, DATABASE_NAME, USER, PASSWORD } = env_Vars.Db;

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
  } catch (err) {
    console.error("migrations failed:", err);
    throw err;
  }
}

// comment out when generating migrations
init();

export const drizzleDb = getDrizzleDb(env_Vars.Db);
