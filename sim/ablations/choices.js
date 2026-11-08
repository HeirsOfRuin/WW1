// Is every choice best somewhere? The adaptive soldier with one decision forced.
// node npx tsx sim/ablate.js sim/ablations/choices.js --adapter=sim/adapter.ts
export default {
  runs: 250, by: [], pool: ['town'], fixed: { policy: 'adaptive' },
  base: {},
  variants: {
    phaseBlind: { battle: 'blind' }, alwaysPush: { battle: 'push' }, alwaysHelp: { battle: 'help' }, alwaysGround: { battle: 'ground' }, groundInTrench: { battle: 'groundInTrench' }, ignoreStall: { battle: 'ignoreStall' },
    volunteerAll: { volunteer: true }, volunteerNone: { volunteer: false },
  },
  metrics: ['armistice', 'homeAlive', 'grade', 'medal', 'friendsAlive', 'broken', 'courtMartial'],
};
