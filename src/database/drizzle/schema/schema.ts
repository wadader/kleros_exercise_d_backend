import { text, char, boolean, pgTable } from "drizzle-orm/pg-core";

export const rpslzGames = pgTable("rpslz_games", {
  txHash: char("tx_hash", { length: 66 }).primaryKey(),
  createdContractAddress: char("created_contract_address", {
    length: 42,
  })
    .notNull()
    .unique(),
  // we could fetch joinerAddress from the blockchain directly, but as it is immutable, we save time/bandwidth by storing it here
  joinerAddress: char("joiner_address", { length: 42 }).notNull(),
  isGameOver: boolean("is_game_over").notNull().default(false),
});

export const logins = pgTable("logins", {
  nonce: text("logins").primaryKey(),
});
