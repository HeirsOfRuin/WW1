# Kill gate: results

Stage 2 of the game-building workflow. A numbers-only model of one soldier's war, 1915 to
the Armistice: rotations, battles, nerve, the section, wounds, promotions, awards and the
four leaves. No UI, no prose. It answers one question: are the decisions interesting as a
table of numbers, and can `SPEC.md`'s targets be hit?

**Verdict: pass, with nine open issues.** Every target is met. The gate found seven design
faults in the first model, all fixed before any game code was written (below). The biggest
open issue: the battle choices change *who* comes home (medals, friends, breakdown), but not
measurably *whether* he does.

## How it was measured

All files are in `prototypes/killgate/`. The batch tools (`run.js`, `ablate.js`, `stats.js`,
`measure-lib.js`) are the game-measure kit, copied unchanged; `rng.js` is game-scaffold's.

| File | What |
|---|---|
| `data.js` | Every tunable number |
| `model.js` | The rules. Deterministic: named RNG streams, no `Math.random` |
| `policies.js` | Eight fixed policies, each a written rule |
| `adapter.js` | Connects the model to the kit |
| `gate.js` | The tables below (`npm run gate`) |
| `ablations/choices.js` | One decision forced, the rest as played (`npm run choices`) |
| `ablations/skills.js` | Each skill switched off; inert check (`npm run skills`) |
| `check.js` | Determinism and invariants over 3,840 runs (`npm run check`) |

Matrix: 8 policies × 4 towns × 500 seeds = **16,000 runs**, 2,000 per policy. Every rate
carries one standard error (±). A gap smaller than about twice the combined error is noise.

The policies:

| Policy | In the line | In battle | At leave |
|---|---|---|---|
| reckless | Volunteers for everything | Always pushes | Goes back |
| careful | Never volunteers; reports sick below 40 nerve | Always goes to ground | Goes back |
| mates | Volunteers when a friend is at risk | Helps while a friend lives | Goes back |
| climber | Volunteers for duties that earn standing | Pushes unless nerve is gone | Takes a posting if not promoted that stage |
| adaptive | Volunteers while nerve is high | Reads the phase (push across no man's land, keep down in a stalled attack, help on the hold) | Goes back; takes a commission |
| quit1/2/3 | As adaptive | As adaptive | Takes a home posting at the first leave from stage N on, if one is offered |

"Adaptive" is the stand-in for competent play. It is simple: fixed thresholds, no look-ahead.
A good human will beat it.

## Results against the SPEC targets

| Target | Measured | Verdict |
|---|---|---|
| Best policy reaches the Armistice in 5-10% | adaptive 6.1% ±0.5 | Met |
| Reckless reaches it near 0% | 1.8% ±0.3 | Met (1 in 55) |
| Competent play survives Stage 1 in 60-75% | 74.7% ±1.0 | Met, at the top of the band |
| Going back beats quitting after Stage 1 | +13.9 grade (42.3 vs 28.4), at a 71% chance of not coming home | Met |
| Every policy has a losing route | Every policy is killed in 40-66% of runs | Met |
| No policy best on both survival and grade | adaptive best grade (33.0) but low survival (36.1% home alive); climber and the quitters survive most | Met |
| No town best on both survival and grade | city best survival (45.2%), worst grade (25.7); pit and farm best grade | Met |

### Every policy (2,000 runs each)

| Policy | Armistice | Survives 1915 | Home alive | Killed | Shell shock | Court-martial | Wounded out | Captured | Posting | Grade (mean) | Medal | Friends home (of 9) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| reckless | 1.8% | 68.0% | 39.1% | 59.0% | 20.9% | 1.9% | 15.7% | 0.8% | — | 24.0 | **26.6%** | 4.02 |
| careful | 4.7% | **76.9%** | 36.4% | 56.6% | 13.2% | **7.0%** | 14.6% | 4.0% | — | 25.2 | 0.0% | 3.97 |
| mates | 4.7% | 72.5% | 33.3% | 66.0% | 10.3% | 0.8% | 16.4% | 1.9% | — | 28.7 | 15.2% | **4.51** |
| climber | 0.8% | 69.0% | 47.1% | 51.6% | 10.4% | 1.3% | 12.3% | 0.5% | 23.1% | 25.6 | 21.9% | 3.90 |
| adaptive | **6.1%** | 74.7% | 36.1% | 62.5% | 13.0% | 1.3% | 15.8% | 1.3% | — | **33.0** | 18.9% | 4.25 |
| quit1 | 0.1% | 74.7% | **59.4%** | 40.4% | 1.9% | 0.3% | 9.3% | 0.0% | 48.1% | 28.9 | 9.2% | 3.87 |
| quit2 | 0.1% | 74.7% | 52.2% | 47.4% | 2.8% | 0.5% | 11.9% | 0.0% | 37.5% | 31.2 | 13.4% | 3.97 |
| quit3 | 0.5% | 74.7% | 41.4% | 57.5% | 9.8% | 1.1% | 14.4% | 0.1% | 16.6% | 31.0 | 17.4% | 4.13 |

SE: rates ±0.3 to ±1.1; grade ±0.5 to ±1.0. "Home alive" = every ending except killed and
court-martial. Each policy is best at something: reckless at medals, careful at surviving
1915, mates at friends, climber and the quitters at coming home, adaptive at the Armistice
and the grade. About half of all deaths happen in the line, not in battle.

What this says about the game: a man who keeps his head down survives his first year more
often, then breaks or is charged (careful: 13% shell shock, 7% court-martial, no medals).
A man who goes looking for it wins medals and dies (reckless). Over four years, nerve
decides more runs than bullets.

### The leave decision (the push-your-luck test)

Runs that reached a leave with a home posting on offer, played both ways on the same seeds:

| Leave | Runs | Take the posting | Go back | Going back: not home | Going back: Armistice |
|---|---|---|---|---|---|
| After 1915 | 424 | 28.4 ±0.3 | 42.3 ±2.4 | 71.2% | 8.0% |
| After 1916 | 687 | 57.0 ±0.3 | 61.3 ±2.2 | 71.9% | 14.7% |
| After 1917 | 333 | 89.2 ±0.4 | 101.3 ±3.9 | 50.5% | 33.9% |

Going back is worth more on average at every leave, at odds most people would not take.
That is the intended dilemma. The 1916 leave is a near coin flip (+4.3, about 2 SE).

How often an offer exists: at the first leave, 33% for mill and city men (munitions, clerking),
9-11% for pit and farm men (only if wounded: the pits recall from 1916, the land from 1917).

### Towns

| Town (every policy pooled, 4,000 runs) | Armistice | Home alive | Grade |
|---|---|---|---|
| Pit village | 2.6% ±0.3 | 42.0% ±0.8 | 29.8 ±0.5 |
| Mill town | 2.4% ±0.2 | 43.0% ±0.8 | 28.5 ±0.5 |
| City office | 1.7% ±0.2 | **45.2%** ±0.8 | 25.7 ±0.5 |
| Farm village | 2.5% ±0.2 | 42.3% ±0.8 | **29.9** ±0.5 |

The city man comes home more often and with less. Pit and farm earn more and survive less.

### Every choice is best somewhere (adaptive soldier, one decision forced, 1,000 runs, same seeds)

| Forced | Armistice | Home alive | Medal | Friends home | Shell shock | Court-martial | Grade |
|---|---|---|---|---|---|---|---|
| (as played) | 7.0% ±0.8 | 36.2% | 19.9% | 4.28 | 12.6% | 2.4% | 34.4 |
| Always push | ~ | ~ | **+8.4** | 4.11 | **-5.1** | -1.2 | ~ |
| Always help | ~ | ~ | -5.8 | **4.56** | ~ | ~ | ~ |
| Always go to ground | -3.0 | ~ | -11.7 | 3.97 | ~ | +5.3 | 26.5 |
| Ground in the enemy trench only | ~ | +2.5 ~ | ~ | 4.27 | ~ | ~ | 35.9 ~ |
| Ignore stalled attacks | ~ | ~ | ~ | 4.28 | ~ | ~ | ~ |
| Volunteer for everything | -4.9 | +7.7 | ~ | 4.08 | **+11.7** | ~ | 25.7 |
| Volunteer for nothing | ~ | ~ | -3.3 ~ | 4.14 | ~ | ~ | 30.3 |

`~` = inside the noise floor. Pushing is the medal choice and, through the nerve an award
gives back, the fewest breakdowns. Helping keeps friends alive and costs medals. Volunteering
for everything breaks men. **Going to ground is never measurably best over a whole run**, and
reading the phase (push, ground or help by situation) is not measurably better than a blind
rule. See open issues 1 and 2.

### Nothing declared is decoration (inert check, 1,920 runs per skill, every policy, town and general pick)

Every one of the 15 skills changes some end states when switched off:

| Skill | Runs changed | | Skill | Runs changed |
|---|---|---|---|---|
| stamina | 1,383 | | lit | 288 |
| trench sense | 743 | | mech | 257 |
| sport | 720 | | lead | 242 |
| voice | 622 | | snipe | 132 |
| field | 395 | | firstaid | 107 |
| dig | 375 | | bomb, signals, lewis | 66, 62, 55 |
| | | | tunnel | 16 |

The specialist skills barely move outcomes. See open issue 4.

### Nerve is scarce

The adaptive soldier is below 40 nerve in 10% of his turns; 45% of runs go below 40 at some
point, 27% below 20; 13% end in shell shock. In the first model it was 2% of turns and the
mates policy never broke (fault 3 below).

## What the gate changed

Seven faults the first model had, each found by a number:

| # | Fault | How it showed | Fix |
|---|---|---|---|
| 1 | Survival far above target | Best policy reached the Armistice in 26.5% | Harsher throughout: shellfire up about 30% in 1915 and roughly doubled in 1916-18; battle hit chances in 1916-18 up about 70% |
| 2 | A severe wound removed him for the rest of the stage, so reckless play was self-protecting | Reckless survived 11.8% | A severe wound is a fixed 4-rotation absence |
| 3 | Nerve was not scarce: rest gave back more than the line took | Adaptive below 40 nerve in 2% of turns; mates never broke | Rest recovery cut from 7 to 4.5; helping costs nerve |
| 4 | Friends were counted alive the day he left, so an early posting got credit for men with years of war ahead | Quitting after 1915 graded as well as going back | The section fights on to the Armistice in every run; friends home = alive in November 1918 |
| 5 | Friends died at 1.7 times his own death rate | 1 of 9 came home | Recalibrated: about 4 of 9 come home |
| 6 | Pushing was not best at anything | Always-help beat it on survival, grade and friends | Phase types: going to ground in no man's land leaves you in the open; stalled attacks; pushing is the medal choice |
| 7 | Shell shock graded the same as death, so a life saved counted for nothing | Reading stalled attacks saved 33 lives per 1,000 and graded no better | Shell shock ×0.6 (killed ×0.4, wounded out ×0.8) |

Two smaller ones: the tunnelling skill was read by nothing (now it lowers the risk of mine
collapse), and munitions and clerk postings were offered at the first leave 62% of the time
(now 33%, rising with each year).

## Open issues

1. **Battle choices barely change survival over a run.** Battles are where the authored
   content will live. If a player's choices there do not change whether he lives, playtest
   will say "my choices don't matter" (failure F2). Half the deaths happen in the line, decided
   by shellfire and volunteering. Options: shift risk from the line into battles; widen the
   gap between the safest and riskiest choice per phase; or accept it and say so on screen
   ("the battle decides what kind of man comes home"). Recommend the first two, measured in
   the battle FRAME.
2. **Going to ground is never measurably best over a whole run.** It is safest in the phase
   it is chosen, and pays later in standing, nerve and court-martial risk. Either accept it as
   the tempting choice, or give it one situation where it clearly pays (a wounded friend
   beside you, a counter-attack you cannot stop).
3. **The tunnelling transfer is a trap.** Pit, adaptive, 2,000 runs: taken, the Armistice
   3.7% and grade 28.6; refused, 8.9% and 39.4. Home alive is 3 points better taken. A
   tunneller leaves his section, and with it the nerve the section gives back. Make it a
   real trade or cut it.
4. **Specialist skills barely matter once learned** (55-66 runs in 1,920 changed). They open
   a path but scale nothing. In the game they should appear as battle options only that
   specialist has.
5. **The 1916 leave is a coin flip** while 1915 and 1917 favour going back. Fine if wanted.
6. **The city is the "comes home" town**: best survival, worst grade. Is that its identity?
7. **The grade weights were set to pass this gate**: stage credit 8/24/48/90, Armistice ×1.4,
   posting ×1.0, wounded out and captured ×0.8, shell shock ×0.6, killed ×0.4, court-martial
   ×0.1, plus rank, awards, friends home and nerve. The player sees this number at the end;
   it needs the author's view.
8. **Commissions**: 4-15% of adaptive runs by town (pit 4%, because tunnellers rarely
   qualify). Check against the intended feel of "a strong run".
9. **No number here is sourced.** Every hazard was tuned to the SPEC targets. Before writing,
   check the shape against sources: deaths in the line vs in battle, leave frequency, how
   often a 1914 volunteer was wounded, home-posting routes.

## Next

Stage 3: `docs/DESIGN.md` (stack, architecture, schema, scope), for the author's approval.
Open issues 1, 3 and 7 are design questions for that document; 2, 4 and 8 can wait for the
battle and career FRAMEs. The prototype is the Stage 2 record: once the engine exists,
measurement moves into the shipped functions and this model is retired.
