import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import type { TypedServer } from './types';
import { registerSessionHandlers } from './handlers/session';
import { registerPlayerHandlers } from './handlers/player';
import { registerSeatsHandlers } from './handlers/seats';
import { registerRolesHandlers } from './handlers/roles';
import { registerPhaseHandlers } from './handlers/phase';
import { registerNightOrderHandlers } from './handlers/nightOrder';
import { setIO } from './ioInstance';

export function createSocketServer(httpServer: HttpServer, clientOrigin: string): TypedServer {
  const io: TypedServer = new Server(httpServer, {
    cors: { origin: clientOrigin },
  });

  io.on('connection', (socket) => {
    registerSessionHandlers(io, socket);
    registerPlayerHandlers(io, socket);
    registerSeatsHandlers(io, socket);
    registerRolesHandlers(io, socket);
    registerPhaseHandlers(io, socket);
    registerNightOrderHandlers(io, socket);
  });

  setIO(io);
  return io;
}
