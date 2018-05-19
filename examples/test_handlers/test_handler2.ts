import { MqttClient } from 'mqtt';
import { connect, getHandlerToken, subscribe } from '../../src/client';
import { IPayload } from '../../src/IPayload';

export function startHandler2() {
  connect('handler2', getHandlerToken())
    .then((client: MqttClient) => {
      subscribe(client, "get_more_apples")
        .then((p: IPayload) =>
          client.publish(`${p.user_id}/got_apples`, JSON.stringify(["green", "black", "purple"]))
        );
    });
}
