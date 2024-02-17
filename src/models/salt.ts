import { randomBytes } from "crypto";
import { EthAddress } from "../types/web3";
import { drizzleDb } from "../config/init";
import { rpslzGames, salts } from "../database/drizzle/schema/schema";
import { and, eq } from "drizzle-orm";

export class Salt {
  constructor() {
    console.log(
      "constructing salt class- this message should only appear once"
    );
  }
  getSaltForGame = async (
    contractAddress: EthAddress,
    creatorAddress: EthAddress
  ): Promise<string | undefined> => {
    const saltArr = await drizzleDb
      .select({ saltForGame: salts.salt })
      .from(salts)
      .innerJoin(rpslzGames, eq(rpslzGames.saltId, salts.id))
      .where(
        and(
          eq(rpslzGames.createdContractAddress, contractAddress),
          eq(salts.requestedByAddress, creatorAddress)
        )
      );

    if (saltArr.length) return saltArr[0]?.saltForGame;
  };

  getSaltId = async (salt: string): Promise<number | undefined> => {
    const saltArr = await drizzleDb
      .select({ saltId: salts.id })
      .from(salts)
      .where(eq(salts.salt, salt));

    if (saltArr.length) return saltArr[0]?.saltId;
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
