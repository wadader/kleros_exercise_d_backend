import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

export type Tx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof import("./drizzle/schema/schema"),
  ExtractTablesWithRelations<typeof import("./drizzle/schema/schema")>
>;
