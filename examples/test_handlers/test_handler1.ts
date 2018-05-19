import { MqttClient } from 'mqtt';
import { connect, getHandlerToken, subscribe } from '../../src/client';
import { IPayload } from '../../src/IPayload';

export function startHandler1() {
  connect('handler1', getHandlerToken())
    .then((client: MqttClient) => {
      subscribe(client, 'get_apples')
        .then((p: IPayload) => {
          const responsePayload = JSON.stringify(['red', 'yellow', 'blue']);
          client.publish(
            `${p.user_id}/got_apples`,
            responsePayload)
        });
    });
}
