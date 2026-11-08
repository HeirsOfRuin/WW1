// The war's dates. The war layer counts rotations; the story engine counts seasons (four a year)
// and derives ages and cooldowns from them. This table gives each rotation its month, and
// seasonOf() turns a month into the engine's season count, so the engine's clock is moved on
// as the war's is (DESIGN §2, the calendar risk; tests/calendar.test.ts proves it).
// Battle months follow the battles' dates: Loos 25 September 1915; the Somme from 1 July 1916;
// Arras from 9 April 1917; Passchendaele from 31 July 1917; the German offensive from 21 March
// 1918; Amiens and the Hundred Days from 8 August 1918. To be checked against sources (SPEC).
import { STAGES } from './data';
import type { War } from './war';

const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** [year, month 1-12] of each rotation, by stage; then the month of that stage's leave. */
export const ROTATION_MONTHS: Record<number, { rotations: [number, number][]; leave: [number, number] }> = {
  1: { rotations: [[1915, 5], [1915, 6], [1915, 6], [1915, 7], [1915, 8], [1915, 8], [1915, 9], [1915, 10], [1915, 11]], leave: [1915, 12] },
  2: { rotations: [[1916, 2], [1916, 3], [1916, 4], [1916, 5], [1916, 7], [1916, 7], [1916, 8], [1916, 9], [1916, 10], [1916, 11]], leave: [1916, 12] },
  3: { rotations: [[1917, 1], [1917, 2], [1917, 3], [1917, 4], [1917, 5], [1917, 6], [1917, 7], [1917, 8], [1917, 9], [1917, 10]], leave: [1917, 12] },
  4: { rotations: [[1918, 1], [1918, 2], [1918, 3], [1918, 4], [1918, 5], [1918, 6], [1918, 8], [1918, 8], [1918, 9], [1918, 10]], leave: [1918, 11] },
};
export const TRAINING: [number, number] = [1914, 9];
export const ARMISTICE: [number, number] = [1918, 11];
/** The engine's season count starts at spring 1914 (config start_year 1914). */
export const FIRST_YEAR = 1914;

for (const st of STAGES) {
  if (ROTATION_MONTHS[st.n]!.rotations.length !== st.rotations) throw new Error(`calendar: stage ${st.n} needs ${st.rotations} rotation months`);
}

/** The month the war is at now: training, a rotation, a leave, or the day it ended. */
export function warMonth(w: War): [number, number] {
  if (w.cursor.at === 'train' || (w.clock === 0 && w.stage === 1)) return TRAINING;
  if (w.ending === 'armistice') return ARMISTICE;
  const t = ROTATION_MONTHS[w.stage]!;
  if (w.cursor.at === 'leave' || (w.ending === 'posting')) return t.leave;
  return t.rotations[Math.min(Math.max(w.clockInStage - 1, 0), t.rotations.length - 1)]!;
}

/** The engine's season index (0 = spring 1914) for a month; January and February are last year's winter. */
export function seasonOf([y, m]: [number, number]): number {
  if (m <= 2) return (y - 1 - FIRST_YEAR) * 4 + 3;
  return (y - FIRST_YEAR) * 4 + (m <= 5 ? 0 : m <= 8 ? 1 : m <= 11 ? 2 : 3);
}

export const monthName = ([y, m]: [number, number]) => `${M[m - 1]} ${y}`;
