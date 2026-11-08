# FRAME: The story leads (2026-11-09)

## The author's words

> "I think we will set it up to follow a story more so than just just playing generic missions.
> Have a general play through (only volunteering half the time) to split between story and
> generic missions 50/50"

## What was wrong

Measured before the change, a mill-town game was 23% story screens and 77% generic ones. Every
tour opened on the sergeant asking for men, and every duty played out in three sortie steps,
so the duty board took over the game. The authored story (the friends, the sniper, the letters,
the battles) appeared once a tour, between those steps.

## The change (built)

**Each tour opens on its own page (`w_tour`).** The page gives the month, the weather and the
smell of the line, and what happened last tour. It is one tap ("Go on." / "Another tour.").
The year's title page and the mill town's story events are routed here (`war.pending == tour`),
so the story comes first in each tour and the duty board second. There are 12 months with 2
takes each, plus carry-over lines.

**At most one duty is offered per tour, on 60% of tours** (`ROLE.dutyChance`). Before, every
tour offered one. A tour with no duty goes straight to the next tour page.

**Ordered duties happen off-screen.** When you are detailed for a duty, or you turn down a
role mission, it now plays out by itself at steady (`autoSortie`). The next tour page reports
it in one line. Before, you played all three steps of a duty you had said no to, which made
"no" a longer path than "yes".

**The war kept its difficulty.** Fewer duties meant less risk, so each duty got harder:
- duty hit chance ×1.25 and nerve cost ×1.5 (raid 0.15 and 12);
- each stage's nerve drain +2 (7, 8, 9, 9);
- turning back on a sortie costs 6 standing and 4 nerve.

## The test: `npm run story`

`tools/story-share.ts` plays 200 mill-town games through the engine with the `half` policy
(volunteers on every other offer, takes every other mission, plays every step steady). It
counts each screen as story or generic. Generic means `w_*` (except `w_tour`), sortie steps
`s_*`, and sortie results `x_*`. Story is everything else. The test "the story leads" fails if
the 1915, 1916 or 1917 share leaves 44-70%.

| | Before | After |
|---|---|---|
| Whole game | 23% | **53.6%** (76 screens a game) |
| 1915 | | 61.6% (34 a game) |
| 1916 | | 50.9% (24 a game) |
| 1917 | | 48.7% (13 a game) |
| 1918 | | 25.4% (5 a game; 1918 is not written yet) |

**The caveat.** The 53.6% counts `w_tour` as story. It is written prose, not a decision, but
it is a short page, and it is the most-seen screen (14 a game). Counted as generic, the share
would be about 35%. The rest of the gap closes with written content: 1918 for the mill town,
and the other three towns, which still play only generic scenes.

## The gate (2,000 runs per policy; % ± 1 SE)

| | Before (`25f6c70`) | After |
|---|---|---|
| adaptive: Armistice | 5.3 ±0.5 | 5.5 ±0.5 |
| adaptive: survives 1915 | 75.3 ±1.0 | 75.6 ±1.0 |
| adaptive: broken | 13.1 ±0.8 | 14.9 ±0.8 |
| reckless: Armistice | 0.5 ±0.2 | 1.8 ±0.3 |
| careful: Armistice | 5.0 ±0.5 | 4.2 ±0.4 |
| mates: Armistice | 4.0 ±0.4 | 3.0 ±0.4 |
| climber: Armistice | 0.3 ±0.1 | 0.8 ±0.2 |
| half: Armistice | | 4.4 ±0.5 |
| Leave 1, go back vs take (grade) | 39.3 vs 28.0 (+11.3) | 39.6 vs 26.1 (+13.5) |

The targets still hold: best play 5-10%, competent play survives 1915 60-75% (75.6, on the
edge). Reckless play rose from 0.5% to 1.8%, because it now meets fewer duties. That is still
"near zero", but it is the number to watch. On the first retune it reached 5.2%, and the
nerve and duty changes above brought it back down (`out/gate-story-1..6.txt`, not committed).
Broken rose two points because nerve does more of the killing now; the war is as hard but
wears you out more.
