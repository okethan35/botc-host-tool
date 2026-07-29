import { create } from 'zustand';
import type { OwnRoleReveal, PublicGame, PublicPlayer } from 'shared';

interface PlayerState {
  connected: boolean;
  invalid: boolean;
  invalidReason: string | null;
  game: PublicGame | null;
  players: PublicPlayer[];
  self: PublicPlayer | null;
  ownRole: OwnRoleReveal | null;
  errorMessage: string | null;

  setConnected: (connected: boolean) => void;
  setInvalid: (reason: string) => void;
  setResumed: (game: PublicGame, players: PublicPlayer[], self: PublicPlayer, ownRole: OwnRoleReveal | null) => void;
  setBoard: (game: PublicGame, players: PublicPlayer[]) => void;
  setPhase: (phase: PublicGame['phase'], nightNumber: number) => void;
  setOwnRole: (ownRole: OwnRoleReveal) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const initial = {
  connected: false,
  invalid: false,
  invalidReason: null as string | null,
  game: null as PublicGame | null,
  players: [] as PublicPlayer[],
  self: null as PublicPlayer | null,
  ownRole: null as OwnRoleReveal | null,
  errorMessage: null as string | null,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initial,
  setConnected: (connected) => set({ connected }),
  setInvalid: (invalidReason) => set({ invalid: true, invalidReason }),
  setResumed: (game, players, self, ownRole) =>
    set({ game, players, self, ownRole, invalid: false, invalidReason: null }),
  setBoard: (game, players) => set({ game, players }),
  setPhase: (phase, nightNumber) => set((s) => (s.game ? { game: { ...s.game, phase, nightNumber } } : {})),
  setOwnRole: (ownRole) => set({ ownRole }),
  setError: (errorMessage) => set({ errorMessage }),
  reset: () => set(initial),
}));
