import { authenticateWithJWT, authorizeSubscribe, authorizePublish } from './auth';
import * as aedesPersistenceRedis from 'aedes-persistence-redis';
import * as mqEmitterRedis from 'mqemitter-redis';
const aedes = require('aedes');
import { ISubscription } from 'mqtt-packet';

const mq = mqEmitterRedis({
  port: process.env.REDIS_MQ_PORT,
  host: process.env.REDIS_MQ_HOST,
  db: 0
});

const persistence = aedesPersistenceRedis({
  port: process.env.REDIS_DB_POST,
  host: process.env.REDIS_DB_HOST,
  family: 4,
  db: 0,
  maxSessionDelivery: 100,
  packetTTL: function (_packet) {
    return 10
  }
})

export function start(options, cb) {

  const broker = aedes({ persistence, mq });

  broker.authenticate = options.authenticate || authenticateWithJWT();
  broker.authorizeSubscribe = options.authorizeSubscribe || authorizeSubscribe();
  broker.authorizePublish = options.authorizePublish || authorizePublish();

  broker.on('client', function (client) {
    options.logger.log('New connection: ', client.id);
  });

  broker.on('clientDisconnect', function (client) {
    options.logger.log('Disconnected connection: ', client.id);
  });

  broker.on('clientError', function (_client, err) {
    options.logger.error("Client Error", err);
  });

  broker.on('connectionError', function (_client, err) {
    options.logger.error("Connection Error", err);
  });

  broker.on('publish', function (packet) {
    options.logger.log('Published', packet.topic, packet.payload.toString());
  });

  broker.on('subscribe', function (subscriptions: ISubscription[], client) {
    subscriptions.forEach((sub => {
      options.logger.log('Subscribed', sub.topic, client.id);
    }))
  });

  const tslOptions = {
    key: options.keyFile,
    cert: options.certFile
  };
  let server = require('tls').createServer(tslOptions, broker.handle)
  server.listen(options.port, function () {
    options.logger.log('Broker listening on port ', options.port)
    cb();
  })
}
