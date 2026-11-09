# FRAME: the pit town, 1916 (2026-11-09)

## The request

> "Go ahead" (2026-11-09), to the recommendation: the pit through 1916 next, because the
> tunnelling choice is set up and leads nowhere written.

## The problem

At the start of 1916 a pit man with digging is offered the tunnellers (`w_tunnel_pit`). Taking
it changes his war (`war.ts`): he leaves the section for good, his path is `tunnel`, a crew of
four stands in for his friends, and his missions are listening and camouflets. His three
friends go on fighting with the battalion and can still be killed (`finishWar` and the section
loss run on without him), but he is never present when it happens.

Until now both roads were generic in 1916, and a pit rifleman read the generic Somme.

## The design: one year, two roads

Events are tagged by road (`requires: war.transferred` or `{ not: war.transferred }`), and the
two battles carry a paragraph for every path, the tunneller included.

**The section's road.** The pit company attacks at La Boisselle on 1 July, beside the great mine.
Bell's brother is a conscientious objector (the Military Service Acts, 1916). Robson is given
the company's pigeons for the attack. The week's bombardment. July after. Charlton and a mule in
the autumn mud. Their father put on light work at bank.

**The tunneller's road.** The first shift underground in France: chalk, not coal, worked in
socks so the Germans can't hear. The crew: Evans from the Rhondda (out in last July's strike),
Pascoe, a Cornish tin miner, and Mott, a London clay-kicker who dug the Tube. The geophone and
the German miners talking on the other side of the chalk. Packing the charge for 1 July. A
visit to the battalion at rest to find out who's alive. On 1 July he is at the firing point when
the mine goes up, and then goes over with the sappers to the crater.

**Shared.** The letter from home, and the 1916 leave, which knows which road he took.

**The autumn battle.** The Butte de Warlencourt, the chalk mound the Northumbrian battalions
attacked in the autumn mud of 1916.

**The friends' deaths, for a tunneller.** The scenes already handle "not present". A tunneller
hears by letter from home or from a battalion man met behind the lines, not at the ration dump.

## Tours

Stage 2 is tours 10 to 19. Tour 14 is 1 July (July); tour 18 is the autumn battle (October).
Tour pages: 10 (February), 11 (March), 12 (May), 13 (June), 15 (July), 16 (August), 17
(September), 19 (November).

## Sources to check (tuned, not sourced, until checked)

- The La Boisselle mine fired at 07:28 on 1 July 1916; zero at 07:30; the attack there by
  Northumberland battalions, with very heavy loss from machine guns in the village.
- Tunnellers worked chalk with bayonets and kept silent; listening by geophone from 1916;
  canaries and mice for gas; Proto rescue sets (familiar from colliery rescue brigades).
- Clay-kickers recruited from London Underground and sewer work, paid six shillings a day.
- The Military Service Acts (January and May 1916); conscientious objectors before tribunals.
- The Butte de Warlencourt attacked in October and November 1916, in mud.

## What will be measured

- `npx tsx tools/story-share.ts 200 pit`: the 1916 share (29% before), on both roads.
- Transcripts of a 1916 on each road, read end to end.
- The validator, style lint, continuity and render scan; `npm run gate` unchanged.

## As built (2026-11-09)

- Twelve events in `front_1916_pit`, tagged by road:
  - The section's road: the ones who went under, Matty Bell, the pigeon basket, the
    bombardment, July, the mule.
  - The tunneller's road: the first shift, the crew, the charge, the geophone, a visit to the
    battalion.
  - Both roads: the father's letter.
- The first of July at La Boisselle in four phases. The mine, the crater, the afternoon (Robson's
  bird let go from the crater, or yours if he's down), and the night. Every 1916 path has a
  paragraph, the tunneller's at the firing point.
- The Butte in three phases; `l_pit_1916`, which knows which road he took.
- **The friends' deaths, for a tunneller.** His friends die without him there, so the scenes give
  him the news from the battalion, worded so it reads right even in the middle of a battle.
- **The tour page, for a tunneller.** It said "there are gaps in the section now" to a man who
  had left the section. It now says the news comes over from the battalion.

**Found by reading transcripts, and fixed.**
- The death news first said "at the shaft head, at the change of shift", but it can come in the
  middle of 1 July.
- The transport sergeant walked over to the tunnellers to tell him about Charlton.
- Bell was "quiet since the drill hall", but the pit enlisted at the Miners' Hall.

**Measured** (`npx tsx tools/story-share.ts 200 pit`; the roads with a scratch run of 200 each).

| | Before | After |
|---|---|---|
| Pit 1916 story share | 29.2% | 58.5% |
| ... staying with the section | | 52.7% |
| ... going to the tunnellers | | 58.6% |
| Pit, whole game | 47.1% | 55.4% |
| `npm run gate` | | identical, every row |

The pit test now covers 1915 and 1916 (each 44-70%).
