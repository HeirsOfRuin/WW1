// The soldier's record: what the Soldier tab shows (the author, 2026-11-09: "The game needs a
// character tab that tracks skills, traits, awards, career, rank, friends, rivals, etc.").
// One function builds it from the state; the UI shows it and computes nothing.
// Career dates come from the war's own log (every promotion, wound, course, battle, award and
// death is logged with its tour), so the record cannot disagree with what happened.
import type { ContentBundle } from '../content/schema';
import type { GameState } from './state';
import { heroOf } from '@engine/character';
import { RANKS, STAGES, ROLES, home, skill, aliveFriends, sentHomeOf, lsd, corpsOf, rankFull, PROMO, SERGEANT, CSM, SUBALTERN, LIEUTENANT, COMMISSION_LEAD, type War } from './war/index';
import { ROTATION_MONTHS, monthName, monthOfClock, TRAINING } from './war/calendar';
import { SECTION_NAMES, PATH_NAMES, roleName, nerveWord, standingWord, whereOf, offerWords } from './module';

export interface Line { label: string; note?: string }
export interface SkillLine { label: string; level: number; note: string }
export interface SoldierRecord {
  name: string; town: string; age: number; rank: string; role: string;
  nerve: { value: number; word: string }; standing: string;
  home: Line[]; war: SkillLine[]; traits: Line[]; awards: Line[]; career: Line[];
  friends: { name: string; status: string; written: boolean; alive: boolean }[];
  /** the tank's crew or the air gunner's pilot and fitter, once he has transferred (FRAME-TANK, FRAME-AIR) */
  crew: { title: string; men: { name: string; status: string; alive: boolean }[] } | null;
  /** what the next step up needs, and what he has (FRAME-PLAYTEST2 B: the rule nobody could see) */
  next: Line[];
  rivals: Line[];
  totals: Line[];
}

const ASSIGN_NAMES: Record<string, string> = {
  firing: 'Firing party', escort: 'Prisoner escort', guide: 'Guide for the relief', burial: 'Burial party',
  instructor: 'Instructor at the divisional school', concert: 'The concert party',
};

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
  // the tank and air gunner learn the Lewis gun: his trade in both (FRAME-TANK.md, FRAME-AIR.md)
  bearer: ['Stretcher-bearing', 'At 2, the stretcher-bearer\'s role; the men around you are brought in.'],
};
const AWARD_NAMES: Record<string, string> = {
  MiD: 'Mentioned in Despatches', MM: 'Military Medal', MC: 'Military Cross', DCM: 'Distinguished Conduct Medal', VC: 'Victoria Cross', DFM: 'Distinguished Flying Medal',
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
    else if ((m = /^assignment: (\w+) (taken|got out of)$/.exec(e.msg))) career.push({ label: `${ASSIGN_NAMES[m[1]!] ?? m[1]}, ${when(e)}`, note: m[2] === 'taken' ? 'Did it' : 'Got out of it' });
    else if ((m = /^(light|severe) wound \((.*)\)/.exec(e.msg))) career.push({ label: `Wounded, ${when(e)}`, note: `${m[1] === 'severe' ? 'Badly, ' : 'Lightly, '}${whereOf(m[2]!)}` });
    else if ((m = /^awarded (\w+)$/.exec(e.msg))) { awards.push({ label: AWARD_NAMES[m[1]!] ?? m[1]!, note: when(e) }); career.push({ label: `${AWARD_NAMES[m[1]!] ?? m[1]}, ${when(e)}` }); }
    else if ((m = /^named in orders \((\w+)\)$/.exec(e.msg))) awards.push({ label: 'Named in battalion orders', note: when(e) });
    else if ((m = /^servant to officer (\d)$/.exec(e.msg))) career.push({ label: `Officer's servant, ${when(e)}`, note: m[1] === '1' ? 'His platoon officer\'s batman' : 'The new officer\'s batman' });
    else if (/^transferred to a tunnelling company/.test(e.msg)) career.push({ label: `To the tunnellers, ${when(e)}`, note: 'Royal Engineers' });
    else if (/^transferred to the Tank Corps/.test(e.msg)) career.push({ label: `To the tanks, ${when(e)}`, note: 'Heavy Branch, Machine Gun Corps; the Tank Corps from July 1917' });
    else if (/^transferred to the Royal Flying Corps/.test(e.msg)) career.push({ label: `To the Flying Corps, ${when(e)}`, note: 'Aerial gunner, a two-seater squadron' });
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
    const away = { tunnel: 'with the tunnellers', tank: 'in the tanks', air: 'in the Flying Corps' }[corpsOf(w) ?? 'tunnel'];
    const status = alive ? (w.transferred ? `Alive. You are ${away} now.` : 'Alive') : deaths.get(i) ?? 'Killed';
    return { name: n, status, written: i < 3, alive };
  });

  const crew = crewOf(w, flags);

  const war = Object.entries(WAR)
    .filter(([k]) => k !== 'tunnel' || corpsOf(w) === 'tunnel')
    .map(([k, [label, note]]) => ({ label, level: Math.round(skill(w, k) * 10) / 10, note }));

  return {
    name: hero.name,
    town: content.starts[s.start]?.label ?? s.start,
    age: Math.floor((s.time - hero.born) / 4),
    rank: rankFull(w),
    role: ((n) => n[0]!.toUpperCase() + n.slice(1))(roleName(w)),
    nerve: { value: Math.max(0, Math.round(w.nerve)), word: nerveWord(w.nerve) },
    standing: standingWord(w.standing),
    home: Object.keys(w.homeSet).map((k) => ({ label: HOME_NAMES[k] ?? k, note: HOME[k] })),
    war,
    traits,
    awards,
    career,
    friends,
    crew,
    next: nextStep(w),
    rivals,
    totals: [
      { label: 'Tours in the line', note: String(w.stats.rotations) },
      { label: 'Battles', note: String(w.stats.battles) },
      { label: 'Duties volunteered for', note: String(w.stats.volunteered) },
      { label: 'Role missions', note: w.stats.missions ? `${w.stats.missions} (${w.stats.missionsWon} went well)` : 'None yet' },
      { label: 'Wounds', note: String(log.filter((e) => /wound \(/.test(e.msg)).length) },
      // the author, 2026-11-16: "yes on number, players would like that"
      { label: 'Men you know you killed', note: String(w.stats.killed ?? 0) },
      { label: 'Prisoners taken', note: String(w.stats.prisoners ?? 0) },
      { label: 'The section from home', note: `${aliveFriends(w)} of 9 alive` },
      { label: 'Sent home', note: lsd(sentHomeOf(w)) },
    ],
  };
}

/** The next rank and what it needs, in the war layer's own numbers (war.ts promote, csmVacancy,
 *  commissionOffer, officerVacancy): one derivation, read here. */
function nextStep(w: War): Line[] {
  const has = (n: number) => Math.round(n);
  const lead = Math.round(skill(w, 'lead') * 10) / 10;
  const out: Line[] = [];
  if (w.ending) return out;
  if (w.commissioned) {
    if (w.rank === SUBALTERN) out.push({ label: 'Lieutenant', note: `A vacancy after a battle, with standing ${PROMO.ltStanding} (you have ${has(w.standing)}).` });
    else if (w.rank === LIEUTENANT) out.push({ label: 'Acting captain', note: `A vacancy after a battle, with standing ${PROMO.captStanding} (you have ${has(w.standing)}).` });
    return out;
  }
  if (w.servant) out.push({ label: 'An officer\'s servant', note: 'A servant stays a private: no stripe at a leave while you serve. A stripe from a battle or a mission ends it.' });
  if (w.rank < SERGEANT) out.push({ label: RANKS[w.rank + 1]!, note: `Going back after a leave; a vacancy after a battle, with standing ${45 + 10 * w.rank} (you have ${has(w.standing)}); or a role mission that goes well.` });
  if (w.rank === SERGEANT) out.push({ label: 'Company sergeant major', note: `A vacancy, with standing ${PROMO.csmStanding} (you have ${has(w.standing)}): about one leave in eight, or one battle in twenty-five.` });
  if (corpsOf(w) === 'tank' || corpsOf(w) === 'air') out.push({ label: 'A commission', note: 'Not from the tanks or the Flying Corps: a commission would put you back in the infantry.' });
  else if (w.stage > 3 || (w.stage === 3 && w.cursor.at === 'done')) out.push({ label: 'A commission', note: 'The boards are past.' });
  else out.push({ label: 'A commission', note: `The board at the leave of December 1917 takes a sergeant or above with standing 70 (you have ${has(w.standing)}) and one of: reading and figures from home${home(w, 'lit') ? ' (you have it)' : ''}, a gallantry medal${w.awards.some((a) => a !== 'MiD') ? ' (you have one)' : ''}, or leadership ${COMMISSION_LEAD} (you have ${lead}). Half of those it sees, it takes.` });
  if (w.rank >= CSM) out.splice(0, out.length - 1);
  return out;
}

type Man = { name: string; status: string; alive: boolean };
/** The men he serves with after a transfer, and what has become of them so far. Their fates are
 *  story choices (flags) that come true on a later tour, so each is shown only once its tour has
 *  passed: the record must not tell the player that Lacey dies at Cambrai in September. */
function crewOf(w: War, flags: Record<string, unknown>): SoldierRecord['crew'] {
  const f = (k: string) => !!flags[k];
  // a battle's fates come true when it is fought (or its tour has gone by, if he was out of it)
  const after = (tour: number, battle: string) => w.clock > tour || w.log.some((l) => l.includes(`battle: ${battle} as`));
  if (corpsOf(w) === 'tank') {
    const men: Man[] = [];
    const lacey: Man = !after(29, 'Cambrai') ? { name: '2/Lt Edward Lacey', status: 'Commands Polaris. Sick every time she moves.', alive: true }
      : f('tk17_lacey_praised') ? { name: '2/Lt Edward Lacey', status: 'Killed at Flesquières, Cambrai, November 1917, walking ahead of her.', alive: false }
      : { name: '2/Lt Edward Lacey', status: 'Wounded at Cambrai, November 1917, and sent home.', alive: true };
    men.push(lacey);
    men.push(f('tk18_said_no') ? (after(36, 'Hundred Days, August') ? { name: 'Cpl Walter Pring', status: 'Went to the Whippets without you. Killed at Amiens, August 1918.', alive: false } : { name: 'Cpl Walter Pring', status: 'Driving a Whippet now, with somebody else on his gun.', alive: true })
      : f('tk18_pring_hit') ? { name: 'Cpl Walter Pring', status: 'Wounded in the Whippet, September 1918, and sent home.', alive: true }
      : f('tk18_whippet') ? { name: 'Cpl Walter Pring', status: 'Drives the Whippet. You are his gunner.', alive: true }
      : { name: 'Cpl Walter Pring', status: 'The driver. Drives like a bus with the brakes on.', alive: true });
    men.push(f('tk18_tonks_told') ? { name: 'Pte Alf Tonks', status: 'Deaf in one ear. Sent to the workshops at Erin.', alive: true } : { name: 'Pte Alf Tonks', status: 'Gearsman. Signals with a hammer on the engine cover.', alive: true });
    men.push(f('tk17_murray_tin') && after(29, 'Cambrai') ? { name: 'Pte Duggie Murray', status: 'Burned at Cambrai, November 1917.', alive: false } : { name: 'Pte Duggie Murray', status: 'Gearsman. Says she is badly riveted.', alive: true });
    men.push(f('tk_kearney_taken') ? { name: 'Pte Mick Kearney', status: 'Taken prisoner when his tank ditched beyond their line, August 1918.', alive: true } : { name: 'Pte Mick Kearney', status: 'Gunner. Deals the cards.', alive: true });
    return { title: 'The crew of Polaris', men };
  }
  if (corpsOf(w) === 'air') {
    const men: Man[] = [];
    men.push(f('af18_ferrier_home') ? { name: 'Lt Neil Ferrier', status: 'Your pilot in 1917. Sent home to teach, February 1918.', alive: true }
      : f('af18_ferrier_killed') ? { name: 'Lt Neil Ferrier', status: 'Your pilot in 1917. Killed after the retreat, spring 1918.', alive: false }
      : { name: 'Lt Neil Ferrier', status: 'Your pilot. Flies the RE8 like a binder.', alive: true });
    if (f('af18_hollis')) men.push(f('af18_hollis_killed') ? { name: 'Sgt Len Hollis', status: 'A sergeant pilot. Killed at the Somme bridges, August 1918.', alive: false } : { name: 'Sgt Len Hollis', status: 'A sergeant pilot. Knows engines, and says so.', alive: true });
    if (f('af18_hollis_killed')) men.push({ name: 'Mr Lyle', status: 'Your pilot since the bridges.', alive: true });
    men.push({ name: 'AM1 Bert Sallis', status: 'The fitter. Waits on the field every evening, counting the machines home.', alive: true });
    return { title: 'Your pilot and fitter', men };
  }
  return null;
}

export { ROLES };
