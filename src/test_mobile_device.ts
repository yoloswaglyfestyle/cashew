import { logInfo, logError } from './logger';
var mqtt = require('mqtt');
var jwt = require('jsonwebtoken');
const userId = 139871238127389;
var token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET);

export function startMobileDevice() {
  var client = mqtt.connect('mqtt://localhost:1883', {
    username: 'JWT',
    password: token,
    clientId: 'device_' + Math.random().toString(16).substr(2, 8)
  })

  client.on('connect', function () {
    client.subscribe(userId + '_got_apples')
    setTimeout(() => {
      client.publish('get_apples', JSON.stringify({ user_id: userId }));

      setTimeout(() => {
        client.publish('get_more_apples', JSON.stringify({ user_id: userId }));
      }, 8000);

    }, 3000);
  })

  client.on('message', function (topic, message) {
    const p = JSON.stringify(message.toString());
    logInfo("subscriber receiving", topic, p)
  })

  client.on('error', function (err) {
    logError('Subscriber error', err);
  });
}