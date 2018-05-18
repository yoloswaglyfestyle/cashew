import { connect, subscribe } from '../clientHelper';
import { MqttClient } from 'mqtt';

var jwt = require('jsonwebtoken');
const userId = 139871238127389;
var token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET);

export function startMobileDevice() {

  connect('mobile', token)
    .then((client: MqttClient) => {
      setTimeout(() => {
        client.publish('get_apples', JSON.stringify({ user_id: userId }));
        setTimeout(() => {
          client.publish('get_more_apples', JSON.stringify({ user_id: userId }));
        }, 8000);
      }, 3000);

      const topic = `${userId}/got_apples`
      subscribe(client, topic)
        .then(apples => {
          console.log("subscriber receiving", topic, apples)
        })
    });
}