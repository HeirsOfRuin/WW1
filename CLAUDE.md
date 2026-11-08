# In the Trenches: working rules

- Read `docs/SPEC.md` first in every new session (the design and every decision in the
  author's words), then `docs/KILLGATE.md` (what the numbers model showed, and the open
  issues). Do not re-derive either from chat.
- Built with the HeirsOfRuin game-building skills (`Game-Workshop/skills/`). Read
  `game-building/SKILL.md` before writing game logic. Follow its stages and gates; skipping
  a stage is allowed, skipping it silently is not.
- Read `docs/DESIGN.md` (approved) before touching `src/`.
- Every commit runs `npm run check` first (build, tests, validate, text tools, bot, smoke).
  Every change to the war layer's numbers or rules re-runs the gate and puts the numbers,
  with their ± error, in the commit message.
- The kill-gate prototype (`prototypes/killgate/`) is retired (2026-11-09, sorties): it is the
  Stage 2 record, not maintained. The war layer is the only model; `npm run gate` measures it.
- Measurement: `npm run gate` (the KILLGATE tables from the real game), `choices`, `roles`,
  `skills`, `steps`, `measure`. The kit files in `sim/` (`run.js`, `ablate.js`,
  `stats.js`, `measure-lib.js`, `rng.js`) are copied from Game-Workshop and not edited here.
- Content is fiction: a fictional battalion and towns in real battles. Historical numbers
  go in data tables with sources once checked; until then they are marked as tuned, not sourced.
- Decisions go in the SPEC's dated table with the author's words quoted.
- Scratch files are `tools/_*.mjs` or `*.tmp.*` and are never committed. `dist/`, `out/`,
  `release/` are output and never committed.
- Write for a reader who was not there: plain words, the failure behind each rule, the
  number that was measured.
