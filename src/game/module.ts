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
} from './war/index';
import { warMonth, seasonOf, monthName } from './war/calendar';

const st = (s: CoreState) => s as GameState;
const ct = (c: CoreContent) => c as ContentBundle;
const war = (s: CoreState) => st(s).war;

// ---- words -----------------------------------------------------------------------------------

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
  trench: 'trench sense', bomb: 'bombing', lewis: 'the Lewis gun', snipe: 'sniping', signals: 'signals', lead: 'leadership', tunnel: 'tunnelling',
};
export const PATH_NAMES: Record<string, string> = {
  rifleman: 'rifleman', bomb: 'bomber', lewis: 'Lewis gunner', snipe: 'sniper', signals: 'signaller', tunnel: 'tunneller', nco: 'section leader', subaltern: 'platoon officer',
};
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
};
const BATTLES = new Set(STAGES.flatMap((st) => Object.values(st.battles).map((b) => b.name)));

/** A home posting in words. The war layer's names stay as they are (they are in its saves). */
export function offerWords(o: string): string {
  const words: Record<string, string> = {
    'home service (wounded)': 'home service, while the wound mends',
    'war work (mill)': 'a release to munitions work in an engineering shop',
    'war work (pit)': 'a release back to the pit: coal is war work too',
    'war work (city)': 'a clerk\'s post at the depot',
    'war work (farm)': 'a release to the land, for the harvest',
    instructor: 'instructor at the training depot',
  };
  return words[o] ?? o;
}

/** Where a wound or a death happened, in words, from the cause the resolver recorded. */
export function whereOf(cause: string): string {
  // the resolver appends what happened (", severe wound, downgraded", ": shell shock"); battle names keep their commas
  const c = cause.replace(/(, severe wound, downgraded|: [^:]*)$/, '').trim();
  if (c === 'shellfire') return 'by a shell in the front line';
  if (c === 'in the line') return 'in the line';
  if (c === 'shelled in support') return 'by a shell in the support trenches';
  if (c === 'mine collapse or camouflet') return 'underground, when a gallery came in';
  if (DUTY_NAMES[c]) return `on ${DUTY_NAMES[c]}`;
  if (ROLE_WHERE[c]) return ROLE_WHERE[c]!;
  if (BATTLES.has(c)) return `at ${c}`;
  return 'in France';
}

/** The ending in one sentence. */
export function endingLine(w: War): string {
  const why = w.endWhy;
  switch (w.ending) {
    case 'killed': return `Killed ${whereOf(why)}.`;
    case 'invalided': return `Wounded ${whereOf(why)}, badly enough that the army will not have you back.`;
    case 'broken': return why.includes(':') ? `Your nerve went ${whereOf(why)}.` : 'Your nerve went in the line.';
    case 'courtMartial': return `You froze ${whereOf(why)} and were charged with cowardice.`;
    case 'captured': return `Overrun ${whereOf(why)} and taken prisoner.`;
    case 'posting': return `You took the posting: ${offerWords(w.posting ?? '')}.`;
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
/** The first of the written friends (the first three of the section) killed and not yet shown. */
const writtenFallen = (w: War) => newsOf(w).fallen.find((f) => f.i < 3);

/** A battle's name as a content id: "Somme, 1 July" -> somme_1_july. */
export const battleSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const BATTLE_SLUGS = ['none', ...STAGES.flatMap((st) => Object.values(st.battles).map((b) => battleSlug(b.name)))];

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
export function artOf(s: CoreState): string | undefined {
  const w = war(s); const p = w.pending;
  if (p?.kind === 'battle' && p.battle === 'Loos' && p.phase === 0) return 'loos_advance';
  if (p?.kind === 'leave' && st(s).start === 'mill') return 'leave_mill';
  return undefined;
}

/** The status line under the date on every screen (DESIGN §10): the UI shows it, computes nothing. */
export function statusOf(s: CoreState): { rank: string; role: string; nerve: string; standing: string; section: string } {
  const w = war(s);
  return {
    rank: RANKS[w.rank]!,
    role: PATH_NAMES[w.path] ?? w.path,
    nerve: `Nerve: ${nerveWord(w.nerve)}`,
    standing: standingWord(w.standing),
    section: `${aliveFriends(w)} of 9 from home`,
  };
}

// ---- paths -------------------------------------------------------------------------------------

const FIELDS = ['pending', 'ending', 'done', 'stalled', 'friend_at_risk', 'offers', 'commission', 'nerve', 'standing', 'rank', 'stage', 'section', 'path', 'transferred', 'battle', 'phase', 'tour', 'mate1', 'mate2', 'mate3', 'duty', 'call', 'wound', 'fallen', 'fallen_present', 'course', 'take', 'sortie', 'step', 'can_back', 'vol', 'result', 'result_key'] as const;
const PENDING = ['none', 'tunnel', 'duty', 'mission', 'sick', 'course', 'battle', 'leave', 'step'];
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
    case 'can_back': return p?.kind === 'step' && p.canBack;
    case 'vol': return p?.kind === 'step' && p.vol;
    // a finished sortie not yet told: ok, failed, turned (back), or none
    case 'result': { const r = w.cursor.at === 'done' ? null : w.news?.sortie; return r ? (r.turned ? 'turned' : r.ok ? 'ok' : 'failed') : 'none'; }
    case 'result_key': return w.news?.sortie?.key ?? 'none';
    // which of two written takes a recurring scene shows (alternates by tour), so a mission is not word for word the last one
    case 'take': return w.clock % 2;
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
  namedValues: (c, path) => (path === 'start' ? Object.keys(ct(c).starts) : path === 'war.battle' ? BATTLE_SLUGS : path === 'war.duty' ? ['none', ...Object.keys(DUTIES)] : path === 'war.wound' ? ['none', 'light', 'severe'] : path === 'war.sortie' || path === 'war.result_key' ? ['none', ...Object.keys(SORTIES)] : path === 'war.result' ? ['none', 'ok', 'failed', 'turned'] : path === 'war.course' ? ['none', 'bomb', 'lewis', 'snipe', 'signals', 'lead'] : path === 'war.pending' ? PENDING : path === 'war.ending' ? ENDINGS : path === 'war.path' ? Object.keys(PATH_NAMES) : undefined),
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
      const what = (e as { war_ack: 'wound' | 'fallen' | 'sortie' }).war_ack;
      if (what === 'sortie') newsOf(w).sortie = null;
      else if (what === 'wound') newsOf(w).wound = null;
      else { const f = writtenFallen(w); if (f) newsOf(w).fallen.splice(newsOf(w).fallen.indexOf(f), 1); }
    },
    /** the player's answer to the war's question */
    war(s, c, e, ctx) {
      const d = (e as { war: string }).war;
      const w = war(s);
      if (!w.pending) throw new Error(`war: "${d}" with no question pending`);
      newsOf(w).fallen = newsOf(w).fallen.filter((f) => f.i < 3); // the six unwritten men are a line in the changes
      newsOf(w).wound = null;
      newsOf(w).sortie = null; // shown already, or happened in a war that has moved on
      const before = { nerve: w.nerve, standing: w.standing, rank: w.rank, section: aliveFriends(w), awards: w.awards.length };
      decide(w, d as Decision);
      const dn = Math.round(w.nerve - before.nerve);
      if (dn) ctx.changes.push(`Nerve ${dn > 0 ? '+' : '−'}${Math.abs(dn)}`);
      const ds = Math.round(w.standing - before.standing);
      if (ds) ctx.changes.push(`Standing ${ds > 0 ? '+' : '−'}${Math.abs(ds)}`);
      if (w.rank > before.rank) ctx.changes.push(`Promoted: ${RANKS[w.rank]}`);
      if (w.awards.length > before.awards) ctx.changes.push(`Awarded: ${w.awards.slice(before.awards).join(', ')}`);
      const lost = before.section - aliveFriends(w);
      if (lost > 0) ctx.changes.push(lost === 1 ? 'A man of the section killed' : `${lost} men of the section killed`);
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
    if (p.kind === 'duty' && d === 'volunteer' && p.friendAtRisk) put('friend', 'Covers a friend', STAKES_RANK.rel, 0);
    if (p.kind === 'leave') put('war', d === 'back' || d === 'commission' ? 'Back to the front' : 'Your war ends', STAKES_RANK.life, 0);
  },
  textVar(name, s) {
    const w = war(s); const p = w.pending;
    switch (name) {
      case 'nerve_word': return nerveWord(w.nerve);
      case 'standing_word': return standingWord(w.standing);
      case 'rank_name': return RANKS[w.rank]!;
      case 'path_name': return PATH_NAMES[w.path] ?? w.path;
      case 'section_line': {
        const n = aliveFriends(w);
        return n === 9 ? 'All nine of the section from home are alive.' : n === 0 ? 'None of the section from home is left.' : `${n} of the nine from home are alive.`;
      }
      case 'mate': return mate(s);
      case 'mate1': case 'mate2': case 'mate3': { const n = SECTION_NAMES[w.town]![Number(name.slice(4)) - 1]!; return w.friends[Number(name.slice(4)) - 1] ? surname(n) : n; }
      case 'mate1_first': case 'mate2_first': case 'mate3_first': return SECTION_NAMES[w.town]![Number(name[4]) - 1]!.split(' ')[0]!;
      case 'risk_bold': case 'risk_steady': case 'risk_careful': case 'risk_back': {
        if (p?.kind !== 'step') return '';
        return riskWord(sortieHit(w, p.key, p.role, p.step, name.slice(5) as SortieChoice));
      }
      case 'wound_where': return w.news?.wound ? whereOf(w.news.wound.cause) : '';
      case 'fallen_name': { const f = writtenFallen(w); return f ? SECTION_NAMES[w.town]![f.i]! : ''; }
      case 'fallen_first': { const f = writtenFallen(w); return f ? SECTION_NAMES[w.town]![f.i]!.split(' ')[0]! : ''; }
      case 'fallen_surname': { const f = writtenFallen(w); return f ? surname(SECTION_NAMES[w.town]![f.i]!) : ''; }
      case 'fallen_where': { const f = writtenFallen(w); return f ? whereOf(f.why) : ''; }
      case 'tour_line': {
        const i = w.cursor.at === 'duty' ? (w.cursor as { i: number }).i : 0;
        return `Tour ${w.clock} in the line. ${i === 0 ? 'The first' : 'A second'} call for men this tour.`;
      }
      case 'duty_name': return p?.kind === 'duty' ? DUTY_NAMES[p.duty] ?? p.duty : '';
      case 'duty_risk': return p?.kind === 'duty' ? riskWord(dutyHit(w, p.duty)) : '';
      case 'duty_cost': return p?.kind === 'duty' ? `${DUTIES[p.duty]!.nerve} nerve` : '';
      case 'friend_line': return p?.kind === 'duty' && p.friendAtRisk ? 'One of the section from home has been detailed for it.' : 'Nobody from home is going.';
      case 'mission_name': return p?.kind === 'mission' ? ROLES[p.role]!.mission : '';
      case 'mission_risk': return p?.kind === 'mission' ? riskWord(missionHit(w, p.role)) : '';
      case 'course_name': return p?.kind === 'course' ? SKILL_NAMES[p.skill] ?? p.skill : '';
      case 'battle_name': return p?.kind === 'battle' ? p.battle : '';
      case 'phase_line': return p?.kind === 'battle' ? PHASE_LINES[p.type] ?? '' : '';
      case 'phase_count': return p?.kind === 'battle' ? `Phase ${p.phase + 1} of ${battleOf(w).phases.length}.` : '';
      case 'risk_push': case 'risk_help': case 'risk_ground': {
        if (p?.kind !== 'battle') return '';
        const b = battleOf(w);
        const choice = name.slice(5) as 'push' | 'help' | 'ground';
        return riskWord(phaseHit(w, b, b.phases[p.phase]![0], p.type, choice));
      }
      case 'offer0': case 'offer1': case 'offer2': return p?.kind === 'leave' ? offerWords(p.offers[Number(name.slice(5))] ?? '') : '';
      case 'offers_line': {
        if (p?.kind !== 'leave') return '';
        if (!p.offers.length) return 'Nothing is on offer that would keep you at home.';
        return `On offer: ${p.offers.map(offerWords).join('; ')}.`;
      }
      case 'grade': return grade(w).toFixed(0);
      case 'friends_home': return `${aliveFriends(w)} of the nine`;
      case 'awards_line': return w.awards.length ? w.awards.join(', ') : 'none';
      case 'ending_line': return endingLine(w);
    }
    return undefined;
  },
  checkTextVar: (name) => (['risk_bold', 'risk_steady', 'risk_careful', 'risk_back', 'wound_where', 'fallen_name', 'fallen_first', 'fallen_surname', 'fallen_where', 'mate', 'mate1', 'mate2', 'mate3', 'mate1_first', 'mate2_first', 'mate3_first', 'phase_count', 'tour_line', 'nerve_word', 'standing_word', 'rank_name', 'path_name', 'section_line', 'duty_name', 'duty_risk', 'duty_cost', 'friend_line', 'mission_name', 'mission_risk', 'course_name', 'battle_name', 'phase_line', 'risk_push', 'risk_help', 'risk_ground', 'offer0', 'offer1', 'offer2', 'offers_line', 'grade', 'friends_home', 'awards_line', 'ending_line'].includes(name) ? [] : undefined),
  variantKey: (s) => st(s).start,
  startScene: (s, c) => ct(c).starts[st(s).start]?.start_scene,
  date: (s) => monthName(warMonth(war(s))),
};

export { STAGES };

registerGame(module);
