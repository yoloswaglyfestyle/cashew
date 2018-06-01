import * as jwt from 'jsonwebtoken';
import { connect, subscribe, publish } from '../../src/client';

const userId = 139871238127389;
const token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET || 'shhhhh');

export function startMobileDevice() {
  const options = {
    clientId: 'mobile',
  };
  connect(token, options).then(conn => {
    setTimeout(() => {
      publish(`${userId}/get_apples`, JSON.stringify({}), conn);
      setTimeout(() => {
        publish(
          `${userId}/get_more_apples`,
          JSON.stringify({}),
          conn);
      }, 8000);
    }, 3000);

    const topic = `${userId}/got_apples`;
    subscribe(topic, conn).observe(apples => {
      console.log('subscriber receiving', topic, apples);
    });
  });
}
