// CLI: npm run validate. The shared checks (packages/tools/src/validate.ts: conditions, text,
// effects, links, flags, lethal choices, reachability, endings) plus this game's own.
import { validateContent, type Issue } from '@tools/validate';

import { loadContent, ContentError } from './content-loader';
import type { ContentBundle } from '../src/content/schema';

export function validate(content: ContentBundle): Issue[] {
  const extra: Issue[] = [];
  const err = (where: string, message: string) => extra.push({ severity: 'error', where, message });
  // the game's own rules: each start's scene, stats and station exist
  for (const s of Object.values(content.starts)) {
    const w = `starts/${s.id}`;
    if (!content.scenes[s.start_scene]) err(w, `unknown start scene "${s.start_scene}"`);
    if (!content.config.stations.includes(s.hero.station)) err(w, `unknown station "${s.hero.station}"`);
    for (const a of Object.keys(s.hero.attributes)) if (!content.config.attributes.includes(a)) err(w, `unknown attribute "${a}"`);
    for (const k of Object.keys(s.hero.skills)) if (!content.config.skills.includes(k)) err(w, `unknown skill "${k}"`);
  }
  const issues = validateContent(content, {
    starts: Object.values(content.starts).map((s) => s.start_scene),
    variantKeys: Object.keys(content.starts),
    checkGameEffect: (where, e, e2) => {
      if ('toll' in e && typeof (e as { toll: unknown }).toll !== 'number') e2(where, 'toll takes pence');
    },
  });
  return [...extra, ...issues];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const content = loadContent();
    const issues = validate(content);
    const errors = issues.filter((i) => i.severity === 'error');
    for (const i of errors) console.log(`ERROR   ${i.where}: ${i.message}`);
    for (const i of issues.filter((i) => i.severity === 'warning')) console.log(`warning ${i.where}: ${i.message}`);
    console.log(`\n${Object.keys(content.scenes).length} scenes, ${Object.keys(content.starts).length} starts, ${errors.length} errors, ${issues.length - errors.length} warnings`);
    process.exit(errors.length ? 1 : 0);
  } catch (e) {
    if (e instanceof ContentError) { console.error(e.message); process.exit(1); }
    throw e;
  }
}
