# In the Trenches: spec

Status: **approved** (2026-11-08), revision 3. Stage 1 of the game-building workflow
(`Game-Workshop/skills/game-building/SKILL.md`). Kill gate: **passed**, round 2 with the author's
answers (`docs/KILLGATE.md`, 2026-11-09). Design: `docs/DESIGN.md`, draft for approval.

## Decisions

| Date | Decision | The author's words |
|---|---|---|
| 2026-11-07 | The premise | "A new game, one based on WW1, where you play a recruit who joins the British or German army as an 18 year old recruit. You fight in some of the most deadliest and famous battles of the war, earning awards, promotions, making friends, nameless or even faceless rivals, etc." |
| 2026-11-08 | British first; German later | "British first" |
| 2026-11-08 | One life per run | "one life per run" |
| 2026-11-08 | Fictional battalion in real battles | "fictional battalion" |
| 2026-11-08 | Art as Vikingr (photo source to pixel scene, `Vikingr/tools/art.ts`, `docs/ART.md`) | "Art like vikingr" |
| 2026-11-08 | The whole war is very hard; not every ending is death or disability | "going through the entire war should be incredibly hard, but that doesn't mean every end should be death or disability either" |
| 2026-11-08 | 3 or 4 stages; survive a stage, go home on leave, choose to stay home or go back | "if you survive to specific dates, set at different historic stages of the war (3 or 4 of them), you get sent home for leave, see home and their life, then get the option to stay at home or reenlist and continue the war" |
| 2026-11-08 | Going back guarantees a promotion; each stage has 2 or 3 paths by rank, position and specialty | "Each time you reenlist, you get a guaranteed promotion, so if you didn't get a promotion during that stage. That way each stage only needs 2 or 3 paths based on the players rank, position and specialty" |
| 2026-11-08 | "Stay home" is an earned home posting (instructor, medical downgrade, war work) | "1. Yes" |
| 2026-11-08 | Going back gives one step; promotions earned in a stage stack on top | "2. Yes" |
| 2026-11-08 | Four stages: 1915 Loos, 1916 Somme, 1917, 1918 | "3. Yes" |
| 2026-11-08 | Targets: best play reaches the Armistice in 5-10% of runs, reckless near 0%, competent play survives Stage 1 in 60-75% | "4. Yes" |
| 2026-11-08 | Four backgrounds/towns at character creation, with hometown skills chosen there; war skills learned while deployed | "I think having 4 different backgrounds/towns to choose from help set the character creation up, besides choosing some hometown skills, then make sure we talk war skills learned while deployed" |
| 2026-11-08 | Spec approved: four town types (pit, mill, city office, farm), one battalion with a company per town, two town skills plus one general at creation; go to the kill gate | "Yes to all. Go ahead" |
| 2026-11-09 | Kill gate open issue 1: move risk from the line into battles and widen the gap between the safest and riskiest battle choice, so battle choices change whether he lives | "1. Yes" |
| 2026-11-09 | Kill gate open issue 2: the tunnelling transfer becomes a real trade, not a trap (or is cut) | "2. Yes" |
| 2026-11-09 | Kill gate open issue 3: the grade weights as set in the kill gate are accepted for now (stage credit 8/24/48/90; Armistice x1.4, posting x1.0, wounded out and captured x0.8, shell shock x0.6, killed x0.4, court-martial x0.1) | "3. Yes" |
| 2026-11-09 | Specialist roles: each brings role-specific missions, slightly better pay, circumstances and kit than a rifleman, and an easier promotion when the missions go well; and puts him at risk more often | "Each role should provide some new, role specific missions, gives you slightly better pay/circumstances/kit compared to a regular rifleman, and make it easier to get a promotion should the missions go well, but they also put you at risk more often, despite the benefits." |
| 2026-11-09 | DESIGN.md approved; pay becomes money sent home that changes the family's circumstances on leave (after the slice); the vertical slice is 1915 for the mill town | "I agree with your recommendations." |
| 2026-11-09 | Title: *In the Trenches* | "We'll call it... In the Trenches, or something like that" |
| 2026-11-09 | Calibration verdict on the prose: real and human, not machine-sounding; emotional, hard or quiet as the moment needs; the prose carries the senses the game does not show. Then build on | "The prose isn't quite right. Keep it from sounding too Ai-esque. It should sound real, human, emotional at times, hard and action filled when needed, and quiet or cautious in the right places. The prose needs to help fill in the other senses that don't get used in this game. Continue building" |
| 2026-11-09 | Playtest 1: a Soldier tab (skills, traits, awards, career, rank, friends, rivals); prose with the depth of a book or a life; missions played out, not go or stay (sorties; the prototype retired) | "The game needs a character tab that tracks skills, traits, awards, career, rank, friends, rivals, etc. The narrative prose needs more depth. I want it to have a touch of a book or life about it. Not just snapshots over weeks. There needs to be more actions and playing out missions. Just taking whether you go or not is no fun" |
| 2026-11-09 | The story leads: a general playthrough (volunteering half the time) should be about half story, half generic missions. Each tour opens on its own page; a duty is offered on 60% of tours; ordered duties play out off-screen (FRAME-STORY.md) | "I think we will set it up to follow a story more so than just just playing generic missions. Have a general play through (only volunteering half the time) to split between story and generic missions 50/50" |
| 2026-11-09 | Write 1918 for the mill town: the Spring Offensive, Amiens, October, the Armistice; the platoon officer's path; the friends' threads closed (FRAME-1918.md) | "Go ahead" |
| 2026-11-09 | The pit town's opening and 1915: the Miners' Hall, Robson, Bell and Charlton, the tapping and the mine, Loos across a coalfield, the first leave, the tunnellers' offer (FRAME-PIT-1915.md) | "Go ahead" |
| 2026-11-09 | The pit town's 1916 on two roads: with the section at La Boisselle, or with the tunnellers who fired the mine; the Butte; the 1916 leave (FRAME-PIT-1916.md) | "Go ahead" |
| 2026-11-09 | The pit town's 1917 on two roads: the section at Arras and Passchendaele (the mill's battles, shared), the tunneller from the Arras subways to Messines; his father's death (FRAME-PIT-1917.md) | "Go ahead" |
| 2026-11-09 | The pit town's 1918 on two roads, with the mill's battles shared, and the pit's own Armistice (FRAME-PIT-1918.md); the pit is written through | "Go ahead" |
| 2026-11-09 | The farm town's opening and 1915: Dunsworthy on Exmoor, Cottle, Pearce and Yeo, young Mr Venn, Loos at the Lone Tree; the tunneller's 1918 left story-heavy as recommended (FRAME-FARM-1915.md) | "Contine" |
| 2026-11-10 | The city town's opening and 1915 (the last town without one): London insurance clerks, Webb, Fenton and Marsh, Loos under Tower Bridge (FRAME-CITY-1915.md) | "Go with any opening to the end of 1915 not yet completed" |

## Pitch

An 18-year-old volunteer in a fictional New Army battalion, 1914 to the Armistice. You do not
choose the war, the battles or the orders. You choose how much risk you take and for whom,
and at the end of each year whether to go back.

## Character creation: four towns, hometown skills

The player picks one of four home towns, then a few hometown skills from that town's list
and a short general list. Age is fixed at 18; name and family are chosen.

### The four towns (proposed)

Fictional towns of real types. Each one sets the section's trades and accents, which
specialties come easily, and which war work is offered as a home posting at leave.

| Town type | Hometown skills on offer | Takes easily to | War work offered at leave |
|---|---|---|---|
| Pit village (coalfield) | Digging, timbering, working in the dark, stamina | Wiring, tunnelling (transfer to a tunnelling company) | Released back to the pits |
| Mill town (textiles) | Machinery, working in noise, stamina | Lewis gun (mechanical), signals | Munitions |
| City office (clerk) | Literacy, figures, a rifle club or Territorial drill | Signals, runner, orderly room; commission eligibility | A staff or depot clerk post |
| Farm village (rural) | Fieldcraft, shooting, horses | Sniping, scouting, transport | Land work |

General list (any town): first aid (St John Ambulance), sport (a strong throwing arm helps a
bomber), a chapel or choir voice (standing with the section), football.

**How the four share one battalion.** One fictional New Army service battalion; each of its
four companies drawn from one of the four towns. Locally raised companies are plausible for
1914 service battalions (to be checked). The player's town sets his company and his section.
The battle skeletons stay one per stage, and the other three companies are on the same field:
men from the other towns appear as neighbours, rivals and replacements.

### War skills: learned only at the front

| War skill | Learned by | Opens |
|---|---|---|
| Trench sense (reading shellfire, where not to stand) | Time in the line | Fewer casualties on every path |
| Bombing | Course or a raid | Specialist path (bomber) |
| Lewis gun | Course | Specialist path (Lewis gunner) |
| Sniping and scouting | Course or patrols | Specialist path (sniper) |
| Signals | Course | Specialist path (signaller or runner) |
| Wiring and digging | Working parties | Fewer losses on night work; tunnelling transfer |
| Gas drill | Training, then the first gas attack | Survives gas phases |
| Leadership | Leading men in a battle phase | NCO path, commission eligibility |

Rules for both kinds of skill:
- Hometown skills set the starting point and how fast a war skill grows; they never stand in
  for it. A miner learns wiring faster; he does not start a wirer.
- War skills come only from doing or from a course. No points to spend.
- Keep the total at about 12 skills. Every one must move an outcome (inert check, rule 2)
  or be cut.
- Home-posting offers derive from skills: instructor needs a war skill, war work needs the
  hometown trade. One function decides both what is shown and what is offered (rule 1).
- No town may be best on both survival and grade (kill gate).

### The content cost of four towns, and the containment

Four towns times four leaves is 16 home chapters, and four sections of 8-10 men is about 40
named men. Contained by:
- Each leave chapter is a shared national layer (casualty lists, rationing, conscription,
  air raids) plus a short town layer (family, trade, the war work, the families of the section).
- Each town has 2-3 written friends; the rest of the section is generated from a regional
  name and trade pool and becomes known through events.

## Structure: four stages, each ending in home leave

| Stage | Period | Main battle(s) | Enters at (minimum) | Ends with |
|---|---|---|---|---|
| 1 | Enlistment, training, France 1915 | Loos (Sept 1915) | Private | Home leave, winter 1915-16 |
| 2 | 1916 | The Somme (July-Nov) | Lance corporal | Home leave, winter 1916-17 |
| 3 | 1917 | Arras, Passchendaele or Cambrai | Corporal | Home leave, winter 1917-18 |
| 4 | 1918 | The Spring Offensive, the Hundred Days | Sergeant (or second lieutenant) | The Armistice |

Four rather than three: the war falls into four years of action for a 1914 volunteer, and the
year-end leave matches the real pace (other ranks got home leave rarely, about once a year;
to be checked). Dates and which battles a New Army battalion could plausibly fight are to be
checked against sources before any writing.

### Inside a stage

| Layer | Turn | What the player decides |
|---|---|---|
| Rotation (systemic) | One cycle, about 2-3 weeks: front line, support, reserve, rest | Which duties to volunteer for (wiring party, raid, listening post, sniping, carrying); report sick or not; how to spend rest |
| Battle (authored set piece) | 4-8 phases | Choices under fire. Chance moves numbers; it never decides what beats what |
| Between | Courses, letters, transfers after wounds | Where to spend standing and time; which specialty to train in |

### Paths: what the 2-3 per stage are

A path is the role you fight the stage's battle in. One battle skeleton per stage; the path
changes the decisions in it, not the battle.

| Path | Decides for | Unlocked by |
|---|---|---|
| Rifleman | Himself and the man beside him | Default at Private and Lance corporal |
| Specialist (bomber, Lewis gunner, sniper, runner) | His team and his weapon | A course in the stage before |
| Section or platoon NCO | His section | Corporal and above |
| Subaltern (Stage 4 only) | His platoon, and he writes the letters home | A commission (see below) |

That is about 10 path-stage combinations across the game, not 4 stages times every rank.

### Home leave

Each leave is a short chapter in the same fictional home town, with a recurring cast: family,
a sweetheart or not, the families of the section. The town changes year to year (casualty
lists, rationing, women in the munitions works, conscription from 1916, air raids). The friends
in your section are from that town, so the dead are missed there too. Leave is where the cost
of the stage shows, not just the score.

## The stay-or-go-back choice: historical problem and recommended fix

**The problem.** A British volunteer signed for three years or the duration. He could not
choose to stay home on leave, and from 1916 conscription would have taken him back anyway.
Played literally, the choice would be invented.

**Recommended fix.** Keep the choice; change what "stay" means. At each leave the player can
take a **home posting** he has earned, which were real routes out of the line:

- Instructor at a training depot (an experienced NCO, or a man with a specialty).
- Unfit for front-line service after a wound (medical downgrade, home service).
- Released to war work (a skilled tradesman or miner was sometimes recalled).

Which postings are offered depends on rank, specialty, wounds and standing, so a run that
earned more has more ways home. Taking one ends the run with a graded ending, not a loss.

**Going back** is "return to the front" rather than "re-enlist", and the promotion is grounded:
battalions lost NCOs faster than they could replace them, and survivors were promoted to fill
the gaps.

## Promotion: the guarantee must not make earned promotion worthless

As written, an in-stage promotion and the guaranteed one could land you on the same rank, so
earning one would buy nothing at the stage boundary (failure F2: a declared effect that changes
nothing). **Recommended:** going back always gives one step, and steps earned during a stage
stack on top. A strong run reaches sergeant by Stage 3 and becomes eligible for a commission
(officer cadet course at home during the Stage 3 leave, back as a second lieutenant for Stage 4).
That commission is the British case for the game: a working-class volunteer made an officer.

## Endings

| Ending | When | Grade |
|---|---|---|
| Killed | Any time | The record stands: rank, awards, what the section remembers |
| Broken (shell shock) | Nerve at zero | Evacuated; the war ends for him |
| Court-martial | Desertion, cowardice, striking a superior | The worst ending |
| Home posting | At any leave, by choice | Graded by stage reached, rank, awards, friends alive, nerve |
| The Armistice | Survive Stage 4 | The best grade available |

Wounded and captured are branches, not endings, unless the wound downgrades him (then a home
posting is offered).

## Scarce resource

**Nerve.** Spent by shellfire, losses and raids; recovered slowly by rest, leave and friends
still alive. Low nerve locks options, and the locked option says why. Supporting: health,
standing (with NCOs and officers), the section (8-10 named men from home, each with a bond).

## The push-your-luck question the kill gate must answer

Every leave is a cash-out point. If going home after Stage 1 grades nearly as well as pushing
on, careful players quit early and never see the Somme. If pushing on is clearly better, the
choice is fake. The grade has to reward each extra stage enough that going back is tempting,
while the death rate makes it a real risk.

## Ranks and awards

| Ladder | Pte, L/Cpl, Cpl, Sgt, CSM; commission from the ranks |
|---|---|
| Awards | Mention in Despatches, Military Medal (from 1916), DCM, VC |
| Each award changes | Standing, home-posting offers, course places, commission eligibility, how replacements treat you |

## Friends and rivals

- **Section:** 8-10 named men from home. Killed, wounded, transferred, replaced by strangers.
  The dead stay dead, at the front and in the town (game-narrative continuity tool).
- **Rivals in your own lines:** an NCO who has it in for you; a man after the same stripe.
- **Faceless rivals across the wire:** a sniper or an opposing regiment that recurs, known only
  by what it does.

## Scope

- British, Western Front only. German track later, with its own version of the stay-or-go
  choice (it will not be the same) and the F10 scope-widening check.
- Not a tactics game: the player never moves units on a map.
- Shape C (Vite + Preact + TS + YAML) with game-narrative, as Knight of Adalia and Vikingr.

## Kill gate (Stage 2)

Numbers-only sim of rotations, generic battles and the four leave decisions, no UI, in
`prototypes/`. About 200+ seeds per policy.

Every policy runs from each of the four towns.

| Policy | Volunteering | At leave |
|---|---|---|
| Reckless | Always | Always go back |
| Careful | Never | Always go back |
| Mates first | When a friend is at risk | Always go back |
| Climber | When it earns standing | Go back while promotions keep coming |
| Quitter N | Adaptive | Take a home posting after Stage N (N = 1, 2, 3) |

Proposed targets (the author's call; numbers to be set):

| Measure | Proposed |
|---|---|
| Reach the Armistice, best policy | 5-10% of runs |
| Reach the Armistice, reckless | near 0% |
| Survive Stage 1, competent play | 60-75% |
| Quit-after-Stage-1 average grade | Clearly below going back for a competent policy |
| Every policy | Has at least one losing route; none best on both survival and grade |
| Every town | Best somewhere; none best on both survival and grade |

## Open questions for the author

1. The four town types (pit, mill, city office, farm): accept, or swap one (a port or
   shipyard town is the obvious alternative)?
2. One battalion with a company per town: accept?
3. How many hometown skills at creation: two from the town list plus one general (recommended)?
4. Then approve this spec as a whole, which opens the kill gate.

To check against sources before writing: whether a 1914 service battalion could fight at
Loos (Stage 1), locally raised companies, leave frequency for other ranks, and the routes to a
home posting.
