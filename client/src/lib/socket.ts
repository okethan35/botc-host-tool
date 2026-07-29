import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from 'shared';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

/** Socket<ListenEvents, EmitEvents> - first param is server->client, second client->server. */
export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocket(): AppSocket {
  // autoConnect: false - connection is driven explicitly by useSocket's
  // effect (connect on mount, disconnect on cleanup) so it survives React
  // StrictMode's dev-only double mount/unmount/mount cycle. A plain
  // `io(...)` would auto-connect immediately, get manually disconnected by
  // the simulated unmount, and never reconnect (socket.io-client does not
  // auto-reconnect after an explicit .disconnect()).
  return io(SERVER_URL, { transports: ['websocket', 'polling'], autoConnect: false });
}
