import { IClientConnection, IClientOptions } from "../src/types";

declare module "cashew-mqtt" {
  import { Stream } from "most";
  export function connect(
    jwt: string,
    options: IClientOptions
  ): Promise<IClientConnection>;
  export function subscribe(
    topic: string,
    conn: IClientConnection
  ): Stream<any>;
  export function publish(
    topic: string,
    payload: any,
    conn: IClientConnection
  ): void;
}
