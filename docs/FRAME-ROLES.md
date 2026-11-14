# FRAME: promotions, special assignments, the stretcher-bearer (2026-11-14)

## The request

> "Yes to all three, and begin the framework for the tank transfer, also one for a gunner
> position in the air corps" (2026-11-14). The three were recommended after measuring 2,000 wars
> per policy (ranks, roles, awards): cap the promotions, add special assignments, add a
> stretcher-bearer. The two transfers are designed in FRAME-TANK.md and FRAME-AIR.md.

## 1. Promotions (built)

**What was wrong.**
- Every leave gave a guaranteed step, and earned stripes stacked on it, all the way to company
  sergeant major.
- By the start of 1918, 60% of the men still alive were CSMs (one to a company of about 200),
  34% were officers, and nobody was below sergeant.
- The ladder ran out by 1917, so in the last two years a promotion was no reward.

**The rule now** (`PROMO` in `data.ts`).
- The guaranteed step at leave, and every earned stripe, stop at sergeant.
- Company sergeant major comes only by a vacancy, for a sergeant the officers rate highly
  (standing 80): a 12% chance at a leave, and 4% after a battle.
- An officer rises by vacancies after 1918's battles: lieutenant at a 35% chance (standing 55),
  then acting captain at 25% (standing 70). An acting captain's role reads "company commander".
- Pay gains the two officer rates. The top tier of what the family sees at leave moved from
  £50 to £38, so the third leave still splits two ways.

**Measured** (scratch run, 3,000 wars per policy).

| Rank at the start of 1918 (adaptive) | Before | After |
|---|---|---|
| Sergeant | 6% | 58% |
| Company sergeant major | 59% | 10% |
| Second lieutenant | 34% | 32% |

At the Armistice: sergeant 58%, CSM 10%, second lieutenant 14%, lieutenant 15%, acting captain 3%.

**Gate** (2,000 per policy, % ± 1 SE, before → after).
- adaptive Armistice 5.8 ±0.5 → 5.5 ±0.5; survives 1915 75.7 ±1.0 → 75.7 ±1.0.
- reckless 2.0 ±0.3 → 1.8 ±0.3; careful 4.8 → 4.8; half 4.0 → 4.8 ±0.5.
- Grade (adaptive) 32.3 → 30.6, because rank counts in the record.

Every target holds.

## 2. Special assignments (built)

**What was missing.** A soldier's extra work was fighting work: duties (raids, patrols, wiring,
listening, carrying) and his specialty's missions. The jobs men were detailed for that were not
fighting, some of the strongest stories of the war, were not in the game.

**The rule** (`ASSIGNMENTS` in `data.ts`). On a tour in the line with no course offered, a 12%
chance of an assignment, picked by weight among those open to him. He takes it, or tries to get
out of it.

| Assignment | Open | Take it | Get out of it |
|---|---|---|---|
| Firing party | from 1916 | nerve -8, standing +3 | nerve -2, standing -4 |
| Prisoner escort | after his first battle | nerve +2, standing +1, 1% risk on the road | standing -1 |
| Guiding the relief | any tour | nerve -1, standing +2, 2% risk | standing -1 |
| Burial party | after his first battle | nerve -5, standing +2 | standing -2 |
| Instructor at the divisional school | from 1916, corporal and up with a strong skill | nerve +6, standing +2, a tour out of the line | standing -1 |
| Concert party | the "voice" home skill | nerve +6 | nothing |

- **Scenes.** One per assignment, shared by every town (`assignments.yaml`).
- **Soldier tab.** Each assignment is logged in the career, with whether he did it or got out of
  it.
- **Death wording.** A man killed on the road reads "escorting prisoners back to the cage", or
  "guiding the relief in".

**Measured** (scratch run, 2,000 wars). About 1.1 assignments a war (0.6 per ten tours). Per 100
wars:
- guiding 64, escort 18, burial 17, instructor 5, firing party 7, concert party rare under the
  bots, which never pick the voice.
- Guiding leads because before a man's first battle it is the only job open to him.

**Gate** (2,000 per policy, % ± 1 SE, before → after).
- adaptive Armistice 5.5 ±0.5 → 6.0 ±0.5; survives 1915 75.7 ±1.0 → 75.2 ±1.0.
- reckless 1.8 ±0.3 → 2.4 ±0.3; careful 4.8 → 4.3; half 4.8 → 5.3 ±0.5.

Every target holds. Reckless play is the number to watch: it is near zero, but the highest yet.
The instructor's tour away and the concert party's steadying help everyone, the reckless too.

**Test change.** The farm and city story-share tests now play 120 games, not 40. Their 1917 has
10-15 screens a game, so 40 games was about 500 screens, and the reshuffled wars put them under
44% by noise (41.7% and 43.8%). Over 200 games the shares are 46.7% and 47.7%.
