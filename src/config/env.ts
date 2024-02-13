import {
  AppEnv,
  DbEnv,
  EnvClassConstructorArgs,
  InfuraEnv,
  RandomEnv,
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

    if (!envArgs.randomEnv.RANDOM_SEED) throw "RANDOM_SEED not defined in env";
    this.random = {
      RANDOM_SEED: envArgs.randomEnv.RANDOM_SEED,
    };

    if (!envArgs.dbEnv.HOST) throw "DB_HOST not defined in env";
    if (!envArgs.dbEnv.USER) throw "DB_USER not defined in env";
    if (!envArgs.dbEnv.PASSWORD) throw "DB_PASSWORD not defined in env";
    if (!envArgs.dbEnv.DATABASE_NAME) throw "DB_DATABASE_NAME not defined in env";
    if (!envArgs.dbEnv.PORT) throw "DB_PORT not defined in env";
    this.Db = {
      HOST: envArgs.dbEnv.HOST,
      USER: envArgs.dbEnv.USER,
      PASSWORD: envArgs.dbEnv.PASSWORD,
      DATABASE_NAME: envArgs.dbEnv.DATABASE_NAME,
      PORT: Number(envArgs.dbEnv.PORT),
    };
    if (isNaN(this.Db.PORT)) throw "DB_PORT does not seem like a valid number";
  }

  readonly infura: InfuraEnv;
  readonly random: RandomEnv;
  readonly app: AppEnv;
  readonly Db: DbEnv;
}
