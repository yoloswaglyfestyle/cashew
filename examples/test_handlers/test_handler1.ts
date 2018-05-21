import { MqttClient } from 'mqtt';
import { connect, getHandlerToken, subscribe } from '../../src/client';
import { IPayload, ITLSKeys } from '../../src/types';

export function startHandler1(keys: ITLSKeys) {
  connect(getHandlerToken(), {keys, clientId: 'handler1'})
    .then((client: MqttClient) => {
      subscribe(client, 'get_apples')
        .then((p: IPayload) => {
          const responsePayload = JSON.stringify(['red', 'yellow', 'blue']);
          client.publish(
            `${p.user_id}/got_apples`,
            responsePayload);
        });
    });
}
