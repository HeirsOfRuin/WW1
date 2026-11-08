// Specialist roles (author, 2026-11-09): do they pay, and do they cost? The adaptive soldier
// who never takes a specialist course, and the pit man who refuses or takes the tunnelling transfer.
// node npx tsx sim/ablate.js sim/ablations/roles.js --adapter=sim/adapter.ts
export default {
  runs: 500, by: ['town'], pool: [], fixed: { policy: 'adaptive' },
  base: {},
  variants: { noRoles: { noRoles: true }, tunnelRefused: { tunnel: false } },
  metrics: ['armistice', 'homeAlive', 'killed', 'grade', 'medal', 'rank', 'friendsAlive'],
};
