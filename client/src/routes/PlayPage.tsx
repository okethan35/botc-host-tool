import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { SOCKET_EVENTS } from 'shared';
import type { BoardUpdatePayload, ErrorPayload, OwnRoleReveal, PhaseChangedPayload, SessionInvalidPayload, SessionResumedPayload } from 'shared';
import { useSocket } from '../hooks/useSocket';
import { usePlayerStore } from '../hooks/usePlayerState';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { ConnectionStatus } from '../components/shared/ConnectionStatus';
import { PlayerView } from '../components/player/PlayerView';

export function PlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { session, clear } = useSessionStorage(gameId ?? '');
  const socket = useSocket();
  const store = usePlayerStore();

  useEffect(() => {
    if (!gameId) return;
    if (!session || session.role !== 'player') {
      navigate(`/join/${gameId}`);
      return;
    }
    const playerSession = session;

    function onConnect() {
      store.setConnected(true);
      socket.emit(SOCKET_EVENTS.SESSION_AUTH, {
        role: 'player',
        gameId: gameId!,
        playerId: playerSession.playerId,
        sessionToken: playerSession.sessionToken,
      });
    }
    function onDisconnect() {
      store.setConnected(false);
    }
    function onResumed(payload: SessionResumedPayload) {
      if (payload.role !== 'player') return;
      store.setResumed(payload.game, payload.players, payload.self, payload.ownRole);
    }
    function onInvalid(payload: SessionInvalidPayload) {
      store.setInvalid(payload.reason);
      clear();
      navigate(`/join/${gameId}`);
    }
    function onBoardUpdate(payload: BoardUpdatePayload) {
      store.setBoard(payload.game, payload.players);
    }
    function onPhaseChanged(payload: PhaseChangedPayload) {
      store.setPhase(payload.game.phase, payload.game.nightNumber);
    }
    function onRoleAssigned(payload: OwnRoleReveal) {
      store.setOwnRole(payload);
    }
    function onError(payload: ErrorPayload) {
      store.setError(payload.message);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.SESSION_RESUMED, onResumed);
    socket.on(SOCKET_EVENTS.SESSION_INVALID, onInvalid);
    socket.on(SOCKET_EVENTS.BOARD_UPDATE, onBoardUpdate);
    socket.on(SOCKET_EVENTS.PHASE_CHANGED, onPhaseChanged);
    socket.on(SOCKET_EVENTS.PLAYER_ROLE_ASSIGNED, onRoleAssigned);
    socket.on(SOCKET_EVENTS.ERROR, onError);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.SESSION_RESUMED, onResumed);
      socket.off(SOCKET_EVENTS.SESSION_INVALID, onInvalid);
      socket.off(SOCKET_EVENTS.BOARD_UPDATE, onBoardUpdate);
      socket.off(SOCKET_EVENTS.PHASE_CHANGED, onPhaseChanged);
      socket.off(SOCKET_EVENTS.PLAYER_ROLE_ASSIGNED, onRoleAssigned);
      socket.off(SOCKET_EVENTS.ERROR, onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, session?.role]);

  if (!gameId) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center pt-3">
        <ConnectionStatus connected={store.connected} />
      </div>
      {store.game ? (
        <PlayerView game={store.game} players={store.players} ownRole={store.ownRole} />
      ) : (
        <p className="p-8 text-center text-ink/70">Connecting…</p>
      )}
      {store.errorMessage ? <p className="text-center text-sm text-evil">{store.errorMessage}</p> : null}
    </div>
  );
}
