import { MqttClient } from 'mqtt';

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
  port?: string;
  logger?: Console;
  mq?: any;
  persistence?: any;
  debug?: boolean;
}

export interface IClientOptions {
  keys?: ITLSKeys;
  host?: string;
  port?: string;
  logger?: Console;
  protocol?: string;
  clientId?: string;
  parse?: any;
}

export interface IClientConnection {
  options: IClientOptions;
  client: MqttClient;
}
