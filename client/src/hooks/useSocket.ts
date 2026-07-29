import { useEffect, useRef } from 'react';
import { createSocket, type AppSocket } from '../lib/socket';

/**
 * Creates a socket for the lifetime of the owning component, connecting on
 * mount and disconnecting on cleanup. The socket itself is created once
 * (autoConnect: false, see lib/socket.ts) and reused across StrictMode's
 * dev-only double mount/unmount/mount - only .connect()/.disconnect() are
 * called per effect run, which correctly re-establishes the connection on
 * remount (unlike relying on autoConnect + disconnect(), which does not).
 */
export function useSocket(): AppSocket {
  const ref = useRef<AppSocket | null>(null);
  if (!ref.current) {
    ref.current = createSocket();
  }
  const socket = ref.current;

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socket;
}
