# Constellation Test Server

This module allows you to replicate the Constellation server and use clients such as [Carina](https://github.com/mixer/carina) to connect and subscribe to [Constellation](https://dev.mixer.com/reference/constellation/index.html) live events.

## Setup
1. You can connect to the public test server using the WS address: `` Or you can follow the rest of the steps to run your own server.
1. Clone the repo.
1. `npm install` Note: This requires a setup of TypeScript installed on your development environment also.
1. `tsc`
1. Start the test server with `node lib/`

## Usage
You can subscribe to all the events which Constellation currently provides using the [Constellation methods](https://dev.mixer.com/reference/constellation/index.html#methods_livesubscribe). Once you
have subscribed you will start to receive dummy events from the server.

However as this is a test server you can optionally send a `internal` parameter in the `livesubscribe` method. This allows you to change how often you get sent that event, you can only do this with the test server and not with
the production version of Constellation from Mixer.

The default interval for events is: `3000`ms. There is a max interval config which if you go over that it will default back.

If you get stuck with using Constellation or anything else please use the following: [Constellation Reference](https://dev.mixer.com/reference/constellation/index.html).
