require('dotenv').config();
import { connect } from '../src/broker';
import { startMobileDevice } from './test_clients/test_mobile_device';
import { startHandler1 } from './test_handlers/test_handler1';
import { startHandler2 } from './test_handlers/test_handler2';
import { startHandler3 } from './test_handlers/test_handler3_db';
var fs = require('fs');
var path = require('path');

const startClientsAndHandlers = () => {
  startMobileDevice();
  startHandler1();
  startHandler2();
  startHandler3();
};

connect({
  port: process.env.BROKER_PORT,
  keyFile: fs.readFileSync(path.join(__dirname, process.env.TLS_KEY_FILE)),
  certFile: fs.readFileSync(path.join(__dirname, process.env.TLS_CERT_FILE))
}, startClientsAndHandlers);
