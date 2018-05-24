import { MqttClient } from 'mqtt';
import { connect, getHandlerToken, subscribe } from '../../src/client';
import { IPayload } from '../../src/types';

export function startHandler2() {
  connect(getHandlerToken(), { clientId: 'handler2'})
    .then((client: MqttClient) => {
      subscribe(client, 'get_more_apples')
        .then((p: IPayload) =>
          client.publish(`${p.user_id}/got_apples`, JSON.stringify(['green', 'black', 'purple'])),
        );
    });
}
