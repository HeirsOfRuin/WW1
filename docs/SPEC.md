# WW1 (working title): spec, draft

Status: **draft, not approved** (2026-11-07). Stage 1 of the game-building workflow
(`Game-Workshop/skills/game-building/SKILL.md`). Nothing is built until the author
approves this page and the kill gate passes.

## The idea, in the author's words

> "A new game, one based on WW1, where you play a recruit who joins the British or
> German army as an 18 year old recruit. You fight in some of the most deadliest and
> famous battles of the war, earning awards, promotions, making friends, nameless or
> even faceless rivals, etc." (2026-11-07)

## Pitch

An 18-year-old volunteer, August 1914 to the Armistice. You do not choose the war, the
battles or the orders. You choose how much of yourself you spend inside them, and on whom.

## The design problem to solve first: agency

A private controls almost nothing. If the game hands him strategic choices it stops being
the First World War; if it gives him none it is a slideshow with dice. The lever is
**exposure**: the calendar and the battles are fixed, but how much risk he takes, when,
and for whom is his. Volunteer for the raid or keep your head down. Go back for a mate or
keep moving. Take the stripe and the responsibility, or stay one of the lads.

## Loop

| Layer | Turn | What the player decides |
|---|---|---|
| Rotation (systemic) | One cycle, about 2-3 weeks: front line, support, reserve, rest | Which duties to volunteer for (wiring party, raid, listening post, sniping, carrying); report sick or not; how to spend rest |
| Battle (authored set piece) | 4-8 phases: the approach, the assault, the consolidation, the counter-attack | Personal choices under fire. Chance moves numbers; it never decides what beats what |
| Between | Leave, letters, courses (bombing, Lewis gun, NCO), transfers after wounds | Where to put your standing and time |

## Scarce resource

**Nerve.** Spent by shellfire, losses and raids; recovered slowly by rest, leave and friends
still alive. Low nerve locks options, and the locked option says why. Supporting stats:
health (wounds), standing (with NCOs and officers: promotion, choice of duties) and the
section (8-10 named men, each with a bond).

## Per-turn decision

How much exposure to accept this rotation, and for whom: yourself (standing, awards), your
mates (their survival, your nerve), or nobody (you survive; standing falls; the section notices).

## Ways to lose

1. **Killed.**
2. **Broken.** Nerve reaches zero: shell shock, evacuated, your war ends.
3. **Court-martial.** Desertion, cowardice, striking a superior.

Not losses: a wound (a time skip, often a new battalion), capture (a branch that ends the
fighting; a prisoner chapter is a later feature).

## One way to win

Be alive on 11 November 1918. The grade is what you bring home: rank, awards, men of your
first section still alive, nerve left.

## Ranks and awards: the case for two armies

| | British | German |
|---|---|---|
| Ladder | Pte, L/Cpl, Cpl, Sgt, CSM; commission from the ranks common by 1917-18 | Soldat, Gefreiter, Unteroffizier, Vizefeldwebel, Offizierstellvertreter; commission from the ranks rare |
| Awards | Mention in Despatches, Military Medal (from 1916), DCM, VC | Iron Cross 2nd class (common), 1st class (rare), state orders |
| Discipline | Death sentences carried out far more often | Far fewer executions |

Every award must change something (rule 2): leave, standing, course places, commission
eligibility, how replacements treat you. An award that only displays is cut.

## Battle calendar (to be checked against sources before writing)

| Year | British track (Kitchener volunteer, overseas at 19) | German track (Kriegsfreiwilliger) |
|---|---|---|
| 1914 | Training | First Ypres / Langemarck (the volunteer regiments) |
| 1915 | Loos | Second Ypres or Champagne |
| 1916 | The Somme | Verdun, the Somme |
| 1917 | Arras, Passchendaele, Cambrai | Arras or Passchendaele |
| 1918 | The Spring Offensive (defending), the Hundred Days | Operation Michael, the retreat |

One man at every famous battle is a stretch. Wounds, transfers and reconstituted battalions
route him there; the game says when that routing happened.

## Friends and rivals

- **Section:** 8-10 named men with bonds. They are killed, wounded, transferred and replaced
  by strangers. The dead stay dead (game-narrative continuity tool).
- **Rivals in your own lines:** an NCO who has it in for you; a man after the same stripe.
- **Faceless rivals across the wire:** a sniper or an opposing regiment that recurs, known only
  by what it does (a periscope shot out, a man dropped at the same loophole).
- **Later option:** both tracks share one world, so the British track's faceless enemy is the
  German protagonist's unit and the reverse. Strong hook, doubles the continuity load.

## Scope (recommended)

- One army first. British: longer rank ladder (commission), clearer award ladder, more
  English sources. German as the second start after the first ships, with the F10
  scope-widening check.
- Western Front only.
- Not a tactics game: the player never moves units on a map.
- A fictional battalion inside a real division's battles: accuracy without misattributing
  deeds to real units.
- Shape C (Vite + Preact + TS + YAML) with game-narrative, as Knight of Adalia and Vikingr.

## Distance from the built games

Closest: Knight of Adalia and Vikingr (a life RPG), The Lists (a career ladder). New here:
no strategic control, a fixed calendar, and nerve rather than money or land as the thing
you run out of. If the kill gate shows exposure is not a real choice, this is a reskin of
Vikingr and should not be built.

## Kill gate (Stage 2)

Numbers-only sim of the rotation loop and generic battles, no UI, in `prototypes/`.
Policies x seeds (about 200+ each): always volunteer, never volunteer, mates first,
standing first, adaptive (spend nerve, rest when low). Measure survival to the Armistice,
end rank, awards, section survivors, nerve left, and the cause of each loss.

Passes if: no policy dominates on both survival and grade; "never volunteer" survives more
but grades poorly and risks a court-martial path; every policy has a losing route.

## Open questions for the author

1. British first? (Recommended.)
2. One life per run (shorter, replayable through different regiments and enlistment years),
   or one long story where death is an ending?
3. Target share of runs that reach the Armistice.
4. Art: text only, or period-photo pixel scenes (the Vikingr pipeline)?
5. Real battalion, or a fictional one in real battles? (Fictional recommended.)
