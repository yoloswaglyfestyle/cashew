require('dotenv').config();
import { startBroker } from './broker'
import { startMobileDevice } from './test_mobile_device'
import { startHandler1 } from './test_handler1'
import { startHandler2 } from './test_handler2'

startBroker(() => {
  startMobileDevice();
  startHandler1();
  startHandler2();
});
