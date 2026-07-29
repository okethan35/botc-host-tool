/**
 * Role name -> icon filename (served from client/public/icons/roles/).
 * Icons are official Trouble Brewing character token art sourced from the
 * Blood on the Clocktower Wiki (wiki.bloodontheclocktower.com), which belongs
 * to The Pandemonium Institute - used here at the project owner's direction,
 * unlike ability/FAQ/reminder text which is paraphrased rather than copied.
 * Roles with no entry (any future non-Trouble-Brewing role until icons are
 * sourced for it) simply render without an icon.
 */
export const ROLE_ICON_FILENAMES: Record<string, string> = {
  Washerwoman: 'washerwoman',
  Librarian: 'librarian',
  Investigator: 'investigator',
  Chef: 'chef',
  Empath: 'empath',
  'Fortune Teller': 'fortuneteller',
  Undertaker: 'undertaker',
  Monk: 'monk',
  Ravenkeeper: 'ravenkeeper',
  Virgin: 'virgin',
  Slayer: 'slayer',
  Soldier: 'soldier',
  Mayor: 'mayor',
  Butler: 'butler',
  Drunk: 'drunk',
  Recluse: 'recluse',
  Saint: 'saint',
  Poisoner: 'poisoner',
  Spy: 'spy',
  'Scarlet Woman': 'scarletwoman',
  Baron: 'baron',
  Imp: 'imp',
};

export function getRoleIconPath(roleName: string): string | null {
  const filename = ROLE_ICON_FILENAMES[roleName];
  return filename ? `/icons/roles/${filename}.png` : null;
}
