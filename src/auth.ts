import { logInfo } from './logger';

var jwt = require('jsonwebtoken');

export function authorizePublish() {
  return function (_client, packet, callback) {
    if (packet.topic === 'aaaa') {
      return callback(new Error('wrong topic'))
    }

    if (packet.topic === 'bbb') {
      packet.payload = new Buffer('overwrite packet payload')
    }

    callback(null)
  }
}

export function authorizeSubscribe() {
  return function (client, sub, callback) {
    if (!client.deviceProfile) {
      return callback(new Error('Not authenticated. Please login!'), false);
    }
    if (client.deviceProfile.handler) {
      return callback(null, sub);
    }
    if (sub.topic.indexOf(client.deviceProfile.user_id) !== 0) {
      return callback(new Error(`Not authorized to subscribe to "${sub.topic}."`), false);
    }

    if (sub.topic === 'bbb') {
      // overwrites subscription
      sub.qos = sub.qos + 2
    }

    callback(null, sub)
  }
}

export function authenticateWithJWT() {

  return function (client, username, password, callback) {

    if (username !== 'JWT') { return callback(null, false); }

    jwt.verify(password.toString(), process.env.JWT_SECRET, function (err, profile) {
      if (err) { return callback("Error getting UserInfo", false); }
      logInfo("Authenticated client " + profile.user_id);
      client.deviceProfile = profile;
      return callback(null, true);
    });

  }
}