// Sorties (docs/FRAME-PLAYTEST1.md): is each way of doing a step best somewhere? The adaptive
// soldier, with every step forced bold, steady, careful or (where allowed) turned back.
// npx tsx sim/ablate.js sim/ablations/steps.js --adapter=sim/adapter.ts
export default {
  runs: 1000, by: [], pool: ['town'], fixed: { policy: 'adaptive' },
  base: {},
  variants: { allBold: { step: 'bold' }, allSteady: { step: 'steady' }, allCareful: { step: 'careful' }, turnBack: { step: 'back' } },
  metrics: ['armistice', 'homeAlive', 'killed', 'medal', 'rank', 'grade', 'sortieOk'],
};
