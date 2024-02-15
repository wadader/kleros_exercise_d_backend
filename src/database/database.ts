import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env_Vars } from "../config/init";
import * as completeSchema from "./drizzle/schema/schema";

// for query purposes
const getQueryClient = ({
  HOST,
  PORT,
  DATABASE_NAME,
  USER,
  PASSWORD,
}: (typeof env_Vars)["db"]) =>
  postgres({
    max: 10,
    host: HOST,
    port: PORT,
    database: DATABASE_NAME,
    username: USER,
    password: PASSWORD,
  });

export const getDrizzleDb = (db: (typeof env_Vars)["db"]) =>
  drizzle(getQueryClient(db), {
    schema: completeSchema,
  });
