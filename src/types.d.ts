import { MqttClient } from "mqtt";

interface ITLSKeys {
  key: Buffer;
  cert: Buffer;
  ca: Buffer;
}

interface IBrokerOptions {
  port?: string;
  logger?: Console;
  mq?: any;
  persistence?: any;
  debug?: boolean;
}

interface IClientOptions {
  logger?: Console;
  brokerUrl?: string;
  clientId?: string;
  parse?: any;
}

interface IClientConnection {
  options: IClientOptions;
  client: MqttClient;
}
