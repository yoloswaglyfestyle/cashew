require('dotenv').config();
import { startBroker } from './broker/broker';
import { startMobileDevice } from './test_clients/test_mobile_device';
import { startHandler1 } from './test_handlers/test_handler1';
import { startHandler2 } from './test_handlers/test_handler2';
import { startHandler3 } from './test_handlers/test_handler3_db';

startBroker(() => {
  startMobileDevice();
  startHandler1();
  startHandler2();
  startHandler3();
});
