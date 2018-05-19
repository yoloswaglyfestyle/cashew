# Cashew

Cashew is a real-time communications backend for connected applications.

### Install 

```sh
npm i https://github.com/bsommardahl/cashew
```
### Getting Started

#### The Broker

```javascript 
import { start } from 'cashew';
import fs from 'fs';
import path from 'path';

start({
  port: process.env.BROKER_PORT,
  keyFile: fs.readFileSync(path.join(__dirname, process.env.TLS_KEY_FILE)),
  certFile: fs.readFileSync(path.join(__dirname, process.env.TLS_CERT_FILE)),  
}, () => {
  console.log("Cashew running on port " + process.env.BROKER_PORT);
   
});
```
#### The Client

```javascript
import { subscribe } from 'cashew';

connect('some device or handler id', getHandlerToken())
  .then((client: MqttClient) => {
    subscribe(client, 'get_apples')
      .then((p: IPayload) => {
        const responsePayload = JSON.stringify(['red', 'yellow', 'blue']);
        client.publish(
          `${p.user_id}/got_apples`,
          responsePayload)
      });
  });
```
See more examples in our [demo](https://github.com/bsommardahl/cashew/tree/master/examples).

## Setup

Demo Prereq's:
- Redis Db (at least one)
- Mongo Db
- Loggly Account

You'll need the following environment variables. You can either add them to your environmemt or create an `.env` file in the project root.

```
JWT_SECRET=shhhhh
LOGGLY_TOKEN=0000000-0000-0000-9001-0000000000
LOGGLY_SUBDOMAIN=something
REDIS_MQ_HOST=127.0.0.1
REDIS_DB_HOST=127.0.0.1
REDIS_MQ_POST=6379
REDIS_DB_POST=6379
BROKER_PORT=8883
TLS_KEY_FILE=../ca-certificates/server.key
TLS_CERT_FILE=../ca-certificates/server.crt
CA_CERT_FILE=../ca-certificates/ca.crt
MONGO_DB_URL=mongodb://test:test@00000000.mlab.com:27490/someName
MONGO_DB_NAME=someName
```
## Demo

To run the demo, you need to start an instance of Redis and configure it in your environment. For convenience, we have included a `docker-compose.yml` file so that you can easily run a local instance. Use the following commands in your terminal:

```
cd examples
docker-compose up
```

(Of course, this assumes you have installed Docker and Docker Compose.)

Once Redis is running, you can use the following commands to run the demo (in another terminal):

```
cd examples
npm install
npm run demo
```

You should see a series of console logs. After 3 seconds, you should see that the mobile device requested and received apples. After a few more seconds, you should see that the mobile device requests "more apples" (literally) and gets two sets: 1) from a simple handler and 2) from a db-connected handler. In all, the client should have received 9 apples of different colers.

## Concepts

### IDP

The "Identity Provider" (IDP) can be anything that produces a properly signed JWT. The only requirement is that the IDP use the same secret key for signing since the broker will verify the JWT before passing on requests.

Cashew supports Auth0 out-of-the-box since it is easy to get moving. However, any other IDP will do and should only require a an adapter to translate their output to a signed JWT.

When connecting to the broker, you must include use "JWT" as the username and the actual signed JWT string as the password.

### Broker 

The broker sits between mobile devices and the handlers that will do the work. The broker's main responsibilities are:

- Wait for commands
- Handle new subscriptions
- Facilitate publishing of commands
- Notify subscribers of newly published commands
- Enforce authentication with JWT verification
- Enforce authorization to subscribe or publish

One broker instance will be able to handle around 50,000 live subscriptions and around 5,000 publishes per second (needs to be verified with load testing). When it's time to scale up, we can cluster the broker.

### Mobile and Web Devices

Client devices will both publish and subscribe. Topics will be used to divide the communication between services.

### Handlers

Handlers monitor (subscribe to) topics in order to carry out the wishes of the user. In this case, handlers could be analogous to AWS's Lambda Functions. Each handler should be small and focuses on one task. Handlers can be deployed to various environments. 

Handlers also authenticate using JWT and must have a `handler` property to be allowed to subscribe. In the future, we will lock down handlers so that they can only subscribe to predetermined topics.

## Conventions
### Topic Naming

In general, topic names should be pretty descriptive. It's best to let topic names describe the specific action you'd like to perform. Topics are free, so there's no reason to try to shoe-horn several intentions into one "god-topic". For some great advice when naming topics, please check out this article by HiveMq: https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices.

We will give you a few additional guidelines:

- Commands are messages that are usually sent from the mobile device to a handler to do or request something. Some examples might include "get apples", "wash dishes",or "save dog". The voice of a command's topic name should be somewhat (or very) imperative. It should also be in the present tense, much like a vocal command you might make to Amazon Alexa, Siri or your Google Assistant. 
- Events are messages that are sent out as a result of something else. Many times, events result from commands. To respond to the examples above, some events might be "got apples", "dishes washed", or "dog saved". Events can also come from other triggers like a cron job or another system. It's best to name events in the past tense, stating what has already happened.
- Many times, events are directed at a specific user. In that case, the user's id must be included in the message so that, like a letter in the mail, it gets to the right destination. We use the following format: "{userId}/{eventName}..." For example, if the event is "got_apples" and the userId is "123", then the mobile device must subscribe to "123/get_apples" to start receiving those events. 

## Scenarios
### Example Scenario - "Add a contact"

- RequestContactHandler - subscribes to "request_contact" topic 
- RequestContactHandler - subscribes to "accept_contact" topic 
- Mobile device #1 - subscribes to "68946/contact_approved" topic (where "68946" is the user id)
- Mobile device #2 - subscribes to "23412/contact_requested" topic (where "23412" is the user id)
- Mobile device #1 - User adds a contact
- Mobile device #1 - Publishes payload to "request_contact" topic
- Broker - Receives publish and broadcasts to all subscribers
- RequestContactHandler - receives payload on "request_contact" topic
- RequestContactHandler - adds contact request to store
- RequestContactHandler - publishes payload to "23412/contact_requested" topic
- Broker - Receives publish and broadcasts to all subscribers
- Mobile device #2 - Receives payload on the "23412/contact_requested" topic
- Mobile device #2 - Decides to accept, publishes payload to "accept_contact" topic
- Broker - Receives publish and broadcasts to all subscribers
- RequestContactHandler - receives payload on "accept_contact" topic
- RequestContactHandler - removes the request from the store and adds an approved contact to the store
- RequestContactHandler - publishes payload on "68946/contact_approved" topic
- Broker - Receives publish and broadcasts to all subscribers
- Mobile device #1 - receives payload and congratulates the user

### Example Scenario - "Get list of contacts"

- ContactListHandler - subscribes to "get_contact_list" topic 
- Mobile device #1 - User wants to see a list of contacts
- Mobile device #1 - subscribes to "68946/contact_list" topic (where "68946" is the user id)
- Mobile device #1 - Publishes to "get_contact_list" topic
- Broker - Receives publish and broadcasts to all subscribers
- ContactListHandler - receives payload on "get_contact_list" topic
- ContactListHandler - gets contacts from store
- ContactListHandler - publishes payload to "68946/contact_list" topic
- Broker - Receives publish and broadcasts to all subscribers
- Mobile device #1 - Receives payload on the "68946/contact_list" topic
- Mobile device #2 - Displays the list

## Considerations

### Scalability

The broker is ready to cluster. It uses Redis to persist subscriptions and topics in-flight. It also employs MqEmitter-Redis which is cluster-ready. We should be able to put the broker behind a load balancer and scale out.

### Security

#### TLS
Connection to the broker must be made with TLS.

Create a test cert and key file using the following command. This tutorial might help: http://www.steves-internet-guide.com/mosquitto-tls/

Clients need the ca cert along with the server cert and key. The server only needs the server cert and key.

#### Subscription Partitioning

The authorization mechanism is written to only allow mobile devices to subscribe to topics that include the user's id in the first segment of the topic name. If the wrong user id is provided, the subscription is refused.

## Todo
- Confirm protection against MiTM and DDoS attacks

## Credits

Thanks to Jakub Synowiec (@jsynowiec) for taking the time to create and maintain a great node/ts boilerplate. It helped us get moving much faster! https://github.com/jsynowiec/node-typescript-boilerplate 

## Sponsors
[![Vault Wallet](https://vaultwallet.io/wp-content/uploads/2018/03/vault_logo_light.png)](https://vaultwallet.io)
