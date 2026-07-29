import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { SOCKET_EVENTS } from 'shared';
import type {
  ErrorPayload,
  GrimoireUpdatePayload,
  NightOrderItemUpdatedPayload,
  NightOrderListPayload,
  PhaseChangedPayload,
  PlayerConversionReadyPayload,
  RolesSetupChoiceRequiredPayload,
  SeatingWarningPayload,
  SessionInvalidPayload,
  SessionResumedPayload,
} from 'shared';
import { useSocket } from '../hooks/useSocket';
import { useHostStore } from '../hooks/useGameState';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { ConnectionStatus } from '../components/shared/ConnectionStatus';
import { PhaseIndicator } from '../components/shared/PhaseIndicator';
import { PhaseControls } from '../components/grimoire/PhaseControls';
import { GrimoireView } from '../components/grimoire/GrimoireView';
import { PlayerEditModal } from '../components/grimoire/PlayerEditModal';
import { RingLayout } from '../components/ring/RingLayout';
import { Seat } from '../components/ring/Seat';
import { ColorBadge } from '../components/shared/ColorBadge';
import { SeatOrderEditor } from '../components/grimoire/SeatOrderEditor';
import { SeatingConstraintWarning } from '../components/grimoire/SeatingConstraintWarning';
import { NightOrderChecklist } from '../components/grimoire/NightOrderChecklist';
import { SetupChoiceModal } from '../components/grimoire/SetupChoiceModal';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { RoleIcon } from '../components/shared/RoleIcon';
import { playPageTurn } from '../lib/sound';
import { pdfDownloadUrl } from '../lib/api';

type Tab = 'roster' | 'ring' | 'seating' | 'nightOrder';
const TABS: { id: Tab; label: string }[] = [
  { id: 'roster', label: 'Roster' },
  { id: 'ring', label: 'Ring' },
  { id: 'seating', label: 'Seating' },
  { id: 'nightOrder', label: 'Night Order' },
];

export function HostGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { session, clear } = useSessionStorage(gameId ?? '');
  const socket = useSocket();
  const store = useHostStore();
  const [tab, setTab] = useState<Tab>('roster');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    if (!session || session.role !== 'host') {
      navigate('/');
      return;
    }
    const hostSession = session;

    function onConnect() {
      store.setConnected(true);
      socket.emit(SOCKET_EVENTS.SESSION_AUTH, { role: 'host', gameId: gameId!, hostToken: hostSession.hostToken });
    }
    function onDisconnect() {
      store.setConnected(false);
    }
    function onResumed(payload: SessionResumedPayload) {
      if (payload.role !== 'host') return;
      store.setResumed(payload.game, payload.players, payload.roles);
    }
    function onInvalid(payload: SessionInvalidPayload) {
      store.setInvalid(payload.reason);
      clear();
      navigate('/');
    }
    function onGrimoireUpdate(payload: GrimoireUpdatePayload) {
      store.setPlayers(payload.players);
    }
    function onSetupChoiceRequired(payload: RolesSetupChoiceRequiredPayload) {
      store.setPendingSetupChoices(payload.pending);
    }
    function onSeatingWarning(payload: SeatingWarningPayload) {
      store.setSeatingWarnings(payload.warnings);
    }
    function onPhaseChanged(payload: PhaseChangedPayload) {
      store.setPhase(payload.game.phase, payload.game.nightNumber);
    }
    function onNightOrderList(payload: NightOrderListPayload) {
      store.setNightOrder(payload.nightNumber, payload.items);
    }
    function onNightOrderItemUpdated(payload: NightOrderItemUpdatedPayload) {
      store.updateNightOrderItem(payload.roleId, payload.checked);
    }
    function onConversionReady(payload: PlayerConversionReadyPayload) {
      store.setClaimUrl(payload.playerId, payload.claimUrl);
    }
    function onError(payload: ErrorPayload) {
      store.setError(payload.message);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.SESSION_RESUMED, onResumed);
    socket.on(SOCKET_EVENTS.SESSION_INVALID, onInvalid);
    socket.on(SOCKET_EVENTS.GRIMOIRE_UPDATE, onGrimoireUpdate);
    socket.on(SOCKET_EVENTS.ROLES_SETUP_CHOICE_REQUIRED, onSetupChoiceRequired);
    socket.on(SOCKET_EVENTS.SEATING_WARNING, onSeatingWarning);
    socket.on(SOCKET_EVENTS.PHASE_CHANGED, onPhaseChanged);
    socket.on(SOCKET_EVENTS.NIGHT_ORDER_LIST, onNightOrderList);
    socket.on(SOCKET_EVENTS.NIGHT_ORDER_ITEM_UPDATED, onNightOrderItemUpdated);
    socket.on(SOCKET_EVENTS.PLAYER_CONVERSION_READY, onConversionReady);
    socket.on(SOCKET_EVENTS.ERROR, onError);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.SESSION_RESUMED, onResumed);
      socket.off(SOCKET_EVENTS.SESSION_INVALID, onInvalid);
      socket.off(SOCKET_EVENTS.GRIMOIRE_UPDATE, onGrimoireUpdate);
      socket.off(SOCKET_EVENTS.ROLES_SETUP_CHOICE_REQUIRED, onSetupChoiceRequired);
      socket.off(SOCKET_EVENTS.SEATING_WARNING, onSeatingWarning);
      socket.off(SOCKET_EVENTS.PHASE_CHANGED, onPhaseChanged);
      socket.off(SOCKET_EVENTS.NIGHT_ORDER_LIST, onNightOrderList);
      socket.off(SOCKET_EVENTS.NIGHT_ORDER_ITEM_UPDATED, onNightOrderItemUpdated);
      socket.off(SOCKET_EVENTS.PLAYER_CONVERSION_READY, onConversionReady);
      socket.off(SOCKET_EVENTS.ERROR, onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, session?.role]);

  useEffect(() => {
    if (tab === 'nightOrder' && socket.connected) {
      socket.emit(SOCKET_EVENTS.NIGHT_ORDER_GET, {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, socket.connected]);

  if (!gameId) return null;

  const selectedPlayer = store.players.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCodeModalOpen(true)}
            className="text-xl font-semibold text-ink underline decoration-dotted decoration-ink/40 underline-offset-4 hover:text-neutral"
            title="Show game code full-screen"
          >
            Game {store.game?.code ?? '…'}
          </button>
          <ConnectionStatus connected={store.connected} />
        </div>
        <div className="flex items-center gap-3">
          {store.game ? <PhaseIndicator phase={store.game.phase} nightNumber={store.game.nightNumber} /> : null}
          {gameId && session?.role === 'host' ? (
            <Button
              variant="secondary"
              onClick={() => window.open(pdfDownloadUrl(gameId, session.hostToken), '_blank')}
            >
              Download PDF
            </Button>
          ) : null}
        </div>
      </header>

      {store.game ? (
        <PhaseControls
          phase={store.game.phase}
          nightNumber={store.game.nightNumber}
          onChange={(phase) => socket.emit(SOCKET_EVENTS.PHASE_CHANGE, { phase })}
        />
      ) : null}

      <SeatingConstraintWarning warnings={store.seatingWarnings} />
      {store.errorMessage ? <p className="text-sm text-evil">{store.errorMessage}</p> : null}

      <nav className="flex gap-2 border-b border-ink/30">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              if (tab !== t.id) playPageTurn();
              setTab(t.id);
            }}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t.id ? 'border-b-2 border-neutral text-neutral' : 'text-ink/70 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'roster' && (
        <GrimoireView
          players={store.players}
          roles={store.roles}
          onAddPhantom={(displayName) => socket.emit(SOCKET_EVENTS.PLAYER_ADD_PHANTOM, { displayName })}
          onSelectPlayer={(p) => setSelectedId(p.id)}
          onAssignRoles={() => socket.emit(SOCKET_EVENTS.ROLES_ASSIGN, {})}
        />
      )}

      {tab === 'ring' && (
        <RingLayout
          players={store.players}
          totalSeats={store.players.length}
          renderSeat={(player) => {
            const role = store.roles.find((r) => r.id === player.roleId);
            return (
              <Seat
                label={player.displayName}
                sublabel={role?.name}
                dimmed={!player.alive}
                onClick={() => setSelectedId(player.id)}
                badge={<ColorBadge alignment={player.alignment} />}
                icon={role ? <RoleIcon roleName={role.name} size={28} /> : null}
              />
            );
          }}
        />
      )}

      {tab === 'seating' && (
        <SeatOrderEditor
          players={store.players}
          roles={store.roles}
          onReorder={(orderedPlayerIds) => socket.emit(SOCKET_EVENTS.SEATS_REORDER, { orderedPlayerIds })}
        />
      )}

      {tab === 'nightOrder' && store.nightOrder && (
        <NightOrderChecklist
          nightNumber={store.nightOrder.nightNumber}
          items={store.nightOrder.items}
          onToggle={(roleId, checked) => socket.emit(SOCKET_EVENTS.NIGHT_ORDER_CHECK, { roleId, checked })}
        />
      )}

      <PlayerEditModal
        player={selectedPlayer}
        roles={store.roles}
        claimUrl={selectedPlayer ? store.claimUrlByPlayerId[selectedPlayer.id] : undefined}
        onClose={() => setSelectedId(null)}
        onUpdateNotes={(playerId, notes) => socket.emit(SOCKET_EVENTS.PLAYER_UPDATE_NOTES, { playerId, hostNotes: notes })}
        onSetAlive={(playerId, alive) => socket.emit(SOCKET_EVENTS.PLAYER_SET_ALIVE, { playerId, alive })}
        onSetAlignment={(playerId, alignment) => socket.emit(SOCKET_EVENTS.PLAYER_SET_ALIGNMENT, { playerId, alignment })}
        onSetRole={(playerId, roleId) => socket.emit(SOCKET_EVENTS.PLAYER_SET_ROLE, { playerId, roleId })}
        onRemove={(playerId) => {
          socket.emit(SOCKET_EVENTS.PLAYER_REMOVE, { playerId });
          setSelectedId(null);
        }}
        onConvertToReal={(playerId) => socket.emit(SOCKET_EVENTS.PLAYER_CONVERT_TO_REAL, { playerId })}
      />

      <SetupChoiceModal
        pending={store.pendingSetupChoices}
        onAnswer={(roleId, chosenValue) => {
          socket.emit(SOCKET_EVENTS.ROLES_SETUP_CHOICE_ANSWER, { roleId, chosenValue });
          store.clearPendingChoice(roleId);
        }}
      />

      <button
        type="button"
        onClick={() => setCodeModalOpen(true)}
        className="text-center text-xs text-ink/70 hover:text-ink/70"
      >
        Join code: <span className="font-mono">{store.game?.code}</span> — share this with players.
      </button>

      <Modal open={codeModalOpen} onClose={() => setCodeModalOpen(false)} title="Game code">
        <p className="text-center font-mono text-6xl font-bold tracking-[0.3em] text-ink">{store.game?.code}</p>
      </Modal>
    </div>
  );
}
