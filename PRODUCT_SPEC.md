# Blood on the Clocktower Host Companion — Product Spec

## Purpose

A host-facing tool for running Blood on the Clocktower games. Supplementary, not a replacement for in-person storytelling. Host runs the game; the app tracks roles, seating, notes, and phase state, and produces a printable reference. Players get a minimal companion view: their role, the ability FAQ, and a public status board.

## Non-goals (explicitly out of scope for now)

- No automated night-action resolution (host decides everything, app just reminds/tracks)
- No voting/nomination automation
- No multiple simultaneous scripts in v1 (ship with Trouble Brewing only, design data model to allow more later)
- No accounts/auth — game-scoped session tokens only
- No PDF generation — print view uses browser print (`@media print` CSS)

## Color theming

CSS variables, applied consistently across host and player views:

```css
--color-good: /* blue */
--color-evil: /* red */
--color-neutral: /* purple */
```

- Good-aligned role cards/badges: blue accents
- Evil-aligned role cards/badges: red accents
- General app chrome, public board, layout shell, phase indicators: purple
- Alignment can differ from a role's default alignment (e.g. Recluse registers evil, some abilities flip alignment) — never derive display color from role directly, always from the player's current `alignment` field

## Data model

```
Game
  id
  code                 // short join code, avoid ambiguous chars (0/O, 1/I)
  scriptId             // 'trouble-brewing' for v1
  phase                // 'lobby' | 'night' | 'day'
  nightNumber          // 0 pre-game, 1 = first night, 2+ = other nights
  createdAt

Player
  id
  gameId
  displayName
  hasDevice            // false = host-added phantom player, no socket
  socketId             // null if !hasDevice
  seatPosition          // int, host-editable, drives circle layout
  roleId
  alignment            // 'good' | 'evil', independent of role default
  alive                // boolean
  hostNotes            // private, host-only, free text
  isHost               // boolean

Role
  id
  name
  team                 // 'townsfolk' | 'outsider' | 'minion' | 'demon'
  scriptId
  abilityText          // paraphrased, NOT official almanac text (IP concern, see below)
  faqText              // paraphrased player-facing FAQ
  firstNightOrder      // int | null
  otherNightOrder      // int | null
  reminderText         // paraphrased host reminder for night-order checklist

NightOrderProgress     // tracks checklist completion per night, resets each phase change
  gameId
  nightNumber
  roleId
  checked              // boolean
```

### Important IP note
Official Blood on the Clocktower ability text, almanac entries, and reminder tokens belong to The Pandemonium Institute. Role *names* are necessary for the app to function and are fine to use, but all ability descriptions, FAQ text, and reminder text should be paraphrased in your own words rather than copied verbatim from the almanac or the app's night-sheet. This is what the content-gathering doc (separate file) is for.

## Core features

### 1. Game creation & joining
- Host creates a game, gets a short code (4–6 alphanumeric characters).
- Players join via code + display name.
- Host can add "phantom" players (`hasDevice: false`) for anyone without a phone — same Player record as everyone else, just no socket attached, host manages their role/status directly.

### 2. Role assignment
- Single script (Trouble Brewing) for v1.
- Server-side only: role pool is looked up by player count, shuffled, assigned. Never sent to client until each player's own role is revealed to them.
- Setup modifiers (e.g. roles that change team counts) run as a pass before final assignment — build this as a hook, not bolted on after, since it's structurally different from plain random assignment.

### 3. Host grimoire view
- Full roster: name, role, alignment (color-coded), alive/dead, seat position.
- Tap a player to: edit notes, mark dead/alive, reassign role, change alignment.
- Circle layout view — seats arranged in an actual ring (not a table), matching physical seating. Computed via basic trig from seat index and total player count so it scales to any group size.
- Same ring component reused for the on-screen grimoire and the print view (build once).

### 4. Circle/seat order management
- Drag-to-reorder list, writes to `seatPosition`.
- Once set, auto-compute left/right neighbor for any seat — needed for neighbor-dependent roles and useful context on the night-order checklist.

### 5. Phase control
- Host toggles lobby → night → day → night... 
- Phase change is broadcast to all connected players (updates their public board).
- Starting a night phase resets `NightOrderProgress` for that night number.

### 6. Night-order reminder checklist
- On night start, server filters the script's full role list down to roles actually present in this game.
- Sorts by `firstNightOrder` (night 1) or `otherNightOrder` (night 2+).
- Displays as a checklist: role name, seat position, computed neighbors if relevant, `reminderText`.
- Host taps through, checks off. Resets each night.

### 7. Player notes (host-only)
- Free-text field per player, private to host, editable anytime.

### 8. Player view
- Their own role name + paraphrased ability text + paraphrased FAQ.
- Public board: alive/dead status for all players, current phase (day/night), night number.
- Nothing else — no access to other players' roles, no host tools.

### 9. Print view
- Route like `/game/:id/print`, `@media print` CSS, host uses browser print.
- Layout:
  - Ring diagram: seat number + blank/pre-filled name-role line per seat, arranged clockwise starting from seat 1 at top (matches the reference layout your friend already uses).
  - Below the ring: night-order checklist for the script, pre-filtered to roles in this game (first night + other night versions).
  - Blank note-separator lines below that for freeform notes (host writes on paper during play).
- Pre-filled with actual seat/role/name data from the game — not a blank template. This is the main value-add over a printed blank sheet.

## Suggested stack

- Frontend: React/Vite
- Backend: Node/Express + Socket.io (room-per-game maps naturally to game sessions)
- State: in-memory on server + periodic snapshot to Postgres via Prisma (reconnect resilience, no need for Redis at this scale)
- Reconnect: session token stored client-side, tied to `gameId` + `playerId`; rejoining with the same token restores role/status without restarting

## Build order (suggested)

1. Game creation, join via code, phantom player support
2. Role assignment (Trouble Brewing only), host grimoire (list view, not ring yet)
3. Host notes, mark dead/alive, phase toggle, public board on player view
4. Player view: role + FAQ text
5. Seat order (drag-to-reorder) + ring layout component
6. Night-order checklist tied to phase changes
7. Print view (reuses ring component)
8. Reconnect/session token polish

## Open decisions to make during build

- Exact join-code character set/length
- Whether phantom players can be "converted" to real players mid-game if someone's phone dies and they join fresh (probably: yes, host reassigns socket to existing Player record)
- Whether alignment-flip abilities are tracked as a log (for host reference) or just overwrite the current field with no history — simpler to start with no history
