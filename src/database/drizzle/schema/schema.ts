import {
  text,
  char,
  boolean,
  pgTable,
  serial,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

export const salts = pgTable("salts", {
  id: serial("id").primaryKey(),
  // numeric precision of 78 is over 2^256, good enough for soring a uint256 equivalent
  salt: numeric("salt", { precision: 78 }).notNull().unique(),
  requestedByAddress: char("requested_by_address", { length: 42 }).notNull(),
});

export const rpslzGames = pgTable("rpslz_games", {
  txHash: char("tx_hash", { length: 66 }).primaryKey(),
  createdContractAddress: char("created_contract_address", {
    length: 42,
  })
    .notNull()
    .unique(),
  saltId: integer("salt_id")
    .references(() => salts.id)
    .notNull()
    .unique(),
  // we could fetch joinerAddress from the blockchain directly, but as it is immutable, we save time/bandwidth by storing it here
  joinerAddress: char("joiner_address", { length: 42 }).notNull(),
  didCreatorTimeout: boolean("did_creator_timeout").notNull().default(false),
  didJoinerTimeout: boolean("did_joiner_timeout").notNull().default(false),
  winnerAddress: char("winner_address", { length: 42 }),
});

export const logins = pgTable("logins", {
  nonce: text("logins").primaryKey(),
});
