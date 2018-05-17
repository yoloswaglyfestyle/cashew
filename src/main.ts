require('dotenv').config();
import { startBroker } from './broker'
import { startSubscriber } from './subscriber'
import { startPublisher } from './publisher'

startBroker(() => {
  startSubscriber();
  startPublisher();
});
