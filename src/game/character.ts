// The soldier's record: what the Soldier tab shows (the author, 2026-11-09: "The game needs a
// character tab that tracks skills, traits, awards, career, rank, friends, rivals, etc.").
// One function builds it from the state; the UI shows it and computes nothing.
// Career dates come from the war's own log (every promotion, wound, course, battle, award and
// death is logged with its tour), so the record cannot disagree with what happened.
import type { ContentBundle } from '../content/schema';
import type { GameState } from './state';
import { heroOf } from '@engine/character';
import { RANKS, STAGES, ROLES, home, skill, aliveFriends, sentHomeOf, lsd, type War } from './war/index';
import { ROTATION_MONTHS, monthName, monthOfClock, TRAINING } from './war/calendar';
import { SECTION_NAMES, PATH_NAMES, roleName, nerveWord, standingWord, whereOf, offerWords } from './module';

export interface Line { label: string; note?: string }
export interface SkillLine { label: string; level: number; note: string }
export interface SoldierRecord {
  name: string; town: string; age: number; rank: string; role: string;
  nerve: { value: number; word: string }; standing: string;
  home: Line[]; war: SkillLine[]; traits: Line[]; awards: Line[]; career: Line[];
  friends: { name: string; status: string; written: boolean; alive: boolean }[];
  rivals: Line[];
  totals: Line[];
}

const HOME: Record<string, string> = {
  dig: 'Digging and timbering. Wiring and carrying parties are safer; trench sense comes faster.',
  mech: 'A hand with machinery. The Lewis gun comes faster.',
  lit: 'Reading and figures. Signals come faster; a commission is possible; courses come more often.',
  field: 'Fieldcraft and a gun. Patrols and raids are safer; sniping comes faster.',
  stamina: 'Stamina. Nerve drains slower; light wounds mend faster.',
  firstaid: 'First aid. The men around you are killed less often.',
  sport: 'A throwing arm. Bombing comes faster; raids earn more.',
  voice: 'A voice. Nerve comes back faster at rest; the section listens.',
};
const HOME_NAMES: Record<string, string> = {
  dig: 'Digging', mech: 'Machinery', lit: 'Reading and figures', field: 'Fieldcraft', stamina: 'Stamina',
  firstaid: 'First aid', sport: 'Throwing arm', voice: 'Voice',
};
const WAR: Record<string, [string, string]> = {
  trench: ['Trench sense', 'Every hit is less likely, in the line and in battle.'],
  bomb: ['Bombing', 'At 2, the bomber\'s role; safer raids.'],
  lewis: ['Lewis gun', 'At 2, the Lewis gunner\'s role.'],
  snipe: ['Sniping', 'At 2, the sniper\'s role; safer patrols.'],
  signals: ['Signals', 'At 2, the signaller\'s role.'],
  lead: ['Leadership', 'The section is killed less often when you lead it; counts for a commission.'],
  tunnel: ['Tunnelling', 'Underground, the gallery is less likely to come in on you.'],
};
const AWARD_NAMES: Record<string, string> = {
  MiD: 'Mentioned in Despatches', MM: 'Military Medal', MC: 'Military Cross', DCM: 'Distinguished Conduct Medal', VC: 'Victoria Cross',
};
/** Traits are what he has done that the story remembers (flags), in a few words each. */
const TRAITS: [string, string, string][] = [
  ['gave_fags', 'Shares what he has', 'Gave Duckworth one of his last two Woodbines, the first night.'],
  ['kept_pilling_secret', 'Keeps a confidence', 'Kept Walter Pilling\'s age to himself.'],
  ['told_on_pilling', 'Spoke up for a boy', 'Told the sergeant Pilling was a child. It changed nothing.'],
  ['wrote_home', 'Writes home', 'Two sides by a candle end.'],
  ['sent_postcard', 'Keeps it short', 'Sent the field postcard: I am quite well.'],
  ['wrote_for_shaw', 'A good hand', 'Wrote Albert Shaw\'s letters for him.'],
  ['taught_shaw', 'Patient', 'Taught Shaw to spell allotment.'],
  ['built_up_crater', 'Careful of his trench', 'Built up the low place by the crater under the flares.'],
  ['last_letter', 'Carries a last letter', 'There is a letter in his pay book.'],
  ['spoke_at_roll', 'Bears witness', 'Answered at roll call for the men he saw fall.'],
  ['brought_discs', 'Went out for the discs', 'Brought in identity discs from the wire, July 1916.'],
  ['best_man', 'A promise to Shaw', 'Said he would stand up with him and Edith.'],
  ['carved_name', 'Left his name', 'Carved his name in the chalk of the caves under Arras.'],
  ['hunted_fritz', 'Went after the man at the crater', 'Three days in the crater lip with the sniping officer. Nobody knows for sure.'],
  ['led_the_gassed', 'Led the blind', 'Led a line of gassed men down to the aid post, July 1917.'],
  ['wet_babys_head', 'Wet the baby\'s head', 'Drank the health of Albert Shaw\'s son in the section\'s rum.'],
  ['stood_shaws_watch', 'A good pal', 'Stood Shaw\'s sentry so he could write home.'],
  ['sat_with_shaw', 'Sits up with a friend', 'Stayed on the firestep with Shaw the night Edith wrote.'],
  ['went_to_airman', 'Saw the airman', 'Ran to the burning aeroplane. There was nothing to do.'],
  ['wrote_to_mrs_shaw', 'Writes to the mothers', 'Wrote to a dead friend\'s mother himself.'],
  ['wrote_to_mrs_duckworth', 'Writes to the mothers', 'Wrote to a dead friend\'s mother himself.'],
  ['wrote_to_mrs_pilling', 'Writes to the mothers', 'Wrote to a dead friend\'s mother himself.'],
];

const monthOfTour = (stage: number, clock: number) => monthName(monthOfClock(stage, clock));

function parseLog(w: War): { stage: number; clock: number; msg: string }[] {
  return w.log.map((l) => {
    const m = /^S(\d) r(\d+) \| (.*)$/.exec(l);
    return m ? { stage: Number(m[1]), clock: Number(m[2]), msg: m[3]! } : { stage: 1, clock: 0, msg: l };
  });
}

export function recordOf(content: ContentBundle, s: GameState): SoldierRecord {
  const w = s.war;
  const hero = heroOf(s);
  const names = SECTION_NAMES[w.town]!;
  const log = parseLog(w);
  const when = (e: { stage: number; clock: number }) => monthOfTour(e.stage, e.clock);

  const career: Line[] = [{ label: `Enlisted, ${monthName(TRAINING)}`, note: content.starts[s.start]?.label }];
  const awards: Line[] = [];
  const deaths = new Map<number, string>();
  for (const e of log) {
    let m: RegExpExecArray | null;
    if ((m = /^promoted to (.*) \((.*)\)$/.exec(e.msg))) career.push({ label: `${m[1]}, ${when(e)}`, note: m[2] === 'returned to the front' ? 'On going back after leave' : m[2]!.replace(/^vacancy after/, 'A vacancy after').replace(/^standing$/, 'The sergeant\'s word') });
    else if ((m = /^battle: (.*) as (\w+)$/.exec(e.msg))) career.push({ label: m[1]!, note: `${when(e)}, as ${PATH_NAMES[m[2]!] ?? m[2]}` });
    else if ((m = /^course: (\w+)$/.exec(e.msg))) career.push({ label: `Course, ${when(e)}`, note: WAR[m[1]!]?.[0] });
    else if ((m = /^(light|severe) wound \((.*)\)/.exec(e.msg))) career.push({ label: `Wounded, ${when(e)}`, note: `${m[1] === 'severe' ? 'Badly, ' : 'Lightly, '}${whereOf(m[2]!)}` });
    else if ((m = /^awarded (\w+)$/.exec(e.msg))) { awards.push({ label: AWARD_NAMES[m[1]!] ?? m[1]!, note: when(e) }); career.push({ label: `${AWARD_NAMES[m[1]!] ?? m[1]}, ${when(e)}` }); }
    else if (/^transferred to a tunnelling company/.test(e.msg)) career.push({ label: `To the tunnellers, ${when(e)}`, note: 'Royal Engineers' });
    else if ((m = /^leave after stage (\d)/.exec(e.msg))) career.push({ label: `Home on leave, ${monthName(ROTATION_MONTHS[Number(m[1])]!.leave)}` });
    else if ((m = /^friend (\d+) killed \((.*)\)$/.exec(e.msg))) deaths.set(Number(m[1]) - 1, `Killed ${whereOf(m[2]!)}, ${when(e)}`);
    else if (/^froze/.test(e.msg)) career.push({ label: `Froze under fire, ${when(e)}`, note: 'The sergeant covered for him' });
  }
  if (w.ending === 'posting' && w.posting) career.push({ label: 'Home posting', note: offerWords(w.posting) });

  const flags = s.flags;
  const traits: Line[] = [];
  for (const [f, label, note] of TRAITS) if (flags[f] && !traits.some((t) => t.label === label)) traits.push({ label, note });
  if (home(w, 'stamina') && w.severe === 0 && w.clock > 15) traits.push({ label: 'Never badly hit', note: 'Not yet.' });

  const rivals: Line[] = [];
  if (flags.met_fritz) rivals.push({ label: 'Fritz-at-the-crater', note: flags.hunted_fritz ? 'A sniper behind their wire by the old mine crater. You went after him in 1917. After that week nobody was shot in that bay. Nobody ever saw him.' : flags.left_fritz ? 'A sniper behind their wire by the old mine crater. Somebody went after him in 1917. You never found out who fired the last shot.' : 'A sniper with a telescopic sight, behind their wire by the old mine crater. Nobody has seen him. He has killed men in your bay.' });

  const friends = names.map((n, i) => {
    const alive = !!w.friends[i];
    const status = alive ? (w.transferred ? 'Alive. You are with the tunnellers now.' : 'Alive') : deaths.get(i) ?? 'Killed';
    return { name: n, status, written: i < 3, alive };
  });

  const war = Object.entries(WAR)
    .filter(([k]) => k !== 'tunnel' || w.transferred)
    .map(([k, [label, note]]) => ({ label, level: Math.round(skill(w, k) * 10) / 10, note }));

  return {
    name: hero.name,
    town: content.starts[s.start]?.label ?? s.start,
    age: Math.floor((s.time - hero.born) / 4),
    rank: RANKS[w.rank]!,
    role: ((n) => n[0]!.toUpperCase() + n.slice(1))(roleName(w)),
    nerve: { value: Math.max(0, Math.round(w.nerve)), word: nerveWord(w.nerve) },
    standing: standingWord(w.standing),
    home: Object.keys(w.homeSet).map((k) => ({ label: HOME_NAMES[k] ?? k, note: HOME[k] })),
    war,
    traits,
    awards,
    career,
    friends,
    rivals,
    totals: [
      { label: 'Tours in the line', note: String(w.stats.rotations) },
      { label: 'Battles', note: String(w.stats.battles) },
      { label: 'Duties volunteered for', note: String(w.stats.volunteered) },
      { label: 'Role missions', note: w.stats.missions ? `${w.stats.missions} (${w.stats.missionsWon} went well)` : 'None yet' },
      { label: 'Wounds', note: String(log.filter((e) => /wound \(/.test(e.msg)).length) },
      { label: 'The section from home', note: `${aliveFriends(w)} of 9 alive` },
      { label: 'Sent home', note: lsd(sentHomeOf(w)) },
    ],
  };
}

export { ROLES };
