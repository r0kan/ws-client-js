import { ISerializer } from '../typing/interfaces';

export class JsonSerializer<TDeSerializedData> implements ISerializer<TDeSerializedData> {
  serialize<T = unknown>(data: T): string {
    return JSON.stringify(data);
  }

  deserialize<T = unknown>(data: T): TDeSerializedData {
    if (typeof data === 'string') {
      return JSON.parse(data);
    }

    throw new Error(`Deserialize failed for data: ${data}`);
  }
}
