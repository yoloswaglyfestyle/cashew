const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
import { MqttClient } from 'mqtt';
import { IPayload } from '../src/IPayload';

const defaultOptions = {
  key: false,
  cert: false,
  ca: false,
  host: 'localhost',
  port: process.env.BROKER_PORT,
  protocol: 'mqtts',
  clientId: `device_${Math.random().toString(16).substr(2, 8)}`,
};

export function connect(token, options?) {
  const opts = {...defaultOptions, options};
  return new Promise((resolve, reject) => {
    try {
      const client: MqttClient = mqtt.connect({
        host: opts.host,
        port: opts.port,
        protocol: opts.protocol,
        key: opts.key,
        cert: opts.cert,
        ca: opts.ca,
        username: 'JWT',
        password: token,
        rejectUnauthorized: false,
        clientId: opts.clientId,
      });
      client.on('connect', function () {
        resolve(client);
      });
      client.on('error', function (err) {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function subscribe(client, topic) {
  return new Promise((resolve, _reject) => {
    client.subscribe(topic);

    client.on('message', function (t, payload) {
      if (topic === t) {
        const p: IPayload = JSON.parse(payload.toString());
        resolve(p);
      }
    });
  });
}

export function getHandlerToken() {
  return jwt.sign({
    handler: {
      name: 'test_handler3r',
      ip: '1.2.3.4',
    },
  },              process.env.JWT_SECRET);
}
