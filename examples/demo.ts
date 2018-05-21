require('dotenv').config();
import { start } from '../src/broker';
import { startMobileDevice } from './test_clients/test_mobile_device';
import { startHandler1 } from './test_handlers/test_handler1';
import { startHandler2 } from './test_handlers/test_handler2';
import { startHandler3 } from './test_handlers/test_handler3_db';
const fs = require('fs');
const path = require('path');

const keys = {
  key: fs.readFileSync(path.join(__dirname, process.env.TLS_KEY_FILE)),
  cert: fs.readFileSync(path.join(__dirname, process.env.TLS_CERT_FILE)),
  ca: fs.readFileSync(path.join(__dirname, process.env.CA_CERT_FILE)),
};

const startClientsAndHandlers = () => {
  startMobileDevice(keys);
  startHandler1(keys);
  startHandler2(keys);
  startHandler3(keys);
};

start({
  keys,
  port: parseInt(process.env.BROKER_PORT, 0),
  logger: console,
},    startClientsAndHandlers);
