import * as assert from 'assert';
import { connect, getHandlerToken, subscribe } from '../../src/client';
import { IPayload } from '../../src/types';
const MongoClient = require('mongodb').MongoClient;

export function startHandler3() {
  connect(getHandlerToken(), { clientId: 'handler3' }).then(conn => {
    subscribe(conn, 'get_more_apples').then((p: IPayload) =>
      MongoClient.connect(
        process.env.MONGO_DB_URL,
        { useNewUrlParser: true },
        (err, mongo) => {
          if (err) {
            return console.log('Error connecting to mongo db: ' + err);
          }

          const db = mongo.db(process.env.MONGO_DB_NAME);
          db
            .collection('apples')
            .find({})
            .toArray((findErr, docs) => {
              assert.equal(null, findErr);
              const apples = docs.map(x => x.color);
              conn.client.publish(
                `${p.user_id}/got_apples`,
                JSON.stringify(apples),
              );
              mongo.close();
            });
        },
      ),
    );
  });
}
