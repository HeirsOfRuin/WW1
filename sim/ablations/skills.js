// Nothing declared is decoration: each skill switched off must change some end states.
// npx tsx sim/ablate.js sim/ablations/skills.js --adapter=sim/adapter.ts --inert
const SKILLS = ['dig', 'mech', 'lit', 'field', 'stamina', 'firstaid', 'sport', 'voice', 'trench', 'bomb', 'lewis', 'snipe', 'signals', 'lead', 'tunnel'];
export default {
  // Every policy, town and general pick, so each skill is reachable by some soldier.
  runs: 20, by: [], pool: ['town', 'general', 'policy'], inert: true,
  base: {},
  variants: Object.fromEntries(SKILLS.map((k) => [`no_${k}`, { off: [k] }])),
  metrics: ['armistice', 'grade'],
};
