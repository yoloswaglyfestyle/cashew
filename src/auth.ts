import * as jwt from 'jsonwebtoken';
import { IPublishPacket, ISubscription } from 'mqtt-packet';

export function authorizePublish (_: any, packet: IPublishPacket, done: (err?: Error | null) => void) {
    if (packet.topic === 'aaaa') {
      return done(new Error('wrong topic'));
    }

    if (packet.topic === 'bbb') {
      packet.payload = new Buffer('overwrite packet payload');
    }

    done(null);
  }

export function authorizeSubscribe(
  client: any,
  sub: ISubscription,
  done: (err: Error | null, subscription?: ISubscription | null) => void) {
    if (!client.deviceProfile) {
      return done(new Error('Not authenticated. Please login!'));
    }
    if (client.deviceProfile.handler) {
      return done(null, sub);
    }
    if (sub.topic.indexOf(client.deviceProfile.user_id) !== 0) {
      return done(new Error(`Not authorized to subscribe to "${sub.topic}."`));
    }

    // if (sub.topic === 'bbb') {
    //   // overwrites subscription
    //   sub.qos = sub.qos + 2
    // }

    done(null, sub);
  }

export function authenticateWithJWT(
  client: any,
  username: string,
  password: string,
  done: (err: Error & { returnCode: number } | null, success: boolean | null) => void,
) {

    if (username !== 'JWT') { return done(null, false); }

    jwt.verify(password.toString(), process.env.JWT_SECRET, (err, profile) => {
      if (err) {
        const BAD_USERNAME_OR_PASSWORD = 4;
        const e: Error & { returnCode: number } = {
          ...new Error('Error getting UserInfo'),
          returnCode: BAD_USERNAME_OR_PASSWORD,
        };

        return done(e, false);
      }
      client.deviceProfile = profile;

      return done(null, true);
    });

}
