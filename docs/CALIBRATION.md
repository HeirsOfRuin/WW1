# Calibration (Phase 2): for the author's verdict

DESIGN §13, Phase 2: two or three pieces at full polish, judged before anything is written
around them. Vikingr's calibration cut its duel from five moves to three; Knight of Adalia's
found its prose "too long-winded". This round is the mill town, 1915.

## What was built

| Piece | Scene | When it shows |
|---|---|---|
| A rotation event | `v_letter_mill`: a letter and parcel from home; answer properly or send the field postcard | The first call for men from tour 3 on, once |
| A battle phase | `b_loos_advance`: Loos, 25 September 1915, half past six, for a rifleman; a second version when the attack has stalled at uncut wire | Loos, phase 1 |
| A leave | `l_mill_1915`: home in December; your mother remembers how you answered the letter; Mrs Shaw asks after Albert, or her blinds are down | The 1915 leave |
| Two pictures | `loos_advance`, `leave_mill`, from the author's sources | Loos phase 1; every mill-town leave |

Screenshots at phone size: `out/calib/` (made by a scratch script, not committed).

## Decided at calibration (by measurement or by looking)

- **The picture band is 2:1** (400 × 200), not Vikingr's 2.5:1. At 2.5:1 the Loos picture lost
  its sandbagged parapet (the point of the picture) and the mill-town soldier lost his legs.
  About 195 px tall on a 390 px phone.
- **The palette, "Field Service"** (`src/ui/art/palette.ts`, 56 colours): khaki, mud, chalk,
  slate sky, brick, gaslight, gas-green and blood used sparingly, skin, muted fields. The chalk
  is warm and stops short of white: at the first try the chalk of Loos read as snow.
- **The friends have names**: three written friends per town, six more men, surnames among the
  men (`SECTION_NAMES` in `src/game/module.ts`). A dead man is never named as alive: the text
  asks for the nearest living one.
- **Risk is shown in words on every risky choice**, from the resolver. In the stalled version
  the words reverse (walking on: very high; the shell hole: real), which is the point.

## Questions for the author

1. **Voice.** Plain, second person, present tense, short dialogue, fear as body things. Right,
   or too quiet, too long?
2. **Look.** The palette and the band. Does the Loos chalk still read as snow?
3. **Density.** Status line, what the last choice changed, picture, prose, three choices: the
   Loos screen is about a screen and a half, so the choices sit below the fold. Shorter prose,
   or fine?
4. **Risk words.** Shown on every choice ("high risk"). Keep them, soften them, or hide them
   and let the prose carry it?
5. **Names.** Shaw, Duckworth, Pilling for the mill town. Right for the place?

## The author's verdict, round 1 (2026-11-09)

> "The prose isn't quite right. Keep it from sounding too Ai-esque. It should sound real, human,
> emotional at times, hard and action filled when needed, and quiet or cautious in the right
> places. The prose needs to help fill in the other senses that don't get used in this game."

Questions 2-5 (look, density, risk words, names) had no objection; they stand as built.

**What changed.** The style guide's Voice section now holds the author's words and turns them
into rules a writer (or a later session) can follow: at least two senses that are not sight in
every scene, rhythm that follows the moment (hard and short in action, room to breathe at rest,
watchful in caution), comparisons from his own life (the shed, the looms, chapel, the Co-op),
emotion that arrives through a thing and is allowed to land, and a list of what makes prose
sound machine-written (the neat closing quip, lists of three, "not X but Y", summary words,
everything at one temperature). The lint watches for eight of those patterns.

**Round 2** is the slice itself, written to that guide (`content/scenes/war/1915-mill.yaml` and
the shared scenes in `war.yaml`): the enlistment, the last night at home, training; eight
front-line events; all three phases of Loos for a rifleman; the first leave; all seven endings.
