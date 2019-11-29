import { TStatus, TCloseEvent, TDisposer } from './types';

export interface ISerializer<TMessage> {
  serialize<T = unknown>(data: T): string | ArrayBufferLike | Blob | ArrayBufferView;
  deserialize<T = unknown>(data: T): TMessage;
}

export interface IConnection<TMessageData> {
  status: TStatus;
  connect(protocol?: string | string[]): void;
  disconnect(closeEvent?: TCloseEvent): void;
  send<T = unknown>(data: T): boolean;
  onOpen(cb: () => void): TDisposer;
  onReopen(cb: () => void): TDisposer;
  onError(cb: () => void): TDisposer;
  onClose(cb: (event: TCloseEvent) => void): TDisposer;
  onMessage(cb: (data: TMessageData) => void): TDisposer;
}
