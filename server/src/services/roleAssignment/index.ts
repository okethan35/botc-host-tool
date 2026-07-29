import { sortBySeat, SOCKET_EVENTS } from 'shared';
import type { Alignment, PendingSetupChoice, Role, SetupEffect, TeamComposition } from 'shared';
import { prisma } from '../../db/prisma';
import type { RuntimePlayer, RuntimeState } from '../../state/types';
import type { TypedServer } from '../../socket/types';
import { hostRoom } from '../../socket/rooms';
import { getBaseComposition } from './playerCountTable';
import { validateComposition, validateDrawCount } from './validation';
import { registerPending } from './pendingChoices';
import { applyChosenCountDelta, applyFixedCountDelta, checkPrecondition } from './effects';
import { clamp, drawRandom, groupByTeam, shuffle } from './utils';
import { toHostPlayer } from '../publicBoard';

export { RoleAssignmentError } from './validation';

type CountDeltaEffect = Extract<SetupEffect, { type: 'countDelta' }>;

/**
 * Round-based role assignment pipeline (build plan section 5a):
 *   1. Draw Demon(s)
 *   2. Draw Minion(s)
 *   3. Resolve setup effects carried by roles drawn in rounds 1-2 (pausing
 *      for host input on hostChoosable effects, e.g. Baron)
 *   4. Draw Outsiders (using the possibly effect-adjusted count)
 *   5. Draw Townsfolk (using the possibly effect-adjusted count)
 *   6. Finalize: shuffle, zip onto seated players, persist, broadcast
 *
 * Each round gets its own validation pass; a failure emits `error` to the
 * host room and aborts the whole pipeline without touching the DB.
 */
export async function assignRoles(state: RuntimeState, io: TypedServer): Promise<void> {
  const gameId = state.game.id;
  const players = sortBySeat([...state.players.values()]);
  const playerCount = players.length;

  let baseComposition: TeamComposition;
  try {
    baseComposition = getBaseComposition(playerCount);
  } catch (err) {
    emitError(io, gameId, (err as Error).message);
    return;
  }

  const byTeam = groupByTeam(state.roles);

  // --- Round 1: Demon ---
  const drawnDemons = drawRandom(byTeam.demon, baseComposition.demon);
  const demonErrors = validateDrawCount(drawnDemons, baseComposition.demon, 'demon', false);
  if (demonErrors.length) return emitError(io, gameId, demonErrors.join(' '));

  // --- Round 2: Minion(s) ---
  const drawnMinions = drawRandom(byTeam.minion, baseComposition.minion);
  const minionErrors = validateDrawCount(drawnMinions, baseComposition.minion, 'minion', false);
  if (minionErrors.length) return emitError(io, gameId, minionErrors.join(' '));

  // --- Round 3: resolve setup effects carried by the demon/minion draw ---
  let composition = { ...baseComposition };
  const effectBearers = [...drawnDemons, ...drawnMinions].filter((r) => r.setupEffect);

  const choosable = effectBearers.filter(
    (r) => r.setupEffect!.type === 'countDelta' && (r.setupEffect as CountDeltaEffect).hostChoosable,
  );

  if (choosable.length > 0) {
    const pending: PendingSetupChoice[] = choosable.map((role) => {
      const effect = role.setupEffect as CountDeltaEffect;
      return {
        roleId: role.id,
        roleName: role.name,
        effectType: 'countDelta',
        min: effect.params.min,
        max: effect.params.max,
        offsetTeam: effect.params.offsetTeam,
      };
    });
    io.to(hostRoom(gameId)).emit(SOCKET_EVENTS.ROLES_SETUP_CHOICE_REQUIRED, { pending });

    // Pipeline pauses here — awaits one answer per pending role via the
    // pendingChoices resolver map, resumed by roles:setupChoiceAnswer.
    const answers = await Promise.all(choosable.map((role) => registerPending(gameId, role.id)));

    choosable.forEach((role, idx) => {
      const effect = role.setupEffect as CountDeltaEffect;
      const chosen = clamp(answers[idx] ?? effect.params.min, effect.params.min, effect.params.max);
      composition = applyChosenCountDelta(composition, effect, chosen);
    });
  }

  for (const role of effectBearers) {
    const effect = role.setupEffect!;
    if (effect.type === 'countDelta' && !effect.hostChoosable) {
      composition = applyFixedCountDelta(composition, effect);
    } else if (effect.type === 'overrideBaseTable') {
      const override = effect.params.table[playerCount];
      if (override) composition = { ...override };
    } else if (effect.type === 'precondition') {
      const errorMessage = checkPrecondition(effect, playerCount);
      if (errorMessage) return emitError(io, gameId, errorMessage);
    }
    // duplicateSelf / deferredAssignment influence the draw step itself, not
    // the team-count math, and are not exercised by any TB role in v1.
  }

  const round3Errors = validateComposition(composition, playerCount);
  if (round3Errors.length) return emitError(io, gameId, round3Errors.join(' '));

  // --- Round 4: Outsiders ---
  const drawnOutsiders = drawRandom(byTeam.outsider, composition.outsider);
  const outsiderErrors = validateDrawCount(drawnOutsiders, composition.outsider, 'outsider', false);
  if (outsiderErrors.length) return emitError(io, gameId, outsiderErrors.join(' '));

  // --- Round 5: Townsfolk ---
  const drawnTownsfolk = drawRandom(byTeam.townsfolk, composition.townsfolk);
  const townsfolkErrors = validateDrawCount(drawnTownsfolk, composition.townsfolk, 'townsfolk', false);
  if (townsfolkErrors.length) return emitError(io, gameId, townsfolkErrors.join(' '));

  const allDrawn = [...drawnDemons, ...drawnMinions, ...drawnOutsiders, ...drawnTownsfolk];
  const finalErrors = [
    ...validateComposition(composition, playerCount),
    ...(allDrawn.length !== playerCount
      ? [`Drew ${allDrawn.length} total roles, expected ${playerCount} players.`]
      : []),
  ];
  if (finalErrors.length) return emitError(io, gameId, finalErrors.join(' '));

  // --- Finalize ---
  await finalizeAssignment(state, players, allDrawn, io);
}

async function finalizeAssignment(
  state: RuntimeState,
  players: RuntimePlayer[],
  drawnRoles: Role[],
  io: TypedServer,
): Promise<void> {
  const gameId = state.game.id;
  const shuffledRoles = shuffle(drawnRoles);

  const assignments = players.map((player, i) => {
    const role = shuffledRoles[i]!;
    const alignment: Alignment = role.team === 'minion' || role.team === 'demon' ? 'evil' : 'good';
    return { player, role, alignment };
  });

  await prisma.$transaction(
    assignments.map(({ player, role, alignment }) =>
      prisma.player.update({
        where: { id: player.id },
        data: { roleId: role.id, alignment },
      }),
    ),
  );

  for (const { player, role, alignment } of assignments) {
    state.players.set(player.id, { ...player, roleId: role.id, alignment });
  }

  io.to(hostRoom(gameId)).emit(SOCKET_EVENTS.GRIMOIRE_UPDATE, {
    players: [...state.players.values()].map(toHostPlayer),
  });

  for (const { player, role, alignment } of assignments) {
    if (player.socketId) {
      io.to(player.socketId).emit(SOCKET_EVENTS.PLAYER_ROLE_ASSIGNED, {
        roleId: role.id,
        roleName: role.name,
        team: role.team,
        abilityText: role.abilityText,
        faqText: role.faqText,
        alignment,
      });
    }
  }
}

function emitError(io: TypedServer, gameId: string, message: string): void {
  io.to(hostRoom(gameId)).emit(SOCKET_EVENTS.ERROR, { message, code: 'ROLE_ASSIGNMENT_FAILED' });
}
