import 'dotenv/config';
import http from 'node:http';
import { createApp } from './app';
import { createSocketServer } from './socket';

const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

const app = createApp(CLIENT_ORIGIN);
const httpServer = http.createServer(app);
createSocketServer(httpServer, CLIENT_ORIGIN);

httpServer.listen(PORT, () => {
  console.log(`botc-host-toll server listening on http://localhost:${PORT}`);
});
