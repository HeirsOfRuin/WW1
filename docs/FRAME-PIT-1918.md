# FRAME: the pit town, 1918 (2026-11-09)

## The request

> "Go ahead" (2026-11-09), to the recommendation: the pit's 1918, sharing the mill's 1918
> battles, with its own events and an Armistice that closes its threads.

## The design

Two roads, as in 1916 and 1917 (`war.transferred`). The battles are the mill's (`b_spring_*`,
`b_amiens_*`, `b_oct_*`): one battalion, one battle. They already carry paragraphs for every
path, the tunneller's included. Two lines are made the pit's own: the river crossing's simile,
and the retreat over the old Somme ground, which takes a pit man past La Boisselle.

The pit's January event offers the same choice as the mill's (dig the post deep), and sets the
same flag (`dug_deep`), so the shared 21 March reads it for both towns.

**The section's road.**
- January: a disbanded Tyneside battalion's pitmen come in.
- February: Robson hears the German guns moving up through the ground, as he heard the tapping
  in 1915.
- April: the comb-out brings Blackhaugh's starred men into the drafts.
- Bell made a lance-corporal.
- Robson and whether he'll ever go back down the pit.
- Charlton and a French farmer in the advance.

**The tunneller's road.**
- The end of mine warfare: the company on dugouts and bridges.
- Mott goes home with a Blighty one.
- Clearing booby traps and delayed mines from the Hindenburg Line dugouts.

**Both roads.**
- February: the waiting (the tunneller hears it through the ground too).
- July: a letter from his mother.
- August: back past the great crater at La Boisselle, going forward, the crater the tunneller
  fired.
- **The pit's Armistice** (`e_armistice_pit`): the buzzer at eleven, the friends alive or
  remembered, the crew, his father's chair, and whether he'll go back down.

## Tours

Stage 4 is tours 30 to 39: the Spring Offensive tour 32, Amiens 36, October 39, then the
Armistice. Tour pages are 30, 31, 33, 34, 35, 37 and 38.

## Sources to check (tuned, not sourced, until checked)

- Battalions disbanded in February 1918 when brigades went from four battalions to three.
- The 1918 comb-out of miners from the pits for the army.
- La Boisselle retaken in late August 1918.
- Delayed-action mines and booby traps left in German dugouts; tunnellers sent to clear them.

## What will be measured

- `npx tsx tools/story-share.ts 200 pit`: the 1918 share, each road.
- Transcripts of each road to the Armistice, read end to end.
- The validator, style lint, continuity and render scan; `npm run gate` unchanged.

## As built (2026-11-09)

- Twelve events in `front_1918_pit`:
  - The section's road: the Ashington men, Lance-Corporal Bell, the comb-out, Robson and
    after, Charlton and the farmer.
  - The tunneller's road: dugouts, Mott's Blighty one, the traps.
  - Both roads: the ground before 21 March, the July letter, the Glory Hole.
- The 1918 battles are the mill's, now routed for the pit too. 21 March reads the pit's
  warning to the officer, the retreat passes La Boisselle, and the river crossing has a pit
  simile.
- `e_armistice_pit`: Evans singing; Mott, Pascoe; Robson, Bell and Charlton alive or not; the pit
  buzzer at eleven; his mother in his father's chair; whether he goes back down.

**Found by reading transcripts, and fixed.**
- A tunneller back from a wound was told he was "back with the battalion"; the tour page now has
  his own line.
- The ending said "You think of..." three times running when friends were dead.
- The July letter said Joe Todd was about to come out with the comb-out, after he had arrived.

**Measured.**

| | Before | After |
|---|---|---|
| Pit 1918 story share (1,000 games) | 38.9% | 70.2% |
| ... staying with the section | | 51.2% |
| ... going to the tunnellers | | 70.2% |
| Pit, whole game (1,000 games) | 59.1% | 60.1% |
| Mill (shared battles touched) | 55.3% | 55.3% |
| `npm run gate` | | identical, every row |

**Open: the tunneller's road is story-heavy in 1918.** The war layer offers a tunneller no
duties (`rotationStart`: `w.transferred` gives no offer) and a mission on 60% of tours, so his
year has few generic screens; the written events fill most of it. The section's road sits at
51%. The pit test covers 1915-1917; 1918 is left out because so few pit men reach it (about two
screens a game) that 40 games cannot measure it. Bringing the tunneller to 50% would mean
giving tunnellers more work in the war layer, which is a rule change for the author to decide.
