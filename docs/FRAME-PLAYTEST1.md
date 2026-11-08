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

## Depth: the book (built, first pass)

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

## As built: the book, first pass (2026-11-09)

- **Every sortie written**: ten kinds (five duties, five roles), three steps each, with a line for
  what you did after every choice and an ending for each sortie in three versions (went well, went
  wrong, turned back). The first step of each duty has a second take, alternating with every
  sortie played, so two in a row never read the same.
- **The tour opens as a passage of the year**: a paragraph for each month, two takes each,
  alternating by tour and by year (the weather, the light, the food, the smell, the work), and
  then what has happened since the last tour, read from the war's own log: back from leave, back
  from a wound, a friend's place taken by a draft lad, a new stripe sewn on crooked, a medal in
  battalion orders that nobody mentions to your face.
- **Two rules changed for it**, both measured: the two duties offered in a tour are now different
  (the same one twice read as a repeat); sortie steps have their own finer risk words, because on
  the battle scale every step read "low risk". Gate after both: best play 5.3% ±0.5 to the
  Armistice, reckless 0.4% ±0.1, survives 1915 75.7% ±1.0, going back after 1915 +10.2 grade.

Still to do for the book: second takes for steps 2 and 3.

## As built: year pages and 1917 (2026-11-09)

- **A title page for each year** (1915 to 1918), each its own chapter so the engine shows it once:
  the year, a subtitle, a soldiers' song of the time as the epigraph ("We're here because we're
  here"; "Hanging on the old barbed wire"; "Oh, it's a lovely war"; "When this lousy war is
  over"), the date, age, rank and role, the section, battles, and the names of the friends killed
  since the last page; then a page of where he stands. The old "France" card is gone (it would
  have come back after every year page). The engine's Station and Purse rows are not shown.
- **1917 for the mill town**: eight events (the caves under Arras; the airman, Bloody April;
  the hunt for Fritz-at-the-crater, which ends with a single shot and no one ever sure; Shaw a
  father or Edith gone to the gasworks lad; Pilling at eighteen; mustard gas and the line of
  blinded men; your mother on the queues and the Ashton explosion of June 1917); Arras in three
  phases (out of the caves into sleet behind a creeping barrage; the cavalry; the counter-attack
  in snow); Passchendaele in four (the duckboards, the pillbox, the shell-hole line, the night);
  the 1917 leave (war bread, the butter saved for a week, the baby's grip, the commission letter
  behind the clock). The tour before Arras is now April (the caves are the night before 9 April).
- **For the author's next playtest**: a man who volunteers often plays sortie after sortie, up to
  a dozen screens in a tour. Is that the pace wanted, or should duties you are detailed for
  (not volunteered) resolve in one line?
