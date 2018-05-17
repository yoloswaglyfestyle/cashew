import { connect, subscribe, getHandlerToken } from './clientHelper';

export function startHandler2() {
  connect('handler2', getHandlerToken())
    .then(client => {
      subscribe(client, "get_more_apples")
        .then(p =>
          client.publish(`${p.user_id}/got_apples`, JSON.stringify(["green", "black", "purple"]))
        );
    });
}