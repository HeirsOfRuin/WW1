// CLI: npm run transcript. Plays each plan in tools/plans/*.yaml and writes it as a readable
// Markdown transcript to docs/playthroughs/: the text, the choices with their locks and stakes,
// what was chosen and what changed. Read one after every content change: it is the cheapest
// playtest there is (Knight of Adalia's reviews ran on these).
//
// A plan: { name, start, seed, choices: [ "scene/choice", "scene/choice!success", ... ] }
// "!success" etc. forces a check's result; a scene not in the plan takes its first available choice.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { loadContent } from './content-loader';
import { newGame, view, choose } from '../src/game/index';
import type { CheckResult } from '@engine/checks';
import type { ContentBundle } from '../src/content/schema';

interface Plan { name: string; start: string; seed: number; choices: string[] }
const PLANS = join(import.meta.dirname, 'plans');

export function transcript(content: ContentBundle, plan: Plan): string {
  let s = newGame(content, { start: plan.start, seed: plan.seed, name: 'Hal' });
  const out = [`# ${plan.name}`, '', `Start: ${content.starts[plan.start]!.label}. Seed ${plan.seed}.`, ''];
  for (let i = 0; i < 300 && !s.ended; i++) {
    const v = view(content, s);
    out.push(`## ${v.title ?? v.sceneId}`, '');
    if (v.dateChanged) out.push(`*${v.date}*`, '');
    if (v.cause) out.push(`> Consequence of: ${v.cause.text}`, '');
    out.push(v.text.replace(/\n\s*\[break\]\s*\n/g, '\n\n*(Continue)*\n\n'), '');
    for (const c of v.choices) {
      const meta = [c.band, c.lethal ? 'MORTAL DANGER' : '', c.lockReason ?? ''].filter(Boolean).join(', ');
      out.push(`- ${c.available ? '' : '~~'}${c.text}${c.available ? '' : '~~'}${meta ? ` *(${meta})*` : ''}${c.stakes.length ? `  \n  <small>At stake: ${c.stakes.join(' · ')}</small>` : ''}`);
    }
    const planned = plan.choices.find((p) => p.startsWith(`${s.scene}/`));
    const [id, force] = planned ? planned.split('/')[1]!.split('!') : [v.choices.find((c) => c.available)?.id];
    if (!id) { out.push('', '**Dead end: no available choice.**'); break; }
    const chosen = v.choices.find((c) => c.id === id)!;
    s = choose(content, s, id, { force: force as CheckResult | undefined }).state;
    const o = s.lastOutcome!;
    out.push('', `**Chose:** ${chosen.text}${o.check ? ` (${o.check.band}: ${o.check.result})` : ''}`, '');
    if (o.text) out.push(o.text, '');
    if (o.changes.length) out.push(`*${o.changes.join(' · ')}*`, '');
  }
  const end = view(content, s);
  out.push(`## ${end.title ?? end.sceneId}`, '', end.text, '');
  if (s.ended?.cause) out.push(`*${s.ended.cause}*`, '');
  return out.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const content = loadContent();
  const dir = join(import.meta.dirname, '..', 'docs', 'playthroughs');
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(PLANS).filter((n) => n.endsWith('.yaml')).sort()) {
    const plan = YAML.parse(readFileSync(join(PLANS, f), 'utf8')) as Plan;
    const file = join(dir, f.replace(/\.yaml$/, '.md'));
    writeFileSync(file, transcript(content, plan));
    console.log(`wrote ${file}`);
  }
}
