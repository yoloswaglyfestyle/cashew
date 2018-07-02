import { connect, getHandlerToken, publish, subscribe } from "../../src/client";

export function startHandler1() {
  connect(
    getHandlerToken(),
    { clientId: "handler1" }
  ).then(conn => {
    subscribe("+/get_apples", conn).observe((p: any) => {
      const responsePayload = JSON.stringify(["red", "yellow", "blue"]);
      publish(`${p.user_id}/got_apples`, responsePayload, conn);
    });
  });
}
