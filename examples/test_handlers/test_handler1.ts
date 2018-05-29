import { connect, getHandlerToken, subscribe } from '../../src/client';
import { IPayload } from '../../src/types';

export function startHandler1() {
  connect(getHandlerToken(), { clientId: 'handler1' }).then(conn => {
    subscribe(conn, 'get_apples').then((p: IPayload) => {
      const responsePayload = JSON.stringify(['red', 'yellow', 'blue']);
      conn.client.publish(`${p.user_id}/got_apples`, responsePayload);
    });
  });
}
