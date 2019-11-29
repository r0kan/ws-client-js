import { TReconnectState, TReconnectOptions, TReconnectCallbacks, TCloseEventCode } from './typing/types';

export class Reconnect {
  private readonly initialState: TReconnectState;

  private readonly state: TReconnectState;

  private readonly attemptsMax: number = 0;
  private readonly delayIncreaseType: TReconnectOptions['delayIncreaseType'];
  private readonly skipCloseEventCodes: TCloseEventCode[] = [];

  private readonly callbacks: TReconnectCallbacks;

  private timeoutId: undefined | number;

  constructor(options: TReconnectOptions, callbacks: TReconnectCallbacks) {
    this.initialState = {
      delay: options.delay,
      attempts: 0,
    };

    this.state = {
      delay: this.initialState.delay,
      attempts: this.initialState.attempts,
    };

    this.attemptsMax = options.attempts;
    this.delayIncreaseType = options.delayIncreaseType;
    this.skipCloseEventCodes = options.skipCloseEventCodes;
    this.callbacks = callbacks;
    this.perform = this.perform.bind(this);
  }

  canApply(code: TCloseEventCode): boolean {
    return this.skipCloseEventCodes.indexOf(code) === -1;
  }

  start(): void {
    this.state.attempts += 1;

    if (this.state.attempts >= this.attemptsMax) {
      this.resetState();
      this.callbacks.onEnd();
    } else {
      this.clearTimer();
      this.timeoutId = window.setTimeout(this.perform, this.state.delay);
    }
  }

  stop(): void {
    this.resetState();
    this.clearTimer();
  }

  private perform(): void {
    switch (this.delayIncreaseType) {
      case 'twice': {
        this.state.delay = this.state.delay * 2;
        break;
      }
      default:
    }
    this.callbacks.onNext();
  }

  private resetState(): void {
    this.state.attempts = this.initialState.attempts;
    this.state.delay = this.initialState.delay;
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
