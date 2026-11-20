// Node-only: reads content/ into a bundle (the shared loader plus this game's starts).
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { loadBase, walkYaml, readYaml, parse, ContentError } from '@tools/content';
import { ConfigSchema, RegistrySchema, SceneSchema, StartSchema, GlossSchema, GAME_ID, type ContentBundle, type Start, type Gloss } from '../src/content/schema';
import { NextSchema, type Next } from '@engine/schema';
import '../src/game/module'; // the rules this content is played by

export { ContentError };
/** `next: "@war"` in a scene: the route in content/route.yaml. */
export const WAR_ROUTE = '@war';
export const CONTENT_DIR = join(import.meta.dirname, '..', 'content');
const REGISTRY = ['flags', 'npcs', 'traits', 'injuries', 'items', 'factions', 'endings', 'lore', 'places'];

export function loadContent(dir = CONTENT_DIR): ContentBundle {
  const { hash, base, rel } = loadBase({ dir, game: GAME_ID, config: ConfigSchema, registry: RegistrySchema, scene: SceneSchema, registryKeys: REGISTRY });
  const starts: Record<string, Start> = {};
  for (const p of walkYaml(join(dir, 'starts'))) {
    hash.update(readFileSync(p));
    const s = parse(StartSchema, readYaml(p), rel(p));
    if (starts[s.id]) throw new ContentError(`${rel(p)}: duplicate start ${s.id}`);
    starts[s.id] = s;
  }
  if (!Object.keys(starts).length) throw new ContentError('content/starts/: no start');
  // the soldier's words: every file in content/glossary/, merged; the first meaning of a term wins
  const glossary: Gloss[] = []; const seenTerm = new Set<string>();
  for (const p of walkYaml(join(dir, 'glossary'))) {
    hash.update(readFileSync(p));
    for (const g of (readYaml(p) as unknown[]) ?? []) {
      const e = parse(GlossSchema, g, rel(p));
      // a form (the term or an `also`) belongs to the first entry that lists it: two files listing
      // "tin hat" and "tin hats" under different terms left one of them matching nothing
      if (seenTerm.has(e.term.toLowerCase())) continue;
      seenTerm.add(e.term.toLowerCase());
      const also = (e.also ?? []).filter((a) => !seenTerm.has(a.toLowerCase()));
      also.forEach((a) => seenTerm.add(a.toLowerCase()));
      glossary.push(also.length ? { ...e, also } : { term: e.term, means: e.means });
    }
  }
  // The war's route (content/route.yaml) replaces every next: "@war", so it is written once and
  // the validator, bot and game all see the real switch.
  const routeFile = join(dir, 'route.yaml');
  hash.update(readFileSync(routeFile));
  const route = parse(NextSchema, readYaml(routeFile), rel(routeFile));
  const sub = (o: unknown): void => {
    if (Array.isArray(o)) { o.forEach(sub); return; }
    if (!o || typeof o !== 'object') return;
    const r = o as Record<string, unknown>;
    for (const k of Object.keys(r)) {
      if (k === 'next' && r[k] === WAR_ROUTE) r[k] = structuredClone(route) as Next;
      else sub(r[k]);
    }
  };
  sub(base.scenes);
  return { hash: hash.digest('hex').slice(0, 12), ...base, starts, glossary };
}
