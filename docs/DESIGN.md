# DESIGN: WW1 (working title)

Stage 3 of the game-building workflow: the Phase 0 proposal. Stack, architecture, state,
content schema, saves, instruments, screens, look, scope and the build plan.

Status: **draft, not approved** (2026-11-09). Nothing is built until the author approves it.
It builds on `SPEC.md` (what the game is, every decision in the author's words) and
`KILLGATE.md` (the numbers model the rules below come from). Where this page and the SPEC
disagree, the SPEC wins and this page is wrong.

## 0. Decisions already made

From the SPEC's dated table. Not reopened here.

| Date | Decision |
|---|---|
| 2026-11-07 | An 18-year-old volunteer, 1914 to the Armistice |
| 2026-11-08 | British first, German later. One life per run. A fictional battalion in real battles. Art as Vikingr |
| 2026-11-08 | Very hard to survive the whole war; not every ending is death or disability |
| 2026-11-08 | Four stages (1915 Loos, 1916 Somme, 1917, 1918), each ending in home leave with a choice: an earned home posting, or back to the front with a guaranteed promotion; earned promotions stack |
| 2026-11-08 | Four towns (pit, mill, city office, farm), one company each in one battalion; two town skills and one general skill at creation; war skills learned only at the front |
| 2026-11-08 | Targets: best play reaches the Armistice in 5-10% of runs, reckless near 0%, competent play survives 1915 in 60-75% |
| 2026-11-09 | Battle choices must decide survival; the tunnelling transfer is a real trade; the kill gate's grade weights accepted; specialist roles bring missions, better pay and kit, easier promotion and more risk |

## 1. Pillars

1. **You choose your exposure, not the war.** The calendar, the battles and the orders are
   fixed. How much risk he takes, when, and for whom, is the player's.
2. **Nerve is what runs out.** Not money, not land. Every screen shows it, and every choice
   that spends it says how much.
3. **The men beside you are from home.** The section is nine named men from his town. They
   die at the front and are missed on leave. The dead stay dead.
4. **Every leave is a way out.** Four times he can stop. Going back pays, and most who go
   back do not come home.
5. **Plain and period-true.** No heroics in the narration, no misery for its own sake. The
   numbers and the names do the work.

## 2. Stack

Shape C, the same as Knight of Adalia and Vikingr, laid by game-scaffold and game-narrative.

| Choice | Decision | Why |
|---|---|---|
| Language and build | TypeScript (strict) + Vite | Static files, offline on any host. The war layer and the content need types |
| UI | Preact + `@preact/signals` | Small; the screens are separate components |
| Story engine | game-narrative's engine (Knight of Adalia's), unchanged, through a game module | Scenes, choices, checks, effects, text templates, pools, queued events, saves and save codes already exist and have played two games |
| War layer | The game's own pure modules in `src/game/war/`, ported from the kill-gate model | Rotations, nerve, battle resolution, the section, roles, career and leave are this game's rules, not the engine's |
| Content | YAML, compiled to one JSON bundle; Zod schema | Prose is easier in YAML; the validator, bot and tests read the same bundle |
| Tests | Vitest | |
| Deploy | GitHub Actions to Pages; installable PWA, offline after first load | Same workflow as the other games |
| Saves | localStorage autosave, plus a text save code (`WWIR1.` + base64url of deflated JSON) | Same family as `KOAD1.` and `VIKR1.` |

**Not single-file.** The content and the war layer together are past the size where shape A
or B works.

**One thing to prove first: the calendar.** The engine counts time in seasons, four to a
year, and derives dates, ages and event cooldowns from that. This game's turn is a rotation,
about ten to a year. Plan: the war layer owns the rotation clock and the date (the engine's
`date` hook), and advances the engine's season count when a rotation crosses a season
boundary, so ages and cooldowns stay right. Phase 1 proves this with a test before anything
depends on it. If it fails, the fallback is Vikingr's route: the game's own calendar module
with the engine's content grammar.

## 3. Architecture

Imports only go downward.

```
UI (Preact)  ->  facade (src/game/index.ts)  ->  war layer (src/game/war/, pure)
                                              ->  story engine (packages/engine, pure, unchanged)
                                              ->  content bundle (data)
   tools/ (validator, bot, measurement, text tools) call the facade and the war layer in Node
```

Rules, each from a game that paid for it:
- **Pure engine** (all games): `(content, state, input) -> new state`. No DOM, no clock, no
  `Math.random`. RNG state lives in the save, so reloading cannot reroll a shell.
- **One resolver per kind of risk** (The Company, Vikingr): a battle phase played by hand,
  one run by the bot and one run 16,000 times by the measurement kit all call the same
  `resolvePhase()`. The same for shellfire, duties, missions and wounds.
- **One derivation per number** (Silk Road, Cradle): the risk words shown under a choice
  come from the same function that resolves it.
- **The bot plays the game, not a model of it.** The kill-gate prototype is retired once the
  real engine reproduces its numbers (§9).

### Facade

```ts
newGame(content, { town, picks, general, name, seed }): GameState
view(content, state): View   // the screen: line | duty | battle | mission | scene | leave | record
act(content, state, action): { state, result }
```

### Modules

| Module | Responsibility | From | Phase |
|---|---|---|---|
| `packages/engine/*` | Scenes, choices, checks, conditions, effects, text, director, saves | game-narrative, unchanged | 1 |
| `war/clock.ts` | Rotations, stages, the date, the engine's season count | new | 1 |
| `war/data.ts` | Every tunable number (the kill gate's `data.js`, typed) | kill gate | 1 |
| `war/risk.ts` | One hit chance per exposure; wounds (killed, severe, light, downgrade) | kill gate `hit`, `trenchMod` | 1 |
| `war/nerve.ts` | Spending and recovery; breakdown; freezing | kill gate | 1 |
| `war/section.ts` | Nine named men from home: losses, protection, the fight on after he leaves | kill gate `friendLosses`, `finishWar` | 1 |
| `war/rotation.ts` | Front, support, reserve, rest: shellfire, duties, sick, courses | kill gate `rotation` | 1 |
| `war/battle.ts` | Phases (advance, trench, hold, defence, stalled), `resolvePhase()`, freeze and charge, capture | kill gate `battle` | 1 |
| `war/roles.ts` | Specialist paths and missions, pay, merit, tunnelling | kill gate round 2 | 1 |
| `war/career.ts` | Standing, promotion, awards, commission board, path by rank and specialty | kill gate | 1 |
| `war/leave.ts` | `postingOffers()`, the stay-or-go decision, the guaranteed step | kill gate | 1 |
| `war/grade.ts` | Endings and the grade | kill gate | 1 |
| `game/module.ts` | The engine's hooks: paths (`nerve`, `standing`, `section.*`, `role`, `rank`), effects, text variables, date | new | 1 |
| `game/save.ts` | Save format, version, migrations | game-narrative template | 1 |

## 4. Time

- **The turn is a rotation**: one cycle through front line, support, reserve and rest, about
  two to three weeks. 9 rotations in 1915, 10 in each later stage.
- **Battles take a rotation's slot** on their real dates (Loos 25 September 1915; the Somme
  1 July 1916 and the autumn; Arras April 1917; Passchendaele from July 1917; the Spring
  Offensive 21 March 1918; the Hundred Days from August 1918). Dates to be checked against
  sources (SPEC).
- **Leave closes each stage**, in winter, at home.
- **Before the front**: enlistment and training, one short chapter per town (autumn 1914 to
  summer 1915). No risk; skills and the section are introduced.

## 5. The soldier: state

| Part | What | Shown as |
|---|---|---|
| Town, hometown skills | Two from the town's list, one general (8 hometown skills) | Character sheet |
| War skills | Trench sense, bombing, Lewis gun, sniping, signals, leadership, tunnelling (0-5, learned by doing and courses) | Character sheet, with what each opens |
| Nerve | -10 to 100; breakdown at 0; freezing below 12 | A gauge on every screen; the cost under every choice |
| Standing | 0-100 with NCOs and officers | Words ("the sergeant trusts you"), and what it unlocks |
| Rank, role, path | Private to CSM, or second lieutenant; rifleman, specialist, NCO, subaltern, tunneller | Header |
| Awards | MiD, MM (from 1916), MC (officers), DCM, VC | Record |
| Wounds | Count of severe wounds; current absence | Character sheet |
| The section | Nine named men: alive, wounded, transferred; replacements as strangers | The section screen |
| Merit | Successful role missions toward a stripe | Role panel |

## 6. The systems (rules of record: `prototypes/killgate/`, ported in Phase 1)

### 6.1 The rotation
Front tour (shellfire; two duties offered: raid, patrol, wiring, listening post, carrying;
each volunteered, declined, or detailed anyway), support (lighter shellfire), rest (nerve
back, plus a little per friend alive and with him; report sick; a course; a promotion). A
specialist also gets his role's mission on 60% of tours.

### 6.2 Battle
Three or four phases, each typed. The type is on screen and decides which choice is safest:

| Phase | Push on | Help a mate | Go to ground |
|---|---|---|---|
| Advance (no man's land) | Safest | Risky | Risky: you are in the open |
| Enemy trench | Most dangerous | Middling | Safest |
| Hold (the counter-attack) | Dangerous | Safest | Middling |
| Defence (1918) | Dangerous | Middling | Safe, but you may be overrun |
| Stalled attack (the player is told) | Suicide | Middling | Safe, and costs no standing |

Push earns medals and standing and gives nerve back through awards; help keeps friends
alive; ground keeps him alive this phase and costs standing, and below 25 nerve risks
freezing and a charge. Measured: reading the phase brings 4.5 more men in 100 home than a
blind rule (KILLGATE).

**Risk words, not odds.** Each choice shows its risk in a band (Low, Real, High, Very high)
computed by the resolver, plus what it costs (nerve, standing) and what it can earn. The
house rule from Vikingr: say what an order does and costs, not what it will do.

### 6.3 The section
Nine men from his town, two or three written with arcs, the rest generated from the town's
name and trade pool. They are killed in the line and in battle, at about his own rate; his
first aid and leadership protect them; helping protects them most. When his war ends by any
road, the section fights on to the Armistice, and "friends home" counts who survived.

### 6.4 Roles
| Role | Opened by | Missions | Battle exposure |
|---|---|---|---|
| Bomber | Bombing course (sport learns faster) | Bombing raids | ×1.5 |
| Lewis gunner | Lewis gun course (mech) | Covering a raid | ×1.4 (×0.85 in defence) |
| Sniper | Sniping course (field) | Sniping from a hide | ×1.2 |
| Signaller / runner | Signals course (lit) | Running a message under fire | ×1.45 |
| Tunneller (pit only, 1916) | Transfer offer (dig) | Listening for enemy miners, blowing a camouflet | ×0.7, leaves his section, a crew instead |

Every role: missions on 60% of tours (declinable, usually sent anyway), +1 nerve at rest
(pay, billets, kit), two good missions give a chance at a stripe. A promoted specialist
keeps his role. Measured: roles kill 2.7 more men in 100 and pay 6.3 points more in medals.

**Pay** is shown (a private's shilling a day; proficiency and tunnellers' pay) and in the
model only buys nerve at rest. See open question 2.

### 6.5 Career
Standing drives promotion (with vacancies after battles), courses and covering for him
when he freezes. Awards follow battle and mission points. At the 1917 leave a sergeant with
standing 70 and an education, a medal or real leadership may be put up for a commission;
the board takes about half.

### 6.6 Leave and endings
At each leave: nerve back, the town chapter, then `postingOffers()`: home service if wounded
that year, the town's war work (munitions and clerking from 1915, the pits from 1916, the
land from 1917), instructor (a corporal with a war skill at 3). Take one and the run ends,
graded. Go back and gain a stripe.

| Ending | Grade multiplier |
|---|---|
| The Armistice | ×1.4 |
| Home posting | ×1.0 |
| Wounded out, captured | ×0.8 |
| Shell shock | ×0.6 |
| Killed | ×0.4 |
| Court-martial | ×0.1 |

The record: stage credit (8/24/48/90), rank, awards, friends home, nerve left. Accepted as
set (2026-11-09); revisit at playtest.

## 7. Content

### 7.1 What is authored

| Content | Count | Words (estimate) |
|---|---|---|
| Enlistment and training, per town | 4 chapters | 6,000 |
| Battles: phases × the path's choices | 8 battles × 3 or 4 phases × 2-3 path variants | 36,000 |
| Rotation events (pool, by year and town) | about 120 | 18,000 |
| Duties and role missions | 5 duties, 5 roles × 6 missions | 12,000 |
| The section: written friends' arcs, rivals | 4 towns × 3 friends × 4 events; 2 rivals per stage | 15,000 |
| Leave: a national layer per year plus a town layer | 4 + 16 | 24,000 |
| Endings, by kind and by stage | about 25 | 8,000 |
| **Total** | | **about 120,000** |

About a third of Knight of Adalia's target. The prose, not the code, is the budget.

### 7.2 Schema additions (on the engine's scene format)

The engine's scenes, choices, checks and effects, plus the game's own effects and fields:

```yaml
- id: loos_p1_advance
  chapter: s1_loos
  kind: spine
  battle: { name: Loos, phase: 1, type: advance }   # the resolver reads this, not the prose
  text: |
    The whistle. The gas has gone forward and some of it has come back. {sgt.name} is up
    the ladder ahead of you. [if section.alive < 9]There are gaps in the line already.[/if]
  choices:
    - id: push
      text: Keep going. Stay with the barrage.
      effects: [ { phase: push } ]          # resolvePhase(); outcome branches below
      next: { on: { hit: loos_hit, ok: loos_p2_trench } }
    - id: help
      text: Drag {friend.name} into the shell hole.
      requires: "section.near_wounded"
      effects: [ { phase: help } ]
      next: { on: { hit: loos_hit, ok: loos_p2_trench } }
    - id: ground
      text: Get down. Wait for the next wave.
      effects: [ { phase: ground } ]
      next: { on: { hit: loos_hit, ok: loos_p2_trench } }
```

Game effects: `phase`, `duty`, `mission`, `nerve`, `standing`, `section_loss`, `course`,
`transfer`, `promote`, `award`, `posting`, `end`. Game paths: `nerve`, `standing`, `rank`,
`role`, `path`, `stage`, `date`, `war.<skill>`, `home.<skill>`, `section.<id>.alive`,
`section.alive`, `friend.*` (the nearest living written friend). Every flag set is read by
something later, or it is in the frame's "flavour" column.

### 7.3 Continuity
`content/continuity.yaml` from day one: the dead are never named alive; ranks and titles in
text come from state; a man transferred to the tunnellers is not with the section; the MM
is not mentioned before 1916; ages come from the birth date. `continuity --strict` and
`scan --strict` are in `npm run check`.

## 8. Saves

- Key `wwir.save.v1`; payload with `v`; a migration chain; a fixture from every shipped
  version, loaded and played on in tests.
- Text save code `WWIR1.`; a file download too.
- RNG streams in the save (fire, duty, section, battle, career, leave), as in the kill gate.
- A scene id that no longer exists falls back to the stage checkpoint, with a journal line.

## 9. Instruments

| Tool | Question | Must assert |
|---|---|---|
| `npm run validate` | Does every link, flag, condition and text resolve? | Every battle scene names a phase the resolver knows; every flag is read |
| `npm run bot` | Do the eight kill-gate policies play every town to an ending? | Progress every rotation; no softlock; every ending reachable |
| `sim/adapter.js` + game-measure | The gate tables from the real engine | Within 2 SE of `KILLGATE.md` before the prototype is retired |
| `npm run choices`, `roles`, `skills` | Every choice best somewhere; roles riskier and better paid; no skill inert | Same claims as the kill gate |
| Render scan, continuity, style lint, choice audit | Leaked tokens; the dead speaking; banned phrases; hollow choices | Clean (`--strict`) |
| Smoke test at 390 px | Does every screen render on a phone? | No overflow; screenshots looked at |
| Save fixtures | Does an old save still load and play? | Every shipped version |

## 10. Screens

Phone first; every screen tested at 390 px.

| Screen | Content |
|---|---|
| **The line** | A strip diagram of the rotation (front, support, reserve, rest) with where he is; the date; nerve; the section as nine marks; this tour's duties |
| **Duty / mission** | The duty, who else is going (a friend at risk is named), the risk band, the nerve cost, what it earns; Volunteer / Stay back |
| **Battle phase** | The pixel scene; the phase type in words ("The attack has stalled at the wire"); prose; three choices with risk band, cost and gain |
| **Scene** | The engine's prose column for events, letters and the section's arcs |
| **The section** | Nine names: alive, wounded, gone; what each is to him; replacements as "new men" |
| **The soldier** | Skills, war skills and what they open, rank, role, standing in words, wounds, awards, pay |
| **Leave** | The town (art), the town's year, the families of the dead, then the offers, each saying what it ends and what going back gives |
| **The record** | At the end: how it ended, the grade and its parts, who of the nine came home |

**Every empty or locked state says why** (failure F35). "No posting on offer: munitions
release needs a mill trade, and the pits do not recall men until 1916."

## 11. Look and art

**Art as Vikingr** (decided 2026-11-08): a source image per key scene (a period photograph
or a generated image), converted by a committed tool (Vikingr's `tools/art.ts`, copied) to
wide pixel art in one fixed master palette; no dithering; sources kept in `art/src/`; a
code-drawn fallback for every key, so missing art never blocks the game. Animation in code
over the stills: palette cycling for flares, fires and rain; sprite loops; particles for
smoke, rain and earth thrown up; reduced motion respected.

**Palette (proposal, settled at calibration):** khaki, mud, chalk, duckboard brown, wet
slate sky, gas yellow-green used sparingly, blood used more sparingly, and home colours
(brick, coal smoke, hearth light) for leave. It must not look like Vikingr's Runestone or
Knight of Adalia's brown and burgundy.

**Sources:** period photographs are the natural source. Their rights must be checked per
image before use; Crown copyright on most official photographs of the war has expired, but
the holding archive's terms still apply. Generated images follow a shot list
(`docs/ART.md`, written in Phase 2) with the period details (steel helmets only from 1916: at
Loos, soft caps; puttees; 1908 or 1914 pattern webbing; no modern kit).

**About 30 key images**: 8 battles × 1-2, four towns × 2, the line, a billet, a dressing
station, a train, the title.

## 12. Scope and risks

1. **Prose is the budget**, about 120,000 words. Contained by the path-shared battle
   skeletons, the national-plus-town leave layers and generated section men.
2. **Historical accuracy is a constraint.** Every date, battle, award and route home is
   checked against sources before its stage is written; sources go in the README. Until
   then numbers are marked "tuned, not sourced".
3. **The calendar spike** (§2). If the engine's seasons cannot carry rotations cleanly, the
   fallback costs about a week of engine work.
4. **Tone.** Executions, shell shock and the deaths of named men are handled plainly, with
   no spectacle and no glory. The style guide's banned list starts with the usual war-film
   phrases.
5. **Two models drift.** The kill gate is retired once the real engine reproduces it.
6. **Scope held back:** the German track, Gallipoli and other fronts, a prisoner chapter,
   the generational sequel. Each is a backlog line, not a plan.

## 13. Build plan

### Phase 1: engine and instruments (no real prose)
- `init.mjs --shape=C`, then game-narrative `install.mjs`; the Pages workflow and the PWA.
- The calendar spike first, with its test.
- The war layer ported from the kill gate; the game module; placeholder scenes for every
  screen; the eight policies as the bot.
- `sim/adapter.js`; the gate, choices, roles and skills configs.

**Exit:** the bot plays 16,000 runs with no stalls; the gate tables match `KILLGATE.md`
within 2 SE; `npm run check` green; installs on a phone.

### Phase 2: calibration
- One Loos phase written for the rifleman; one rotation event; one leave scene for one town.
- A style tile (palette, type, the battle screen) and two pixel scenes from sources.

**Exit:** the author's verdict on voice, look, screen density and the number of choices.

### Phase 3: the vertical slice
- **1915 for the mill town**: enlistment, training, France, nine rotations, Loos, the first
  leave and its decision.
- Why the mill town: it is the weakest town in the kill gate (KILLGATE issue 3), so building
  it first forces its strength to be found.
- Three written friends, the section, two roles opened (Lewis gun, signals).

**Exit:** the author plays it and wants 1916; the bot runs 2,000 slices with no softlocks.

### Phase 4 onward: the breadth loop
1916 and the Somme (`FRAME-SOMME.md` first), the other three towns, the remaining roles,
1917, 1918, the endings. Each through frame, approve, build, measure, playtest.

### Phase 8: release
game-release: the itch kit and the Pages link.

## 14. Open questions for the author

1. **Approve this design** (stack, architecture, build plan). This opens Phase 1.
2. **Pay:** keep it as displayed flavour that buys nerve at rest (as now), or make it a
   small currency sent home that changes the family's circumstances on leave? (Recommended:
   the second, after the slice; rule 2 says a shown number must change something.)
3. **The slice town:** the mill town (recommended, for the reason above) or another?
4. **The name.** A working title is needed for the save key and the page. Candidates:
   *The Line*, *Kitchener's Man*, *Pals*, *Over the Top*. Or your own.
