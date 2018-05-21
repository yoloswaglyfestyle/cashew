import aedes = require('aedes');
import * as aedesPersistenceRedis from 'aedes-persistence-redis';
import * as mqEmitterRedis from 'mqemitter-redis';
import { ISubscription } from 'mqtt-packet';
import * as tls from 'tls';
import { authenticateWithJWT, authorizePublish, authorizeSubscribe } from './auth';
import { IBrokerOptions } from './types';

const mq = mqEmitterRedis({
  port: process.env.REDIS_MQ_PORT,
  host: process.env.REDIS_MQ_HOST,
  db: 0,
});

const persistence = aedesPersistenceRedis({
  port: process.env.REDIS_DB_POST,
  host: process.env.REDIS_DB_HOST,
  family: 4,
  db: 0,
  maxSessionDelivery: 100,
  packetTTL: () => {
    return 10;
  },
});

const defaultOptions = {
  authenticate: authenticateWithJWT,
  authorizePublish,
  authorizeSubscribe,
  logger: console,
  port: 8883,
  mq,
  persistence,
};

export function start(opts: IBrokerOptions, cb: () => void) {
  const options = {...defaultOptions, ...opts};
  const broker = aedes({ persistence: options.persistence, mq: options.mq });

  broker.authenticate = options.authenticate;
  broker.authorizeSubscribe = options.authorizeSubscribe;
  broker.authorizePublish = options.authorizePublish;

  broker.on('client', (client) => {
    options.logger.log('New connection: ', client.id);
  });

  broker.on('clientDisconnect', (client) => {
    options.logger.log('Disconnected connection: ', client.id);
  });

  broker.on('clientError', (_, err) => {
    options.logger.error('Client Error', err);
  });

  broker.on('connectionError', (_, err) => {
    options.logger.error('Connection Error', err);
  });

  broker.on('publish', (packet) => {
    options.logger.log('Published', packet.topic, packet.payload.toString());
  });

  broker.on('subscribe', (subscriptions: ISubscription[], client) => {
    subscriptions.forEach(((sub: ISubscription) => {
      options.logger.log('Subscribed', sub.topic, client.id);
    }));
  });

  const server = tls.createServer(options.keys, broker.handle);
  server.listen(options.port, () => {
    options.logger.log('Broker listening on port ', options.port);
    cb();
  });
}
