import { Router } from 'express';
import { requireHostToken } from '../middleware/hostAuth';
import type { HostAuthedRequest } from '../middleware/hostAuth';
import { renderGrimoirePdf } from '../services/pdf';

export const pdfRouter = Router();

/** GET /api/games/:gameId/pdf?token={hostToken} - downloadable PDF grimoire reference. */
pdfRouter.get('/games/:gameId/pdf', requireHostToken, async (req: HostAuthedRequest, res) => {
  const state = req.gameState;
  if (!state) {
    res.status(500).json({ error: 'Game state missing after auth.' });
    return;
  }

  try {
    const pdf = await renderGrimoirePdf(state);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="botc-${state.game.code}.pdf"`);
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
