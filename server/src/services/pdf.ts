import { chromium } from 'playwright';
import { polarToCartesian } from 'shared';
import { buildPrintData } from './printData';
import type { RuntimeState } from '../state/types';

const SEAT_FOOTPRINT = 108;
const SEAT_WIDTH = 112;
const MIN_RADIUS = 110;
const NOTES_LINES_PER_COLUMN = 22;
// Hard cap on the ring's printed footprint so it can never crowd out the
// notes section or run into the page margins at high player counts. Once the
// "ideal" (evenly-spaced) circular size would exceed these, the ring is
// squeezed into an ellipse - rather than staying circular and overflowing.
const MAX_RING_WIDTH = 480;
const MAX_RING_HEIGHT = 380;
// Compressing seat *positions* into the capped ellipse without also shrinking
// the seat *boxes* causes adjacent boxes to overlap (spacing was only ever
// sized correctly for the uncompressed circle). boxScale re-derives the same
// box-to-spacing ratio that works uncompressed, applied uniformly.
const MIN_BOX_SCALE = 0.6;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function renderRingHtml(totalSeats: number, seats: { seatPosition: number; displayName: string; roleName: string | null }[]): string {
  const idealRadius = totalSeats > 0 ? Math.max(MIN_RADIUS, (totalSeats * SEAT_FOOTPRINT) / (2 * Math.PI)) : MIN_RADIUS;
  const idealSize = idealRadius * 2 + SEAT_FOOTPRINT + 40;

  const width = Math.min(idealSize, MAX_RING_WIDTH);
  const height = Math.min(idealSize, MAX_RING_HEIGHT);
  const radiusX = (width - SEAT_FOOTPRINT - 40) / 2;
  const radiusY = (height - SEAT_FOOTPRINT - 40) / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const boxScale = Math.max(MIN_BOX_SCALE, Math.min(width / idealSize, height / idealSize, 1));
  const boxWidth = SEAT_WIDTH * boxScale;

  const seatBoxes = seats
    .map((seat) => {
      // Position on the "ideal" evenly-spaced circle first, then squeeze
      // proportionally onto the capped ellipse - keeps seat 1 at top,
      // clockwise order, and even angular spacing regardless of the squeeze.
      const { x, y } = polarToCartesian(seat.seatPosition, totalSeats, idealRadius);
      const left = centerX + (x / idealRadius) * radiusX;
      const top = centerY + (y / idealRadius) * radiusY;
      return `
        <div class="seat" style="left:${left}px; top:${top}px; width:${boxWidth}px; padding:${6 * boxScale}px ${8 * boxScale}px; gap:${2 * boxScale}px;">
          <span class="seat-number" style="font-size:${9 * boxScale}px;">Seat ${seat.seatPosition + 1}</span>
          <span class="seat-name" style="font-size:${12 * boxScale}px;">${escapeHtml(seat.displayName)}</span>
          <span class="seat-role" style="font-size:${9 * boxScale}px;">${seat.roleName ? escapeHtml(seat.roleName) : '&nbsp;'}</span>
        </div>`;
    })
    .join('');

  return `
    <div class="ring" style="width:${width}px; height:${height}px;">
      <div class="ring-guide" style="left:${centerX - radiusX}px; top:${centerY - radiusY}px; width:${radiusX * 2}px; height:${radiusY * 2}px;"></div>
      ${seatBoxes}
    </div>`;
}

function renderNotesHtml(): string {
  const column = Array.from({ length: NOTES_LINES_PER_COLUMN }, () => '<div class="note-line"></div>').join('');
  return `
    <div class="notes">
      <h3>Notes</h3>
      <div class="notes-grid">
        <div class="notes-divider"></div>
        <div class="notes-column">${column}</div>
        <div class="notes-column">${column}</div>
      </div>
    </div>`;
}

function buildHtmlDocument(code: string, ringHtml: string, notesHtml: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: letter; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #000;
    margin: 0;
    padding: 0;
  }
  h1 {
    text-align: center;
    font-size: 20px;
    letter-spacing: 0.08em;
    margin: 0 0 16px;
  }
  .ring {
    position: relative;
    margin: 0 auto;
  }
  .ring-guide {
    position: absolute;
    border: 1px dashed #999;
    border-radius: 50%;
  }
  .seat {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #000;
    text-align: center;
    background: #fff;
  }
  .seat-name { font-weight: bold; }
  .notes { margin-top: 28px; }
  .notes h3 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 10px;
  }
  .notes-grid {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 32px;
  }
  .notes-divider {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #000;
    opacity: 0.4;
  }
  .notes-column { display: flex; flex-direction: column; gap: 20px; }
  .note-line { border-bottom: 1px solid #000; opacity: 0.4; height: 1px; }
</style>
</head>
<body>
  <h1>Game ${escapeHtml(code)}</h1>
  ${ringHtml}
  ${notesHtml}
</body>
</html>`;
}

/**
 * Renders the same grimoire reference as the browser-print view, but as a
 * real server-generated PDF: builds a standalone HTML document (reusing the
 * shared ring-geometry math, no client bundle or auth dance involved since
 * this runs entirely server-side) and rasterizes it with a headless browser.
 */
export async function renderGrimoirePdf(state: RuntimeState): Promise<Buffer> {
  const data = buildPrintData(state);
  const html = buildHtmlDocument(data.code, renderRingHtml(data.totalSeats, data.seats), renderNotesHtml());

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'Letter', printBackground: true });
    return pdf;
  } finally {
    await browser.close();
  }
}
