CREATE TABLE IF NOT EXISTS "logins" (
	"logins" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rpslz_games" (
	"tx_hash" char(66) PRIMARY KEY NOT NULL,
	"created_contract_address" char(42) NOT NULL,
	"salt_id" integer NOT NULL,
	"did_creator_timeout" boolean DEFAULT false NOT NULL,
	"did_joiner_timeout" boolean DEFAULT false NOT NULL,
	"winner_address" char(42),
	CONSTRAINT "rpslz_games_created_contract_address_unique" UNIQUE("created_contract_address"),
	CONSTRAINT "rpslz_games_salt_id_unique" UNIQUE("salt_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "salts" (
	"id" serial PRIMARY KEY NOT NULL,
	"salt" numeric(78) NOT NULL,
	"requested_by_address" char(42) NOT NULL,
	CONSTRAINT "salts_salt_unique" UNIQUE("salt")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rpslz_games" ADD CONSTRAINT "rpslz_games_salt_id_salts_id_fk" FOREIGN KEY ("salt_id") REFERENCES "salts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
