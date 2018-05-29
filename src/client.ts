import * as jwt from 'jsonwebtoken';
import { connect as mqttConnect, MqttClient } from 'mqtt';
import { IClientConnection, IClientOptions, IPayload } from '../src/types';

export function connect(
  token: string,
  options?: IClientOptions,
): Promise<IClientConnection> {
  const defaultOptions: IClientOptions = {
    host: 'localhost',
    port: process.env.BROKER_PORT || '8883',
    protocol: 'mqtt',
    clientId: `device_${new Date().getTime()}`,
    parse: JSON.parse,
  };

  const opts: IClientOptions = { ...defaultOptions, ...options };

  return new Promise(
    (
      resolve: (
        value?: IClientConnection | PromiseLike<IClientConnection>,
      ) => void,
      reject: (reason?: Error) => void,
    ) => {
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
          const conn: IClientConnection = { client: client, options: opts };
          resolve(conn);
        });
        client.on('error', (err: Error) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    },
  );
}

export function subscribe(connection: IClientConnection, topic: string) {
  return new Promise(
    (resolve: (value?: IPayload | PromiseLike<IPayload>) => void) => {
      connection.client.subscribe(topic);

      connection.client.on('message', (t: string, payload: Buffer[]) => {
        if (topic === t) {
          const p: IPayload = connection.options.parse(payload.toString());
          resolve(p);
        }
      });
    },
  );
}

export function getHandlerToken() {
  return jwt.sign(
    {
      handler: {
        name: 'test_handler3r',
        ip: '1.2.3.4',
      },
    },
    process.env.JWT_SECRET || 'shhhhh',
  );
}
