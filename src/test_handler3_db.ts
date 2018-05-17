import { connect, subscribe, getHandlerToken } from './clientHelper';
import * as assert from 'assert';

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://test:yardsale@ds127490.mlab.com:27490/heroku_jxd0g5j4";

export function startHandler3() {
  connect('handler2', getHandlerToken())
    .then(client => {
      subscribe(client, "get_more_apples")
        .then(p =>
          MongoClient.connect(url, { useNewUrlParser: true }, function (err, mongo) {
            assert.equal(null, err);
            try {
              const db = mongo.db("heroku_jxd0g5j4");
              const col = db.collection('apples');
              col.find({}).toArray(function (err, docs) {
                assert.equal(null, err);
                const apples = docs.map(x => x.color);
                client.publish(`${p.user_id}/got_apples`, JSON.stringify(apples))
                mongo.close();
              });
            }
            catch (e) {
              throw e;
            }
          })
        )
        .catch(err => {
          console.log(err);
        })
    })
    .catch(err => {
      console.log(err);
    });
}