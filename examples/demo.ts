require('dotenv').config();
import { start } from '../src/broker';
import { startMobileDevice } from './test_clients/test_mobile_device';
import { startHandler1 } from './test_handlers/test_handler1';
import { startHandler2 } from './test_handlers/test_handler2';

const startClientsAndHandlers = () => {
  console.log('Cashew listening...');
  startMobileDevice();
  startHandler1();
  startHandler2();
};

start(
  {
    logger: console,
  },
  startClientsAndHandlers,
);
