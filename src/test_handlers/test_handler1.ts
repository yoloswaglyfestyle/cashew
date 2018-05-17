import { connect, subscribe, getHandlerToken } from '../clientHelper';

export function startHandler1() {
  connect('handler1', getHandlerToken())
    .then(client => {
      subscribe(client, "get_apples")
        .then(p => {
          const responsePayload = JSON.stringify(["red", "yellow", "blue"]);
          client.publish(
            `${p.user_id}/got_apples`,
            responsePayload)
        });
    })
}
