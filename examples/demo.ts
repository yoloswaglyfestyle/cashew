require('dotenv').config();
// import * as aedesPersistenceRedis from 'aedes-persistence-redis';
// import * as mqEmitterRedis from 'mqemitter-redis';
import { start } from '../src/broker';
import { startMobileDevice } from './test_clients/test_mobile_device';
import { startHandler1 } from './test_handlers/test_handler1';
import { startHandler2 } from './test_handlers/test_handler2';
// import { startHandler3 } from './test_handlers/test_handler3_db';

const startClientsAndHandlers = () => {
  startMobileDevice();
  startHandler1();
  startHandler2();
  // startHandler3();
};

// const mq = mqEmitterRedis({
//   port: process.env.REDIS_MQ_PORT,
//   host: process.env.REDIS_MQ_HOST,
//   db: 0,
// });

// const persistence = aedesPersistenceRedis({
//   port: process.env.REDIS_DB_POST,
//   host: process.env.REDIS_DB_HOST,
//   family: 4,
//   db: 0,
//   maxSessionDelivery: 100,
//   packetTTL: () => {
//     return 10;
//   },
// });

start({  
  port: parseInt(process.env.BROKER_PORT || '8883', 0),
  logger: console,  
},    startClientsAndHandlers);
