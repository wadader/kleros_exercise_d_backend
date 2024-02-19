CREATE TABLE IF NOT EXISTS "logins" (
	"logins" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rpslz_games" (
	"tx_hash" char(66) PRIMARY KEY NOT NULL,
	"created_contract_address" char(42) NOT NULL,
	"joiner_address" char(42) NOT NULL,
	"is_game_over" boolean DEFAULT false NOT NULL,
	CONSTRAINT "rpslz_games_created_contract_address_unique" UNIQUE("created_contract_address")
);
