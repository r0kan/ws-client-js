import { STATUS, CLOSE_EVENT_CODE } from '../constants';

type Values<T extends object> = T[keyof T];

// Reconnect
export type TReconnectState = {
  delay: number;
  attempts: number;
};

export type TReconnectCallbacks = {
  onNext: () => void;
  onEnd: () => void;
};

export type TReconnectOptions = {
  delay: number;
  delayIncreaseType: 'default' | 'twice';
  attempts: number;
  skipCloseEventCodes: TCloseEventCode[];
};

// Connection
export type TStatus = Values<typeof STATUS>;
export type TCloseEventCode = Values<typeof CLOSE_EVENT_CODE>;

export type TOptions = {
  url: string;
  reconnect: false | TReconnectOptions;
  debug: boolean;
};

export type TCloseEvent = {
  code: number;
  reason: string;
};

export type TDisposer = () => void;
