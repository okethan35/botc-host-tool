import { create } from 'zustand';
import type { Game, NightOrderItem, PendingSetupChoice, Player, Role, SeatingWarningItem } from 'shared';

interface NightOrderState {
  nightNumber: number;
  items: NightOrderItem[];
}

interface HostState {
  connected: boolean;
  invalid: boolean;
  invalidReason: string | null;
  game: Game | null;
  players: Player[];
  roles: Role[];
  pendingSetupChoices: PendingSetupChoice[];
  seatingWarnings: SeatingWarningItem[];
  nightOrder: NightOrderState | null;
  errorMessage: string | null;
  claimUrlByPlayerId: Record<string, string>;

  setConnected: (connected: boolean) => void;
  setInvalid: (reason: string) => void;
  setResumed: (game: Game, players: Player[], roles: Role[]) => void;
  setPlayers: (players: Player[]) => void;
  setPendingSetupChoices: (pending: PendingSetupChoice[]) => void;
  clearPendingChoice: (roleId: string) => void;
  setSeatingWarnings: (warnings: SeatingWarningItem[]) => void;
  setNightOrder: (nightNumber: number, items: NightOrderItem[]) => void;
  updateNightOrderItem: (roleId: string, checked: boolean) => void;
  setPhase: (phase: Game['phase'], nightNumber: number) => void;
  setError: (message: string | null) => void;
  setClaimUrl: (playerId: string, url: string) => void;
  reset: () => void;
}

const initial = {
  connected: false,
  invalid: false,
  invalidReason: null as string | null,
  game: null as Game | null,
  players: [] as Player[],
  roles: [] as Role[],
  pendingSetupChoices: [] as PendingSetupChoice[],
  seatingWarnings: [] as SeatingWarningItem[],
  nightOrder: null as NightOrderState | null,
  errorMessage: null as string | null,
  claimUrlByPlayerId: {} as Record<string, string>,
};

export const useHostStore = create<HostState>((set) => ({
  ...initial,
  setConnected: (connected) => set({ connected }),
  setInvalid: (invalidReason) => set({ invalid: true, invalidReason }),
  setResumed: (game, players, roles) => set({ game, players, roles, invalid: false, invalidReason: null }),
  setPlayers: (players) => set({ players }),
  setPendingSetupChoices: (pendingSetupChoices) => set({ pendingSetupChoices }),
  clearPendingChoice: (roleId) =>
    set((s) => ({ pendingSetupChoices: s.pendingSetupChoices.filter((p) => p.roleId !== roleId) })),
  setSeatingWarnings: (seatingWarnings) => set({ seatingWarnings }),
  setNightOrder: (nightNumber, items) => set({ nightOrder: { nightNumber, items } }),
  updateNightOrderItem: (roleId, checked) =>
    set((s) =>
      s.nightOrder
        ? {
            nightOrder: {
              ...s.nightOrder,
              items: s.nightOrder.items.map((item) => (item.roleId === roleId ? { ...item, checked } : item)),
            },
          }
        : {},
    ),
  setPhase: (phase, nightNumber) => set((s) => (s.game ? { game: { ...s.game, phase, nightNumber } } : {})),
  setError: (errorMessage) => set({ errorMessage }),
  setClaimUrl: (playerId, url) =>
    set((s) => ({ claimUrlByPlayerId: { ...s.claimUrlByPlayerId, [playerId]: url } })),
  reset: () => set(initial),
}));
