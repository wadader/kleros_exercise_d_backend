import { eq } from "drizzle-orm";
import { drizzleDb } from "../../config/init";
import { logins } from "../../database/drizzle/schema/schema";

export class Login {
  constructor() {
    console.log(
      "constructing login class- this message should only appear once"
    );
  }

  readonly saveNonce = async (_nonce: string) => {
    await drizzleDb.insert(logins).values({ nonce: _nonce });
  };

  readonly getDoesNonceExist = async (_nonce: string): Promise<boolean> => {
    const getNonceResult = await drizzleDb
      .select()
      .from(logins)
      .where(eq(logins.nonce, _nonce));

    if (getNonceResult.length) {
      return true;
    }
    return false;
  };
}
