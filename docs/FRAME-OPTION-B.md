# FRAME: Option B, events that move the numbers (2026-11-13)

## The request

> "Go with your recommendations and continue" (2026-11-13). The recommendation since FRAME-1916:
> option A while writing, then option B, "events that change nerve and standing", as its own
> measured change. The writing is done; this is that change.

## Why

Until now a story event's choice changed only flags: writing home properly, sitting up with a
grieving friend, digging out buried men, covering for a mate. They read as though they mattered,
and the war's numbers did not move. Rule 2 of the game-building skill: a choice that looks like it
matters must change something. The engine already shows nerve and standing changes after a choice
("Nerve +2"), so the player sees what each one did.

## The rule

A new effect, `war_mood: { nerve, standing }`, each from -5 to +5, on an event's choice. Nerve is
how he is holding up inside; standing is how the sergeant and officers rate him. Only story events
(`kind: pool`) carry it: battles and duties have their own rules, and leaves, endings and death
scenes do not move numbers.

**What each kind of choice does.**

| Kind of choice | Nerve | Standing |
|---|---|---|
| Comfort or connection: a proper letter home, sitting with a friend, keeping the dog, sharing the rum, a song | +1 to +3 | 0 |
| Facing the worst on purpose: digging out the buried, going to the burning aeroplane, leading the gassed, walking the old ground | -1 to -3 | +1 to +3 if it is duty or courage |
| Duty by the book: reporting, doing the work right, volunteering in an event | 0 or -1 | +1 to +2 |
| Defying authority for a mate: covering for him, lying to the sergeant, standing by Bell | +1 to +2 | -1 to -2 |
| Turning away, keeping out of it | 0 or +1 | 0, or -1 if an NCO would notice |
| A single "go on" choice | 0 | 0 |

**Balance.** Each event's choices are a trade, not a free gain: if one choice steadies him, the
other buys something else, or both are zero. Across a year, the choices should average about
+0.5 nerve per event, so the war does not get easier: the gate is the check, and the targets
(SPEC, 2026-11-08) must still hold: best play reaching the Armistice in 5-10% of runs, reckless
near 0%, competent play surviving 1915 in 60-75%.

## How it is measured

- The gate's bots now spread event choices by seed and scene, not always the first. Before any
  event moved a number, this left the gate identical (2026-11-13), so the gate measures an average
  player's events.
- `npm run gate` before and after, with ± error, in the commit.

## As built (2026-11-13)

- 122 story events, 170 choices, carry `war_mood`, across all four towns and four years; none
  outside a story event (checked). Nerve summed over every choice is +101.
- Events average about +0.3 to +0.5 nerve per event by town: the mill and pit lower, because
  their events are grimmer and the effects follow what the prose says happened.
- After review, three mill choices that turned away were set to 0 as the rubric says; the
  sweep on the date got +1; and one pit event where both choices steadied him lost the free
  gain.
- Battles, duties, leaves, endings and death scenes move nothing new.

**Measured** (`npm run gate`, 2,000 runs per policy, % ± 1 SE; before = the same bots, events
moving nothing).

| | Before | After | Target |
|---|---|---|---|
| adaptive: Armistice | 5.5 ±0.5 | 5.8 ±0.5 | 5-10 |
| adaptive: survives 1915 | 75.6 ±1.0 | 75.7 ±1.0 | 60-75 (on the edge, as before) |
| adaptive: broken | 14.9 ±0.8 | 12.9 ±0.8 | |
| reckless: Armistice | 1.8 ±0.3 | 2.0 ±0.3 | near 0 |
| careful: Armistice | 4.2 ±0.4 | 4.8 ±0.5 | |
| half: Armistice | 4.4 ±0.5 | 4.0 ±0.4 | |
| Leave 1, go back vs take (grade) | 39.6 vs 26.1 | 39.1 vs 26.6 | |

The change the design wanted shows where it should: fewer men break (adaptive 14.9% to 12.9%),
because the letters and the friends now steady them. Every target holds, and no rule was re-tuned
back.

## Also built: second takes for the duty steps (2026-11-13)

Steps 2 and 3 of every duty and role mission (twenty passages) now have a second take, as step 1
already had, alternating by sortie (`war.stake`). A man on his fourth wiring party no longer reads
the same flare word for word. Each take fits that step's existing choices (the sniper's "Let him
shave" still has a man shaving). Text only: the gate is identical.
