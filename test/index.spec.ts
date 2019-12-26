// utils
import { WsServer } from './WsServer';

// lib
import { Connection, JsonSerializer, IConnection, STATUS, CLOSE_EVENT_CODE } from '../.';

const wsUrl = 'ws://127.0.0.1:8080';

const stubClientData = { id: 1, name: 'User' };
const stubServerData = JSON.stringify(stubClientData);

const wait = (time: number) =>
  new Promise(resolve => {
    setTimeout(resolve, time);
  });

describe('ws-client-js', () => {
  let wsServer: WsServer;
  let connection: IConnection<unknown>;

  beforeAll(async () => {
    wsServer = await WsServer.create(wsUrl);
  });

  afterAll(() => {
    if (wsServer) {
      wsServer.close();
    }
  });

  beforeEach(() => {
    connection = new Connection(new JsonSerializer(), { url: wsUrl });
  });

  afterEach(() => {
    connection.disconnect();
  });

  test('connect should call "onOpen" listeners', async () => {
    const onOpenFn: jest.Mock = jest.fn();
    const onOpenFn2: jest.Mock = jest.fn();

    connection.onOpen(onOpenFn);

    connection.connect();
    await wait(100);
    connection.onOpen(onOpenFn2);

    expect(onOpenFn).toBeCalledTimes(1);
    expect(onOpenFn2).toBeCalledTimes(1);
  });

  test('send message', async () => {
    connection.connect();
    await wait(100);

    const message = await wsServer.waitMessage(() => {
      connection.send(stubClientData);
    });

    expect(message).toEqual(stubServerData);
  });

  test('"onClose" listeners should be called', async () => {
    const onCloseFn: jest.Mock = jest.fn();

    connection.onClose(onCloseFn);
    connection.connect();
    await wait(100);

    wsServer.close();

    await wait(100);

    expect(onCloseFn).toBeCalledTimes(1);

    wsServer = await WsServer.create(wsUrl);
  });

  test('reconnect should work', async () => {
    const onReopenFn: jest.Mock = jest.fn();
    const onCloseFn: jest.Mock = jest.fn();

    const connection = new Connection(new JsonSerializer(), {
      url: wsUrl,
      reconnect: {
        delay: 1000,
        delayIncreaseType: 'default',
        attempts: 4,
        skipCloseEventCodes: [CLOSE_EVENT_CODE.NORMAL],
      },
    });

    connection.onReopen(onReopenFn);
    connection.onClose(onCloseFn);
    connection.connect();

    await wait(100);

    expect(connection.status).toBe(STATUS.OPEN);

    wsServer.closeConnections(CLOSE_EVENT_CODE.UNSUPPORTED_DATA);

    await wait(100);

    expect(connection.status).toBe(STATUS.OPEN);

    await wait(1000);

    expect(onReopenFn).toBeCalledTimes(1);
    expect(onCloseFn).toBeCalledTimes(0);
  });

  test("reconnect should don't work with skipCloseEventCodes", async () => {
    const onCloseFn: jest.Mock = jest.fn();

    const connection = new Connection(new JsonSerializer(), {
      url: wsUrl,
      reconnect: {
        delay: 1000,
        delayIncreaseType: 'default',
        attempts: 4,
        skipCloseEventCodes: [CLOSE_EVENT_CODE.NORMAL],
      },
    });

    connection.onClose(onCloseFn);
    connection.connect();

    await wait(100);

    expect(connection.status).toBe(STATUS.OPEN);

    wsServer.closeConnections(CLOSE_EVENT_CODE.NORMAL);

    await wait(100);

    expect(connection.status).toBe(STATUS.CLOSED);
    expect(onCloseFn).toBeCalledTimes(1);
  });
});
