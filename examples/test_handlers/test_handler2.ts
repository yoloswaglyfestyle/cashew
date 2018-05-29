import { connect, getHandlerToken, subscribe } from '../../src/client';
import { IPayload } from '../../src/types';

export function startHandler2() {
  connect(getHandlerToken(), { clientId: 'handler2' }).then(conn => {
    subscribe(conn, 'get_more_apples').then((p: IPayload) =>
      conn.client.publish(
        `${p.user_id}/got_apples`,
        JSON.stringify(['green', 'black', 'purple']),
      ),
    );
  });
}
