// Nothing declared is decoration: each skill switched off must change some end states.
// node prototypes/killgate/ablate.js prototypes/killgate/ablations/skills.js --adapter=prototypes/killgate/adapter.js --inert
import { HOME_SKILLS, WAR_SKILLS } from '../data.js';
export default {
  // Every policy, town and general pick, so each skill is reachable by some soldier.
  runs: 20, by: [], pool: ['town', 'general', 'policy'], inert: true,
  base: {},
  variants: Object.fromEntries([...HOME_SKILLS, ...WAR_SKILLS].map((k) => [`no_${k}`, { off: [k] }])),
  metrics: ['armistice', 'grade'],
};
