import {
  AppEnv,
  AuthEnv,
  DbEnv,
  EnvClassConstructorArgs,
  InfuraEnv,
} from "./types";
import dotenv from "dotenv";

dotenv.config();

export class Env_Vars {
  constructor(envArgs: EnvClassConstructorArgs) {
    console.log("constructing env_vars - this message should only appear once");

    if (!envArgs.appEnv.BACKEND_PORT) throw "BACKEND_PORT not defined in env";
    this.app = { BACKEND_PORT: Number(envArgs.appEnv.BACKEND_PORT) };
    if (isNaN(this.app.BACKEND_PORT))
      throw "BACKEND_PORT does not seem like a number";

    if (!envArgs.infuraEnv.INFURA_ENDPOINT)
      throw "INFURA_ENDPOINT not defined in env";
    this.infura = {
      INFURA_ENDPOINT: envArgs.infuraEnv.INFURA_ENDPOINT,
    };

    if (!envArgs.dbEnv.HOST) throw "DB_HOST not defined in env";
    if (!envArgs.dbEnv.USER) throw "DB_USER not defined in env";
    if (!envArgs.dbEnv.PASSWORD) throw "DB_PASSWORD not defined in env";
    if (!envArgs.dbEnv.DATABASE_NAME)
      throw "DB_DATABASE_NAME not defined in env";
    if (!envArgs.dbEnv.PORT) throw "DB_PORT not defined in env";
    this.Db = {
      HOST: envArgs.dbEnv.HOST,
      USER: envArgs.dbEnv.USER,
      PASSWORD: envArgs.dbEnv.PASSWORD,
      DATABASE_NAME: envArgs.dbEnv.DATABASE_NAME,
      PORT: Number(envArgs.dbEnv.PORT),
    };
    if (isNaN(this.Db.PORT)) throw "DB_PORT does not seem like a valid number";

    if (!envArgs.authEnv.THIRDWEB_AUTH_PRIVATE_KEY)
      throw "THIRDWEB_AUTH_PRIVATE_KEY not defined in env";
    if (!envArgs.authEnv.THIRDWEB_AUTH_DOMAIN)
      throw "THIRDWEB_AUTH_DOMAIN not defined in env";

    this.Auth = {
      THIRDWEB_AUTH_PRIVATE_KEY: envArgs.authEnv.THIRDWEB_AUTH_PRIVATE_KEY,
      THIRDWEB_AUTH_DOMAIN: envArgs.authEnv.THIRDWEB_AUTH_DOMAIN,
    };
  }

  readonly infura: InfuraEnv;
  readonly app: AppEnv;
  readonly Db: DbEnv;
  readonly Auth: AuthEnv;
}
