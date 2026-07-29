import type { SetupEffect, Team } from 'shared';
import { TROUBLE_BREWING_SCRIPT_ID } from 'shared';

export interface RoleSeedData {
  name: string;
  team: Team;
  abilityText: string;
  faqText: string;
  firstNightOrder: number | null;
  otherNightOrder: number | null;
  reminderText: string;
  setupEffect: SetupEffect | null;
}

export const TROUBLE_BREWING_SCRIPT = {
  id: TROUBLE_BREWING_SCRIPT_ID,
  name: 'Trouble Brewing',
};

const ability = (name: string) => `[PLACEHOLDER ABILITY: ${name} — paraphrased ability text goes here]`;
const faq = (name: string) => `[PLACEHOLDER FAQ: ${name} — paraphrased FAQ text goes here]`;
const reminder = (name: string) =>
  `[PLACEHOLDER REMINDER: ${name} — paraphrased host night-order reminder goes here]`;

/**
 * All 22 official Trouble Brewing roles. Role *names* are used as-is (fine
 * per the product spec's IP note).
 *
 * ability/faq/reminder text: 16 of 22 roles now use real paraphrased content
 * from role_desc.md (the project's own content-gathering doc, written in the
 * user's own words — not copied from the official almanac). The remaining 6
 * (Saint, Poisoner, Spy, Scarlet Woman, Baron, Imp) are still
 * `[PLACEHOLDER ...]` pending that doc covering them. Two roles that do have
 * real ability/FAQ text (Monk, Ravenkeeper) still use the placeholder
 * `reminder()` helper because role_desc.md left their HOST REMINDER field
 * blank.
 *
 * NIGHT ORDER NOTE: firstNightOrder/otherNightOrder below are an
 * approximation of the standard Trouble Brewing night-order sequence
 * (relative order only, not official prose). Flagged for the user to verify
 * against a rules reference — see build plan "what the user still needs to
 * provide". It does not block functionality either way.
 */
export const TROUBLE_BREWING_ROLES: RoleSeedData[] = [
  // ---- Townsfolk (13) ----
  {
    name: 'Washerwoman',
    team: 'townsfolk',
    abilityText: 'You start knowing that 1 of 2 players is a particular Townsfolk.',
    faqText:
      'You are shown 2 players, and then told one Townsfolk character. One of those two people will be that Townsfolk character.',
    firstNightOrder: 2,
    otherNightOrder: null,
    reminderText: 'Show the Washerwoman 2 players, and then a Townsfolk character that one of the players is.',
    setupEffect: null,
  },
  {
    name: 'Librarian',
    team: 'townsfolk',
    abilityText: 'You start knowing that 1 of 2 players is a particular Outsider (or that zero are in play).',
    faqText:
      'You are shown 2 players and then an Outsider character — one of those 2 players is that Outsider. If there is no Outsider in play, you receive a 0.',
    firstNightOrder: 3,
    otherNightOrder: null,
    reminderText: 'Show the Librarian 2 players, and reveal an Outsider character that one of the 2 players is.',
    setupEffect: null,
  },
  {
    name: 'Investigator',
    team: 'townsfolk',
    abilityText: 'You start knowing that 1 of 2 players is a particular Minion.',
    faqText: 'You are shown 2 players, and then a Minion character. One of those two people will be that Minion character.',
    firstNightOrder: 4,
    otherNightOrder: null,
    reminderText: 'Show the Investigator 2 players, only one of which is a Minion. Show what Minion character the players could be.',
    setupEffect: null,
  },
  {
    name: 'Chef',
    team: 'townsfolk',
    abilityText: 'You start knowing how many pairs of evil players there are.',
    faqText:
      'A pair of evil players is exactly 2 evil players sitting next to each other. One player may be part of 2 pairs — if 3 evil players are sitting in a row, you would be shown 2 pairs.',
    firstNightOrder: 5,
    otherNightOrder: null,
    reminderText: 'At setup, write down the number of pairs of evil players. Show this number to the Chef when they wake up.',
    setupEffect: null,
  },
  {
    name: 'Empath',
    team: 'townsfolk',
    abilityText: 'Each night, you learn how many of your 2 alive neighbors are evil.',
    faqText:
      'Each night you are given a number: 0 means neither neighbor is evil, 1 means one is evil, 2 means both are evil. If an adjacent player dies, the next alive player becomes your new neighbor.',
    firstNightOrder: 6,
    otherNightOrder: 6,
    reminderText: 'Mark down the number of evil players next to the Empath each night. Show this number to the Empath.',
    setupEffect: null,
  },
  {
    name: 'Fortune Teller',
    team: 'townsfolk',
    abilityText:
      'Each night, choose 2 players: you learn if either is a Demon. There is a good player who registers as a Demon to you.',
    faqText:
      'Every night you choose 2 players and get a yes/no on whether either is a Demon. One player acts as a red herring — they will always register as a Demon to you.',
    firstNightOrder: 7,
    otherNightOrder: 7,
    reminderText: 'At setup, mark one player as the red herring.',
    setupEffect: null,
  },
  {
    name: 'Undertaker',
    team: 'townsfolk',
    abilityText: 'Each night (except the first), you learn which character died by execution today.',
    faqText:
      'Each night, if a player was killed by execution during the day, you learn their character. If an already-dead player is executed, you still learn their role.',
    firstNightOrder: null,
    otherNightOrder: 9,
    reminderText: 'Note every time a player is executed during the day. Show this to the Undertaker each night.',
    setupEffect: null,
  },
  {
    name: 'Monk',
    team: 'townsfolk',
    abilityText: 'Each night (except the first), choose a player (not yourself): they are safe from the Demon tonight.',
    faqText: 'Choose a player every night to protect them from the Demon. They can still die from other sources.',
    firstNightOrder: null,
    otherNightOrder: 2,
    // Host reminder not yet provided for this role — see role_desc.md.
    reminderText: reminder('Monk'),
    setupEffect: null,
  },
  {
    name: 'Ravenkeeper',
    team: 'townsfolk',
    abilityText: 'If you die at night, you are woken to choose a player: you learn their character.',
    faqText: 'Choose wisely.',
    firstNightOrder: null,
    otherNightOrder: 5,
    // Host reminder not yet provided for this role — see role_desc.md.
    reminderText: reminder('Ravenkeeper'),
    setupEffect: null,
  },
  {
    name: 'Virgin',
    team: 'townsfolk',
    abilityText: 'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.',
    faqText: 'If a Townsfolk nominates you, they instantly die.',
    firstNightOrder: null,
    otherNightOrder: null,
    reminderText: "Track whether the Virgin's ability is still available. If a Townsfolk nominates them, execute the nominator immediately and mark the ability used.",
    setupEffect: null,
  },
  {
    name: 'Slayer',
    team: 'townsfolk',
    abilityText: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.',
    faqText: 'One shot — make it count.',
    firstNightOrder: null,
    otherNightOrder: null,
    reminderText: "Track whether the Slayer has used their shot.",
    setupEffect: null,
  },
  {
    name: 'Soldier',
    team: 'townsfolk',
    abilityText: 'You are safe from the Demon.',
    faqText: "You can't die from the Demon's kill.",
    firstNightOrder: null,
    otherNightOrder: null,
    reminderText: 'If the Demon targets the Soldier, the Soldier does not die.',
    setupEffect: null,
  },
  {
    name: 'Mayor',
    team: 'townsfolk',
    abilityText:
      'If only 3 players live and no execution occurs, your team wins. If you die at night, another player might die instead.',
    faqText:
      'If you are alive on the final day and no execution occurs, the good team wins outright. If you are attacked at night, the Storyteller may choose for another player to die instead of you.',
    firstNightOrder: null,
    otherNightOrder: null,
    reminderText: "Decide whether the Mayor's night-kill redirect applies, based on how the game is going.",
    setupEffect: null,
  },

  // ---- Outsiders (4) ----
  {
    name: 'Butler',
    team: 'outsider',
    abilityText: 'Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.',
    faqText:
      'Track whether your chosen player is voting. If they initially vote and then change their mind, you must follow suit.',
    firstNightOrder: 8,
    otherNightOrder: 8,
    reminderText: "Track the Butler's chosen player, in case that player's vote changes after the Butler has already locked in.",
    setupEffect: null,
  },
  {
    name: 'Drunk',
    team: 'outsider',
    abilityText: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.',
    faqText: 'You will be shown the night info for the Townsfolk character you believe you are.',
    firstNightOrder: null,
    otherNightOrder: null,
    reminderText: 'Track which Townsfolk character the Drunk believes they are.',
    setupEffect: null,
  },
  {
    name: 'Recluse',
    team: 'outsider',
    abilityText: 'You might register as evil, and as a Minion or Demon, even if dead.',
    faqText: 'You might look evil to other players and their abilities, even though you are actually good.',
    firstNightOrder: null,
    otherNightOrder: null,
    reminderText: 'Track which characters see the Recluse as evil — this can change from day to day.',
    setupEffect: null,
  },
  {
    name: 'Saint',
    team: 'outsider',
    abilityText: ability('Saint'),
    faqText: faq('Saint'),
    firstNightOrder: null,
    otherNightOrder: null,
    reminderText: reminder('Saint'),
    setupEffect: null,
  },

  // ---- Minions (4) ----
  {
    name: 'Poisoner',
    team: 'minion',
    abilityText: ability('Poisoner'),
    faqText: faq('Poisoner'),
    firstNightOrder: 1,
    otherNightOrder: 1,
    reminderText: reminder('Poisoner'),
    setupEffect: null,
  },
  {
    name: 'Spy',
    team: 'minion',
    abilityText: ability('Spy'),
    faqText: faq('Spy'),
    firstNightOrder: 9,
    otherNightOrder: 10,
    reminderText: reminder('Spy'),
    setupEffect: null,
  },
  {
    name: 'Scarlet Woman',
    team: 'minion',
    abilityText: ability('Scarlet Woman'),
    faqText: faq('Scarlet Woman'),
    firstNightOrder: null,
    otherNightOrder: 3,
    reminderText: reminder('Scarlet Woman'),
    setupEffect: null,
  },
  {
    name: 'Baron',
    team: 'minion',
    abilityText: ability('Baron'),
    faqText: faq('Baron'),
    firstNightOrder: null,
    otherNightOrder: null,
    reminderText: reminder('Baron'),
    // Wires Baron through the real setupEffect mechanism (rather than a dead
    // code path): adds 0-2 extra Outsiders at the host's choice, offset by
    // removing the same number of Townsfolk, per build plan section 5.
    setupEffect: {
      type: 'countDelta',
      hostChoosable: true,
      params: { targetTeam: 'outsider', min: 0, max: 2, offsetTeam: 'townsfolk' },
    },
  },

  // ---- Demon (1) ----
  {
    name: 'Imp',
    team: 'demon',
    abilityText: ability('Imp'),
    faqText: faq('Imp'),
    firstNightOrder: null,
    otherNightOrder: 4,
    reminderText: reminder('Imp'),
    setupEffect: null,
  },
];
