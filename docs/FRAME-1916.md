# FRAME: 1916, the mill town

Status: **built under option A** (2026-11-09). Option B (events that move nerve and standing)
waits for the author's decision after playing 1915; option C (the German track) waits for 1918.

The feature loop (game-building workflow, Stage 7): the request, the problem, the design rule,
the options with a recommendation, a worked example, and what will be measured.

## The request

> "Go on" (2026-11-09), after the 1915 slice: the next year, in the same voice
> (style guide, the author's words of 2026-11-09).

## What 1916 has to do that 1915 did not

1. **Roles are fought.** A man who took a course in 1915 starts 1916 as a Lewis gunner,
   signaller, bomber or sniper (or a section leader, from corporal), and the war gives his role
   missions on six tours in ten (DESIGN §6.4). In 1915 there were none to write.
2. **The first day of the Somme.** The deadliest day in the British Army's history. It has to
   be written so that the player feels the scale through one man, not told it.
3. **The town learns what July cost.** Lancashire's locally raised battalions lost whole
   streets on 1 July. The 1916 leave is the town after that summer.
4. **The friends go on, or don't.** Shaw, Duckworth and Pilling, whoever is alive, with a thread
   each for the year. The sniper at the crater is still out there.

## The design rule

One scene per battle phase, with paragraphs and choice wording that change with his path, not
one scene per path (DESIGN §6.2: "one battle skeleton per stage; the path changes the
decisions in it"). The resolver already gives each path its own risk; the words have to say why.

## Options

| | Option | For | Against |
|---|---|---|---|
| A | Write 1916 on the current rules: events change nothing in the war's numbers | Builds now; the kill-gate equivalence holds; what the numbers say stays true | Events cannot cost or restore nerve, so a letter from home cannot steady him in the numbers, only in the words |
| B | Let events move nerve and standing a little (a letter +3 nerve, a raid volunteered in an event +standing) | The writing and the numbers say the same thing | A rule change: retires the prototype and its equivalence test (CLAUDE.md), and the gate is re-run and re-tuned |
| C | B, plus the German track's first year | Two sides of the same field | Doubles the writing before one side is finished (DESIGN §12, scope held back) |

**Recommendation: A now, B as its own frame after the author has played 1915.** Playing it
will show whether the letter "doing nothing" to nerve is felt at all. C waits until 1918 is
written, as the SPEC says.

## What gets built under A

| Piece | Scenes | Notes |
|---|---|---|
| Role missions | `w_mission` written for all five roles, two takes each for the Lewis gun and signals (the mill town's trades), one for the others | Shared by every town |
| The Somme, 1 July | Four phases, each with path paragraphs (rifleman, Lewis gunner, signaller, bomber, sniper, section leader) and a stalled version | 07:20 mine, 07:30 whistles, the walk, the uncut wire, the long afternoon, the night |
| The Somme, October | Three phases, the mud, a tank | The first tanks were used on 15 September 1916 |
| Front-line events, 1916 | A new pool, `front_1916_mill`: about six, one at the first call each tour | The friends' threads; the sniper |
| The 1916 leave | `l_mill_1916` | The blinds after July; the Somme film at the picture house; the Zeppelin over Bolton in September; conscription |

## Worked example: the Lewis gunner on 1 July

The rifleman walks with the wave at 07:30. The Lewis gunner goes over in the second line with
the gun and four men carrying drums, and his choices are the gun's: set up in a shell hole and
fire on the machine gun that is cutting down the first wave (push: the German gunners look for
Lewis guns first), get the team's drums forward to men who need them (help), or stay down with
the gun until the fire slackens (ground). The resolver's numbers are already his
(`PATHS.lewis`: hit ×1.4); the words make the player see why.

## What will be measured

- `npm run gate`: unchanged under A (the war's numbers are not touched). Equivalence holds.
- The validator, style lint, continuity (the dead friends) and render scan, clean.
- A transcript of a 1916 run for each path, read end to end before the commit.

## As built (2026-11-09)

- `w_mission` for all five roles; two takes each for the Lewis gun and signals, alternating by
  tour (`war.take`).
- The first of July in four phases, each with a paragraph and choice wording for the six paths a
  mill-town man can be on in 1916, and stalled versions; October in three phases with the tank.
- Seven events in `front_1916_mill`: tin hats and the Derby men, Pilling's papers (his
  seventeenth birthday, tied to the March tour), Edith, the bombardment, July after (the
  identity discs), the tank, a letter from the old line (the sniper is still at the crater).
- The 1916 leave: the blinds after July, Edith, Mrs Pilling, the discs, the Somme film at the
  Hippodrome, the Zeppelin over Bolton (25-26 September 1916).
- `w_sick` written in two takes.

Found by reading one transcript per path: the bombardment was dated May (the pre-Somme tours
now sit in May and June; the bombardment began 24 June); Pilling's birthday scene could land in
May; and in the stalled first phase every choice read "very high risk", so the risk words got a
top band, "almost certain to be hit", at 40% and over (words only; the numbers are unchanged).

Measured: `npm run gate` unchanged; the equivalence test holds; 54 scenes, validator, style lint,
continuity and render scan clean.
