// Is every choice best somewhere? The adaptive soldier with one decision forced.
// node prototypes/killgate/ablate.js prototypes/killgate/ablations/choices.js --adapter=prototypes/killgate/adapter.js
export default {
  runs: 250, by: [], pool: ['town'], fixed: { policy: 'adaptive' },
  base: {},
  variants: {
    phaseBlind: { battle: 'blind' }, alwaysPush: { battle: 'push' }, alwaysHelp: { battle: 'help' }, alwaysGround: { battle: 'ground' }, groundInTrench: { battle: 'groundInTrench' }, ignoreStall: { battle: 'ignoreStall' },
    volunteerAll: { volunteer: true }, volunteerNone: { volunteer: false },
  },
  metrics: ['armistice', 'homeAlive', 'grade', 'medal', 'friendsAlive', 'broken', 'courtMartial'],
};
