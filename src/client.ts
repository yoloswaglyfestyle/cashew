import * as jwt from 'jsonwebtoken';
import { connect as mqttConnect, MqttClient } from 'mqtt';
import { IPayload } from '../src/IPayload';

interface IConnectOptions {
  key: Buffer[];
  cert: Buffer[];
  ca: Buffer[];
  host: string;
  port: number;
  protocol: string;
  clientId: string;
}
const defaultOptions = {
  key: false,
  cert: false,
  ca: false,
  host: 'localhost',
  port: process.env.BROKER_PORT,
  protocol: 'mqtts',
  clientId: `device_${Math.random().toString(16).substr(2, 8)}`,
};

export function connect(token: string, options?: IConnectOptions): Promise<MqttClient> {
  const opts = {...defaultOptions, ...options};

  return new Promise((resolve: (value?: MqttClient | PromiseLike<MqttClient>) => void,
                      reject: (reason?: Error) => void) => {
    try {
      const client: MqttClient = mqttConnect({
        host: opts.host,
        port: opts.port,
        protocol: opts.protocol,
        key: opts.key,
        cert: opts.cert,
        ca: opts.ca,
        username: 'JWT',
        password: token,
        rejectUnauthorized: false,
        clientId: opts.clientId,
      });
      client.on('connect', () => {
        resolve(client);
      });
      client.on('error', (err: any) => {
        reject(new Error(err));
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function subscribe(client: MqttClient, topic: string) {
  return new Promise((resolve: (value?: IPayload | PromiseLike<IPayload>) => void) => {
    client.subscribe(topic);

    client.on('message', (t: string, payload: Buffer[]) => {
      if (topic === t) {
        const p: IPayload = JSON.parse(payload.toString());
        resolve(p);
      }
    });
  });
}

export function getHandlerToken() {
  return jwt.sign({
    handler: {
      name: 'test_handler3r',
      ip: '1.2.3.4',
    },
  },              process.env.JWT_SECRET);
}
