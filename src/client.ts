import * as jwt from 'jsonwebtoken';
import { fromEvent } from 'most';
import { connect as mqttConnect, MqttClient } from 'mqtt';
import { IClientConnection, IClientOptions } from '../src/types';

export function connect(
  token: string,
  options?: IClientOptions,
): Promise<IClientConnection> {
  process.on('uncaughtException', exception => {
    console.error(exception);
    throw exception;
  });

  const defaultOptions: IClientOptions = {
    host: process.env.BROKER_HOST || '0.0.0.0',
    port: process.env.BROKER_PORT || '1883',
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
        const client: MqttClient = mqttConnect(
          `ws://${opts.host}:${opts.port}`,
          {
            //protocol: opts.protocol,
            //keys: opts.keys,
            username: 'JWT',
            password: token,
            rejectUnauthorized: false,
            clientId: opts.clientId,
          },
        );

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

export interface ITopicResponse {
  user_id?: string;
  payload: any;
}

export function subscribe(topic: string, connection: IClientConnection) {
  connection.client.subscribe(topic);

  return fromEvent('message', connection.client)
    .filter(ev => {
      const messageTopicParts = ev[0].split('/');
      const subscribeTopicParts = topic.split('/');
      if (messageTopicParts.length !== subscribeTopicParts.length) {
        return false;
      }
      const newMessageTopic = subscribeTopicParts.map((curr, index) => {
        if (curr === "+") {
          return "+";
        }
        else {
          return messageTopicParts[index];
        }
      }).join("/");

      return newMessageTopic === topic;
    })
    .map((ev): ITopicResponse => {
      const topic = ev[0];
      const payloadStr = ev[1].toString();
      const payload = connection.options.parse(payloadStr);
      const topicSegments = topic.split('/');
      const response: ITopicResponse = { payload };
      response.user_id = topicSegments[0];
      return response;
    });
}

export function publish(topic: string, payload: any, connection: IClientConnection) {
  connection.client.publish(topic, payload);
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
