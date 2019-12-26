import * as WebSocketLib from 'ws';

export class WsServer {
  static async create(wsUrl: string): Promise<WsServer> {
    const port = Number(wsUrl.split(':').reverse()[0]);

    const server = new WebSocketLib.Server({
      port: port,
    });

    await new Promise((resolve, reject) => {
      server.on('listening', () => {
        resolve();
      });

      server.on('error', (...error: any) => {
        reject(error);
      });
    });

    return new WsServer(server);
  }

  private connections: WebSocketLib[] = [];

  private constructor(private readonly server: WebSocketLib.Server) {
    this.server.on('connection', connection => {
      this.connections.push(connection);
    });
  }

  sendMessageToAll(message: string): void {
    this.connections.forEach(i => i.send(message));
  }

  waitMessage(cb: () => void): Promise<string> {
    return new Promise(resolve => {
      this.connections.forEach(connection => {
        const handleMessage = (message: string) => {
          resolve(message);
          connection.removeListener('message', handleMessage);
        };
        connection.on('message', handleMessage);
      });
      cb();
    });
  }

  close(): void {
    this.server.close();
  }

  closeConnections(code?: number): void {
    this.connections.forEach(i => i.close(code, 'asd'));
    this.connections = [];
  }
}
