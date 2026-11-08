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
