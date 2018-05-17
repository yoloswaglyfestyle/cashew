var fs = require('fs');
var path = require('path');
import { authenticateWithJWT, authorizeSubscribe, authorizePublish } from './auth';
import { logInfo, logError } from './logger';
import * as aedesPersistenceRedis from 'aedes-persistence-redis';
import * as mqEmitterRedis from 'mqemitter-redis';

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

const aedes = require('aedes')({ persistence, mq })

aedes.authenticate = authenticateWithJWT();
aedes.authorizeSubscribe = authorizeSubscribe();
aedes.authorizePublish = authorizePublish();

aedes.on('client', function (client) {
  logInfo('New connection: ', client.id);
});

aedes.on('clientDisconnect', function (client) {
  logInfo('Disconnected connection: ', client.id);
});

aedes.on('clientError', function (_client, err) {
  logError("Client Error", err);
});

aedes.on('connectionError', function (_client, err) {
  logError("Connection Error", err);
});

aedes.on('publish', function (packet) {
  logInfo('Published', packet.topic, packet.payload.toString());
});

aedes.on('subscribe', function (subscriptions, client) {
  subscriptions.forEach((sub => {
    logInfo('Subscribed', sub.topic, client.id);
  }))
});

export function startBroker(cb) {
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, process.env.TLS_KEY_FILE)),
    cert: fs.readFileSync(path.join(__dirname, process.env.TLS_CERT_FILE))
  };
  var server = require('tls').createServer(sslOptions, aedes.handle)
  var port = process.env.BROKER_PORT;
  server.listen(port, function () {
    logInfo('Broker listening on port', port)
    cb();
  })

}