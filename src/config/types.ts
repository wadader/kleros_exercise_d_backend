export interface AppEnv {
  BACKEND_PORT: number;
}

export interface InfuraEnv {
  INFURA_ENDPOINT: string;
}

export interface DbEnv {
  HOST: string;
  USER: string;
  PASSWORD: string;
  DATABASE_NAME: string;
  PORT: number;
}

export interface SocketEnv {
  SOCKET_KEY: string;
}

type OptionalStringProperties<T> = {
  [K in keyof T]: string | undefined;
};

export interface EnvClassConstructorArgs {
  infuraEnv: OptionalStringProperties<InfuraEnv>;
  appEnv: OptionalStringProperties<AppEnv>;
  dbEnv: OptionalStringProperties<DbEnv>;
  socketEnv: OptionalStringProperties<SocketEnv>;
}
