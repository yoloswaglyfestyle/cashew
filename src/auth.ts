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
      return callback(new Error('Not authorized. Please login!'), false);
    }
    if (!client.deviceProfile.subscribe || client.deviceProfile.subscribe.length === 0) {
      return callback(new Error('User has no authorized subscriptions.'), false);
    }
    if (client.deviceProfile.subscribe.indexOf(sub.topic) === -1) {
      return callback(new Error(`User is not authorized to subscribe to "${sub.topic}."`), false);
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

    jwt.verify(password.toString(), process.env.SECRET, function (err, profile) {
      if (err) { return callback("Error getting UserInfo", false); }
      logInfo("Authenticated client " + profile.user_id);
      logInfo(profile.subscribe);
      logInfo(profile.publish);
      client.deviceProfile = profile;
      return callback(null, true);
    });

  }
}