# FRAME: the farm town, 1915 (2026-11-09)

## The request

> "Contine" (2026-11-09), to the recommendation: the farm town's opening and 1915 next.

The tunneller's 1918 story share (70%, FRAME-PIT-1918.md) is left as it is, as recommended; the
author did not ask for the rule change.

## The town

Dunsworthy, a fictional farming village on the edge of Exmoor, Devon: hill farms, a squire at the
big house, a church with a ring of six bells, sheep on the moor, the market at South Molton. The
section's names were already West Country (`SECTION_NAMES.farm`). Speech is Devon, in dialogue
only and lightly: 'ee (you), maid (girl), proper, dreckly, my lover, where's it to. His
comparisons come from the land: the plough, the threshing engine, the harvest, lambing, the moor
in fog, the rookery, the church bells.

Two service battalions of the Devonshire Regiment attacked at Loos on 25 September 1915 and lost
heavily, near the Lone Tree, a single cherry tree standing in no man's land. That is the farm
company's Loos.

## The three friends (`SECTION_NAMES.farm`)

| | Who | Thread in 1915 |
|---|---|---|
| Will Cottle (mate 1) | Shepherd's son, slow-spoken, left his dog Fly with his father | Counting the flock: the roll call after Loos |
| Dan Pearce (mate 2) | The poacher; fieldcraft, quick, in trouble | Out into no man's land the first night; caught with a hare by the military police |
| Bert Yeo (mate 3) | Rang the tenor bell; chapel-quiet, eighteen | A church bell in a French village |

And a man who is not in the section: young Mr Venn, the squire's son, the platoon officer. You
were a beater on his father's shoots. He offers to take you as his servant.

## The design rule

The pit's structure: a pool of events (`front_1915_farm`) on the tour page, chained by flags;
Loos in three phases (`b_loos_farm_*`); the leave reads the choices; a death scene per friend.
Events change nothing in the war's numbers.

## Sources to check (tuned, not sourced, until checked)

- The 8th and 9th Devons at Loos, 25 September 1915; the Lone Tree.
- Farm horses requisitioned by the army in August 1914.
- Nightingales singing behind the line; soldiers helping French farmers with the harvest.
- Field Punishment No. 1.
- Bells, gongs and shell cases used as gas alarms.

## What will be measured

- `npx tsx tools/story-share.ts 200 farm`: the 1915 share; a test holds it at 44-70%.
- A transcript of a farm 1915, read end to end.
- The validator, style lint, continuity and render scan; `npm run gate` unchanged.

## As built (2026-11-09)

- `c_enlist_farm` rewritten as the harvest supper, where the squire asks for Dunsworthy men for
  his son's platoon.
- Nine events in `front_1915_farm`: the hare in the wire, the letter (the horses requisitioned),
  Mr Venn and the servant's offer, the French church bell, Pearce on the wheel, the French
  harvest, moving up to the Lone Tree, the count, Mrs Venn's letter.
- Loos in three phases for the farm company, at the Lone Tree; routed above the mill's Loos.
- `l_farm_1915`, remembering the choices; `farm-friends.yaml`, a death scene for each friend.
- **Mr Venn dies at Loos in every run.** He is not one of the section, so the war layer does not
  decide his fate. His death is the farm's fixed loss; the leave's big house and Mrs Venn read it.

**Found by reading transcripts, and fixed.**
- The roll call said "you were with Mr Venn when it happened", which is false for a man wounded
  before Loos; it now rests on being his servant.
- The age line printed "eighteen, sir." in lower case.
- The farm horse shared a name with the pit pony.
- A hill named for Cottle's landmark was a real place with no such tree; it is now the village's
  own down.

**Measured** (`npx tsx tools/story-share.ts 200 farm`).

| | Before | After |
|---|---|---|
| Farm 1915 story share | 49.2% | 61.5% |
| Farm, whole game | 35.6% | 42.6% |
| `npm run gate` | | identical, every row |

A test holds farm 1915 at 44-70%. The farm's 1916-1918 are generic (27% story in 1916).
