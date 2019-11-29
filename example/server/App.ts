import * as WebSocketLib from 'ws';

export class App {
  static async create(port: number): Promise<App> {
    const server = new WebSocketLib.Server({
      port: port,
    });

    await new Promise((resolve, reject) => {
      server.on('listening', () => {
        console.log(`server start on port: ${port}`);
        resolve();
      });

      server.on('error', (...error: any) => {
        console.log(`server error: ${error}`);
        reject(error);
      });
    });

    return new App(server);
  }

  private incrementedId: number = 0;
  private readonly connections: Map<number, WebSocketLib> = new Map();

  private constructor(private readonly server: WebSocketLib.Server) {
    this.server.on('connection', connection => {
      this.incrementedId += 1;
      this.connections.set(this.incrementedId, connection);
      console.log(`server new client connection #${this.incrementedId}`);
      connection.send(JSON.stringify([{ session_id: this.incrementedId }]));
    });
  }

  sendMessageToAll(message: string): void {
    this.connections.forEach(i => i.send(message));
  }

  close(): void {
    this.server.close();
  }
}
