# FRAME: the pit town, 1917 (2026-11-09)

## The request

> "Go ahead" (2026-11-09), to the recommendation: the pit's 1917, with Messines for the
> tunneller.

## The design

Two roads again, tagged by `war.transferred`, as in 1916.

**The battles are shared with the mill.** The pit company is in the same battalion, so Arras
and Passchendaele are the same days. The mill's battle scenes (`b_arras_*`, `b_pass_*`) were
already town-neutral; they are routed for the pit as well and gain a tunneller's paragraph.
Writing them twice would make two versions of one battle drift apart.

**Messines is the tunneller's, as an event.** The war layer has no battle in June 1917. On 7
June 1917 nineteen mines went up under the Messines ridge, the work of two years. The tunneller
is sent north after Arras to keep the old galleries dry, and is there for it.

**The section's road.**
- The frozen winter: pitmen put on digging, and Bell bargains for the rum.
- The caves under Arras, dug by New Zealand tunnellers; a pitman looks at their timbering.
- Bell and the news from Russia.
- Robson's father gives his best birds to the army.
- Charlton and the horses at Ypres.

**The tunneller's road.**
- The subways under Arras, opened at zero for the infantry.
- Gas in the gallery: Pascoe down, and a Proto set (the rescue breathing apparatus every
  colliery brigade knew).
- The blue clay of Flanders, where Mott the clay-kicker is at home.
- Messines.

**Both roads.** His father dies in the summer. The 1917 leave is the house without him.

## Tours

Stage 3 is tours 20 to 29. Arras is tour 23 (April), Passchendaele tour 27 (August). Tour pages
are 20 (January), 21 (February), 22 (April), 24 (May), 25 (June), 26 (July), 28 (September)
and 29 (October).

## Sources to check (tuned, not sourced, until checked)

- The Arras tunnels and quarries, dug and joined by the New Zealand Tunnelling Company, named
  after New Zealand towns; the subway exits opened at zero on 9 April 1917.
- Messines, 7 June 1917, about 03:10: nineteen mines fired; said to have been heard in England.
- The Tsar's abdication (March 1917) and the United States' entry (6 April 1917) reaching the
  line as news.
- Home pigeon fanciers giving birds to the army's pigeon service.
- The Proto breathing apparatus used by colliery rescue brigades and tunnelling companies.

## What will be measured

- `npx tsx tools/story-share.ts 200 pit`: the 1917 share (29% before), and each road.
- Transcripts of each road, read end to end.
- The validator, style lint, continuity and render scan; `npm run gate` unchanged.

## As built (2026-11-09)

- Thirteen events in `front_1917_pit`:
  - The section's road: frost, the caves under Arras, the news from Russia, the blue hen, the
    horse lines.
  - The tunneller's road: the subways, the canary (Pascoe and the Proto set), the blue clay,
    Messines, Evans singing.
  - Both roads: his father's death.
- The battles are the mill's (`b_arras_*`, `b_pass_*`), now routed for the pit too.
  - Each opening gained a tunneller's paragraph: blowing the exits at Arras, making pillboxes
    into shelters at Passchendaele.
  - A man who talked timber with the New Zealander remembers his advice coming out of the
    ground.
- `l_pit_1917`: the house without his father. If the letter never reached him, he learns it on
  the step.

**Found by reading transcripts, and fixed.**
- A tunneller in Flanders was told he'd listen for his friend "in the chalk"; Flanders is clay.
- The tunneller's news from the battalion repeated word for word every tour; it now has two
  takes.
- On the December leave, the pit ponies were up for their summer holiday.
- The blue-clay event could fall after Messines; it is now pinned to May.

**Measured** (`npx tsx tools/story-share.ts 200 pit`; the roads with a scratch run of 200 each).

| | Before | After |
|---|---|---|
| Pit 1917 story share | 29.4% | 56.6% |
| ... staying with the section | | 50.5% |
| ... going to the tunnellers | | 54.7% |
| Pit, whole game | 55.4% | 59.1% |
| Mill, whole game (shared battles touched) | 55.3% | 55.3% |
| `npm run gate` | | identical, every row |

The pit test now covers 1915 to 1917 (each 44-70%).
