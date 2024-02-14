import { randomBytes } from "crypto";
import { EthAddress } from "../types/web3";
import { drizzleDb } from "../config/init";
import { rpslzGames, salts } from "../database/drizzle/schema/schema";
import { eq } from "drizzle-orm";

export class Salt {
  constructor() {
    console.log(
      "constructing salt class- this message should only appear once"
    );
  }
  getSaltForGame = async (
    contractAddress: EthAddress
  ): Promise<string | undefined> => {
    const saltArr = await drizzleDb
      .select({ saltForGame: salts.salt })
      .from(salts)
      .innerJoin(rpslzGames, eq(rpslzGames.salt_id, salts.id))
      .where(eq(rpslzGames.createdContractAddress, contractAddress));

    if (saltArr.length) return saltArr[0]?.saltForGame;
  };

  generateSaltForUser = async (userAddress: EthAddress) => {
    const newSalt = this.getNewSalt();
    await drizzleDb
      .insert(salts)
      .values({ salt: newSalt, requestedByAddress: userAddress });
    return newSalt;
  };

  private getNewSalt(): string {
    const bytes = randomBytes(32);
    const bigInt = BigInt(`0x${bytes.toString("hex")}`);
    return bigInt.toString();
  }
}
