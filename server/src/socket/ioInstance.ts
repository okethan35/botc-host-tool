import type { TypedServer } from './types';

let ioInstance: TypedServer | undefined;

export function setIO(server: TypedServer): void {
  ioInstance = server;
}

/** Accessor for REST route handlers that need to broadcast after a mutation (e.g. join). */
export function getIO(): TypedServer {
  if (!ioInstance) {
    throw new Error('Socket.io server has not been initialized yet.');
  }
  return ioInstance;
}
