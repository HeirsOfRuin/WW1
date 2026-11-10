# FRAME: the city town, 1915 (2026-11-10)

## The request

> "Go with any opening to the end of 1915 not yet completed" (2026-11-10). The mill, pit and farm
> are written through 1915; the city is the one left.

## The town

London. The city company is clerks from the insurance offices, banks and shipping firms of the
City, who enlisted together in September 1914 (the war layer's city start: reading and figures,
a bowler's arm, first aid; the firm makes up their pay). Home is a terraced street in Leyton, the
8.12 to Liverpool Street, the office in Cornhill: a fictional firm, the Gresham and Lombard
Assurance. Speech: clerks speak carefully, a little above themselves; the cockney comes out when
they're frightened. His comparisons come from the office and the town: ledgers and red ink, the
copying press, gaslight, the fog on the river, the Underground, a Lyons tea shop, the music hall,
Saturday football.

## The three friends (`SECTION_NAMES.city`)

| | Who | Thread in 1915 |
|---|---|---|
| Arthur Webb (mate 1) | Your desk neighbour; precise, keeps a diary of everything | The diary, which is forbidden in the line |
| Percy Fenton (mate 2) | The office eleven's centre-forward; cheerful | A match against the pit company; the football at Loos |
| Leonard Marsh (mate 3) | Spectacles; learned the eye chart by heart to pass; Sunday-school teacher | His glasses broken, and what he can't see |

And Miss Holland, who has taken your desk at the office, with a typewriter.

## History used

- The London division at Loos, 25 September 1915: Loos village, the twin pit towers the
  Londoners called Tower Bridge, the Double Crassier; a London battalion kicked a football
  across no man's land. Here a fictional man of the fictional company does it.
- The Zeppelin raids on London: the first on 31 May 1915, and the raid over the City itself on
  8 September 1915.
- Leave trains came in to Victoria; men straight from the line in their mud.
- City firms made up their clerks' pay and kept rolls of honour in the front hall.

## The design rule

The other towns' structure: a pool (`front_1915_city`) on the tour page; Loos in three phases
(`b_loos_city_*`); the leave reads the choices; a death scene per friend.

## What will be measured

- `npx tsx tools/story-share.ts 200 city`: the 1915 share; a test holds it at 44-70%.
- A transcript of a city 1915, read end to end.
- The validator, style lint, continuity and render scan; `npm run gate` unchanged.

## As built (2026-11-10)

- `c_enlist_city` rewritten: the Guildhall queue of bowler hats, the firm making up their pay, the
  three friends introduced.
- Nine events in `front_1915_city`:
  - Webb counting shells.
  - The first Zeppelin letter.
  - Miss Holland at your desk.
  - The match against the pit company: the battalion's towns meet.
  - Marsh's spectacles.
  - Moving up to Tower Bridge.
  - The roll call told as a ledger closed in red.
  - The Zeppelin over the City.
- Loos in three phases for the city company: Fenton's football, Loos village and its cemetery,
  the Double Crassier. Routed above the mill's Loos.
- `l_city_1915`: Victoria in your mud, the office and Miss Holland, the three families.
- `city-friends.yaml`: a death scene for each friend.

**Changed before the first read.**
- A child's death in a named street in the first Zeppelin raid was not certain; it now says
  "they say children were killed".
- Fenchurch Street was dropped from the September raid.
- Football shirts were not numbered in 1915.
- A clerk at the office shared a surname with a man in the section.

**Measured** (`npx tsx tools/story-share.ts 200 city`).

| | Before | After |
|---|---|---|
| City 1915 story share | 49.4% | 61.6% |
| City, whole game | 36.6% | 44.1% |
| `npm run gate` | | identical, every row |

A test holds city 1915 at 44-70%. All four towns are now written to the end of 1915.
