export interface AppEnv {
  BACKEND_PORT: number;
}

export interface InfuraEnv {
  INFURA_ENDPOINT: string;
}

export interface RandomEnv {
  RANDOM_SEED: string;
}

export interface DbEnv {
  HOST: string;
  USER: string;
  PASSWORD: string;
  DATABASE_NAME: string;
  PORT: number;
}

export interface AuthEnv {
  THIRDWEB_AUTH_PRIVATE_KEY: string;
  THIRDWEB_AUTH_DOMAIN: string;
}

type OptionalStringProperties<T> = {
  [K in keyof T]: string | undefined;
};

export interface EnvClassConstructorArgs {
  infuraEnv: OptionalStringProperties<InfuraEnv>;
  appEnv: OptionalStringProperties<AppEnv>;
  randomEnv: OptionalStringProperties<RandomEnv>;
  dbEnv: OptionalStringProperties<DbEnv>;
  authEnv: OptionalStringProperties<AuthEnv>;
}
