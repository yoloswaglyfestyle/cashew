import { logInfo, logError } from './logger';
var mqtt = require('mqtt')

export function startPublisher() {
  var client = mqtt.connect('mqtt://localhost:1883', { username: 'JWT', password: process.env.TEST_JWT })
  client.on('connect', function () {
    setTimeout(() => {
      logInfo("publishing")
      client.publish('apples', 'Hello mqtt');
    }, 3000);
  })

  client.on('error', function (err) {
    logError('Publisher error', err);
  });
}
