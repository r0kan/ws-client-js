# ws-client-js

WebSocket client implementation with reconnect behavior.

## Install

```bash
yarn add ws-client-js
```

or

```bash
npm install ws-client-js --save
```

## Usage

```javascript
import { Connection, JsonSerializer, CLOSE_EVENT_CODE } from 'ws-client-js';

// JSON serializer for send and receive message
const serializer = new JsonSerializer();

const connection = new Connection(serializer, {
  // websocket endpoint
  url: 'ws://localhost:8080',
  reconnect: {
    // 1 seconds
    delay: 1000,
    // 'default' | 'twice'
    // After each attempt, the delay increases based on the type. 'default' does not increase
    delayIncreaseType: 'twice',
    // number of attempts
    attempts: 5,
    // connection closure codes for which reconnect will not work
    skipCloseEventCodes: [CLOSE_EVENT_CODE.NORMAL, CLOSE_EVENT_CODE.NO_STATUS_RESERVED],
  },
  debug: false, // log debug messages
});

// use for start connection to endpoint
connection.connect();

// use for start disconnect to endpoint
connection.disconnect();
```

## Api methods

1. Start connection process
   ```
   connect(protocol?: string | string[]): void;
   ```
2. Start disconnect process
   ```
   disconnect(closeEvent?: TCloseEvent): void;
   ```
3. Send message to server. The message will be serialized using ISerialize implementation
   ```
   send<T = unknown>(data: T): boolean;
   ```
4. Call callback when the message arrives. The message will be deserialized using ISerialize implementation
   ```
   onMessage(cb: () => void): TDisposer;
   ```
5. Call callback when connection open
   ```
   onOpen(cb: () => void): TDisposer;
   ```
6. Call callback when connection open after reconnect
   ```
   onReopen(cb: () => void): TDisposer;
   ```
7. Call callback when a connection error occurs
   ```
   onError(cb: () => void): TDisposer;
   ```
8. Call callback when the connection closes
   ```
   onClose(cb: (event: TCloseEvent) => void): TDisposer;
   ```
