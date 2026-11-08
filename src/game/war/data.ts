// Every tunable number in the war layer. Ported from prototypes/killgate/data.js (round 2,
// 2026-11-09), numbers unchanged: KILLGATE.md measured these. Tuned to the SPEC targets, not
// yet sourced (SPEC: check against sources before each stage is written).
/* eslint-disable */

export type Town = 'pit' | 'mill' | 'city' | 'farm';
export type PhaseType = 'advance' | 'trench' | 'hold' | 'defence';
export type BattleChoice = 'push' | 'help' | 'ground';
export type Ending = 'armistice' | 'posting' | 'captured' | 'invalided' | 'killed' | 'broken' | 'courtMartial';
export type Phase = [number, number, PhaseType];
export interface Battle { name: string; phases: Phase[]; defence?: boolean; capture?: number }
export interface Stage { n: number; year: number; rotations: number; fire: number; sectionLoss: number; nerve: number; battles: Record<number, Battle> }
export interface Duty { hit: number; nerve: number; standing: number; skill: string; award: number; night: boolean; field?: boolean; dig?: boolean }
export interface PathMods { hit: number; award: number; section: number; defence?: number; fire?: number; collapse?: number }
export interface ChoiceMods { standing: number; award: number; friends: number; nerve: number; lead: number }
export interface Role { mission: string; chance: number; hit: number; nerve: number; award: number; success: number }

export const RANKS = ['Private', 'Lance corporal', 'Corporal', 'Sergeant', 'Company sergeant major', 'Second lieutenant'];
export const SUBALTERN = 5;
export const TOP_OR = 4; // highest rank an other rank can reach

// Hometown skills. Each town offers three; the player picks two, plus one general.
export const TOWNS: Record<Town, { list: string[]; pick: string[] }> = {
  pit: { list: ['dig', 'stamina', 'mech'], pick: ['dig', 'stamina'] },
  mill: { list: ['mech', 'stamina', 'voice'], pick: ['mech', 'stamina'] },
  city: { list: ['lit', 'sport', 'firstaid'], pick: ['lit', 'sport'] },
  farm: { list: ['field', 'stamina', 'mech'], pick: ['field', 'stamina'] },
};
export const GENERAL = ['firstaid', 'sport', 'voice'];
export const DEFAULT_GENERAL = 'firstaid';
export const HOME_SKILLS = ['dig', 'mech', 'lit', 'field', 'stamina', 'firstaid', 'sport', 'voice'];

// War skills, learned only at the front. Specialist skills open the specialist path.
export const WAR_SKILLS = ['trench', 'bomb', 'lewis', 'snipe', 'signals', 'lead', 'tunnel'];
export const SPECIALIST = ['bomb', 'lewis', 'snipe', 'signals'];
// Which hometown skill speeds which war skill (x1.6 learning).
export const APTITUDE: Record<string, string> = { bomb: 'sport', lewis: 'mech', snipe: 'field', signals: 'lit', trench: 'dig' };
// The specialty a town's man is steered to when offered a course.
export const TOWN_COURSE: Record<Town, string> = { pit: 'bomb', mill: 'lewis', city: 'signals', farm: 'snipe' };

// War work offered at leave: [hometown skill required, first stage it exists].
// Pits from 1916 (miners recalled), munitions from 1915, clerks from 1915, land work from 1917.
export const WAR_WORK: Record<Town, { skill: string; from: number }> = {
  pit: { skill: 'dig', from: 2 },
  mill: { skill: 'mech', from: 1 },
  city: { skill: 'lit', from: 1 },
  farm: { skill: 'field', from: 3 },
};

// Stages: rotations, battle slots, shellfire per front tour, section loss per rotation.
// A battle: phases, each [base hit chance, nerve cost, phase type]. The type decides which
// choice is safest (PHASE_HIT): no choice is safest everywhere.
export const STAGES: Stage[] = [
  { n: 1, year: 1915, rotations: 9, fire: 0.04, sectionLoss: 0.006, nerve: 5,
    battles: { 6: { name: 'Loos', phases: [[0.16, 10, 'advance'], [0.13, 9, 'trench'], [0.10, 8, 'hold']] } } },
  { n: 2, year: 1916, rotations: 10, fire: 0.046, sectionLoss: 0.0075, nerve: 6,
    battles: {
      4: { name: 'Somme, 1 July', phases: [[0.40, 13, 'advance'], [0.26, 10, 'trench'], [0.22, 9, 'hold'], [0.14, 7, 'hold']] },
      8: { name: 'Somme, autumn', phases: [[0.25, 10, 'advance'], [0.22, 9, 'trench'], [0.14, 8, 'hold']] },
    } },
  { n: 3, year: 1917, rotations: 10, fire: 0.051, sectionLoss: 0.0075, nerve: 7,
    battles: {
      3: { name: 'Arras', phases: [[0.25, 10, 'advance'], [0.22, 9, 'trench'], [0.16, 8, 'hold']] },
      7: { name: 'Passchendaele', phases: [[0.26, 13, 'advance'], [0.25, 13, 'trench'], [0.22, 12, 'hold'], [0.16, 11, 'hold']] },
    } },
  { n: 4, year: 1918, rotations: 10, fire: 0.046, sectionLoss: 0.0075, nerve: 7,
    battles: {
      2: { name: 'Spring Offensive', defence: true, capture: 0.05, phases: [[0.26, 12, 'defence'], [0.23, 11, 'defence'], [0.20, 10, 'defence'], [0.16, 9, 'defence']] },
      6: { name: 'Hundred Days, August', phases: [[0.22, 9, 'advance'], [0.16, 8, 'trench'], [0.14, 7, 'hold']] },
      9: { name: 'Hundred Days, October', phases: [[0.20, 9, 'advance'], [0.14, 8, 'trench'], [0.12, 7, 'hold']] },
    } },
];

// Duties offered on a front tour: extra hit chance, nerve cost, standing if volunteered,
// war skill learned, award points.
export const DUTIES: Record<string, Duty> = {
  raid: { hit: 0.09, nerve: 8, standing: 6, skill: 'bomb', award: 2, night: false, field: true },
  patrol: { hit: 0.04, nerve: 6, standing: 4, skill: 'snipe', award: 1, night: true, field: true },
  wiring: { hit: 0.03, nerve: 4, standing: 3, skill: 'trench', award: 0, night: true, dig: true },
  listening: { hit: 0.02, nerve: 5, standing: 2, skill: 'trench', award: 0, night: true },
  carrying: { hit: 0.015, nerve: 2, standing: 1, skill: 'trench', award: 0, night: true, dig: true },
};

// What a hit does. Shares of hits.
export const WOUND = { killed: 0.32, severe: 0.23, light: 0.45, downgrade: 0.35 };

// Path modifiers in battle: hit chance multiplier, award multiplier, section-loss multiplier.
export const PATHS: Record<string, PathMods> = {
  rifleman: { hit: 1.0, award: 1.0, section: 1.0 },
  bomb: { hit: 1.5, award: 1.6, section: 1.0 },
  lewis: { hit: 1.4, award: 1.3, section: 0.95, defence: 0.85 },
  snipe: { hit: 1.2, award: 1.1, section: 1.0 },
  signals: { hit: 1.45, award: 1.2, section: 1.0 },
  tunnel: { hit: 0.7, award: 0.9, section: 1.0, fire: 0.9, collapse: 0.007 },
  nco: { hit: 1.15, award: 1.2, section: 0.8 },
  subaltern: { hit: 1.45, award: 1.6, section: 0.75 },
};

// Battle choices: standing, award points, friend-loss multiplier, nerve.
export const CHOICES: Record<BattleChoice, ChoiceMods> = {
  push: { standing: 5, award: 1.6, friends: 0.95, nerve: 0, lead: 0.4 },
  help: { standing: 1, award: 0.3, friends: 0.4, nerve: -1, lead: 0.15 },
  ground: { standing: -5, award: 0, friends: 1.05, nerve: 0, lead: 0 },
};

// Hit multiplier by phase type and choice. Advance: going to ground in no man's land leaves
// you in the open under the barrage, so pushing on is safest. Trench: bombing up an enemy
// trench is the most dangerous work, keeping down the safest. Hold: the counter-attack comes
// to you. Defence: going to ground risks being overrun (capture doubles, model.js).
export const PHASE_HIT: Record<PhaseType | 'stalled', Record<BattleChoice, number>> = {
  advance: { push: 0.85, help: 1.35, ground: 1.35 },
  trench: { push: 1.55, help: 1.1, ground: 0.5 },
  hold: { push: 1.4, help: 0.85, ground: 0.7 },
  defence: { push: 1.35, help: 0.95, ground: 0.75 },
  // An attack that has stalled (uncut wire, the barrage gone ahead): pushing on is suicide,
  // the whole line goes to ground, and going down costs no standing. The player is told.
  stalled: { push: 2.3, help: 1.3, ground: 0.5 },
};
// Chance an advance or trench phase has stalled.
export const STALL = 0.25;

// Awards: points needed (drawn per battle), ladder by stage. MM exists from 1916.
export const AWARDS: Record<string, number> = { MiD: 3, MM: 7, MC: 7, DCM: 12, VC: 22 };

// The grade: record times the ending's multiplier. Prototype weights, the author's call later.
export const GRADE = {
  // Cumulative credit for stages completed (0..4): later years are worth more.
  stages: [0, 8, 24, 48, 90], perRank: 6, subalternBonus: 8, perFriend: 2, nervePer10: 1,
  award: { MiD: 3, MM: 8, MC: 8, DCM: 14, VC: 30 } as Record<string, number>,
  mult: { armistice: 1.4, posting: 1.0, captured: 0.8, invalided: 0.8, killed: 0.4, broken: 0.6, courtMartial: 0.1 } as Record<Ending, number>,
};

export const SECTION_SIZE = 9;

// Specialist roles (author, 2026-11-09): role missions, slightly better pay, circumstances and
// kit, an easier promotion when missions go well, and more risk more often.
// mission: chance one is put to him per front tour; hit, nerve, award points, base success.
// A specialist who declines is usually detailed anyway (detail): it is his job.
export const ROLES: Record<string, Role> = {
  bomb: { mission: 'bombing raid', chance: 0.6, hit: 0.11, nerve: 6, award: 2.0, success: 0.55 },
  lewis: { mission: 'covering a raid with the Lewis gun', chance: 0.6, hit: 0.08, nerve: 5, award: 1.4, success: 0.6 },
  snipe: { mission: 'sniping from a hide', chance: 0.6, hit: 0.065, nerve: 4, award: 1.2, success: 0.5 },
  signals: { mission: 'running a message under fire', chance: 0.6, hit: 0.08, nerve: 5, award: 1.2, success: 0.65 },
  tunnel: { mission: 'listening for enemy miners; blowing a camouflet', chance: 0.6, hit: 0.045, nerve: 6, award: 1.2, success: 0.55 },
};
export const ROLE = {
  detail: 0.6, // chance a specialist who declines is sent anyway
  successPerSkill: 0.06, hitPerSkill: 0.06,
  restBonus: 1.0, // better pay, billets and kit: nerve back at rest
  crew: 4, // a tunneller's crew stands in for the section at rest
  meritToPromote: 2, promoteChance: 0.4, // successful missions count toward a stripe
  keepRole: 2.5, // specialist skill at which a promoted man keeps his role instead of leading a section
};
// Share of eligible sergeants a commissioning board accepts.
export const COMMISSION_BOARD = 0.5;
// A friend's chance of being killed per battle phase, as a share of the phase's hit chance.
export const FRIEND_BATTLE = 0.16;

// Nerve recovered at rest (per rotation, plus per friend alive and with you) and on home leave.
export const REST = { base: 4.5, voice: 2, perFriend: 0.4, leave: 30 };
