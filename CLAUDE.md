# WW1 (working title): working rules

- Read `docs/SPEC.md` first in every new session (the design and every decision in the
  author's words), then `docs/KILLGATE.md` (what the numbers model showed, and the open
  issues). Do not re-derive either from chat.
- Built with the HeirsOfRuin game-building skills (`Game-Workshop/skills/`). Read
  `game-building/SKILL.md` before writing game logic. Follow its stages and gates; skipping
  a stage is allowed, skipping it silently is not.
- Every commit runs `npm run check` first. Every change to the model's numbers or rules
  re-runs `npm run gate` and puts the numbers, with their ± error, in the commit message.
- The kit files in `prototypes/killgate/` (`run.js`, `ablate.js`, `stats.js`,
  `measure-lib.js`, `rng.js`) are copied from Game-Workshop and not edited here.
- Content is fiction: a fictional battalion and towns in real battles. Historical numbers
  go in data tables with sources once checked; until then they are marked as tuned, not sourced.
- Decisions go in the SPEC's dated table with the author's words quoted.
- Scratch files are `tools/_*.mjs` or `*.tmp.*` and are never committed. `dist/`, `out/`,
  `release/` are output and never committed.
- Write for a reader who was not there: plain words, the failure behind each rule, the
  number that was measured.
