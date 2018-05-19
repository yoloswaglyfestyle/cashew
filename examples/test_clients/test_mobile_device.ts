import { MqttClient } from 'mqtt';
import { connect, subscribe } from '../../src/client';
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const userId = 139871238127389;
const token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET);

export function startMobileDevice() {

  const options = {
    key: fs.readFileSync(path.join(__dirname, '../', process.env.TLS_KEY_FILE)),
    cert: fs.readFileSync(path.join(__dirname, '../', process.env.TLS_CERT_FILE)),
    ca: fs.readFileSync(path.join(__dirname, '../', process.env.CA_CERT_FILE)),
    clientId: 'mobile',
  };
  connect(token, options)
    .then((client: MqttClient) => {
      setTimeout(() => {
        client.publish('get_apples', JSON.stringify({ user_id: userId }));
        setTimeout(() => {
          client.publish('get_more_apples', JSON.stringify({ user_id: userId }));
        },         8000);
      },         3000);

      const topic = `${userId}/got_apples`;
      subscribe(client, topic)
        .then(apples => {
          console.log('subscriber receiving', topic, apples);
        });
    });
}
