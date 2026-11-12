# FRAME: the farm and city towns, 1918 and their Armistice (2026-11-12)

## The request

> "Continue" (2026-11-12), to the recommendation: the farm and city's 1918, sharing the 1918
> battles, and an Armistice ending for each. With this every town is written from enlistment to
> 11 November 1918.

## The design

The 1918 battles are the mill's (`b_spring_*`, `b_amiens_*`, `b_oct_*`), routed for all four
towns. Two shared lines now have one per town: the river crossing's simile, and the retreat
over the old Somme ground (Mansel Copse for the farm, Gommecourt for the city). Each town's
January event offers the deep dugout and sets the shared `dug_deep`. The farm's warning before 21
March (the rooks) is read by the shared 21 March, as the pit's is.

**Farm.**
- The posts.
- The rooks leaving the German wood before the offensive.
- Bert carrying through the retreat.
- Pearce wanting the keeper's job.
- The memorial names for Mrs Venn.
- The Devonshires' trench in August.
- The French Fly finding her old farm.

**City.**
- The posts.
- Webb's returns before the offensive.
- The air raid on the WAAC camp, and a proposal by letter.
- Marsh signalling by lamp.
- The trench dug in no man's land at Gommecourt, seen again.
- The influenza in London.

**Endings.**
- `e_armistice_farm`: the bells at Dunsworthy; Bert ringing the whole peal he promised in 1915,
  or the tenor half-muffled for him; Mrs Venn's cross; Pearce the keeper; the farm walked with
  his father.
- `e_armistice_city`: Marsh taking down the message, Webb ruling his last line, Fenton's ball;
  London's maroons and Big Ben; Florence on the platform at Victoria, or at your old desk; the
  Roll of Honour's four panels.

## Sources to check (tuned, not sourced, until checked)

- The WAAC camp at Abbeville bombed at night, 30 May 1918, women killed.
- The maroons fired in London at 11 o'clock on 11 November 1918; Big Ben struck again for the
  first time since 1914.
- Church bells rung across England on Armistice Day.
- The influenza in London in October and November 1918.
- Government fixed prices for wheat and the plough-up of old pasture.

## As built (2026-11-12)

**Fixed before or on reading transcripts.**
- The influenza toll in London was overstated as a hundred thousand.
- A condition with brackets, which the engine does not parse.
- Cottle's whistle at the Armistice assumed he had kept the French dog.
- The 21 March line ran into the next sentence with no space for the farm.

**Measured** (`npx tsx tools/story-share.ts 400 <town>`).

| | Before | After |
|---|---|---|
| Farm 1918 story share | 23.7% | 47.9% |
| City 1918 story share | 26.8% | 52.5% |
| Farm, whole game | 52.4% | 54.0% |
| City, whole game | 53.8% | 54.9% |
| Mill, whole game (shared scenes touched) | | 54.8% |
| Pit, whole game | | 60.0% |
| `npm run gate` | | identical, every row |

Most men are dead or home before 1918: three to six screens a game on average. That is too few
for the 40-game test to hold steady, so the farm and city tests stay on 1915-1917.
