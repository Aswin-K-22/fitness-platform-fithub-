// ISocketGateway.ts — abstraction over Socket.IO
export interface ISocketGateway {
  use(middleware: (socket: any, next: (err?: Error) => void) => void): void;
  onConnection(handler: (socket: any) => void): void;
  joinRoom(userId: string, socket: any): void;
  emitToRoom(roomId: string, event: string, data: any): void;
  getRoomSize(roomId: string): number;
  removeUserSocket(userId: string): void;
}
