import { logInfo, logError } from './logger';
var mqtt = require('mqtt');

export function startSubscriber() {
  var client = mqtt.connect('mqtt://localhost:1883', { username: 'JWT', password: process.env.TEST_JWT })

  client.on('connect', function () {
    client.subscribe('apples')
  })

  client.on('message', function (topic, message) {
    logInfo("subscriber receiving", topic, message.toString())
  })

  client.on('error', function (err) {
    logError('Subscriber error', err);
  });
}