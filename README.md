# Blood on the Clocktower — Host Companion

A host-facing companion app for running [Blood on the Clocktower](https://bloodontheclocktower.com/) games in person. It tracks roles, seating, notes, and phase state while you storytell, and produces a printable, pre-filled reference sheet. Players get a minimal companion view of their own: their role, a plain-language FAQ, and a public status board.

This is a supplement to in-person storytelling, not a replacement for it. The host still runs the table — the app just remembers things so you don't have to.

> **Status:** v1, single script (Trouble Brewing). Role ability/FAQ/reminder text ships as clearly-marked placeholders — see [Content & IP note](#content--ip-note) below.

---

## Features

- **Game creation & joining** — host creates a game and gets a short join code; players join from their phone. Host can add "phantom" players for anyone without a device and manage their status directly.
- **Role assignment** — server-side, round-based draw (Trouble Brewing for v1) that correctly sequences roles whose setup effects change team composition (e.g. Baron) before the rest of the pool is drawn, with host confirmation where a role's effect is host-choosable. Roles are never sent to a client until that player's own reveal.
- **Host grimoire** — full roster with color-coded alignment, alive/dead state, and seat position; tap any player to edit notes, reassign a role, or flip alignment. A ring/circle layout mirrors physical seating and is computed for any table size.
- **Seating management** — drag-to-reorder seat list with auto-computed neighbors, which feed both the night-order checklist and any seating-dependent role warnings.
- **Phase control** — toggle lobby → night → day, broadcast live to every connected player.
- **Night-order checklist** — auto-filtered to the roles actually in play, sorted correctly for first night vs. later nights, with a tap-to-check host workflow that resets each night.
- **Player notes** — private, host-only freeform notes per player.
- **Player view** — a player's own role (with its character icon), paraphrased ability text and FAQ, and a public board (who's alive, current phase) — nothing else.
- **PDF export** — a real, downloadable, pre-filled (not blank) PDF reference: seating ring and note lines, rendered server-side.

## Tech stack

| Layer | Choice |
|---|---|
| Client | React + Vite + TypeScript, Tailwind CSS |
| Server | Node + Express + Socket.io, TypeScript |
| Database | PostgreSQL via Prisma |
| Realtime | Socket.io (room-per-game) |
| Shared | An internal `shared` workspace package holding cross-boundary types and the socket event contract |

Monorepo managed with npm workspaces (`shared`, `server`, `client`).

## Getting started

**Prerequisites:** Node.js 20+, Docker (for local Postgres).

```bash
git clone <this-repo>
cd botc-host-toll
npm install

cp .env.example .env        # adjust if needed
docker compose up -d        # starts local Postgres

npm run prisma:migrate      # applies the schema
npm run prisma:seed         # seeds Trouble Brewing role data (placeholder text)

npm run dev                 # runs client (Vite) + server (Express/Socket.io) together
```

The client runs at `http://localhost:5173`, the server at `http://localhost:4000`.

## Deploying (so friends can use it anytime)

This repo includes a [`render.yaml`](./render.yaml) Blueprint that deploys the server (as a free web service) and client (as a free static site) together from [Render](https://render.com). The database lives on [Neon](https://neon.tech) instead of Render's own free Postgres, because Render's free databases auto-delete after 30 days — not what you want for something friends come back to over months.

### 1. Push this repo to GitHub
Render deploys from a GitHub repo, so this needs to be pushed there first if it isn't already.

### 2. Create a free Neon database
1. Sign up at [neon.tech](https://neon.tech) (free, no card required).
2. Create a new project.
3. From the project dashboard's connection details, copy **two** connection strings: the **pooled** one (hostname contains `-pooler`) and the **direct** one. Keep both handy for the next step.

### 3. Deploy to Render via Blueprint
1. Sign up at [render.com](https://render.com) (free tier, no card required).
2. **New +** → **Blueprint**, connect your GitHub account, and select this repo. Render reads `render.yaml` automatically and shows the two services it's about to create.
3. When prompted for `DATABASE_URL` and `DIRECT_URL`, paste in Neon's pooled and direct connection strings from step 2, respectively.
4. Click **Apply**. First deploy takes a few minutes — the server's build installs a headless Chromium (for PDF export), runs database migrations, and seeds the Trouble Brewing roles; the client just builds the static site.

### 4. Double-check the URLs match
`render.yaml` pre-wires the two services to expect each other at `https://botc-host-toll-server.onrender.com` and `https://botc-host-toll-client.onrender.com`. If those exact names were already taken, Render will have assigned different ones — check the dashboard, and if they differ:
- Update the **server's** `CLIENT_ORIGIN` env var to the client's actual URL.
- Update the **client's** `VITE_SERVER_URL` env var to the server's actual URL, then trigger a manual redeploy of the client (this one's baked in at build time, so it needs a rebuild to take effect).

### 5. Share the link
The client's URL is the app — that's what you give your friends.

### Living with the free tier
- The **server** spins down after ~15 minutes of no traffic and takes ~30–60s to wake back up on the next request. This is expected and harmless here — the app already reloads game state from Postgres on reconnect for exactly this reason, so nothing is lost, it's just a one-time wait for whoever opens it first.
- The **client** (static site) never sleeps.
- **PDF export** depends on a headless browser working correctly in Render's environment, which is a bit more fragile than everything else in the stack. If it doesn't work after deploying, every other feature is completely unaffected — it's an isolated thing to debug later, not a sign of a broader problem.

### Future edits
Once connected, every `git push` to your main branch auto-redeploys both services. Keep using the Docker Compose + local Postgres flow from **Getting started** above for local development before pushing.

## Project structure

```
shared/     cross-boundary TypeScript types, Socket.io event contract, pure geometry/seating helpers
server/     Express + Socket.io API, Prisma schema/migrations, role assignment pipeline, seed data
client/     React + Vite host and player UIs, ring layout, print view
```

## Content & IP note

Official Blood on the Clocktower ability text, almanac entries, and reminder tokens belong to [The Pandemonium Institute](https://bloodontheclocktower.com/). Role *names* are used here as necessary for the app to function. All ability descriptions, FAQ text, and reminder text in this codebase are original, paraphrased placeholder content — not copied from the official almanac or app — pending the maintainer's own paraphrased content pass.

This is an unofficial, fan-made tool and is not affiliated with or endorsed by The Pandemonium Institute.

## License

[MIT](./LICENSE)
