import { connect, getHandlerToken, subscribe, publish } from '../../src/client';

export function startHandler2() {
  connect(getHandlerToken(), { clientId: 'handler2' }).then(conn => {
    subscribe('+/get_more_apples', conn).observe((p: any) =>
      publish(
        `${p.user_id}/got_apples`,
        JSON.stringify(['green', 'black', 'purple']),
        conn
      ),
    );
  });
}
