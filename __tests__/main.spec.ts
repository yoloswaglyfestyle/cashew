import { start } from "../src/broker";
import { connect } from "../src/client";

import * as jwt from "jsonwebtoken";
import { connect, subscribe, publish } from "../src/client";

const userId = 139871238127389;
const token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET || "shhhhh");

describe("The MQTT Broker", () => {
  describe("When starting the broker", () => {
    it("should start the broker up", finish => {
      start({ logger: console }, (_, server) => {
        server.close();
        finish();
      });
    });
    it("should accept connections", finish => {
      start({ logger: console }, (_, server) => {
        connect(
          token,
          {}
        ).then(conn => {
          console.log(conn);
          server.close();
          finish();
        });
      });
    });
    it("should not allow subscribing to another user's topic", finish => {
      start({}, (broker, server) => {
        broker.on("clientError", (client, err) => {
          console.log(client);
          console.log(err);
          finish();
        });

        connect(
          token,
          {}
        ).then(conn => {
          subscribe("anotherUser/topic", conn);
        });
      });
    });
  });
});

// connect(token, options).then(conn => {
//   setTimeout(() => {
//     publish(`${userId}/get_apples`, JSON.stringify({}), conn);
//     setTimeout(() => {
//       publish(
//         `${userId}/get_more_apples`,
//         JSON.stringify({}),
//         conn);
//     }, 8000);
//   }, 3000);

//   const topic = `${userId}/got_apples`;
//   subscribe(topic, conn).observe(apples => {
//     console.log('subscriber receiving', topic, apples);
//   });
// });
