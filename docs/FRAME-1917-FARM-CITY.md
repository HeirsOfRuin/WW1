# FRAME: the farm and city towns, 1917 (2026-11-12)

## The request

> "Continue" (2026-11-12), to the recommendation: the farm and city through 1917, sharing Arras
> and Passchendaele.

## The design

The battles are the mill's (`b_arras_*`, `b_pass_*`), already shared with the pit and
town-neutral; they are now routed for all four towns. Each town adds its events
(`front_1917_farm`, `front_1917_city`) and its 1917 leave.

**Farm.**
- The cavalry waiting in the snow before Arras.
- The Land Army girl and the tractor at home; German prisoners working the land.
- Cottle's French dog, Fly, asked for as a messenger dog.
- Pearce goes out alone after a German sniper.
- Bert asks to be a stretcher-bearer.
- A French farmer ploughing with a cow.
- The Flanders mud, like a gateway in February.

**City.**
- Webb offered the orderly-room clerk's job.
- Pickwick read aloud in the caves under Arras.
- Florence joins the WAAC and comes to France.
- Marsh made a signaller; Morse on sentry.
- The daylight aeroplane raid on London (Liverpool Street, the Poplar school).
- The brigade football cup, every town in one team.
- The totals for Passchendaele.

## Sources to check (tuned, not sourced, until checked)

- Cavalry held ready at Arras in April 1917, in snow.
- The Women's Land Army (1917); tractors lent by the county War Agricultural Committees; German
  prisoners working on farms.
- Messenger dogs in the line from 1917.
- The WAAC, formed 1917, sending women clerks to the bases in France.
- The daylight Gotha raid on London, 13 June 1917: Liverpool Street; the Upper North Street
  school in Poplar, eighteen children killed.
- Londoners sheltering in Tube stations and crypts during the 1917 raids.

## As built (2026-11-12)

Seven events and a leave for each town; Arras and Passchendaele routed for all four towns.

**Found by reading transcripts, or before, and fixed.**
- The Land Army girl came in January 1917; the Land Army was formed later that winter. The
  letter now comes from May.
- A Fordson tractor on a Devon farm by December 1917 was doubtful.
- Leytonstone had no Underground station in 1917; the family shelters in the church crypt.
- The battalion's football team lost to "the Guards" in a brigade cup they wouldn't be in.
- "A German shepherd on Vellacott's land" read as the dog.
- Three leave lines assumed events the player might not have seen: the brigade cup, Florence's
  WAAC letter, and the French dog.

**Measured** (`npx tsx tools/story-share.ts 200 <town>`).

| | Before | After |
|---|---|---|
| Farm 1917 story share | 25.0% | 47.7% |
| City 1917 story share | 24.9% | 47.7% |
| Farm, whole game | 49.2% | 52.8% |
| City, whole game | 51.1% | 54.0% |
| Mill, pit (shared battles touched) | 55.3%, 59.9% | unchanged |
| `npm run gate` | | identical, every row |

The farm and city tests now cover 1915 to 1917 (each 44-70%).
