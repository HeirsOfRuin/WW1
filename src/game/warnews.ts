// The war beyond the battalion, by month (the author, playtest 3: "The map makes a huge jump between
// 1916 and 1917. I think a review of the overall war after every home leave would help keep players
// aware of what's going on"). Written as the news reached the men: the papers, the rumours, the
// orders read out. The year pages after each leave show what happened since the last one (with
// the map), and the Map tab lists it all. Dates are the general history; docs/SOURCES.md lists them
// as to be checked against a source when the network allows.
import { lineFor, type FrontLine } from './warmap';
import { ROTATION_MONTHS, monthName, warMonth } from './war/calendar';
import type { War } from './war/war';

export interface WarNews { at: [number, number]; text: string }
export const WAR_NEWS: WarNews[] = [
  { at: [1915, 4], text: 'The Germans use gas for the first time, at Ypres: a green cloud, and the line north of the town broken for a day.' },
  { at: [1915, 4], text: 'Landings at Gallipoli, against the Turks. The papers say Constantinople by the summer.' },
  { at: [1915, 5], text: 'The Lusitania is sunk off Ireland by a U-boat, with more than a thousand drowned. There are riots against German shops at home.' },
  { at: [1915, 5], text: 'Italy comes into the war on our side.' },
  { at: [1915, 6], text: 'A shortage of shells is in all the papers. Lloyd George is made Minister of Munitions, and the women go into the shell factories.' },
  { at: [1915, 9], text: 'Loos, 25 September: the biggest British attack yet. A mile or two taken, and close on 60,000 casualties.' },
  { at: [1915, 10], text: 'Nurse Cavell is shot by the Germans in Brussels for helping soldiers escape.' },
  { at: [1915, 12], text: 'Sir John French is replaced. Sir Douglas Haig commands the army in France.' },
  { at: [1916, 1], text: 'The last men are taken off Gallipoli. It has come to nothing.' },
  { at: [1916, 1], text: 'Conscription: the Military Service Act. Single men first; married men by the summer.' },
  { at: [1916, 2], text: 'The Germans attack the French at Verdun. It goes on all year.' },
  { at: [1916, 4], text: 'A rising in Dublin at Easter, put down in a week. The leaders are shot.' },
  { at: [1916, 4], text: 'Kut, in Mesopotamia, surrenders to the Turks after a siege of five months.' },
  { at: [1916, 5], text: 'The fleets meet at Jutland. We lose more ships, but the German fleet goes back to port and stays there.' },
  { at: [1916, 6], text: 'Lord Kitchener is drowned when his cruiser hits a mine off Orkney.' },
  { at: [1916, 6], text: 'The Russians attack in the east and take hundreds of thousands of prisoners.' },
  { at: [1916, 7], text: 'The Somme, 1 July: nearly 60,000 British casualties on the first day, the worst the army has ever had.' },
  { at: [1916, 9], text: 'Tanks go into action for the first time, at Flers on the Somme.' },
  { at: [1916, 11], text: 'The Somme ends in the November mud: about six miles taken, and over 400,000 British casualties.' },
  { at: [1916, 12], text: 'Lloyd George is Prime Minister. Verdun ends where it began.' },
  { at: [1917, 2], text: 'Germany says its U-boats will sink every ship near Britain, neutral or not. Food is short at home.' },
  { at: [1917, 3], text: 'Revolution in Russia: the Tsar gives up his throne.' },
  { at: [1917, 3], text: 'The Germans pull back to the Hindenburg Line, cutting down every tree and blowing every well behind them.' },
  { at: [1917, 3], text: 'Baghdad is taken from the Turks.' },
  { at: [1917, 4], text: 'America declares war on Germany. Nobody knows when they will come.' },
  { at: [1917, 4], text: 'Arras, 9 April: the Canadians take Vimy Ridge in a morning; then a month of hard fighting east of the town.' },
  { at: [1917, 4], text: 'The French attack on the Aisne fails. There are stories, never in the papers, of French regiments refusing to go up.' },
  { at: [1917, 6], text: 'Messines, 7 June: nineteen mines under the ridge, heard (they say) in London, and the ridge taken by breakfast.' },
  { at: [1917, 6], text: 'German aeroplanes bomb London by daylight. A school in Poplar is hit.' },
  { at: [1917, 7], text: 'Passchendaele, 31 July: the attack east of Ypres begins, and the rain begins with it.' },
  { at: [1917, 10], text: 'The Italians are routed at Caporetto. British and French divisions go to Italy.' },
  { at: [1917, 11], text: 'The Canadians take what is left of Passchendaele village, and the battle ends.' },
  { at: [1917, 11], text: 'The Bolsheviks take power in Russia and ask for peace.' },
  { at: [1917, 11], text: 'Cambrai, 20 November: hundreds of tanks break the Hindenburg Line. The church bells ring at home; within a fortnight most of the ground is lost again.' },
  { at: [1917, 12], text: 'Jerusalem is taken from the Turks.' },
  { at: [1918, 2], text: 'Rationing at home: sugar, then meat and butter.' },
  { at: [1918, 3], text: 'Russia makes peace with Germany at Brest-Litovsk. The German divisions from the east come west.' },
  { at: [1918, 3], text: 'The German offensive, 21 March: in fog, on the Fifth Army. The line goes back forty miles in a fortnight.' },
  { at: [1918, 4], text: 'The Royal Air Force is formed from the Flying Corps and the naval air service.' },
  { at: [1918, 4], text: 'The second German blow, on the Lys. Haig\'s order: "With our backs to the wall ... each one of us must fight on to the end."' },
  { at: [1918, 4], text: 'The navy blocks the U-boat harbour at Zeebrugge, or tries to.' },
  { at: [1918, 6], text: 'The Americans in action at last, in their thousands, at Château-Thierry and Belleau Wood.' },
  { at: [1918, 7], text: 'The last German offensive, on the Marne, is stopped, and the French and Americans counter-attack.' },
  { at: [1918, 8], text: 'Amiens, 8 August: the Germans driven back eight miles in a day. The German commander calls it their black day.' },
  { at: [1918, 9], text: 'The Hindenburg Line is broken at the St Quentin canal. Bulgaria gives in.' },
  { at: [1918, 10], text: 'Lille and Ostend are freed. Turkey gives in. Influenza goes through the army and the country.' },
  { at: [1918, 11], text: 'Austria gives in. The Kaiser gives up his throne and goes to Holland.' },
  { at: [1918, 11], text: 'Eleven o\'clock, 11 November: the Armistice.' },
];

const t = ([y, m]: [number, number]) => y * 12 + m;
/** News after one month, up to and including another. */
export const newsBetween = (after: [number, number], upTo: [number, number]) => WAR_NEWS.filter((n) => t(n.at) > t(after) && t(n.at) <= t(upTo));

export interface YearReview { since: string; sinceLine: FrontLine; news: { month: string; text: string }[] }
/** The war since his last leave, for the year page after it: from the first tour of the year before
 *  (the last review) to this year's first tour. For the first year, since he left for France. */
export function yearReview(w: War): YearReview | null {
  if (w.stage < 2) return null;
  const from: [number, number] = w.stage === 2 ? [1915, 3] : ROTATION_MONTHS[w.stage - 1]!.rotations[0]!;
  const to = ROTATION_MONTHS[w.stage]!.rotations[0]!;
  return {
    since: w.stage === 2 ? 'since you went out' : `since ${monthName(from)}`,
    sinceLine: lineFor(from),
    news: newsBetween(from, to).map((n) => ({ month: monthName(n.at), text: n.text })),
  };
}

/** Everything up to now, newest first, for the Map tab. */
export function newsSoFar(w: War): { month: string; text: string }[] {
  return newsBetween([1915, 3], warMonth(w)).reverse().map((n) => ({ month: monthName(n.at), text: n.text }));
}

/** The review on a year page (y_1916, y_1917, y_1918: the first tour after a leave), or null. */
export function reviewFor(w: War, sceneId: string): YearReview | null {
  return /^y_191[678]$/.test(sceneId) ? yearReview(w) : null;
}
