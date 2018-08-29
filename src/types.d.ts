import { MqttClient } from "mqtt";

interface IClientOptions {
  logger?: Console;
  brokerUrl?: string;
  clientId?: string;
  keepalive?: number;
  parse?: any;
}

interface IClientConnection {
  options: IClientOptions;
  client: MqttClient;
}
