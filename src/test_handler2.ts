import { logError } from './logger';
var mqtt = require('mqtt')
var jwt = require('jsonwebtoken');
var token = jwt.sign({
  handler: {
    name: 'test_handle2r',
    ip: "1.2.3.4",
  }
}, process.env.JWT_SECRET);

export function startHandler2() {
  var client = mqtt.connect('mqtt://localhost:1883', {
    username: 'JWT',
    password: token,
    clientId: 'handler2_' + Math.random().toString(16).substr(2, 8)
  })
  client.on('connect', function () {
    client.subscribe("get_more_apples");

    client.on('message', function (_topic, payload) {
      var p = JSON.parse(payload);
      client.publish(p.user_id + "_got_apples", JSON.stringify(["green", "black", "purple"]))
    });
  });

  client.on('error', function (err) {
    logError('Publisher error', err);
  });
}
