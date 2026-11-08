# FRAME: 1918, the mill town (2026-11-09)

## The request

> "Go ahead" (2026-11-09), after the story change, to the offer: 1918 for the mill town (the
> Spring Offensive, the Hundred Days, the Armistice; the subaltern path).

## What 1918 has to do

1. **Lift the 1918 story share.** Before this, 1918 was 25.4% story for a player who volunteers
   half the time, because nothing was written for it (FRAME-STORY.md).
2. **A defence battle.** The Spring Offensive is the only battle in the war where the Germans
   attack and he can be captured. The war layer doubles the chance of capture if he goes to
   ground (`capture` 0.05, ×2 on ground). The words have to make that legible without saying
   which choice is best: men who stay down in the dugouts are the ones who are taken.
3. **The subaltern.** A man commissioned at the 1917 leave fights 1918 as a platoon officer.
   His friends are now his men. Every battle opening has a paragraph for him, and he has an
   event of his own: censoring the platoon's letters.
4. **Pay off four years.** Each living friend's thread closes, and the mill-town Armistice
   remembers what was chosen.

## The design rule (unchanged from 1916)

One scene per battle phase, with paragraphs for each path. Events change nothing in the war's
numbers (option A), so the gate does not move.

## Tours

Stage 4 is tours 30 to 39. Battles: the Spring Offensive on tour 32 (21 March), Amiens on tour
36 (8 August), October on tour 39. The war ends after tour 39. Seven tours can carry an event:
30, 31, 33, 34, 35, 37, 38.

| Tour | Month | Event (pool `front_1918_mill`) |
|---|---|---|
| 30 | January | The French line: posts, not a trench; dig deeper or get the stove going |
| 31 | February | Waiting: the sweep on the date (21 March 1918 was a Thursday) |
| 32 | March | Battle: four defence phases (the fog, out of the fog, the retreat, the embankment) |
| 33 | April | Backs to the wall: the order read out; the eighteen-and-a-half drafts; Pilling's lad |
| 34 | May | One of: three-day fever (the first influenza), the Americans (Duckworth), censoring (subaltern) |
| 35 | July | Keep your mouth shut: the secret move up; the letter that Jack has his papers |
| 36 | August | Battle: Amiens in three phases |
| 37 | August | The old ground: back over the 1916 battlefield, going forward |
| 38 | September | One of: Shaw's photograph, the Americans, censoring |
| 39 | October | Battle: the river and the village, three phases; then the Armistice |

**The calendar change.** Tour 35 moves from June to July 1918 (`ROTATION_MONTHS`), so the move
up for Amiens is dated the month it happened. It changes dates only, not the war's numbers.

## Sources to check (marked as tuned, not sourced, until checked)

- 21 March 1918: the bombardment from about 04:40, in fog; the infantry from about 09:40.
- The Commander-in-Chief's order of 11 April 1918 ("backs to the wall"), paraphrased, not quoted.
- Drafts of eighteen-and-a-half-year-olds sent to France after March 1918.
- "Keep your mouth shut" notices in pay books before Amiens.
- Amiens: 8 August 1918, 04:20, fog, tanks, no preliminary bombardment.
- The old Somme ground retaken in late August 1918.
- Influenza: a first wave in early summer ("three-day fever"); the deadly wave at home in
  October and November 1918.

## What will be measured

- `npm run story`: the 1918 story share, and the test widened to include 1918.
- `npm run gate`: unchanged (no rule or number touched).
- The validator, style lint, continuity (every living-friend line guarded) and the render scan.

## As built (2026-11-09)

- Nine events in `front_1918_mill`. The dated ones are pinned to their tour (`war.tour == N`):
  a man back from a wound read "April" in July, and the July letter about Jack was crowded out,
  in the first transcript read.
- Ten battle phases: four for 21 March (a paragraph for each of the eight paths in the first),
  three for Amiens and three for October, each attack with a stalled version.
- `e_armistice_mill`: the eleventh hour, then each friend alive or remembered, the town's
  buzzers and the influenza, and Jack, from the choices made in 1918 and before.
- **Wording fixed for every town:** a battle in a sentence ("Killed at Spring Offensive" became
  "in the German offensive, in March"; `BATTLE_WHERE`), and the rank in the Armistice ending
  ("22 years old and Company sergeant major" became "and company sergeant major").

**Measured.**

| | Before | After |
|---|---|---|
| 1918 story share (`npm run story`, 200 games) | 25.4% | 51.8% |
| Whole game | 53.6% | 55.3% |
| `npm run gate` | | identical, every row (no rule or number touched) |

The test "the story leads" now covers 1918 as well (each year 44-70%).

**What a player sees in 1918 depends on luck.** About six screens a game on average, because
most men do not live to see it. A man who reaches the Armistice sees at most seven of the nine
events (one per tour page); in the three Armistice runs read, he saw four or five, because
wounds and courses take him out of the line. Which ones depends on which tours he is in for.
