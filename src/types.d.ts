import { MqttClient } from "mqtt";

interface IClientOptions {
  logger?: Console;
  brokerUrl?: string;
  clientId?: string;
  keepalive?: string;
  parse?: any;
}

interface IClientConnection {
  options: IClientOptions;
  client: MqttClient;
}
