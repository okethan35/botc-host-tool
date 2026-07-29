export type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon';

/** Player-facing good/evil alignment. Independent of a role's default team. */
export type Alignment = 'good' | 'evil';

/** Number of each team present in a game, for a given player count. */
export interface TeamComposition {
  townsfolk: number;
  outsider: number;
  minion: number;
  demon: number;
}

/**
 * Setup-time modifiers a role can carry. Modeled as a discriminated union so the
 * round-based assignment pipeline (see server/src/services/roleAssignment) can
 * dispatch on `type` without special-casing role names. Stored as nullable JSON
 * on `Role.setupEffect` in Postgres (Prisma `Json` has no native union support,
 * hence typing it here instead of in the schema).
 */
export type SetupEffect =
  | {
      type: 'countDelta';
      hostChoosable: boolean;
      params: { targetTeam: Team; min: number; max: number; offsetTeam: Team };
    }
  | {
      type: 'duplicateSelf';
      hostChoosable: boolean;
      params: { maxExtraCopies: number };
    }
  | {
      type: 'overrideBaseTable';
      hostChoosable: false;
      params: { table: Record<number, TeamComposition> };
    }
  | {
      type: 'precondition';
      hostChoosable: false;
      params: { rule: string };
    }
  | {
      type: 'deferredAssignment';
      hostChoosable: false;
      params: { slot: 'demon' | 'minion' };
    }
  | {
      type: 'seatingConstraint';
      hostChoosable: false;
      params: { rule: string };
    };

export interface Role {
  id: string;
  scriptId: string;
  name: string;
  team: Team;
  abilityText: string;
  faqText: string;
  firstNightOrder: number | null;
  otherNightOrder: number | null;
  reminderText: string;
  setupEffect: SetupEffect | null;
}

export interface Script {
  id: string;
  name: string;
}
