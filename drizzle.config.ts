import type { Config } from "drizzle-kit";
import { env_Vars } from "./src/config/init";

export default {
  schema: "./src/drizzle/schema/",
  out: "./src/drizzle/schema/generated",
  driver: "pg",
  dbCredentials: {
    user: env_Vars.Db.USER,
    password: env_Vars.Db.PASSWORD,
    host: env_Vars.Db.HOST,
    port: env_Vars.Db.PORT,
    database: env_Vars.Db.DATABASE_NAME,
  },
  breakpoints: true,
} satisfies Config;
