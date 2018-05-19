import * as assert from 'assert';
import { MqttClient } from 'mqtt';
import { connect, getHandlerToken, subscribe } from '../../src/client';
import { IPayload } from '../../src/IPayload';
const MongoClient = require('mongodb').MongoClient;

export function startHandler3() {
  connect('handler2', getHandlerToken())
    .then((client: MqttClient) => {
      subscribe(client, 'get_more_apples')
        .then((p: IPayload) =>
          MongoClient.connect(process.env.MONGO_DB_URL,
                              { useNewUrlParser: true }, function (err, mongo) {
              assert.equal(null, err);
              const db = mongo.db(process.env.MONGO_DB_NAME);
              db.collection('apples')
                .find({}).toArray(function (err, docs) {
                  assert.equal(null, err);
                  const apples = docs.map(x => x.color);
                  client.publish(`${p.user_id}/got_apples`, JSON.stringify(apples))
                  mongo.close();
                });
            })
        );
    });
}
