import express from 'express';
import cors from 'cors';
import { gamesRouter } from './routes/games';
import { pdfRouter } from './routes/pdf';
import { healthRouter } from './routes/health';

export function createApp(clientOrigin: string) {
  const app = express();

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api', gamesRouter);
  app.use('/api', pdfRouter);

  return app;
}
