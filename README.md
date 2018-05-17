## Components

### IDP

The "Identity Provider" (IDP) can be anything that produces a properly signed JWT. The only requirement is that the IDP use the same secret key for signing since the broker will verify the JWT before passing on requests.

For now, we will use Auth0 as our IDP since it is easy to get moving. However, any other IDP will do. For example, if we need to work with Microsoft systems, a simple adapter could be built to convert whatever horrible XML mess they send us into a nice clean JWT.

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

### Mobile devices

Mobile devices will both publish and subscribe. Topics will be used to divide the communication between services.

### Handlers

Handlers monitor (subscribe to) topics in order to carry out the wishes of the user. In this case, handlers could be analogous to AWS's Lambda Functions. Each handler should be small and focuses on one task. Handlers can be deployed to various environments. 

Handlers also authenticate using JWT.

Messages sent from handler to mobile device are published to topic names prefixed with the user id (ex: "423144_some_topic"). Messages sent from mobile device to handler do not have the user id prefix.

#### Example Scenario - "Add a contact"

- RequestContactHandler - subscribes to "request_contact" topic 
- RequestContactHandler - subscribes to "accept_contact" topic 
- Mobile device #1 - subscribes to "68946_contact_approved" topic (where "68946" is the user id)
- Mobile device #2 - subscribes to "23412_contact_requested" topic (where "23412" is the user id)
- Mobile device #1 - User adds a contact
- Mobile device #1 - Publishes payload to "request_contact" topic
- Broker - Receives publish and broadcasts to all subscribers
- RequestContactHandler - receives payload on "request_contact" topic
- RequestContactHandler - adds contact request to store
- RequestContactHandler - publishes payload to "23412_contact_requested" topic
- Broker - Receives publish and broadcasts to all subscribers
- Mobile device #2 - Receives payload on the "23412_contact_requested" topic
- Mobile device #2 - Decides to accept, publishes payload to "accept_contact" topic
- Broker - Receives publish and broadcasts to all subscribers
- RequestContactHandler - receives payload on "accept_contact" topic
- RequestContactHandler - removes the request from the store and adds an approved contact to the store
- RequestContactHandler - publishes payload on "68946_contact_approved" topic
- Broker - Receives publish and broadcasts to all subscribers
- Mobile device #1 - receives payload and congratulates the user

#### Example Scenario - "Get list of contacts"

- ContactListHandler - subscribes to "get_contact_list" topic 
- Mobile device #1 - User wants to see a list of contacts
- Mobile device #1 - subscribes to "68946_contact_list" topic (where "68946" is the user id)
- Mobile device #1 - Publishes to "get_contact_list" topic
- Broker - Receives publish and broadcasts to all subscribers
- ContactListHandler - receives payload on "get_contact_list" topic
- ContactListHandler - gets contacts from store
- ContactListHandler - publishes payload to "68946_contact_list" topic
- Broker - Receives publish and broadcasts to all subscribers
- Mobile device #1 - Receives payload on the "68946_contact_list" topic
- Mobile device #2 - Displays the list

## Setup

You'll need the following environment variables. You can either add them to your environmemt or create an `.env` file in the project root.

```
JWT_SECRET=shhhhh
LOGGLY_TOKEN=0000000-0000-0000-9001-0000000000
LOGGLY_SUBDOMAIN=something
```

## Security

### TLS
Connection to the broker must be made with SSL.

### Todo
Confirm protection against MITM and DDoS attacks
