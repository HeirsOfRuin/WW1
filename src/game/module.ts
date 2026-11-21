// In the Trenches's game module: the rules the engine leaves to the game. Registered on import;
// every entry point that loads content imports it (src/game/index.ts, tools/content-loader.ts).
//
// The war layer (src/game/war/) owns the soldier's war; this module lets content read it
// (war.* paths and {text} variables), drive it (the war_* effects) and date it (the date hook).
// Every decision scene's choices run one `war:` effect and then route on war.pending, so the
// engine shows the next question the war asks (content/scenes/war/).
import { registerGame, STAKES_RANK, type GameModule } from '@engine/game';
import { advanceSeasons } from '@engine/calendar';
import type { CoreContent } from '@engine/schema';
import type { CoreState } from '@engine/state';
import { GAME_ID, type ContentBundle } from '../content/schema';
import type { GameState } from './state';
import {
  run, decide, setHome, newsOf, aliveFriends, grade, dutyHit, missionHit, phaseHit, battleOf,
  RANKS, ROLES, DUTIES, STAGES, SORTIES, sortieHit, type Decision, type War, type SortieChoice,
  homeTier, sentHomeOf, lsd, ASSIGNMENTS, CORPS_BATTLES, corpsOf, rankName, rankFull, canLead, CLOSE, phaseNerve, sickChance, type CloseChoice,
} from './war/index';
import { warMonth, seasonOf, monthName, monthOfClock } from './war/calendar';
import { CLOSE_CALLS } from './close-calls';

const st = (s: CoreState) => s as GameState;
const ct = (c: CoreContent) => c as ContentBundle;
const war = (s: CoreState) => st(s).war;

// ---- words -----------------------------------------------------------------------------------

/** Risk on one step of a sortie, in words. A step carries a third of a duty's risk, so the battle
 *  scale read "low risk" for every choice (playtest 1): steps get their own, finer scale. */
export function stepRiskWord(p: number): string {
  if (p < 0.005) return 'little risk';
  if (p < 0.012) return 'some risk';
  if (p < 0.025) return 'real risk';
  if (p < 0.05) return 'high risk';
  return 'very high risk';
}

/** Risk of being hit, in words. The number behind it is the resolver's own (dutyHit, phaseHit). */
export function riskWord(p: number): string {
  if (p < 0.03) return 'low risk';
  if (p < 0.08) return 'real risk';
  if (p < 0.18) return 'high risk';
  if (p < 0.4) return 'very high risk';
  return 'almost certain to be hit'; // the stalled first of July: without this every choice read the same
}

const DUTY_NAMES: Record<string, string> = {
  raid: 'a trench raid', patrol: 'a patrol into no man\'s land', wiring: 'a wiring party',
  listening: 'a listening post', carrying: 'a carrying party',
};
const SKILL_NAMES: Record<string, string> = {
  dig: 'digging and timbering', mech: 'machinery', lit: 'reading and figures', field: 'fieldcraft and shooting',
  stamina: 'stamina', firstaid: 'first aid', sport: 'a throwing arm', voice: 'a chapel voice',
  trench: 'trench sense', bearer: 'stretcher-bearing', bomb: 'bombing', lewis: 'the Lewis gun', snipe: 'sniping', signals: 'signals', lead: 'leadership', tunnel: 'tunnelling',
};
export const PATH_NAMES: Record<string, string> = {
  rifleman: 'rifleman', bomb: 'bomber', lewis: 'Lewis gunner', bearer: 'stretcher-bearer', snipe: 'sniper', signals: 'signaller', tunnel: 'tunneller', tank: 'tank gunner', air: 'aerial gunner', nco: 'section leader', subaltern: 'platoon officer',
};
/** His job in a word: an acting captain commands a company, not a platoon. */
export const roleName = (w: War) => (w.rank === 7 ? 'company commander' : PATH_NAMES[w.path] ?? w.path);

const PHASE_LINES: Record<string, string> = {
  advance: 'Crossing no man\'s land. Men who go to ground out here are caught in the open.',
  trench: 'In the enemy trench. Bombing along it is the most dangerous work there is.',
  hold: 'Holding what was taken. The counter-attack will come to you.',
  defence: 'Holding the line against their attack. Go to ground and you may be overrun.',
  stalled: 'The attack has stalled at the wire. Pushing on now is suicide; the whole line is going to ground.',
};

const ROLE_WHERE: Record<string, string> = {
  'bombing raid': 'on a bombing raid',
  'covering a raid with the Lewis gun': 'on the Lewis gun, covering a raid',
  'sniping from a hide': 'in a sniper\'s hide',
  'running a message under fire': 'running a message under fire',
  'listening for enemy miners; blowing a camouflet': 'underground, listening for the enemy\'s miners',
  'carrying the wounded in under fire': 'carrying a wounded man in under fire',
  'bringing the tank up': 'bringing the tank up to the line',
  'flying over the line': 'in the air over the line',
};
const ALL_BATTLES = [...STAGES.flatMap((st) => Object.values(st.battles)), ...Object.values(CORPS_BATTLES).flatMap((by) => Object.values(by!).flatMap((r) => Object.values(r)))];
const BATTLES = new Set(ALL_BATTLES.map((b) => b.name));

/** A home posting in words. The war layer's names stay as they are (they are in its saves). */
export function offerWords(o: string): string {
  const words: Record<string, string> = {
    'home service (wounded)': 'home service, while the wound mends',
    'war work (mill)': 'a release to munitions work in an engineering shop',
    'war work (pit)': 'a release back to the pit: coal is war work too',
    'war work (city)': 'a clerk\'s post at the depot',
    'war work (farm)': 'a release to the land, for the harvest',
    instructor: 'instructor at the training depot',
    'home establishment (air)': 'Home Establishment: an aerial gunnery school in England, teaching the new men',
  };
  return words[o] ?? o;
}

/** Where a wound or a death happened, in words, from the cause the resolver recorded. */
// What the money sent home has done for the family, by town and tier (war.ts homeTier): read at
// every leave (the author, 2026-11-09: "pay becomes money sent home that changes the family's
// circumstances on leave").
const MONEY_LINES: Record<string, string[]> = {
  mill: [
    "What you've sent home has gone on the rent and the coal. Your mother says it's been a godsend, and it hasn't been much.",
    'Your allotment has paid the rent ahead to Easter. Your mother keeps the rent book in the tea caddy and shows you the stamps, every one.',
    "The money you've sent home has bought your father new boots and our Jack a suit for chapel, and there's still something in the Co-op book with your name on it.",
    "There's money in the Post Office in your name now, more than your father made in a year at the mill. Your mother doesn't know what to do with it. She's frightened of it.",
  ],
  pit: [
    "Your allotment goes on the rent and the doctor. It isn't much, and your mother says it's been a godsend.",
    "Your money has paid the doctor for your father's chest, twice, and he grumbles at the waste.",
    'Your money has bought a new range for the kitchen, black-leaded, with an oven, and your mother bakes in it every day you are home.',
    "There's money in the Store in your name, more than your father ever saw at once. Your mother says it's your start, after. Your father says it's blood money, and then says he didn't mean it.",
  ],
  farm: [
    "What you've sent home went to the squire's agent with the Lady Day rent.",
    "Your money paid the farrier and the seed bill. Your father hasn't said thank you, and keeps the receipts.",
    'Your money has bought a young cob to work beside old Blossom. Your father calls him Corporal, to annoy you.',
    "There's money in the bank at South Molton in your name, enough to take a farm of your own, one day, if you came home to it. Your father has been to look at one. He doesn't say so.",
  ],
  city: [
    'The firm makes up your salary, and your allotment goes on top of it, and your mother says how good the firm is, every time.',
    "With the firm making up your salary the house is better off than when you were at your desk. Your mother's ashamed of it, and buys the Sunday joint anyway.",
    'There is new linoleum in the hall and a gas fire in the front room, and your mother keeps saying the firm, the firm, as if it were the firm that went to France.',
    "There's money in the Post Office Savings in your name, a proper sum. Your father, a clerk thirty years, looks at the book a long time and gives it back without a word.",
  ],
};

// battle names in a sentence: "Killed at Spring Offensive" read like a form
const BATTLE_WHERE: Record<string, string> = {
  'Somme, 1 July': 'on the Somme, on the first of July', 'Somme, autumn': 'on the Somme, in the autumn',
  'Spring Offensive': 'in the German offensive, in March', 'Hundred Days, August': 'at Amiens, in August',
  'Hundred Days, October': 'in the advance, in October', Cambrai: 'at Cambrai, in November',
};
export function whereOf(cause: string): string {
  // the resolver appends what happened (", severe wound, downgraded", ": shell shock"); battle names keep their commas
  const c = cause.replace(/(, severe wound, downgraded|: [^:]*)$/, '').trim();
  if (c === 'shellfire') return 'by a shell in the front line';
  if (c === 'in the line') return 'in the line';
  if (c === 'shelled in support') return 'by a shell in the support trenches';
  if (c === 'anti-aircraft fire') return 'by anti-aircraft fire over the line';
  if (c === 'shelled in the tank park') return 'by a shell in the tank park';
  if (c === 'escorting prisoners') return 'on the road, escorting prisoners back to the cage';
  if (c === 'guiding the relief') return 'guiding the relief in';
  if (c === 'mine collapse or camouflet') return 'underground, when a gallery came in';
  if (DUTY_NAMES[c]) return `on ${DUTY_NAMES[c]}`;
  if (ROLE_WHERE[c]) return ROLE_WHERE[c]!;
  if (BATTLES.has(c)) return BATTLE_WHERE[c] ?? `at ${c}`;
  return 'in France';
}

/** A recorded cause, by kind: in a battle, by a shell (or Archie), on a duty or mission, on an
 *  assignment, underground, or something else. The wound and death scenes are written by kind. */
export function causeKind(cause: string): 'battle' | 'shell' | 'sortie' | 'assign' | 'underground' | 'other' {
  const c = cause.replace(/(, severe wound, downgraded|: [^:]*)$/, '').trim();
  if (BATTLES.has(c)) return 'battle';
  if (c === 'shellfire' || c === 'shelled in support' || c === 'shelled in the tank park' || c === 'anti-aircraft fire') return 'shell';
  if (c === 'mine collapse or camouflet') return 'underground';
  if (c === 'escorting prisoners' || c === 'guiding the relief') return 'assign';
  if (DUTY_NAMES[c] || ROLE_WHERE[c] || c in DUTIES) return 'sortie';
  return 'other';
}

/** The ending in one sentence. */
export function endingLine(w: War): string {
  const why = w.endWhy;
  switch (w.ending) {
    case 'killed': return `Killed ${whereOf(why)}.`;
    case 'invalided': return `Wounded ${whereOf(why)}, badly enough that the army will not have you back.`;
    case 'broken': return why.includes(':') ? `Your nerve went ${whereOf(why)}.` : 'Your nerve went in the line.';
    case 'courtMartial': return `You froze ${whereOf(why)} and were charged with cowardice.`;
    case 'captured':
      if (why.endsWith('shot down')) return `Shot down ${whereOf(why)}, and taken prisoner where you came down.`;
      if (why.endsWith('ditched beyond the line')) return `Your tank ditched beyond their line ${whereOf(why)}, and the crew were taken.`;
      return `Overrun ${whereOf(why)} and taken prisoner.`;
    case 'posting': return why.startsWith('sent home by the medical officer') ? 'The medical officer sent you home, worn out: Home Establishment, teaching gunnery in England.' : `You took the posting: ${offerWords(w.posting ?? '')}.`;
    case 'armistice': return 'Monday, 11 November 1918. Eleven o\'clock in the morning.';
  }
  return '';
}

export function standingWord(n: number): string {
  if (n >= 75) return 'the officers know your name';
  if (n >= 55) return 'the sergeant trusts you';
  if (n >= 35) return 'one of the section';
  return 'marked as a shirker';
}

export function nerveWord(n: number): string {
  if (n >= 70) return 'steady';
  if (n >= 45) return 'worn';
  if (n >= 25) return 'frayed';
  if (n >= 12) return 'near breaking';
  return 'breaking';
}

const pend = (s: CoreState) => war(s).pending;

/** What the war's log says happened since the last tour: read by the tour opening. */
function recent(w: War): { backFromWound: boolean; lost: number[]; promoted: boolean; award: string | null; detailed: { key: string; ok: boolean } | null } {
  const out = { backFromWound: false, lost: [] as number[], promoted: false, award: null as string | null, detailed: null as { key: string; ok: boolean } | null };
  for (const l of w.log) {
    const m = /^S\d r(\d+) \| (.*)$/.exec(l);
    if (!m) continue;
    const c = Number(m[1]); const msg = m[2]!;
    const wm = /wound \(.*\): .*out (\d+) rotation/.exec(msg);
    if (wm && c + Number(wm[1]) + 1 === w.clock) out.backFromWound = true;
    if (c !== w.clock - 1) continue;
    const fm = /^friend (\d+) killed/.exec(msg);
    if (fm) out.lost.push(Number(fm[1]) - 1);
    if (/^promoted to/.test(msg)) out.promoted = true;
    const am = /^awarded (\w+)/.exec(msg);
    if (am) out.award = am[1]!;
    const dm = /^detailed: (\w+) (ok|failed)/.exec(msg);
    if (dm) out.detailed = { key: dm[1]!, ok: dm[2] === 'ok' };
  }
  return out;
}
/** The battle just over, for its overview: none once the war has ended (the ending tells it). */
const afterBattle = (w: War) => (w.cursor.at !== 'done' && w.news?.battle?.done ? w.news.battle : null);
/** The first of the written friends (the first three of the section) killed and not yet shown. */
const writtenFallen = (w: War) => newsOf(w).fallen.find((f) => f.i < 3);

/** A battle's name as a content id: "Somme, 1 July" -> somme_1_july. */
export const battleSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const BATTLE_SLUGS = ['none', ...ALL_BATTLES.map((b) => battleSlug(b.name))];

/** The section from home, by town. The first three are the written friends (their arcs are
 *  authored); the war layer's friends[i] is the i-th name. Surnames among the men. */
export const SECTION_NAMES: Record<string, string[]> = {
  mill: ['Albert Shaw', 'Harry Duckworth', 'Walter Pilling', 'Fred Haworth', 'Jack Ashworth', 'Sam Holden', 'Billy Entwistle', 'Joe Crossley', 'Ernest Greenhalgh'],
  pit: ['Tommy Robson', 'Jim Bell', 'George Charlton', 'Ned Armstrong', 'Bob Milburn', 'Alf Dodds', 'Wilf Hepple', 'Jack Ridley', 'Matty Gray'],
  city: ['Arthur Webb', 'Percy Fenton', 'Leonard Marsh', 'Cyril Hammond', 'Sidney Pratt', 'Frank Lowe', 'Edgar Pike', 'Ronald Cobb', 'Herbert Vine'],
  farm: ['Will Cottle', 'Dan Pearce', 'Bert Yeo', 'Charlie Gill', 'Tom Ridd', 'Fred Luxton', 'Walt Pengelly', 'Sid Moore', 'George Hext'],
};
const surname = (n: string) => n.split(' ').slice(-1)[0]!;
/** The nearest living written friend, by surname; the dead are never named alive (continuity). */
function mate(s: CoreState): string {
  const w = war(s); const names = SECTION_NAMES[w.town]!;
  for (let i = 0; i < 3; i++) if (w.friends[i]) return surname(names[i]!);
  return 'a man from the next section';
}

/** The scene's picture, if it has one (DESIGN §11): a key in src/art/. One function, so the UI computes nothing. */
export function artOf(s: CoreState, sceneId = ''): string | undefined {
  // by the scene shown, not only the question pending: a raid's result shown just before the leave
  // carried the leave's picture (playtest 2)
  const w = war(s); const p = w.pending;
  if (p?.kind === 'battle' && p.battle === 'Loos' && p.phase === 0 && /^b_loos/.test(sceneId)) return 'loos_advance';
  if (p?.kind === 'leave' && st(s).start === 'mill' && /^(l_mill|w_leave)/.test(sceneId)) return 'leave_mill';
  return undefined;
}

/** The status line under the date on every screen (DESIGN §10): the UI shows it, computes nothing. */
export function statusOf(s: CoreState): { rank: string; role: string; nerve: string; standing: string; section: string } {
  const w = war(s);
  return {
    rank: rankFull(w),
    role: roleName(w),
    nerve: `Nerve: ${nerveWord(w.nerve)}`,
    standing: standingWord(w.standing),
    section: `${aliveFriends(w)} of 9 from home`,
  };
}

// ---- paths -------------------------------------------------------------------------------------

const FIELDS = ['pending', 'ending', 'done', 'stalled', 'friend_at_risk', 'offers', 'commission', 'nerve', 'standing', 'rank', 'stage', 'section', 'path', 'transferred', 'battle', 'phase', 'tour', 'mate1', 'mate2', 'mate3', 'duty', 'call', 'wound', 'fallen', 'fallen_present', 'course', 'take', 'sortie', 'step', 'card', 'can_back', 'vol', 'result', 'result_key', 'month', 'home_tier', 'assign', 'stake', 'back_from_wound', 'lost_last', 'promoted_last', 'award_last', 'first_tour', 'back_from_leave', 'detailed_last', 'detailed_ok', 'corps', 'corps_offer', 'shot_down', 'after', 'after_fought', 'after_why', 'after_lost', 'after_hit', 'after_award', 'after_promoted', 'after_near', 'duty_nco', 'can_lead', 'sent', 'sent_friend', 'sent_killed', 'close_where', 'close_battle', 'close_phase', 'close_key', 'killed', 'prisoners', 'wound_cause', 'end_cause', 'commissioned', 'servant_offer', 'servant', 'officer_killed'] as const;
const PENDING = ['none', 'tunnel', 'corps', 'close', 'servant', 'duty', 'mission', 'sick', 'course', 'battle', 'leave', 'step', 'tour', 'assign'];
const ENDINGS = ['none', 'armistice', 'posting', 'captured', 'invalided', 'killed', 'broken', 'court_martial'];
/** content ids are lower_snake_case; the war layer's ending names are its own */
const endingId = (e: string) => (e === 'courtMartial' ? 'court_martial' : e);

function value(s: CoreState, field: string): number | string | boolean | undefined {
  const w = war(s); const p = w.pending;
  switch (field) {
    case 'pending': return p?.kind ?? 'none';
    case 'ending': return w.cursor.at === 'done' && w.ending ? endingId(w.ending) : 'none';
    case 'done': return w.cursor.at === 'done';
    case 'stalled': return p?.kind === 'battle' && p.stalled;
    case 'friend_at_risk': return p?.kind === 'duty' && p.friendAtRisk;
    case 'offers': return p?.kind === 'leave' ? p.offers.length : 0;
    case 'commission': return p?.kind === 'leave' && p.commission;
    case 'nerve': return Math.round(w.nerve);
    case 'standing': return Math.round(w.standing);
    case 'rank': return w.rank;
    case 'stage': return w.stage;
    case 'section': return aliveFriends(w);
    case 'path': return w.path;
    case 'transferred': return w.transferred;
    case 'corps': return corpsOf(w) ?? 'none';
    // rank that changes the question (FRAME-PLAYTEST2 B)
    case 'duty_nco': return p?.kind === 'duty' && !!p.nco;
    // a man in front of him (FRAME-PLAYTEST2 A)
    case 'close_where': return p?.kind === 'close' ? p.where : 'none';
    case 'close_battle': return p?.kind === 'close' && p.battle ? battleSlug(p.battle) : 'none';
    case 'close_phase': return p?.kind === 'close' && p.phase !== undefined ? p.phase + 1 : 0;
    case 'close_key': return p?.kind === 'close' && p.key ? p.key : 'none';
    // what kind of thing it was, for the wound and death scenes (FRAME-PLAYTEST2 E)
    case 'wound_cause': return w.cursor.at === 'done' || !w.news?.wound ? 'none' : causeKind(w.news.wound.cause);
    case 'end_cause': return w.cursor.at === 'done' && w.ending ? causeKind(w.endWhy) : 'none';
    case 'commissioned': return w.commissioned;
    // the officer's servant (docs/FRAME-SERVANT.md)
    case 'servant_offer': return p?.kind === 'servant' ? p.officer : 0;
    case 'servant': return w.servant ?? 0;
    case 'officer_killed': return w.cursor.at === 'done' ? 0 : w.news?.officer ?? 0;
    case 'killed': return w.stats.killed ?? 0;
    case 'prisoners': return w.stats.prisoners ?? 0;
    case 'can_lead': return p?.kind === 'battle' && canLead(w);
    case 'sent': return w.cursor.at !== 'done' && w.news?.sent ? w.news.sent.key : 'none';
    case 'sent_friend': return (w.news?.sent?.who ?? -1) >= 0;
    case 'sent_killed': return !!w.news?.sent?.killed;
    // the overview after a battle, fought or missed (playtest 2)
    case 'after': { const b = afterBattle(w); return b ? battleSlug(b.name) : 'none'; }
    case 'after_fought': return !!afterBattle(w)?.fought;
    case 'after_why': return afterBattle(w)?.why ?? 'none';
    case 'after_lost': return afterBattle(w)?.lost.length ?? 0;
    case 'after_hit': return afterBattle(w)?.hit ?? 'none';
    case 'after_award': return !!afterBattle(w)?.award;
    case 'after_promoted': return !!afterBattle(w)?.promoted;
    case 'after_near': return !!afterBattle(w)?.near;
    case 'corps_offer': return p?.kind === 'corps' ? p.corps : 'none';
    case 'shot_down': return w.cursor.at === 'done' && w.ending === 'captured' && w.endWhy.endsWith('shot down');
    case 'assign': return p?.kind === 'assign' ? p.key : 'none';
    case 'home_tier': return homeTier(w);
    case 'battle': return p?.kind === 'battle' ? battleSlug(p.battle) : 'none';
    case 'phase': return p?.kind === 'battle' ? p.phase + 1 : 0;
    case 'tour': return w.clock;
    case 'duty': return p?.kind === 'duty' ? p.duty : 'none';
    case 'wound': return w.cursor.at === 'done' ? 'none' : w.news?.wound?.kind ?? 'none';
    case 'fallen': { const f = writtenFallen(w); return w.cursor.at === 'done' || !f ? 0 : f.i + 1; }
    case 'fallen_present': return !!writtenFallen(w)?.present;
    case 'course': return p?.kind === 'course' ? p.skill : 'none';
    case 'sortie': return p?.kind === 'step' ? p.key : 'none';
    case 'step': return p?.kind === 'step' ? p.step + 1 : 0;
    // which written situation of the step's deck is shown (docs/FRAME-DECKS.md)
    case 'card': return p?.kind === 'step' ? p.card ?? 'a' : 'none';
    case 'can_back': return p?.kind === 'step' && p.canBack;
    case 'vol': return p?.kind === 'step' && p.vol;
    // a finished sortie not yet told: ok, failed, turned (back), or none
    case 'result': { const r = w.cursor.at === 'done' ? null : w.news?.sortie; return r ? (r.turned ? 'turned' : r.ok ? 'ok' : 'failed') : 'none'; }
    case 'result_key': return w.news?.sortie?.key ?? 'none';
    case 'month': return warMonth(w)[1];
    // what happened since the last time he was asked anything: the tour opening carries it (playtest 1)
    case 'back_from_wound': return recent(w).backFromWound;
    case 'lost_last': return recent(w).lost.length;
    case 'promoted_last': return recent(w).promoted;
    case 'award_last': return recent(w).award !== null;
    case 'first_tour': return w.clockInStage === 1;
    case 'back_from_leave': return w.clockInStage === 1 && w.stage > 1;
    case 'detailed_last': return recent(w).detailed?.key ?? 'none';
    case 'detailed_ok': return !!recent(w).detailed?.ok;
    // which written take a sortie shows: alternates with every sortie played, so two in a row differ
    // the sortie count rises when a sortie ends, so its result screen reads the take just played
    case 'stake': return ((w.stats.sorties ?? 0) - (w.news?.sortie && w.cursor.at !== 'done' ? 1 : 0) + 2) % 2;
    // which of two written takes a recurring scene shows (alternates by tour), so a mission is not word for word the last one
    case 'take': return (w.clock + w.stage) % 2; // + stage: the same month reads differently in the next year
    case 'call': return p?.kind === 'duty' && w.cursor.at === 'duty' ? (w.cursor as { i: number }).i + 1 : 0;
    case 'mate1': case 'mate2': case 'mate3': return w.friends[Number(field.slice(4)) - 1]!;
  }
  return undefined;
}

// ---- the clock -----------------------------------------------------------------------------------

/** Move the engine's season count on to the war's month (ages and cooldowns follow it). */
function syncClock(s: CoreState, c: CoreContent, changes: string[]): void {
  const target = seasonOf(warMonth(war(s)));
  if (target > s.time) advanceSeasons(s, c, target - s.time, changes);
}

// ---- the module ------------------------------------------------------------------------------------

export const module: GameModule = {
  id: GAME_ID,
  namespaces: ['war', 'start'],
  getValue(s, _c, path) {
    const [ns, field] = path.split('.');
    if (ns === 'start') return st(s).start;
    return value(s, field ?? '');
  },
  checkPath(_c, path) {
    const [ns, field] = path.split('.');
    if (ns === 'start') return field === undefined ? null : `"start" has no fields (start == <id>)`;
    return (FIELDS as readonly string[]).includes(field ?? '') ? null : `unknown war field in "${path}" (${FIELDS.join(', ')})`;
  },
  labelFor: (_c, path) => ({ 'war.nerve': 'Nerve', 'war.standing': 'Standing', 'war.section': 'The section', 'war.rank': 'Rank' })[path],
  namedValues: (c, path) => (path === 'start' ? Object.keys(ct(c).starts) : path === 'war.battle' ? BATTLE_SLUGS : path === 'war.duty' ? ['none', ...Object.keys(DUTIES)] : path === 'war.wound' ? ['none', 'light', 'severe'] : path === 'war.sortie' || path === 'war.result_key' || path === 'war.detailed_last' ? ['none', ...Object.keys(SORTIES)] : path === 'war.result' ? ['none', 'ok', 'failed', 'turned'] : path === 'war.course' ? ['none', 'bomb', 'lewis', 'snipe', 'signals', 'bearer', 'lead'] : path === 'war.assign' ? ['none', ...Object.keys(ASSIGNMENTS)] : path === 'war.pending' ? PENDING : path === 'war.ending' ? ENDINGS : path === 'war.corps' ? ['none', 'tunnel', 'tank', 'air'] : path === 'war.corps_offer' ? ['none', 'tank', 'air'] : path === 'war.after' ? BATTLE_SLUGS : path === 'war.sent' ? ['none', ...Object.keys(DUTIES)] : path === 'war.wound_cause' || path === 'war.end_cause' ? ['none', 'battle', 'shell', 'sortie', 'assign', 'underground', 'other'] : path === 'war.close_where' ? ['none', 'battle', 'sortie'] : path === 'war.close_battle' ? BATTLE_SLUGS : path === 'war.close_key' ? ['none', 'raid', 'bomb'] : path === 'war.after_why' ? ['none', 'course', 'wound'] : path === 'war.after_hit' ? ['none', 'light', 'severe'] : path === 'war.path' ? Object.keys(PATH_NAMES) : path === 'war.card' ? ['none', ...'abcdefghij'] : undefined),
  effects: {
    /** character creation: the two hometown skills from the town's list */
    war_home(s, _c, e) {
      const g = st(s);
      g.home.picks = (e as { war_home: string[] }).war_home;
      setHome(g.war, g.home.picks, g.home.general);
    },
    /** character creation: the general skill */
    war_general(s, _c, e) {
      const g = st(s);
      g.home.general = (e as { war_general: string }).war_general;
      setHome(g.war, g.home.picks, g.home.general);
    },
    /** the war begins (or resumes): run to the first question */
    war_run(s, c, _e, ctx) {
      run(war(s));
      syncClock(s, c, ctx.changes);
    },
    /** a wound or a friend's death has been shown: clear it so the route moves on */
    war_ack(s, _c, e) {
      const w = war(s);
      const what = (e as { war_ack: 'wound' | 'fallen' | 'sortie' | 'battle' | 'sent' | 'officer' }).war_ack;
      if (what === 'battle') newsOf(w).battle = null;
      else if (what === 'officer') newsOf(w).officer = null;
      else if (what === 'sent') newsOf(w).sent = null;
      else if (what === 'sortie') newsOf(w).sortie = null;
      else if (what === 'wound') newsOf(w).wound = null;
      else { const f = writtenFallen(w); if (f) newsOf(w).fallen.splice(newsOf(w).fallen.indexOf(f), 1); }
    },
    /** Option B: an event's choice moves nerve or standing a little (docs/FRAME-OPTION-B.md) */
    war_mood(s, _c, e, ctx) {
      const w = war(s);
      const m = (e as { war_mood: { nerve?: number; standing?: number } }).war_mood;
      const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
      if (m.nerve) {
        const before = w.nerve; w.nerve = clampN(w.nerve + m.nerve, -10, 100);
        const dn = Math.round(w.nerve - before); if (dn) ctx.changes.push(`Nerve ${dn > 0 ? '+' : '−'}${Math.abs(dn)}`); // rounded: "Nerve +1.0000000000000018" was possible
      }
      if (m.standing) {
        const before = w.standing; w.standing = clampN(w.standing + m.standing, 0, 100);
        const ds = Math.round(w.standing - before); if (ds) ctx.changes.push(`Standing ${ds > 0 ? '+' : '−'}${Math.abs(ds)}`);
      }
    },
    /** the player's answer to the war's question */
    war(s, c, e, ctx) {
      const d = (e as { war: string }).war;
      const w = war(s);
      if (!w.pending) throw new Error(`war: "${d}" with no question pending`);
      newsOf(w).fallen = newsOf(w).fallen.filter((f) => f.i < 3); // the six unwritten men are a line in the changes
      newsOf(w).wound = null;
      newsOf(w).sortie = null; // shown already, or happened in a war that has moved on
      newsOf(w).restored = { rest: 0, leave: 0 };
      newsOf(w).close = null;
      newsOf(w).named = false;
      const before = { nerve: w.nerve, standing: w.standing, rank: w.rank, section: aliveFriends(w), awards: w.awards.length };
      // the tour moves on after its story event (w_tour_on), so its cost lands on the event's result:
      // labelled apart, or "Nerve +1" from an evening with Marthe and the tour's −8 read as "Nerve −7"
      // (the author, playtest 3: "a scene you would think would calm you down ... actually cost you nerve")
      const inLine = w.pending.kind === 'tour';
      decide(w, d as Decision);
      // what the choice cost, then what rest and leave gave back, apart (playtest 2)
      const back = newsOf(w).restored ?? { rest: 0, leave: 0 };
      const dn = Math.round(w.nerve - before.nerve - back.rest - back.leave);
      if (dn) ctx.changes.push(`${inLine ? 'In the line: nerve' : 'Nerve'} ${dn > 0 ? '+' : '−'}${Math.abs(dn)}`);
      if (Math.round(back.rest) > 0) ctx.changes.push(`Out at rest: nerve +${Math.round(back.rest)}`);
      if (Math.round(back.leave) > 0) ctx.changes.push(`Home on leave: nerve +${Math.round(back.leave)}`);
      const ds = Math.round(w.standing - before.standing);
      if (ds) ctx.changes.push(`${inLine ? 'In the line: standing' : 'Standing'} ${ds > 0 ? '+' : '−'}${Math.abs(ds)}`);
      if (w.rank > before.rank) ctx.changes.push(`Promoted: ${rankName(w)}`);
      if (w.awards.length > before.awards) ctx.changes.push(`Awarded: ${w.awards.slice(before.awards).join(', ')}`);
      const lost = before.section - aliveFriends(w);
      // not when his war has just ended: the section's fate to 1918 is then played out in one go, and
      // "6 men of the section killed" read as if it happened that moment (playtest 3)
      if (lost > 0 && w.cursor.at !== 'done') ctx.changes.push(lost === 1 ? 'A man of the section killed' : `${lost} men of the section killed`);
      syncClock(s, c, ctx.changes);
    },
  },
  stakesOf(_c, s, e, put) {
    if (!('war' in e)) return;
    const d = (e as { war: string }).war;
    const p = pend(s);
    if (!p) return;
    // every battle choice risks his life, so saying so under each one tells the player nothing
    if ((p.kind === 'duty' && d === 'volunteer') || (p.kind === 'mission' && d === 'go')) put('life', 'Your life', STAKES_RANK.life, -1);
    if (p.kind === 'duty' && d === 'volunteer' && p.friendAtRisk && !p.nco) put('friend', 'Covers a friend', STAKES_RANK.rel, 0);
    if (p.kind === 'duty' && d === 'send_friend') put('friend', 'A man from home goes', STAKES_RANK.rel, -1);
    if (p.kind === 'leave') put('war', d === 'back' || d === 'commission' ? 'Back to the front' : 'Your war ends', STAKES_RANK.life, 0);
  },
  /** the close call the last roll came to, under the choice's outcome (FRAME-PLAYTEST2 D) */
  outcomeNote(s) {
    const c = war(s).news?.close;
    if (!c) return undefined;
    const w = war(s);
    // inside a tank or in the air a near miss is not the infantry's: their own tables
    const bkey = w.path === 'tank' || w.path === 'air' ? `battle_${w.path}` : `battle_${c.key}`;
    const lines = CLOSE_CALLS[c.kind === 'battle' ? bkey : c.key] ?? CLOSE_CALLS[c.kind === 'battle' ? 'battle' : 'step'] ?? [];
    return lines.length ? lines[(c.n + war(s).clock) % lines.length] : undefined;
  },
  textVar(name, s) {
    const w = war(s); const p = w.pending;
    switch (name) {
      case 'nerve_word': return nerveWord(w.nerve);
      case 'standing_word': return standingWord(w.standing);
      case 'rank_name': return rankName(w);
      // the rank in running prose: 'You're a corporal now'
      case 'rank_a': { const r = rankName(w).toLowerCase(); return w.rank === 4 && rankName(w) === RANKS[4] ? `company sergeant major` : `${/^[aeiou]/.test(r) ? 'an' : 'a'} ${r}`; }
      case 'path_name': return roleName(w);
      case 'section_line': {
        const n = aliveFriends(w);
        return n === 9 ? 'All nine of the section from home are alive.' : n === 0 ? 'None of the section from home is left.' : `${n} of the nine from home are alive.`;
      }
      case 'mate': return mate(s);
      case 'mate1': case 'mate2': case 'mate3': { const n = SECTION_NAMES[w.town]![Number(name.slice(4)) - 1]!; return w.friends[Number(name.slice(4)) - 1] ? surname(n) : n; }
      case 'mate1_first': case 'mate2_first': case 'mate3_first': return SECTION_NAMES[w.town]![Number(name[4]) - 1]!.split(' ')[0]!;
      case 'risk_bold': case 'risk_steady': case 'risk_careful': case 'risk_back': {
        if (p?.kind !== 'step') return '';
        return stepRiskWord(sortieHit(w, p.key, p.role, p.step, name.slice(5) as SortieChoice));
      }
      case 'wound_where': return w.news?.wound ? whereOf(w.news.wound.cause) : '';
      case 'fallen_name': { const f = writtenFallen(w); return f ? SECTION_NAMES[w.town]![f.i]! : ''; }
      case 'fallen_first': { const f = writtenFallen(w); return f ? SECTION_NAMES[w.town]![f.i]!.split(' ')[0]! : ''; }
      case 'fallen_surname': { const f = writtenFallen(w); return f ? surname(SECTION_NAMES[w.town]![f.i]!) : ''; }
      case 'fallen_where': { const f = writtenFallen(w); return f ? whereOf(f.why) : ''; }
      case 'lost_last_name': {
        const r = recent(w);
        const named = r.lost.find((i) => i < 3);
        return named !== undefined ? SECTION_NAMES[w.town]![named]!.split(' ')[0]! : r.lost.length > 1 ? `${r.lost.length} of the section` : SECTION_NAMES[w.town]![r.lost[0] ?? 3]!.split(' ')[0]!;
      }
      case 'award_last_name': { const a = recent(w).award; return a === 'MM' ? 'Military Medal' : a === 'DCM' ? 'Distinguished Conduct Medal' : a === 'MC' ? 'Military Cross' : a === 'VC' ? 'Victoria Cross' : a === 'DFM' ? 'Distinguished Flying Medal' : 'mention in despatches'; }
      case 'tour_line': {
        const i = w.cursor.at === 'duty' ? (w.cursor as { i: number }).i : 0;
        return `Tour ${w.clock} in the line. ${i === 0 ? 'The first' : 'A second'} call for men this tour.`;
      }
      case 'duty_name': return p?.kind === 'duty' ? DUTY_NAMES[p.duty] ?? p.duty : '';
      case 'duty_risk': return p?.kind === 'duty' ? riskWord(dutyHit(w, p.duty)) : '';
      case 'duty_cost': return p?.kind === 'duty' ? `${DUTIES[p.duty]!.nerve} nerve` : '';
      case 'risk_close_shoot': case 'risk_close_bayonet': case 'risk_close_prisoner': case 'risk_close_spare':
        return p?.kind === 'close' ? stepRiskWord(CLOSE.choices[name.slice(11) as CloseChoice].hit) : '';
      case 'duty_risk_draft': return p?.kind === 'duty' ? riskWord(dutyHit(w, p.duty) * 1.4) : '';
      case 'sent_name': { const i = w.news?.sent?.who ?? -1; return i >= 0 ? SECTION_NAMES[w.town]![i]! : ''; }
      case 'sent_first': { const i = w.news?.sent?.who ?? -1; return i >= 0 ? SECTION_NAMES[w.town]![i]!.split(' ')[0]! : ''; }
      case 'sent_duty': return w.news?.sent ? DUTY_NAMES[w.news.sent.key] ?? w.news.sent.key : '';
      case 'friend_line': return p?.kind === 'duty' && p.friendAtRisk ? 'One of the section from home has been detailed for it.' : 'Nobody from home is going.';
      case 'mission_name': return p?.kind === 'mission' ? ROLES[p.role]!.mission : '';
      case 'mission_risk': return p?.kind === 'mission' ? riskWord(missionHit(w, p.role)) : '';
      case 'course_name': return p?.kind === 'course' ? SKILL_NAMES[p.skill] ?? p.skill : '';
      case 'battle_name': return p?.kind === 'battle' ? p.battle : '';
      case 'phase_line': return p?.kind === 'battle' ? PHASE_LINES[p.type] ?? '' : '';
      case 'phase_count': return p?.kind === 'battle' ? `Phase ${p.phase + 1} of ${battleOf(w).phases.length}.` : '';
      case 'risk_push': case 'risk_help': case 'risk_ground': case 'risk_lead': {
        if (p?.kind !== 'battle') return '';
        const b = battleOf(w);
        const choice = name.slice(5) as 'push' | 'help' | 'ground' | 'lead';
        // the nerve the order costs, from the same function that charges it, and a plain warning when it
        // is more than he has left: the breakdown is then shown before it happens, not after
        const cost = Math.round(phaseNerve(w, b, p.phase, choice));
        return `${riskWord(phaseHit(w, b, b.phases[p.phase]![0], p.type, choice))}, ${cost} nerve${w.nerve - cost <= 0 ? ': more than you have left' : ''}`;
      }
      case 'offer0': case 'offer1': case 'offer2': return p?.kind === 'leave' ? offerWords(p.offers[Number(name.slice(5))] ?? '') : '';
      case 'money_line': return MONEY_LINES[w.town]![homeTier(w)]!;
      case 'sent_home': return lsd(sentHomeOf(w));
      case 'offers_line': {
        if (p?.kind !== 'leave') return '';
        if (!p.offers.length) return 'Nothing is on offer that would keep you at home.';
        return `On offer: ${p.offers.map(offerWords).join('; ')}.`;
      }
      case 'grade': return grade(w).toFixed(0);
      case 'friends_home': return `${aliveFriends(w)} of the nine`;
      case 'awards_line': return w.awards.length ? w.awards.join(', ') : 'none';
      case 'ending_line': return endingLine(w);
      // how the medical officer is likely to take it, from the chance the resolver uses (war.ts sickChance)
      case 'sick_odds': { const c = sickChance(w); return c >= 0.6 ? 'he knows your name: he will likely listen' : c >= 0.45 ? 'he may listen' : 'he has you down as a man who hangs back: he likely won\'t'; }
      // the sweetheart at home, by town (content/scenes/war/romance.yaml)
      case 'sweetheart': return ({ mill: 'Nellie', pit: 'Lizzie', farm: 'Rose', city: 'Ivy' } as Record<string, string>)[w.town] ?? '';
      // how near the sortie just ended came, and his name in orders: at the end of its result, after the
      // result is told (playtest 3: "read out in battalion orders" came before the screen said it went well)
      case 'result_note': {
        const so = w.news?.sortie; if (!so || w.cursor.at === 'done') return '';
        const m = so.turned || so.margin === undefined ? '' : so.ok ? (so.margin < 0.3 ? 'It held, just.' : so.margin > 2.5 ? 'It went as well as these things ever go.' : '') : (so.margin > -0.3 ? 'It so nearly came off.' : so.margin < -2.5 ? 'It was never going to work.' : '');
        return [m, w.news?.named ? 'Your name is read out in battalion orders.' : ''].filter(Boolean).join(' ');
      }
      case 'after_name': return afterBattle(w)?.name ?? '';
      case 'after_lost_names': {
        const b = afterBattle(w); if (!b?.lost.length) return '';
        const names = b.lost.map((i) => SECTION_NAMES[w.town]![i]!);
        return names.length === 1 ? names[0]! : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
      }
      case 'after_award_name': { const a = afterBattle(w)?.award; return a === 'MM' ? 'the Military Medal' : a === 'DCM' ? 'the Distinguished Conduct Medal' : a === 'MC' ? 'the Military Cross' : a === 'VC' ? 'the Victoria Cross' : a === 'DFM' ? 'the Distinguished Flying Medal' : 'a mention in despatches'; }
    }
    return undefined;
  },
  checkTextVar: (name) => (['rank_a', 'lost_last_name', 'award_last_name', 'risk_bold', 'risk_steady', 'risk_careful', 'risk_back', 'wound_where', 'fallen_name', 'fallen_first', 'fallen_surname', 'fallen_where', 'mate', 'mate1', 'mate2', 'mate3', 'mate1_first', 'mate2_first', 'mate3_first', 'phase_count', 'tour_line', 'nerve_word', 'standing_word', 'rank_name', 'path_name', 'section_line', 'duty_name', 'duty_risk', 'duty_cost', 'friend_line', 'mission_name', 'mission_risk', 'course_name', 'battle_name', 'phase_line', 'risk_push', 'risk_help', 'risk_ground', 'offer0', 'offer1', 'offer2', 'offers_line', 'grade', 'friends_home', 'awards_line', 'ending_line', 'money_line', 'sent_home', 'after_name', 'after_lost_names', 'after_award_name', 'duty_risk_draft', 'sent_name', 'sent_first', 'sent_duty', 'risk_lead', 'risk_close_shoot', 'risk_close_bayonet', 'risk_close_prisoner', 'risk_close_spare', 'result_note', 'sweetheart', 'sick_odds'].includes(name) ? [] : undefined),
  // the year's title page: where he stands, and who of the nine has died since the last page
  cardRows: (_c, s) => {
    const w = war(s);
    return [['Rank', `${rankFull(w)}, ${roleName(w)}`], ['The section from home', `${aliveFriends(w)} of 9`], ['Battles', String(w.stats.battles)]];
  },
  cardDead: (_c, s, from) => {
    const w = war(s); const names = SECTION_NAMES[w.town]!;
    const out: string[] = [];
    for (const l of w.log) {
      const m = /^S(\d) r(\d+) \| friend (\d+) killed/.exec(l);
      if (m && seasonOf(monthOfClock(Number(m[1]), Number(m[2]))) >= from) out.push(names[Number(m[3]) - 1]!);
    }
    return out;
  },
  variantKey: (s) => st(s).start,
  startScene: (s, c) => ct(c).starts[st(s).start]?.start_scene,
  date: (s) => monthName(warMonth(war(s))),
};

export { STAGES };

registerGame(module);
