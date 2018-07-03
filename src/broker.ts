// import aedes from "aedes";
const aedes = require("aedes");
import * as http from "http";
import { ISubscription } from "mqtt-packet";
// import * as net from 'net';
// import * as tls from 'tls';
import * as webSockets from "websocket-stream";

import {
  authenticateWithJWT,
  authorizePublish,
  authorizeSubscribe
} from "./auth";
import { IBrokerOptions } from "./types";

const defaultOptions = {
  authenticate: authenticateWithJWT,
  authorizePublish,
  authorizeSubscribe,
  debug: false,
  logger: console,
  port: 1883
};

export function start(
  opts: IBrokerOptions,
  cb: (broker: any, server: http.Server) => void
) {
  const options = { ...defaultOptions, ...opts };
  const broker = aedes({ persistence: options.persistence, mq: options.mq });

  broker.authenticate = options.authenticate;
  broker.authorizeSubscribe = options.authorizeSubscribe;
  broker.authorizePublish = options.authorizePublish;

  broker.on("client", client => {
    options.logger.log("New connection: ", client.id);
  });

  broker.on("clientDisconnect", client => {
    options.logger.log("Disconnected connection: ", client.id);
  });

  broker.on("clientError", (client, err) => {
    options.logger.error("client error", client.id, err.message, err.stack);
  });

  broker.on("connectionError", (client, err) => {
    options.logger.error("connection error", client.id, err.message, err.stack);
  });

  broker.on("publish", (packet, client) => {
    if (client) {
      options.logger.log("Message from client", client.id, packet.topic);
    }
  });

  broker.on("subscribe", (subscriptions: ISubscription[], client) => {
    if (client) {
      options.logger.log("subscribe from client", subscriptions, client.id);
    }
  });

  // const server = options.keys
  //   ? tls.createServer(options.keys, broker.handle)
  //   : net.createServer(broker.handle);

  const webServer = http.createServer();
  webSockets.createServer(
    {
      server: webServer
    },
    broker.handle
  );

  webServer.listen(options.port, () => {
    if (cb) {
      cb(broker, webServer);
    }
  });

  process.on("uncaughtException", exception => {
    options.logger.error(exception);
  });
}
