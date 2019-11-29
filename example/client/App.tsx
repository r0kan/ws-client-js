// [libs]
import * as React from 'react';
import { Connection, JsonSerializer, CLOSE_EVENT_CODE, TCloseEvent } from 'ws-client-js';

// styles
import './App.css';

type TProps = {};

type TState = {
  connected: boolean;
  messages: object[];
};

export class App extends React.Component<TProps, TState> {
  state: TState = {
    connected: false,
    messages: [],
  };

  connection: Connection<object>;

  constructor(props: TProps) {
    super(props);
    this.connection = new Connection(new JsonSerializer(), {
      url: 'ws://localhost:8080',
      debug: true,
      reconnect: {
        delay: 500,
        delayIncreaseType: 'default',
        attempts: 5,
        skipCloseEventCodes: [CLOSE_EVENT_CODE.NORMAL, CLOSE_EVENT_CODE.NO_STATUS_RESERVED],
      },
    });
  }

  componentDidMount(): void {
    this.connection.onOpen(this.handleConnectionOpen);
    this.connection.onReopen(this.handleConnectionOpen);
    this.connection.onMessage(this.handleConnectionMessage);
    this.connection.onError(this.handleConnectionError);
    this.connection.onClose(this.handleConnectionClose);
  }

  handleConnectionOpen = () => {
    console.log('handleConnectionOpen');
    this.connection.send({ id: 1, name: 'User' });
    this.setState({
      connected: true,
    });
  };

  handleConnectionReopen = () => {
    console.log('handleConnectionReopen');
  };

  handleConnectionMessage = (message: unknown) => {
    console.log('handleConnectionMessage', message);
    this.setState(prevState => ({
      messages: prevState.messages.concat([message]),
    }));
  };

  handleConnectionClose = (event: TCloseEvent) => {
    console.log('handleConnectionClose', event);
    this.setState({
      connected: false,
    });
  };

  handleConnectionError = () => {
    console.log('handleConnectionError');
  };

  handleConnectClick = () => {
    if (this.state.connected) {
      this.connection.disconnect();
    } else {
      this.connection.connect();
    }
  };

  render() {
    const { connected, messages } = this.state;
    return (
      <div className="app">
        <button className="app__connect" onClick={this.handleConnectClick}>
          {connected ? 'Disconnect' : 'Connect'}
        </button>
        <h3 className="app__messages-title">Messages</h3>
        <div className="app__messages">
          {messages.map((message, index) => (
            <div key={index}>
              <pre>{JSON.stringify(message)}</pre>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
