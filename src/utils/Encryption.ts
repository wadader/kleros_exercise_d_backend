import { createCipheriv, randomBytes } from "crypto";

export class Encryption {
  constructor(SOCKET_KEY: string) {
    console.log("Creating encryptor: this message should only appear once");
    this.socketKey = SOCKET_KEY;
  }

  encrypt = (game_identifier: Buffer): string => {
    const cipher = createCipheriv("aes-256-cbc", this.socketKey, this.iv);
    return Buffer.concat([
      cipher.update(game_identifier),
      cipher.final(),
    ]).toString("hex");
  };

  private iv = randomBytes(16);
  private socketKey: string;
}
