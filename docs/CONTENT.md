# Content authoring reference

> From the game-narrative skill (Knight of Adalia's reference, generalised). Edit it as the game grows its own effects and paths.

All game content lives in `/content` as YAML. `src/content/schema.ts` (Zod) is the authoritative schema. This file documents it for writers. `npm run validate` and `npm run lint:style` must pass before committing content.

## Files
| Path | Holds |
|---|---|
| `config.yaml` | Attributes, skills, stations, tracks, seasons, chapters, start year |
| `registry/flags.yaml` | Every flag, with a description. `hidden: true` keeps it out of the UI. `later: ch2` marks a flag set now and read in a later chapter. The "never read" warning stays quiet until that chapter has content. |
| `registry/npcs.yaml` | Every named NPC: name, title, faction, starting affection/respect, notes |
| `registry/traits.yaml`, `injuries.yaml`, `items.yaml` | Labels, descriptions and stat `mods` (e.g. `skill.arms: -2`). Injuries have `heals_after` (seasons; omit for permanent) and an optional `scar` trait. |
| `registry/factions.yaml` | Reputation tracks. `kind: faction` ranges -10..10; `kind: personal` (honor, ruthlessness, piety) ranges 0..10. |
| `registry/endings.yaml` | Endings. `chapter` says when the validator starts demanding they be reachable. |
| `starts/*.yaml` | Who you are when the game begins: label, summary, first scene, the hero's stats and coin |
| `scenes/<chapter>/*.yaml` | Spine scenes. A file holds one scene or a list of scenes. |
| `events/*.yaml` | Pool and queued events, same format |
| `style-guide.md` | Voice, and the lint's banned and watch lists |
| `continuity.yaml` | Phrases allowed only while a condition holds; the dead stay dead |

## Scene
```yaml
- id: c1_tourney_lists          # lower_snake_case, unique across all content
  chapter: ch1                  # one of config.chapters
  kind: spine                   # spine | pool | queued | ending
  title: The Lists at Ravell
  tags: [martial, court]
  requires: [ station >= squire ]   # pool/queued: eligibility. spine: documentation only.
  pool: c1_summer              # pool scenes only: which group they belong to
  weight: 10                    # pool scenes only: draw weight
  once: true                    # pool: never repeats (default true)
  cooldown: { seasons: 2 }      # pool, when once: false
  checkpoint: true              # save fallback point if content changes
  on_enter: [ ...effects ]      # applied on arrival
  text: |
    Passage text. Blank line = new paragraph.
  variants:                     # optional: full replacement text per start (GameModule.variantKey)
    archer: |
      ...
  choices: [ ...choices ]
```
- **Spine** scenes form the authored backbone and link by `next`.
- **Pool** scenes are interludes. They are drawn by a spine choice's `next: { pool, count, then }` and must end with `next: "@return"`.
- **Queued** scenes are delayed consequences, scheduled by a `queue` effect. They fire before the next scene once due, then `@return`. They do not change the chapter.
- **Ending** scenes have `ending: <registry id>` and no choices.

## Choice
```yaml
- id: bribe                       # unique within the scene
  text: Press a coin into the porter's hand.
  tags: [wealth]                  # approach: martial, cunning, diplomacy, wealth, allies, learning, piety, yield...
  requires: [ res.coin >= 12 ]    # visible; shown locked with "Requires Coin 1s" when unmet
  label: "Requires: the porter's trust"   # optional override for the lock text
  visible_if: [ flag.knows_porter ]       # hidden entirely when unmet
  lethal: true                    # can kill; needs `warn` and a `check`
  warn: The porter's dogs are loose.
  # without a check:
  text_after: Outcome text.
  effects: [ ...effects ]
  next: c1_gatehouse
  # with a check (text_after/next go in the outcomes):
  check: { attr: presence, skill: diplomacy, difficulty: 4, audience: knights, mods: [ { if: flag.x, add: 1, label: "he owes you" } ] }
  success: { text: ..., effects: [...], next: ... }
  partial: { text: ..., effects: [...], next: ... }   # optional; falls back to failure
  failure: { text: ..., effects: [...], next: ... }
```
**Rules the validator enforces**
- Every non-ending scene has at least one choice with no `requires` and no `visible_if`. The player is never left without an option.
- `die` effects only appear in outcomes of `lethal` choices.
- Every lethal choice has a `warn` and a `check`.

## Checks and odds
- Score = effective attribute + effective skill + audience modifier + situational mods − difficulty.
- Chance of full success = 50% + 10% per point of score, clamped to 5–95%. A further 15% band above that is partial success.
- The UI shows a band, never a number:
  - **Risky**: under 40%
  - **Even**: 40–65%
  - **Favorable**: over 65%
- `audience` names who is watching (nobles, knights, commons, merchants, clergy); the game's `audience` hook turns it into a modifier, or none.
- Difficulty guide: 2 easy, 3 ordinary, 4 hard, 5 very hard, 6+ desperate.

## Conditions
Conditions are strings. A list means all must hold. Combine them with `{ all: [...] }`, `{ any: [...] }` or `{ not: ... }`.

```
flag.met_aldric          !flag.disgraced         counter.debts >= 2
attr.wits >= 3           skill.diplomacy >= 4     (effective values: injuries, traits and items count)
rep.knights <= -2        rep.honor >= 5           res.coin >= 240 (pence)   res.renown >= 10
rel.hamon_darrell.affection >= 3   rel.X.respect   rel.X.loyalty   npc.X.met   npc.X.alive
favor.hamon_darrell >= 1
trait.literate_vernacular   injury.broken_hand   item.yew_bow
station >= squire        track == levy           start == heir
chapter >= ch1           calendar.season == winter   calendar.year >= 15   age >= 16   health <= 3
ferry.repair >= 1        (a game's own paths: src/game/module.ts namespaces)
```
Station, chapter and season compare by their order. For example, `station >= squire` is true for a knight.

The hero's own paths (`attr`, `skill`, `trait`, `injury`, `item`, `health`, `age`, `injured`, `wounded`, `armour`, `station`, `track`) can also be written with `hero.` in front: `hero.attr.wits` is `attr.wits`. Three paths exist only with it: `hero.sex` (`male` or `female`), `hero.name` and `hero.alive`. Use the bare form unless the game has other playable characters (House of Adalia's heirs).

## Effects
```yaml
- set: flag.x                     # and: clear: flag.x
- add: { skill.arms: 1, rep.knights: -1, res.coin: -24, rel.hamon_darrell.affection: 2, favor.hamon_darrell: 1, counter.debts: 1, health: -2 }
- assign: { track: levy, chapter: ch1 }
- toll: 6                         # a game's own effect (src/content/schema.ts GAME_EFFECTS, src/game/module.ts effects)
- trait: +hot_tempered            # or -hot_tempered
- item: +yew_bow                  # or -yew_bow
- injury: broken_hand             # heal: broken_hand
- station: squire                 # optional track: squire_track
- meet: hamon_darrell             # kill: hamon_darrell
- queue: { event: c3_wat_returns, delay: { seasons: 6 }, earliest_chapter: ch3 }   # fires once due AND that chapter is reached
- advance: { seasons: 1 }         # ages the character, heals injuries
- journal: "A line for the journal."
- die: "Cause of death, shown on the ending screen. Takes {variables}."
- alias: { master: ancel_brome }  # point @master at an NPC
- if: flag.x                      # conditional effects; else is optional
  then: [ ...effects ]
  else: [ ...effects ]
```

## Aliases
`config.yaml` declares alias slots (`master`, `rival`). The `alias` effect fills them.
- `@master` can be used anywhere an NPC id can: `rel.@master.respect >= 3`, `npc.@master.alive`, `favor.@master`, `{npc.@master.title}`, `kill: "@master"`.
- `alias.master == hamon_darrell` tests who currently fills the slot.

## Routing
`next` can be a switch. The first branch whose condition holds wins:
```yaml
next:
  switch:
    - { if: alias.master == hamon_darrell, go: c1_trouble_hamon }
  default: c1_trouble_ancel
```
Clamps:
- attributes 1–6;
- skills 0–10;
- faction reputation −10..10, personal 0..10;
- relationships −10..10;
- coin never below 0;
- health 1–10 (health alone never kills).

## Text
- `{name}`, `{date}`, `{coin}`, `{station}`, `{season}`, `{year}`, `{age}`, `{age_words}`, and the game's own (`{takings}`: GameModule.textVar)
- Pronouns for the hero, written in the masculine and rendered for the hero's sex: `{he}` (she), `{him}` (her), `{his}` (her), `{himself}` (herself), `{lord}` (lady), `{man}` (woman), `{son}` (daughter). Capitalise the first letter to capitalise the word: `{He}`, `{His}`. Only pronouns may be capitalised.
- Titles take templates too.
- Do not start a passage with `{date}`; the UI already shows the date above every scene.
- `{npc.hamon_darrell}` gives the name; `{npc.hamon_darrell.title}` gives "Sir Hamon Darrell".
- Any condition path, for example `{skill.arms}`.
- `[if cond]...[elif cond]...[else]...[/if]`, which can be nested. A text condition is a single expression or a chain with `&&` and `||` (`&&` binds tighter; no parentheses).
- `injured` is true while any injury is active. Use it for the death rule: kill only `if: [ "!injured", armour... ]` fails.

## Starts
See `starts/*.yaml`. A start names its first scene and the hero's stats; scenes vary their text by start with `variants:` and `[if start == id]`.

## Scripted plans
`tools/plans/*.yaml` are fixed routes through the game: `scene/choice` per scene (`scene/choice!success` forces the roll); a scene not in the plan takes its first open choice.
- `npm run transcript` renders them as readable Markdown in `docs/playthroughs/`. Read one after every content change.
- When content changes break a plan, either fix the content or update the plan on purpose.

## Pages, friends, followers, codex
- **Pages.** A line containing only `[break]` in a scene's text splits it into pages. The player sees a Continue button between pages, and the choices appear after the last page.
- **Friends.** `npc.X.friend` is true when affection is 5 or more and respect 2 or more, unless the NPC is tagged `family`.
  - Use it for mods, for example `{ if: npc.will_cobb.friend, add: 1, label: Cobb has your back }`.
  - Use it for extra options, and to soften failures.
- **Followers.** The `join: npc` and `leave: npc` effects move an NPC into or out of the retinue. `npc.X.follower` tests one NPC. `retinue` counts living followers plus `res.men` (unnamed soldiers).
- **People page.** `registry/codex.yaml` maps an NPC id to a list of `{ if?, text }` entries, shown once met and once the condition holds.
- **World page.** `registry/lore.yaml` holds entries `{ title, category, if?, text }`. Categories are places, powers, people, customs, money, war and faith.
- **Partial outcomes.** A check gets a partial band only if the choice defines `partial:`. Write a partial as a mixed win, never as a failure.
