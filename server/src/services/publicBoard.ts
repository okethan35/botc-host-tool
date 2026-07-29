import type { BoardUpdatePayload, Player, PublicGame, PublicPlayer } from 'shared';
import type { RuntimePlayer, RuntimeState } from '../state/types';

/** Full player record for the host grimoire — omits socketId/sessionToken. */
export function toHostPlayer(player: RuntimePlayer): Player {
  return {
    id: player.id,
    gameId: player.gameId,
    displayName: player.displayName,
    hasDevice: player.hasDevice,
    seatPosition: player.seatPosition,
    roleId: player.roleId,
    alignment: player.alignment,
    alive: player.alive,
    hostNotes: player.hostNotes,
    isHost: player.isHost,
  };
}

export function toPublicGame(state: RuntimeState): PublicGame {
  return {
    id: state.game.id,
    code: state.game.code,
    phase: state.game.phase,
    nightNumber: state.game.nightNumber,
  };
}

export function toPublicPlayer(player: RuntimePlayer): PublicPlayer {
  return {
    id: player.id,
    displayName: player.displayName,
    hasDevice: player.hasDevice,
    seatPosition: player.seatPosition,
    alive: player.alive,
    isHost: player.isHost,
  };
}

/** Full roster reduced to fields safe to broadcast to every connected player. */
export function buildBoardUpdate(state: RuntimeState): BoardUpdatePayload {
  return {
    game: toPublicGame(state),
    players: [...state.players.values()].map(toPublicPlayer),
  };
}
