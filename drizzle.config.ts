import type { Config } from "drizzle-kit";
import { env_Vars } from "./src/config/init";

export default {
  schema: "./src/database/drizzle/schema/",
  out: "./src/database/drizzle/schema/generated",
  driver: "pg",
  dbCredentials: {
    user: env_Vars.db.USER,
    password: env_Vars.db.PASSWORD,
    host: env_Vars.db.HOST,
    port: env_Vars.db.PORT,
    database: env_Vars.db.DATABASE_NAME,
  },
  breakpoints: true,
} satisfies Config;
