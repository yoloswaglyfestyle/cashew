import { MqttClient } from 'mqtt';

interface ITLSKeys {
  key: Buffer;
  cert: Buffer;
  ca: Buffer;
}

interface IBrokerOptions {
  keys?: ITLSKeys;
  port?: string;
  logger?: Console;
  mq?: any;
  persistence?: any;
  debug?: boolean;
}

interface IClientOptions {
  keys?: ITLSKeys;
  host?: string;
  port?: string;
  logger?: Console;
  protocol?: string;
  clientId?: string;
  parse?: any;
}

interface IClientConnection {
  options: IClientOptions;
  client: MqttClient;
}
