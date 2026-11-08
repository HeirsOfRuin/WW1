# Kill gate: results

Stage 2 of the game-building workflow. A numbers-only model of one soldier's war, 1915 to
the Armistice: rotations, battles, nerve, the section, wounds, roles, promotions, awards and
the four leaves. No UI, no prose. It answers one question: are the decisions interesting as
a table of numbers, and can `SPEC.md`'s targets be hit?

**Verdict: pass** (round 1, 2026-11-08; round 2 with the author's answers, 2026-11-09).
Every target is met. Round 1 found seven design faults and left nine open issues; round 2
closed five of them (battle choices now decide survival, going to ground pays somewhere,
tunnelling is a real trade, specialist roles behave as the author described, the grade
weights are accepted). Six smaller issues remain, below.

## How it was measured

All files are in `prototypes/killgate/`. The batch tools (`run.js`, `ablate.js`, `stats.js`,
`measure-lib.js`) are the game-measure kit, copied unchanged; `rng.js` is game-scaffold's.

| File | What | Command |
|---|---|---|
| `data.js` | Every tunable number | |
| `model.js` | The rules. Deterministic: named RNG streams, no `Math.random` | |
| `policies.js` | Eight fixed policies, each a written rule | |
| `adapter.js` | Connects the model to the kit | |
| `gate.js` | The policy, town and leave tables | `npm run gate` |
| `ablations/choices.js` | One battle or duty decision forced | `npm run choices` |
| `ablations/roles.js` | Never specialise; refuse the tunnelling transfer | `npm run roles` |
| `ablations/skills.js` | Each skill switched off; inert check | `npm run skills` |
| `check.js` | Determinism and invariants, 3,840 runs | `npm run check` |

Main matrix: 8 policies × 4 towns × 500 seeds = **16,000 runs**, 2,000 per policy. Ablations
at 4,000 runs per variant on the same seeds. Every rate carries one standard error (±); a gap
under about twice the combined error is noise, marked `~`.

| Policy | In the line | In battle | At leave |
|---|---|---|---|
| reckless | Volunteers for everything | Always pushes | Goes back |
| careful | Never volunteers; reports sick below 40 nerve | Always goes to ground | Goes back |
| mates | Volunteers when a friend is at risk | Helps while a friend lives | Goes back |
| climber | Volunteers for duties that earn standing | Pushes unless nerve is gone | Takes a posting if not promoted that stage |
| adaptive | Volunteers while nerve is high | Reads the phase: push across no man's land, keep down in a stalled attack, help on the hold | Goes back; takes a commission |
| quit1/2/3 | As adaptive | As adaptive | Takes a home posting at the first leave from stage N on, if offered |

"Adaptive" stands in for competent play: fixed thresholds, no look-ahead. A good human will
beat it (the ablations already show one better rule, below).

## Results against the SPEC targets

| Target | Measured | Verdict |
|---|---|---|
| Best policy reaches the Armistice in 5-10% | adaptive 5.6% ±0.5, careful 5.5% ±0.5 | Met |
| Reckless reaches it near 0% | 1.6% ±0.3 (1 in 60) | Met |
| Competent play survives 1915 in 60-75% | 75.0% ±1.0 | Met, at the top of the band |
| Going back beats quitting after 1915 | +14.4 grade (41.8 vs 27.4) at a 69% chance of not coming home | Met |
| Every policy has a losing route | Every policy is killed in 40-67% of runs | Met |
| No policy best on both survival and grade | adaptive best grade (32.3), low survival (36.6% home alive); climber and the quitters survive most | Met |
| No town best on both survival and grade | city best survival (45.3%), pit best grade (31.6) | Met, narrowly (see issue 3) |

### Every policy (2,000 runs each)

| Policy | Armistice | Survives 1915 | Home alive | Killed (in battle) | Shell shock | Court-martial | Wounded out | Captured | Posting | Grade | Medal | Friends home (of 9) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| reckless | 1.6% | 67.2% | 33.7% | 65.5% (33.5) | 14.8% | 0.8% | 16.8% | 0.5% | — | 22.7 | **27.1%** | 3.56 |
| careful | 5.5% | **77.3%** | 36.0% | 56.9% (29.9) | 11.5% | **7.1%** | 15.4% | 3.6% | — | 26.7 | 3.3% | 3.51 |
| mates | 3.5% | 72.5% | 32.0% | 67.2% (40.0) | 9.7% | 0.8% | 17.6% | 1.3% | — | 26.8 | 16.5% | **4.13** |
| climber | 0.6% | 68.5% | 45.1% | 53.7% (27.4) | 8.7% | 1.2% | 13.7% | 0.2% | 21.9% | 24.7 | 22.1% | 3.45 |
| adaptive | **5.6%** | 75.0% | 36.6% | 61.8% (32.3) | 12.1% | 1.6% | 17.3% | 1.6% | — | **32.3** | 22.7% | 3.82 |
| quit1 | 0.1% | 75.0% | **60.2%** | 39.5% (18.1) | 2.8% | 0.3% | 9.9% | 0.0% | 47.4% | 28.9 | 12.0% | 3.40 |
| quit2 | 0.1% | 75.0% | 53.3% | 46.2% (21.8) | 3.5% | 0.5% | 12.6% | 0.0% | 37.1% | 31.6 | 16.8% | 3.51 |
| quit3 | 0.4% | 75.0% | 42.6% | 56.2% (28.3) | 9.8% | 1.2% | 15.4% | 0.1% | 16.9% | 31.5 | 21.4% | 3.67 |

SE: rates ±0.1 to ±1.1; grade ±0.5 to ±1.0. "Home alive" = every ending except killed and
court-martial. Each policy is best at something. Battles now carry more than half the deaths
(adaptive: 32.3 of 61.8 points; round 1: 29.6 of 62.5).

### The leave decision (push your luck)

Runs that reached a leave with a home posting on offer, played both ways on the same seeds:

| Leave | Runs | Take the posting | Go back | Going back: not home | Going back: Armistice |
|---|---|---|---|---|---|
| After 1915 | 414 | 27.4 ±0.2 | 41.8 ±2.4 | 69.3% | 7.5% |
| After 1916 | 676 | 57.9 ±0.3 | 59.1 ±2.2 | 70.1% | 12.9% |
| After 1917 | 338 | 91.4 ±0.5 | 96.3 ±3.8 | 48.8% | 30.8% |

Going back pays more on average after 1915, at odds most people would not take. After 1916
and 1917 it is a coin flip on the grade, with the death rate deciding it. An offer exists at
the first leave for 31-33% of mill and city men (munitions, clerking) and 9-10% of pit and
farm men (only when wounded: the pits recall from 1916, the land from 1917).

### Towns (every policy pooled, 4,000 runs each)

| Town | Armistice | Home alive | Grade | Commissioned (adaptive) |
|---|---|---|---|---|
| Pit village | **3.2%** ±0.3 | 43.0% ±0.8 | **31.6** ±0.6 | 4.2% |
| Mill town | 1.6% ±0.2 | 40.6% ±0.8 | 26.5 ±0.5 | **8.8%** |
| City office | 1.2% ±0.2 | **45.3%** ±0.8 | 25.0 ±0.4 | 7.2% |
| Farm village | 2.6% ±0.3 | 40.9% ±0.8 | 29.4 ±0.6 | 5.2% |

### Battle choices (adaptive soldier, one decision forced, 4,000 runs, same seeds)

| Forced | Armistice | Home alive | Medal | Friends home | Shell shock | Court-martial | Grade |
|---|---|---|---|---|---|---|---|
| (as played) | 6.0% ±0.4 | 36.4% ±0.8 | 25.9% | 3.78 | 13.3% | 1.5% | 32.9 |
| Phase-blind rule | -1.0 | **-4.5** | ~ | 3.70 | -5.6 | ~ | 30.6 |
| Always push | ~ | -6.8 | **+3.1** | 3.64 | **-8.4** | -0.9 | 31.5 |
| Always help | ~ | -3.6 | -6.0 | **4.12** | -4.4 | -0.5 | 31.1 |
| Always go to ground | -1.4 | ~ | -10.7 | 3.54 | ~ | +4.2 | 28.0 |
| Ground in the enemy trench | ~ | **+2.7** | ~ | 3.72 | +3.6 | +0.9 | **33.8** |
| Ignore stalled attacks | ~ | -3.1 | ~ | 3.81 | -4.4 | -0.6 | 32.0 |
| Volunteer for everything | -3.6 | +6.3 | ~ | 3.68 | **+11.0** | ~ | 25.3 |
| Volunteer for nothing | ~ | ~ | -6.6 | 3.77 | ~ | ~ | 31.5 |

**Battle choices now decide whether he lives.** Reading the phase brings 4.5 more men in 100
home than a blind rule. Every choice is best somewhere:
- **Push:** the medal choice, and the fewest breakdowns (an award gives nerve back).
- **Help:** the most friends home.
- **Going to ground in the enemy trench:** the most men home and the best grade, at a cost
  in breakdowns and court-martials.
- **Volunteering for everything:** breaks men. Volunteering for nothing costs medals.

The ground-in-the-trench result means the adaptive rule is not the best play. That is the
point: a better rule exists for a player to find.

### Specialist roles (author, 2026-11-09; 4,000 runs)

The author's rule: role missions, slightly better pay, circumstances and kit, an easier
promotion when missions go well, and more risk more often. As built:

| | In the model |
|---|---|
| Role missions | Offered on 60% of front tours: bombing raid, covering a raid with the Lewis gun, sniping from a hide, running a message under fire, listening for enemy miners. Declining is possible; he is sent anyway 60% of the time |
| Better pay, circumstances, kit | +1 nerve back at every rest |
| Easier promotion | Two successful missions give a 40% chance of a stripe |
| More risk | Mission hit chance 4.5-11% per mission; higher exposure in battle (bomber ×1.5, runner ×1.45, Lewis gunner ×1.4, sniper ×1.2; rifleman ×1.0, NCO ×1.15) |

Never specialising, against the adaptive soldier who takes roles when offered:

| | Armistice | Killed | Home alive | Medal | Rank | Grade |
|---|---|---|---|---|---|---|
| Takes roles | 6.3% ±0.4 | 61.9% | 36.8% | 26.2% | 2.46 | 33.8 |
| Never specialises | -1.9 | **-2.7** | **+2.2** | -6.3 | 2.31 | 29.8 |

Roles are riskier and pay in medals, rank and grade. Staying in the ranks is the safer road
home. About a third of men who fight in 1916-17 do it in a role.

### The tunnelling transfer (pit men, 1,000 runs)

| | Armistice | Killed | Home alive | Friends home | Grade |
|---|---|---|---|---|---|
| Takes it | 6.2% ±0.8 | 56.2% | **42.0%** | 3.60 | 34.4 |
| Refuses it | +1.8 ~ | **+7.6** | -6.7 | **3.96** | **37.9** |

A real trade now: the tunneller is killed less and comes home more; the man who stays with
his section brings more of them home and grades higher.

### Skills: nothing is decoration

All 15 skills change end states when switched off (1,920 runs each, every policy, town and
general pick): stamina 1,391; trench sense 769; sport 709; voice 621; field 389; dig 375;
lit 256; lead 232; snipe 224; mech 188; bomb 171; signals 133; firstaid 126; tunnel 120;
lewis 111. The specialist skills moved from 55-66 in round 1 to 111-224: role missions use
them.

### Nerve is scarce

The adaptive soldier is below 40 nerve in 10% of his turns; 46% of runs go below 40, 25%
below 20; 12% end in shell shock.

## What the gate changed

### Round 1 (2026-11-08): seven faults in the first model

| # | Fault | How it showed | Fix |
|---|---|---|---|
| 1 | Survival far above target | Best policy reached the Armistice in 26.5% | Harsher throughout |
| 2 | A severe wound removed him for the rest of the stage, so reckless play was self-protecting | Reckless survived 11.8% | A severe wound is a fixed 4-rotation absence |
| 3 | Nerve was not scarce | Adaptive below 40 nerve in 2% of turns; mates never broke | Less rest recovery; helping costs nerve |
| 4 | Friends were counted alive the day he left | Quitting after 1915 graded as well as going back | The section fights on to the Armistice in every run |
| 5 | Friends died at 1.7 times his own rate | 1 of 9 came home | Recalibrated: about 4 of 9 |
| 6 | Pushing was best at nothing | Always-help beat it on everything | Phase types and stalled attacks |
| 7 | Shell shock graded as death | A life saved counted for nothing | Shell shock ×0.6 |

### Round 2 (2026-11-09): the author's answers

| Change | Why | Result |
|---|---|---|
| Line shellfire -30%, battle hit chances +20%, wider gap between safest and riskiest choice per phase | Issue 1: battle choices did not change survival | Reading the phase: +4.5 home alive (was ~0) |
| Specialist roles with missions, pay, merit promotion and higher battle exposure | Author's rule for roles | Riskier (+2.7 killed), better paid (+6.3 medals, higher rank) |
| Courses offer the town's trade half the time, the army's need the rest | Bombers never appeared (pit men all became tunnellers) | All four specialist roles appear |
| A promoted specialist keeps his role | Guaranteed promotions pushed everyone onto the NCO path by 1917 | A third of 1916-17 battles fought in a role |
| Tunnellers: lower mine-collapse risk, a crew in place of the section at rest, role missions; a **bug fixed**: a bulk edit in round 1 had set the tunneller's shellfire modifier to 0.99 instead of 0.9 | Issue 3: the transfer was a trap (collapse alone killed about 1 in 4) | A real trade |
| A commissioning board accepts half of eligible sergeants | Two-thirds of 1918 battles were fought as officers | About 37% of men fighting in 1918 are officers; 4-9% of all adaptive runs |

## Open issues

1. **The 1916 and 1917 leaves are coin flips on the grade** while 1915 clearly favours going
   back. Fine if wanted: the late leaves then turn on how much the player values his life.
2. **Careful play reaches the Armistice as often as adaptive play** (5.5% vs 5.6%), with
   no medals, a worse grade and 7% court-martialled. Keeping your head down is a viable,
   joyless way through. Decide whether that is the intended message.
3. **Pit is the strongest town** (best grade and Armistice rate; survival within 2.3 points
   of the city). **Mill is the weakest**: lowest survival, second-lowest grade; its only
   lead is commissions. Mill needs a strength (the Lewis gun role is the riskiest).
4. **Commissions:** 4-9% of adaptive runs, about a third of those fighting in 1918. Check
   against the intended feel.
5. **Role missions per run are few** (2.5 on average), because roles start in 1916 and most
   men are dead by 1917. In the game each one is authored, so few may be right.
6. **No number here is sourced.** Every hazard was tuned to the SPEC targets. Before writing,
   check the shape against sources: deaths in the line vs in battle, leave frequency, how
   often a 1914 volunteer was wounded, home-posting routes, tunneller casualties.

## Reproduced by the game (2026-11-09)

Phase 1 ported this model into the game as its war layer. Played through the story engine by
the same policies on the same seeds, the game's `npm run gate` prints these tables exactly,
and `tests/game.test.ts` holds 160 wars equal to the prototype's. Every number above is the
game's number until a rule changes (DESIGN §15).

## Next

Stage 3: `docs/DESIGN.md` (stack, architecture, schema, scope), for the author's approval.
The prototype is the Stage 2 record: once the engine exists, measurement moves into the
shipped functions and this model is retired.
