var aedes = require('aedes')()
import { authenticateWithJWT, authorizeSubscribe, authorizePublish } from './auth';
import { logInfo, logError } from './logger';

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
  var server = require('net').createServer(aedes.handle)
  var port = 1883
  server.listen(port, function () {
    logInfo('server listening on port', port)
    cb();
  })

}