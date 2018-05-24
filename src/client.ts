import * as jwt from 'jsonwebtoken';
import { connect as mqttConnect, MqttClient } from 'mqtt';
import { IClientOptions, IPayload } from '../src/types';

export function connect(token: string, options?: IClientOptions): Promise<MqttClient> {

  const defaultOptions = {
    host: 'localhost',
    port: process.env.BROKER_PORT || '8883',
    protocol: 'mqtt',
    clientId: `device_${new Date().getTime()}`,
  };

  const opts = {...defaultOptions, ...options};

  return new Promise((resolve: (value?: MqttClient | PromiseLike<MqttClient>) => void,
                      reject: (reason?: Error) => void) => {
    try {
      const client: MqttClient = mqttConnect({
        host: opts.host,
        port: opts.port,
        protocol: opts.protocol,
        keys: opts.keys,
        username: 'JWT',
        password: token,
        rejectUnauthorized: false,
        clientId: opts.clientId,
      });
      client.on('connect', () => {
        resolve(client);
      });
      client.on('error', (err: Error) => {
        reject(err);
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
  },              process.env.JWT_SECRET || 'shhhhh');
}
