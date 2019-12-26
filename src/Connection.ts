// types
import { IConnection, ISerializer } from './typing/interfaces';
import { TStatus, TOptions, TCloseEvent, TDisposer, TCloseEventCode } from './typing/types';

// constants
import { STATUS, CLOSE_EVENT_CODE } from './constants';
import { EVENT_TYPE } from './enums';

// reconnect behavior
import { Reconnect } from './Reconnect';

export class Connection<TMessage> implements IConnection<TMessage> {
  status: TStatus = STATUS.CONNECTING;

  private serializer: ISerializer<TMessage>;

  private readonly options: Omit<TOptions, 'reconnect'> = { url: '', debug: false };

  private readonly reconnect?: Reconnect;

  private connection: WebSocket | null = null;

  private error: Event | null = null;

  private protocol?: string | string[];

  private resendQueue: unknown[] = [];

  private readonly listeners: { [eventName in EVENT_TYPE]: Function[] } = {
    [EVENT_TYPE.OPEN]: [],
    [EVENT_TYPE.REOPEN]: [],
    [EVENT_TYPE.MESSAGE]: [],
    [EVENT_TYPE.CLOSE]: [],
    [EVENT_TYPE.ERROR]: [],
  };

  constructor(serializer: ISerializer<TMessage>, options: Partial<TOptions>) {
    this.serializer = serializer;
    this.options = {
      ...this.options,
      ...options,
    };

    if (this.options.url.search(/(wss?|https?)/) === -1) {
      throw new Error(`Not valid webSocket URL: ${this.options.url}`);
    }

    this.handleMessage = this.handleMessage.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleReconnectNext = this.handleReconnectNext.bind(this);
    this.handleReconnectEnd = this.handleReconnectEnd.bind(this);

    if (options.reconnect) {
      this.reconnect = new Reconnect(options.reconnect, {
        onNext: this.handleReconnectNext,
        onEnd: this.handleReconnectEnd,
      });
    }
  }

  onOpen(cb: () => void): TDisposer {
    if (this.status === STATUS.OPEN) {
      cb();
    } else {
      this.listeners[EVENT_TYPE.OPEN].push(cb);
    }
    return this.getEventListenerDisposer(EVENT_TYPE.OPEN, cb);
  }

  onReopen(cb: () => void): TDisposer {
    this.listeners[EVENT_TYPE.REOPEN].push(cb);
    return this.getEventListenerDisposer(EVENT_TYPE.REOPEN, cb);
  }

  onMessage(cb: (data: TMessage) => void): TDisposer {
    this.listeners[EVENT_TYPE.MESSAGE].push(cb);
    return this.getEventListenerDisposer(EVENT_TYPE.MESSAGE, cb);
  }

  onClose(cb: (event: TCloseEvent) => void): TDisposer {
    this.listeners[EVENT_TYPE.CLOSE].push(cb);
    return this.getEventListenerDisposer(EVENT_TYPE.CLOSE, cb);
  }

  onError(cb: () => void): TDisposer {
    this.listeners[EVENT_TYPE.ERROR].push(cb);
    return this.getEventListenerDisposer(EVENT_TYPE.ERROR, cb);
  }

  connect(protocol?: string | string[]): void {
    if (this.connection === null) {
      this.protocol = protocol;
      this.status = STATUS.CONNECTING;
      this.connection = new WebSocket(this.options.url, protocol);
      this.connection.onmessage = this.handleMessage;
      this.connection.onopen = this.handleOpen;
      this.connection.onerror = this.handleError;
      this.connection.onclose = this.handleClose;
    }
  }

  disconnect(closeEvent?: TCloseEvent): void {
    if (this.connection !== null) {
      this.status = STATUS.CLOSED;
      this.notifyListeners(
        EVENT_TYPE.CLOSE,
        closeEvent || {
          code: CLOSE_EVENT_CODE.NORMAL,
          reason: 'Closed by client',
        },
      );
      this.connection.close();
      this.connection = null;
    }
  }

  send<T = unknown>(data: T): boolean {
    if (this.status === STATUS.CONNECTING) {
      this.resendQueue.push(data);
      return true;
    }
    if (this.status !== STATUS.OPEN || !this.connection) {
      this.notifyListeners(EVENT_TYPE.ERROR);
      return false;
    }

    this.connection.send(this.serializer.serialize(data));
    return true;
  }

  private resend(): void {
    if (this.resendQueue.length !== 0 && this.connection) {
      for (let i = 0; i < this.resendQueue.length; i += 1) {
        this.connection.send(this.serializer.serialize(this.resendQueue[i]));
      }
      this.resendQueue = [];
    }
  }

  private handleMessage(event: MessageEvent): void {
    this.notifyListeners(EVENT_TYPE.MESSAGE, this.serializer.deserialize(event.data));
  }

  private handleOpen(event: Event): void {
    this.status = STATUS.OPEN;

    if (this.reconnect && this.reconnect.isStarted) {
      this.reconnect.stop();
      this.error = null;
      this.notifyListeners(EVENT_TYPE.REOPEN);
      this.log('socket reopened', event);
    } else {
      this.notifyListeners(EVENT_TYPE.OPEN);
      this.log('socket opened', event);
    }

    this.resend();
  }

  private handleError(error: Event): void {
    this.notifyListeners(EVENT_TYPE.ERROR);
    this.error = error;
    this.log('socket error', error);
  }

  private handleReconnectNext(): void {
    this.status = STATUS.CONNECTING;
    if (this.connection) {
      this.connection = null;
    }
    this.connect(this.protocol);
  }

  private handleReconnectEnd(): void {
    this.status = STATUS.CLOSED;
    this.disconnect({
      code: CLOSE_EVENT_CODE.NORMAL,
      reason: 'Reconnect failed',
    });
  }

  private handleClose(event: CloseEvent): void {
    if (this.reconnect && (this.error || this.reconnect.canApply(event.code as TCloseEventCode))) {
      this.reconnect.start();
    } else {
      this.log('socket stopped', event);
      this.disconnect({
        code: event.code,
        reason: event.reason,
      });
    }
  }

  private notifyListeners(type: EVENT_TYPE, data?: unknown): void {
    switch (type) {
      case EVENT_TYPE.OPEN:
      case EVENT_TYPE.ERROR:
      case EVENT_TYPE.REOPEN: {
        for (let i = 0; i < this.listeners[type].length; i += 1) {
          this.listeners[type][i]();
        }
        break;
      }
      case EVENT_TYPE.CLOSE:
      case EVENT_TYPE.MESSAGE: {
        for (let i = 0; i < this.listeners[type].length; i += 1) {
          this.listeners[type][i](data);
        }
        break;
      }
    }
  }

  private getEventListenerDisposer(eventType: EVENT_TYPE, cb: (data: any) => any): TDisposer {
    return () => {
      this.listeners[eventType] = this.listeners[eventType].filter(i => i !== cb);
    };
  }

  private log(...args: any[]): void {
    if (this.options.debug) {
      console.group('WebSocket Connection log');
      args.forEach(arg => {
        typeof arg === 'object' ? console.dir(arg) : console.info(arg);
      });
      console.groupEnd();
    }
  }
}
