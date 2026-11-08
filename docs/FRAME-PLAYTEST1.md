# FRAME: Playtest 1 (2026-11-09)

## The author's words

> "The game needs a character tab that tracks skills, traits, awards, career, rank, friends,
> rivals, etc.
>
> The narrative prose needs more depth. I want it to have a touch of a book or life about it.
> Not just snapshots over weeks.
>
> There needs to be more actions and playing out missions. Just taking whether you go or not is
> no fun"

## Classification (playtest protocol: bug / missing control / missing explanation / design)

| Note | Class | Answer |
|---|---|---|
| Character tab | Missing explanation: the state existed, the player could not see it | The Soldier tab (built; `src/game/character.ts`) |
| Prose depth | Design | Continuity between scenes: each tour told as part of a life, not a fresh card (below) |
| Missions played out | Design, and a rule change | Sorties: every duty and role mission in three steps (built; below) |

## Sorties (built)

A duty you go on, and every role mission, plays out in three steps. Each step offers bold,
steady and careful, and some offer turning back. Each choice shows its risk in words from the
resolver. How the steps went decides whether the sortie succeeds; success brings standing,
medals and, for a specialist, merit toward a stripe.

**The rule.** Each step carries a share of the duty's old single-roll hit chance, so a sortie
played steadily is as dangerous as the roll it replaced. Bold ×1.6 risk, 2 points; steady ×1, 1
point; careful ×0.5, nothing; turning back ×0.6, ends it, and costs 6 standing and 4 nerve.
Success needs 3.5 points (3 for wiring, listening, carrying), plus half a point per skill level,
plus luck in −1..1.

**Measured** (adaptive soldier, every step forced, 2,000 runs, same seeds):

| Every step | Sorties that go well | Comes home | Medal | Rank | Grade |
|---|---|---|---|---|---|
| As played (steady, careful when nerve is low) | 72% | 35.2% | 18.9% | 2.42 | 30.8 |
| Bold | **98%** | ~ | +3.3 | 2.36 | 29.6 |
| Steady | 80% | ~ | **+3.5** | **2.48** | **31.4** |
| Careful | 6% | +5.4 | −4.7 | 2.34 | 31.6 |
| Turn back where allowed | 4% | **+7.3** | −8.2 | 1.38 | 19.0 |

Each is best somewhere: bold gets the job done, steady earns most over a war, careful and
turning back bring a man home (turning back with nothing, and often broken: −3.9 Armistice).
Two tries went before: at a success threshold of 3, steady succeeded almost always and bold
bought nothing; at a cheap turn-back, turning back was the best road to the Armistice and the
grade.

**The gate, before → after** (2,000 runs per policy): best play reaches the Armistice 5.6% ±0.5
→ 5.3% ±0.5; reckless 1.6% ±0.3 → 0.5% ±0.2; competent survives 1915 75.0% ±1.0 → 75.3% ±1.0;
going back after 1915 +14.4 → +11.3 grade at a 75% chance of not coming home. All SPEC targets
still met. Medals for the adaptive soldier 22.7% → 18.9%.

**The prototype is retired** with this change (CLAUDE.md): the game no longer plays its war.

## Depth: the book (next)

The fault: a tour is a card. The sergeant wants men; a choice; numbers; the next card weeks on.
Nothing carries from one to the next except what the status line says.

The fix, in order:
1. **Sorties told.** Each step a written scene, the result told in its own words, and the men in
   it named (the friends where they are alive).
2. **The tour as a passage of a life.** A short opening for each tour, written for the month and
   the place (the weather, the food, the post, what the section is talking about), and carrying
   what happened last time: the wound healing, the friend's empty place, the raid that went
   wrong, the medal no one mentions.
3. **Chapters.** A title page at each stage (1915, 1916) with what the year has been, so the war
   reads as a story with parts.

## What will be measured

The gate after every rule change; the validator, style lint, continuity and render scan; and a
full transcript of a year read end to end before each commit.
