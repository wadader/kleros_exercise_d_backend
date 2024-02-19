import { randomBytes } from "crypto";

export class Salt {
  constructor() {
    console.log(
      "constructing salt class- this message should only appear once"
    );
  }

  getNewSalt(): string {
    const bytes = randomBytes(32);
    const bigInt = BigInt(`0x${bytes.toString("hex")}`);
    return bigInt.toString();
  }
}
