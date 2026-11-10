# FRAME: the farm and city towns, 1916 (2026-11-10)

## The request

> "Continue" (2026-11-10), to the recommendation: the farm and city through 1916.

## The design

Each town's first of July was a different place, so each opens on its own; the rest of the day
and the October battle are shared with the mill where the mill's scenes already fit.

| | Farm | City |
|---|---|---|
| Where | Mametz: the Devons from Mansel Copse, cut down by the machine gun at the shrine; the village taken in the afternoon | Gommecourt: the London division's diversion, behind smoke; into their trench, cut off, back at dark |
| Phase 1 | `b_somme_farm_1` | `b_somme_city_1` |
| Phase 2 (into their trench) | mill's `b_somme_2` | mill's `b_somme_2` |
| Phase 3 | `b_somme_farm_3` (Mametz village) | mill's `b_somme_3` (cut off, bombed out) |
| Phase 4 | `b_somme_farm_4` (the slope at night) | mill's `b_somme_4` (back at dark) |
| October | mill's `b_somme_autumn_*` | mill's `b_somme_autumn_*` |

The mill's phase 3 compared counting rounds to counting picks on a loom; it now has a line per
town.

**Farm events.**
- The tribunal exempts a neighbour's sons.
- A new officer, a grammar-school clerk.
- A French sheepdog finds Cottle.
- The ringers at home ring a quarter peal for the Dunsworthy men.
- The clay model of the ground before Mametz.
- The Devonshires buried in their own trench.
- The harvest got in by women and schoolboys.

**City events.**
- Miss Holland becomes Florence.
- Webb's first notebook, kept.
- Fenton's father sends a new ball painted LOOS, 1915.
- Marsh's Sunday-school letters.
- The trench dug in no man's land, and the rumour of the feint.
- The London lists.
- The airship shot down over Cuffley.

## Sources to check (tuned, not sourced, until checked)

- The 8th and 9th Devons at Mametz, 1 July 1916; the machine gun at the shrine; an officer's
  model of the ground; the dead buried in their own trench (Mansel Copse) and the board, "The
  Devonshires held this trench; the Devonshires hold it still".
- The 56th (London) Division at Gommecourt, 1 July 1916, a diversion: a new trench dug in no
  man's land in May, smoke, the German trenches entered and lost by evening.
- Military Service Act tribunals exempting farmers' sons.
- The airship shot down at Cuffley, 3 September 1916, seen across London.
- A quarter peal of Grandsire Doubles is 1,260 changes.

## As built (2026-11-10)

- **Farm.** Seven events (`front_1916_farm`), the Mametz scenes (`b_somme_farm_1/3/4`) and the
  leave (`l_farm_1916`).
- **City.** Seven events (`front_1916_city`), the Gommecourt opening (`b_somme_city_1`) and the
  leave (`l_city_1916`).
- **Shared with the mill.** Phase 2 for both towns; phases 3 and 4 for the city; October for
  both. The mill's phase 3 loom simile now has a line per town.

**Found by reading transcripts, or before, and fixed.**
- The farm's tribunal letter and the new officer's arrival named Cottle and Bert as alive in
  runs where they were dead.
- "Nippies" (Lyons waitresses) is a name from the 1920s.

**Measured** (`npx tsx tools/story-share.ts 200 <town>`).

| | Before | After |
|---|---|---|
| Farm 1916 story share | 27.4% | 50.6% |
| City 1916 story share | 26.4% | 49.1% |
| Farm, whole game | 42.6% | 49.2% |
| City, whole game | 44.1% | 51.1% |
| Mill, whole game (shared scenes touched) | 55.3% | 55.3% |
| `npm run gate` | | identical, every row |

The farm and city tests now cover 1915 and 1916 (each 44-70%).
