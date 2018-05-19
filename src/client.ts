const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');
import { MqttClient } from 'mqtt';
import { IPayload } from '../src/IPayload';

export function connect(deviceName, token) {
  return new Promise((resolve, reject) => {
    try {
      const key = fs.readFileSync(path.join(__dirname, process.env.TLS_KEY_FILE));
      const cert = fs.readFileSync(path.join(__dirname, process.env.TLS_CERT_FILE));
      const ca = fs.readFileSync(path.join(__dirname, process.env.CA_CERT_FILE));
      const client: MqttClient = mqtt.connect({
        host: 'localhost',
        port: process.env.BROKER_PORT,
        protocol: 'mqtts',
        key,
        cert,
        ca,
        username: 'JWT',
        password: token,
        rejectUnauthorized: false,
        clientId: `${deviceName}_${Math.random().toString(16).substr(2, 8)}`,
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
