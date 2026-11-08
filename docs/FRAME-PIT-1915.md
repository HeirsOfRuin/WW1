# FRAME: the pit town, 1915 (2026-11-09)

## The request

> "Go ahead" (2026-11-09), to the offer: write one other town's opening and 1915, to see
> whether the friend-thread structure carries over.

## Why the pit first

- The pit has a trade the war layer already knows: a pit man with digging is offered the
  tunnellers at the start of 1916 (`war.ts`, `pending: tunnel`). Until now that offer was two
  lines of generic text.
- Loos was fought across a French coalfield: pit heads, winding towers, slag heaps, miners'
  rows. A pit company attacking there sees home in it. That is the town's Loos.
- Until now a pit player read the mill's Loos ("like every steam pipe in the shed") and the
  mill's training page. Those leaks are closed (below).

## The town

A fictional Northumberland pit village, Blackhaugh: the rows, the pit heap that has smouldered
for years, the Miners' Hall, the Primitive Methodist chapel, the colliery band, pigeon crees.
Speech is pitmatic, in dialogue only and lightly: aye, howay, marra (workmate), bairn, bait
(packed food), gan (go), divvent (don't), wor (our), hinny. His comparisons come from
underground: the roof talking before a fall, the cage, the lamp, bad air, the face, the pony.

## The three friends (`SECTION_NAMES.pit`)

| | Who | Thread in 1915 |
|---|---|---|
| Tommy Robson (mate 1) | Your marra at the face. Says nothing; pigeon man, like his da | Hears the Germans digging under the trench on the first night; the army's pigeon loft |
| Jim Bell (mate 2) | Talker, union man, reads the Herald | The baths in the brewery vats, and the Welsh miners' strike of July 1915 |
| George Charlton (mate 3) | The pony driver; gentle with animals | The mules before Loos; wants the transport lines after it |

## The design rule

The mill's structure, kept: a pool of events (`front_1915_pit`) on the tour page, chained by
flags; Loos in three phases; the first leave remembers the choices; each friend has a death
scene with a choice the leave reads. Events change nothing in the war's numbers (option A).

## What is pit-only

1. **The tapping.** On the first night Robson hears German miners under the trench. Report it
   or not. In July they blow the mine; whether the bay was thinned out depends on that choice.
2. **The lamp tokens.** The roll call after Loos is told as the token board at the lamp cabin:
   the tokens left on the board are the men still down.
3. **The tunnellers' offer (January 1916)** written for the pit (`w_tunnel_pit`), remembering
   the tapping and the mine.

## Leaks closed for every town

- Training: "the way you never knew them in the shed" is now worded for each town.
- 1918 year page: "you can't remember the shed" is now worded for each town.
- A patrol in fog: "thick as the shed on a damp morning" is now worded for each town.

## What will be measured

- `npm run story` for the pit (`tools/story-share.ts` takes a town): the 1915 share.
- The validator, style lint, continuity (pit friends guarded) and the render scan.
- A transcript of a pit 1915 read end to end.
- `npm run gate`: unchanged (no rule or number touched).

## As built (2026-11-09)

- `c_enlist_pit` rewritten (the Miners' Hall queue, the three friends introduced).
- Nine events in `front_1915_pit`: the tapping, the letter, the army's pigeon loft, the baths and
  the Welsh strike, the mine, moving up to the coalfield, the lamp tokens, the transport lines.
- Loos in three phases for the pit company: the winding towers, the miners' rows and their
  cellars, the burning slag heap. Routed above the mill's Loos for `start == pit`.
- `l_pit_1915`, remembering eleven choices, and `w_tunnel_pit` for the January 1916 offer.
- `pit-friends.yaml`: Robson, Bell and Charlton each have a death scene.
- The leaks closed as planned (training, the 1918 year page, the patrol in fog).

**Found by reading transcripts, and fixed.** Loos (25 September 1915) was a Saturday, not a
Sunday. The tunnellers' officer said "last July" and "January" when the mine and the offer can
fall in other months. The baths opened "July." when shown in August. Robson said his tunnelling
mate had already signed up, but the war layer keeps him in the section, so he now stays.
"Bolshie" was an anachronism in 1915.

**Measured.**

| | Before | After |
|---|---|---|
| Pit 1915 story share (`npx tsx tools/story-share.ts 200 pit`) | 49.0% | 61.3% |
| Pit, whole game | 38.5% | 47.1% |
| `npm run gate` | | identical, every row |

The pit's 1916-1918 are still generic (about 29% story), which is why its whole-game share sits
below the mill's 55.3%. A test now holds pit 1915 between 44% and 70%.

**Does the structure carry over?** Yes, with no code change. A pool per town and year, flags
prefixed by town, a death scene per friend, and the leave read from both. The one thing a new
town needs from the code is a route line per scene, and the story tool's classifier needs any
town-written `w_` scene named in it (`w_tunnel_pit`).
