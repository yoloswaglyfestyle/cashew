export interface IPayload {
  user_id: string;
}

export interface ITLSKeys {
  key: Buffer;
  cert: Buffer;
  ca: Buffer;
}

export interface IBrokerOptions {
  keys?: ITLSKeys;
  port?: number;
  logger?: Console;
}

export interface IClientOptions {
  keys?: ITLSKeys;
  host?: string;
  port?: number;
  logger?: Console;
  protocol?: string;
  clientId?: string;
}
