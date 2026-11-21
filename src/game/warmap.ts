// The war map (the author, 2026-11-17: "a pixel map of the overall war would be really handy for
// players to understand what is going on and where they are"). The Western Front from Dover to
// Sedan: the line for the month the war is at, where he is, and the battles he fought or missed.
// One derivation: the month comes from the calendar (warMonth), the battles from the war's own log,
// so the map cannot disagree with the story. Lines and places are [lat, lon], simplified from the
// general maps of the front (docs/SOURCES.md: approximate, to the nearest few miles).
import type { War } from './war/war';
import { corpsOf } from './war/war';
import { warMonth, monthName } from './war/calendar';

export type LatLon = readonly [number, number];
export const EXTENT = { lat0: 49.35, lat1: 51.4, lon0: 1.0, lon1: 5.02 };

/** The sea north and west of the French and Belgian coast, down to Dieppe (England is cut out). */
export const SEA: LatLon[] = [
  [50.93, 1.0], [51.08, 1.17], [51.13, 1.31], [51.22, 1.4], [51.4, 1.44], [51.4, 3.55],
  [51.35, 3.29], [51.33, 3.2], [51.23, 2.92], [51.13, 2.75], [51.04, 2.38], [50.99, 2.13],
  [50.95, 1.86], [50.87, 1.58], [50.73, 1.6], [50.52, 1.59], [50.4, 1.56], [50.22, 1.6],
  [50.06, 1.37], [49.92, 1.08], [49.92, 1.0],
];
/** The Belgian frontier, drawn dotted. */
export const FRONTIER: LatLon[] = [
  [51.09, 2.55], [50.95, 2.62], [50.81, 2.78], [50.73, 2.86], [50.7, 3.02], [50.62, 3.18],
  [50.53, 3.28], [50.45, 3.66], [50.35, 3.99], [50.15, 4.2], [49.97, 4.15], [49.95, 4.5], [49.79, 4.85], [49.75, 5.02],
];
/** The Somme, Saint-Valery to Saint-Quentin. */
export const SOMME: LatLon[] = [
  [50.18, 1.62], [50.11, 1.83], [49.89, 2.3], [49.91, 2.51], [49.94, 2.72], [49.93, 2.93], [49.75, 3.07], [49.85, 3.29],
];

// The front line, north to south, the British and French side on the west. Shared stretches:
const COAST_TO_YPRES: LatLon[] = [[51.14, 2.75], [51.03, 2.87], [50.93, 2.85], [50.89, 2.86]];
const SALIENT_1915: LatLon[] = [[50.87, 2.92], [50.85, 2.95], [50.82, 2.93], [50.81, 2.89], [50.78, 2.87], [50.76, 2.86], [50.73, 2.89]];
const ARMENTIERES_TO_LENS: LatLon[] = [[50.7, 2.94], [50.67, 2.93], [50.64, 2.88], [50.61, 2.85], [50.58, 2.79], [50.54, 2.75], [50.52, 2.76], [50.48, 2.78], [50.46, 2.79], [50.43, 2.79]];
const VIMY_TO_SOMME_1915: LatLon[] = [[50.39, 2.74], [50.37, 2.76], [50.33, 2.78], [50.29, 2.8], [50.26, 2.79], [50.2, 2.7], [50.17, 2.66], [50.14, 2.64], [50.12, 2.63], [50.1, 2.65], [50.08, 2.66], [50.05, 2.68], [50.02, 2.69], [49.995, 2.7], [49.99, 2.73], [49.98, 2.75], [49.97, 2.79], [49.95, 2.81]];
const SOUTH_OF_SOMME_1915: LatLon[] = [[49.93, 2.82], [49.91, 2.8], [49.84, 2.77], [49.7, 2.72], [49.59, 2.87], [49.51, 2.93], [49.4, 3.25], [49.35, 3.45]];
const SOMME_GAINS_1916: LatLon[] = [[50.12, 2.63], [50.1, 2.66], [50.08, 2.69], [50.07, 2.72], [50.07, 2.79], [50.05, 2.85], [50.04, 2.88], [50.0, 2.91], [49.97, 2.92], [49.95, 2.88], [49.92, 2.91], [49.89, 2.88], [49.84, 2.79]];
const MESSINES_1917: LatLon[] = [[50.87, 2.92], [50.85, 2.95], [50.82, 2.93], [50.79, 2.93], [50.76, 2.92], [50.74, 2.94]];
const PASSCHENDAELE_1917: LatLon[] = [[50.91, 2.92], [50.92, 2.96], [50.9, 3.02], [50.85, 2.99], [50.84, 2.98], [50.81, 2.98], [50.8, 2.95], [50.76, 2.92], [50.74, 2.94]];
const VIMY_TO_HINDENBURG_1917: LatLon[] = [[50.36, 2.85], [50.33, 2.88], [50.3, 2.9], [50.28, 2.9], [50.23, 2.93], [50.19, 2.93], [50.17, 2.98], [50.11, 3.03]];
const HINDENBURG_SOUTH: LatLon[] = [[50.06, 3.1], [50.0, 3.13], [49.86, 3.21], [49.67, 3.35], [49.53, 3.35], [49.46, 3.43], [49.43, 3.62], [49.35, 3.9]];
const FLESQUIERES_1917: LatLon[] = [[50.14, 3.08], [50.13, 3.13], [50.09, 3.12]];

export interface FrontLine { key: string; caption: string; points: LatLon[] }

/** A line part of the way from one line to another: each point of `to` moved back toward the nearest
 *  point of `from` (f = 0: on `from`, 1: `to`). For a battle's gains as the months went (the Somme from
 *  July to November 1916, Passchendaele from August to November 1917): without it the map showed the
 *  whole of a battle's ground taken on its first day (playtest 3). */
function partWay(from: LatLon[], to: LatLon[], f: number): LatLon[] {
  const near = ([la, lo]: LatLon): LatLon => {
    let best: LatLon = from[0]!; let bd = Infinity;
    for (let i = 1; i < from.length; i++) {
      const [a0, o0] = from[i - 1]!; const [a1, o1] = from[i]!;
      const dl = a1 - a0, dn = o1 - o0; const len = dl * dl + dn * dn;
      const t = len ? Math.max(0, Math.min(1, ((la - a0) * dl + (lo - o0) * dn) / len)) : 0;
      const q: LatLon = [a0 + t * dl, o0 + t * dn]; const d = (q[0] - la) ** 2 + (q[1] - lo) ** 2;
      if (d < bd) { bd = d; best = q; }
    }
    return best;
  };
  return to.map((p) => { const q = near(p); return [q[0] + f * (p[0] - q[0]), q[1] + f * (p[1] - q[1])] as LatLon; });
}
const SOMME_1915 = [...VIMY_TO_SOMME_1915, ...SOUTH_OF_SOMME_1915];
const somme = (f: number) => [...COAST_TO_YPRES, ...SALIENT_1915, ...ARMENTIERES_TO_LENS, ...VIMY_TO_SOMME_1915.slice(0, 8), ...partWay(SOMME_1915, SOMME_GAINS_1916, f), ...SOUTH_OF_SOMME_1915.slice(3)];
// March 1917: the Germans gone back to the Hindenburg Line south of Arras; Vimy and Arras not yet attacked
const HINDENBURG_FROM_ARRAS: LatLon[] = [[50.27, 2.83], [50.22, 2.88], [50.19, 2.92], [50.16, 2.99], [50.11, 3.03]];
const passchendaele = (f: number) => [...COAST_TO_YPRES, ...partWay(MESSINES_1917, PASSCHENDAELE_1917, f), ...ARMENTIERES_TO_LENS.slice(1), ...VIMY_TO_HINDENBURG_1917, ...HINDENBURG_SOUTH];
export const LINES: Record<string, FrontLine> = {
  l1915: { key: 'l1915', caption: 'The line has hardly moved since the winter of 1914.', points: [...COAST_TO_YPRES, ...SALIENT_1915, ...ARMENTIERES_TO_LENS, ...SOMME_1915] },
  l1916a: { key: 'l1916a', caption: 'The Somme: a mile or so taken in the south since 1 July; in the north, almost nothing.', points: somme(0.25) },
  l1916b: { key: 'l1916b', caption: 'The Somme: the ridge and its woods taken, yard by yard, since July.', points: somme(0.6) },
  l1916: { key: 'l1916', caption: 'The Somme is over. It pushed the line back about six miles.', points: somme(1) },
  l1917h: { key: 'l1917h', caption: 'The Germans have gone back to the Hindenburg Line south of Arras, wrecking everything they left.', points: [...COAST_TO_YPRES, ...SALIENT_1915, ...ARMENTIERES_TO_LENS, ...VIMY_TO_SOMME_1915.slice(0, 4), ...HINDENBURG_FROM_ARRAS, ...HINDENBURG_SOUTH] },
  l1917a: { key: 'l1917a', caption: 'Arras: Vimy Ridge taken, and a few miles east of the town.', points: [...COAST_TO_YPRES, ...SALIENT_1915, ...ARMENTIERES_TO_LENS.slice(1), ...VIMY_TO_HINDENBURG_1917, ...HINDENBURG_SOUTH] },
  l1917m: { key: 'l1917m', caption: 'Messines Ridge taken, south of Ypres, after the mines went up on 7 June.', points: passchendaele(0) },
  l1917p: { key: 'l1917p', caption: 'Passchendaele: a mile or two of mud taken east of Ypres since 31 July.', points: passchendaele(0.4) },
  l1917b: { key: 'l1917b', caption: 'Passchendaele: the salient a few miles deeper, for a year of mud.', points: passchendaele(1) },
  l1917c: { key: 'l1917c', caption: 'After Cambrai: a few miles kept at Flesquières, the rest lost again.', points: [...COAST_TO_YPRES, ...PASSCHENDAELE_1917, ...ARMENTIERES_TO_LENS.slice(1), ...VIMY_TO_HINDENBURG_1917, ...FLESQUIERES_1917, ...HINDENBURG_SOUTH] },
  l1918a: { key: 'l1918a', caption: 'The German offensive has driven the line back to Amiens and across the Lys.', points: [[51.14, 2.75], [51.03, 2.87], [50.93, 2.85], [50.89, 2.86], [50.85, 2.92], [50.81, 2.87], [50.79, 2.79], [50.78, 2.76], [50.74, 2.7], [50.71, 2.67], [50.67, 2.62], [50.6, 2.56], [50.56, 2.62], [50.52, 2.76], [50.46, 2.79], [50.43, 2.8], [50.36, 2.85], [50.33, 2.88], [50.29, 2.84], [50.23, 2.77], [50.17, 2.73], [50.14, 2.71], [50.12, 2.63], [50.06, 2.64], [50.02, 2.65], [49.98, 2.63], [49.95, 2.63], [49.87, 2.53], [49.83, 2.51], [49.77, 2.48], [49.65, 2.52], [49.62, 2.55], [49.55, 2.83], [49.45, 2.95], [49.35, 3.05]] },
  l1918b: { key: 'l1918b', caption: 'Amiens has pushed the line back to the old Somme battlefield.', points: [[51.14, 2.75], [51.03, 2.87], [50.93, 2.85], [50.89, 2.86], [50.85, 2.92], [50.81, 2.87], [50.79, 2.79], [50.78, 2.76], [50.74, 2.7], [50.71, 2.67], [50.67, 2.62], [50.6, 2.56], [50.56, 2.62], [50.52, 2.76], [50.46, 2.79], [50.43, 2.8], [50.36, 2.85], [50.33, 2.88], [50.29, 2.84], [50.23, 2.77], [50.17, 2.73], [50.14, 2.71], [50.12, 2.63], [50.06, 2.64], [50.0, 2.65], [49.94, 2.72], [49.83, 2.77], [49.7, 2.75], [49.58, 2.85], [49.45, 2.97], [49.35, 3.1]] },
  l1918c: { key: 'l1918c', caption: 'The Germans are back on the Hindenburg Line, and the Lys is given up.', points: [[51.14, 2.75], [51.03, 2.87], [50.93, 2.85], [50.89, 2.86], [50.85, 2.95], [50.79, 2.85], [50.73, 2.89], [50.69, 2.86], [50.63, 2.78], [50.53, 2.78], [50.43, 2.8], [50.36, 2.85], [50.28, 2.89], [50.18, 3.0], [50.11, 3.09], [50.0, 3.13], [49.86, 3.21], [49.66, 3.36], [49.46, 3.43], [49.35, 3.6]] },
  l1918d: { key: 'l1918d', caption: 'The Hindenburg Line is broken. Lille and the Belgian coast are free.', points: [[51.25, 3.57], [51.18, 3.57], [50.98, 3.53], [50.83, 3.3], [50.6, 3.35], [50.36, 3.5], [50.25, 3.64], [50.1, 3.6], [49.9, 3.63], [49.57, 3.9], [49.35, 4.3]] },
  l1918e: { key: 'l1918e', caption: 'Eleven o\'clock, 11 November 1918: the line where it stopped.', points: [[51.22, 3.85], [51.05, 3.75], [50.77, 3.88], [50.63, 3.78], [50.45, 3.95], [50.28, 3.97], [50.12, 3.93], [49.92, 4.08], [49.92, 4.52], [49.77, 4.72], [49.7, 4.94], [49.62, 5.02]] },
};

/** Which line stands in a month (year, month 1-12). */
export function lineFor([y, m]: [number, number]): FrontLine {
  const t = y * 12 + m;
  const at = (yy: number, mm: number) => yy * 12 + mm;
  if (t < at(1916, 7)) return LINES.l1915!;
  if (t < at(1916, 9)) return LINES.l1916a!;
  if (t < at(1916, 11)) return LINES.l1916b!;
  if (t < at(1917, 3)) return LINES.l1916!;
  if (t < at(1917, 4)) return LINES.l1917h!;
  if (t < at(1917, 6)) return LINES.l1917a!;
  if (t < at(1917, 8)) return LINES.l1917m!;
  if (t < at(1917, 10)) return LINES.l1917p!;
  if (t < at(1917, 12)) return LINES.l1917b!;
  if (t < at(1918, 4)) return LINES.l1917c!;
  if (t < at(1918, 8)) return LINES.l1918a!;
  if (t < at(1918, 9)) return LINES.l1918b!;
  if (t < at(1918, 10)) return LINES.l1918c!;
  if (t < at(1918, 11)) return LINES.l1918d!;
  return LINES.l1918e!;
}

/** Places named on the map, with where the label sits from the dot (pixels). */
export const PLACES: { name: string; at: LatLon; dx: number; dy: number }[] = [
  { name: 'DOVER', at: [51.13, 1.31], dx: 2, dy: -6 },
  { name: 'CALAIS', at: [50.95, 1.86], dx: 2, dy: -6 },
  { name: 'BOULOGNE', at: [50.73, 1.61], dx: 2, dy: -2 },
  { name: 'YPRES', at: [50.85, 2.88], dx: -21, dy: -2 },
  { name: 'LILLE', at: [50.63, 3.06], dx: 2, dy: -2 },
  { name: 'LOOS', at: [50.46, 2.79], dx: -17, dy: -2 },
  { name: 'ARRAS', at: [50.29, 2.78], dx: -21, dy: -2 },
  { name: 'ALBERT', at: [50.0, 2.65], dx: -25, dy: -2 },
  { name: 'AMIENS', at: [49.89, 2.3], dx: -10, dy: 2 },
  { name: 'CAMBRAI', at: [50.18, 3.23], dx: 2, dy: -2 },
  { name: 'MONS', at: [50.45, 3.95], dx: 2, dy: -2 },
];

/** Where each battle was fought, for the markers (the first of July by the town's ground). */
const BATTLE_AT: Record<string, LatLon> = {
  Loos: [50.46, 2.79], 'Somme, autumn': [50.07, 2.79], Arras: [50.29, 2.85], Passchendaele: [50.9, 3.0],
  Cambrai: [50.12, 3.12], 'Spring Offensive': [50.08, 2.98], 'Hundred Days, August': [49.87, 2.55], 'Hundred Days, October': [50.1, 3.5],
};
const FIRST_OF_JULY: Record<string, LatLon> = { mill: [50.1, 2.66], pit: [50.02, 2.69], farm: [49.99, 2.74], city: [50.14, 2.65] };
const BATTLE_WORDS: Record<string, string> = {
  Loos: 'Loos, September 1915', 'Somme, 1 July': 'The Somme, 1 July 1916', 'Somme, autumn': 'The Somme, autumn 1916', Arras: 'Arras, April 1917',
  Passchendaele: 'Passchendaele, 1917', Cambrai: 'Cambrai, November 1917', 'Spring Offensive': 'The German offensive, March 1918',
  'Hundred Days, August': 'Amiens, August 1918', 'Hundred Days, October': 'The advance, October 1918',
};
export function battleAt(name: string, town: string): LatLon | undefined {
  return name === 'Somme, 1 July' ? FIRST_OF_JULY[town] : BATTLE_AT[name];
}

export interface Here { at: LatLon | null; where: string }
/** Off the map: in England (training, a hospital, Wool), or a prisoner in Germany. */
const ENGLAND: LatLon = [51.3, 1.12];

/** Where he is in a month, by road: the sector the story puts the battalion in, or his corps'. */
export function hereOf(w: War): Here {
  const [y, m] = warMonth(w);
  const corps = corpsOf(w);
  if (w.cursor.at === 'done') {
    if (w.ending === 'captured') return { at: null, where: 'A prisoner in Germany' };
    if (w.ending === 'posting' || w.ending === 'invalided') return { at: ENGLAND, where: 'Home in England' };
  }
  if (w.cursor.at === 'train' || (w.clock === 0 && w.stage === 1)) return { at: ENGLAND, where: 'Training in England' };
  if (w.out > 0 && w.blightyThisStage && w.outWhy === 'wound') return { at: ENGLAND, where: 'In hospital in England' };
  if (corps === 'air' && (y > 1917 || m >= 5)) {
    return y === 1918 && m >= 4 ? { at: [49.97, 2.3], where: 'The aerodrome at Bertangles, behind Amiens' } : { at: [50.82, 2.68], where: 'The aerodrome behind Ypres' };
  }
  if (corps === 'tank' && y === 1917) {
    if (m <= 1) return { at: ENGLAND, where: 'Wool, in Dorset: the tank school' };
    if (m <= 2) return { at: [50.41, 2.23], where: 'Bermicourt and Erin: the tank depots' };
    if (m >= 11) return { at: [50.12, 3.05], where: 'Cambrai: before Flesquières ridge' };
  }
  if (corps === 'tank' && y === 1918 && m <= 2) return { at: [50.43, 2.21], where: 'The tank park at Erin' };
  if (y === 1915) return { at: [50.49, 2.74], where: 'The Loos sector, by Vermelles' };
  if (y === 1916) {
    if (m <= 7) {
      const [la, lo] = FIRST_OF_JULY[w.town]!; const at: LatLon = [la, lo - 0.04]; // behind the line, not on it
      const name = { mill: 'Serre', pit: 'La Boisselle', farm: 'Mametz', city: 'Gommecourt' }[w.town]!;
      return { at, where: `The Somme front, before ${name}` };
    }
    return { at: [50.04, 2.75], where: 'The Somme in the autumn, by Flers and the Butte' };
  }
  if (y === 1917) {
    if (m <= 2) return { at: [50.05, 2.78], where: 'The Somme front, in the winter' };
    if (m <= 6) return { at: [50.29, 2.82], where: 'Arras' };
    return { at: [50.85, 2.87], where: 'The Ypres salient' };
  }
  if (m <= 2) return { at: [50.85, 2.87], where: 'The Ypres salient, in the winter' };
  if (m === 3) return { at: [50.08, 2.98], where: 'The line before Bapaume, south of Arras' };
  if (m <= 7) return { at: [49.98, 2.6], where: 'The line before Albert and Amiens' };
  if (m === 8) return { at: [49.87, 2.53], where: 'Amiens: Villers-Bretonneux' };
  if (m === 9) return { at: [50.0, 3.05], where: 'Before the Hindenburg Line' };
  if (m === 10) return { at: [50.1, 3.48], where: 'The advance: Le Cateau and the Selle' };
  return { at: [50.37, 3.75], where: 'The road to Mons' };
}

export interface MapView {
  month: string; line: FrontLine; first: FrontLine; here: Here;
  battles: { name: string; words: string; at: LatLon; fought: boolean }[];
}
/** Everything the Map tab shows, from the war. */
export function mapOf(w: War, since?: FrontLine): MapView {
  const battles: MapView['battles'] = [];
  for (const l of w.log) {
    const f = /\| battle: (.*) as \w+$/.exec(l); const mi = /\| missed: (.*) \((course|wound)\)$/.exec(l);
    const name = f?.[1] ?? mi?.[1];
    if (!name) continue;
    const at = battleAt(name, w.town);
    if (at && !battles.some((b) => b.name === name)) battles.push({ name, words: BATTLE_WORDS[name] ?? name, at, fought: !!f });
  }
  return { month: monthName(warMonth(w)), line: lineFor(warMonth(w)), first: since ?? LINES.l1915!, here: hereOf(w), battles };
}

/** A map position to a pixel on a w x h grid. */
export function project([lat, lon]: LatLon, w: number, h: number): [number, number] {
  const x = ((lon - EXTENT.lon0) / (EXTENT.lon1 - EXTENT.lon0)) * w;
  const y = ((EXTENT.lat1 - lat) / (EXTENT.lat1 - EXTENT.lat0)) * h;
  return [Math.round(x), Math.round(y)];
}
