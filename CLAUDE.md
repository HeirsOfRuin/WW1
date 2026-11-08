# In the Trenches: working rules

- Read `docs/SPEC.md` first in every new session (the design and every decision in the
  author's words), then `docs/KILLGATE.md` (what the numbers model showed, and the open
  issues). Do not re-derive either from chat.
- Built with the HeirsOfRuin game-building skills (`Game-Workshop/skills/`). Read
  `game-building/SKILL.md` before writing game logic. Follow its stages and gates; skipping
  a stage is allowed, skipping it silently is not.
- Read `docs/DESIGN.md` (approved) before touching `src/`. The war layer's rules of record are
  the kill-gate prototype until Phase 1 reproduces its numbers; then the prototype is retired.
- Every commit runs `npm run check` first (build, tests, validate, text tools, bot, smoke).
  Every change to the war layer's numbers or rules re-runs the gate and puts the numbers,
  with their ± error, in the commit message. The prototype's own tools are `npm run proto:*`.
- The war layer (`src/game/war/`) must play the same war as the kill-gate prototype on the same
  seed (`tests/game.test.ts`). A deliberate rule change retires that test and the prototype
  together, in the same commit, with the before and after `npm run gate` numbers.
- Measurement: `npm run gate` (the KILLGATE tables from the real game), `choices`, `roles`,
  `skills`, `measure`. The kit files in `sim/` and `prototypes/killgate/` (`run.js`, `ablate.js`,
  `stats.js`, `measure-lib.js`, `rng.js`) are copied from Game-Workshop and not edited here.
- Content is fiction: a fictional battalion and towns in real battles. Historical numbers
  go in data tables with sources once checked; until then they are marked as tuned, not sourced.
- Decisions go in the SPEC's dated table with the author's words quoted.
- Scratch files are `tools/_*.mjs` or `*.tmp.*` and are never committed. `dist/`, `out/`,
  `release/` are output and never committed.
- Write for a reader who was not there: plain words, the failure behind each rule, the
  number that was measured.
