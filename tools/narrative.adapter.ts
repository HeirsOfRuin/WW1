// In the Trenches on the game-narrative text tools (tools/narrative/): lint-style, render-scan,
// continuity and audit-choices read the game through this file only.
import { join } from 'node:path';
import { playOnce, POLICIES } from '@tools/play';
import { validateCond, test } from '@engine/conditions';
import { loadContent, CONTENT_DIR } from './content-loader';
import { newGame, view, startsOf } from '../src/game/index';
import type { ContentBundle } from '../src/content/schema';
import type { GameState } from '../src/game/state';
import type { NarrativeAdapter, Seen, Written } from './narrative/adapter';

function textsOf(c: ContentBundle): Written[] {
  const out: Written[] = [];
  const add = (where: string, text: string | undefined) => { if (text) out.push({ where, text }); };
  const effects = (where: string, es: unknown[] = []) => {
    for (const e of es as Record<string, unknown>[]) {
      if ('then' in e) { effects(where, e.then as unknown[]); effects(where, e.else as unknown[]); }
      if (typeof e.journal === 'string') add(`${where}(journal)`, e.journal);
      if (typeof e.die === 'string') add(`${where}(death)`, e.die);
    }
  };
  for (const s of Object.values(c.scenes)) {
    const w = `${c.sources[s.id]}:${s.id}`;
    add(w, s.text); add(`${w}(title)`, s.title);
    for (const [k, t] of Object.entries(s.variants ?? {})) add(`${w}(variant ${k})`, t);
    effects(w, s.on_enter);
    for (const ch of s.choices) {
      const cw = `${w}/${ch.id}`;
      add(cw, ch.text); add(`${cw}(warn)`, ch.warn); add(`${cw}(after)`, ch.text_after); effects(cw, ch.effects);
      for (const k of ['success', 'partial', 'failure'] as const) { add(`${cw}[${k}]`, ch[k]?.text); effects(cw, ch[k]?.effects); }
    }
  }
  for (const st of Object.values(c.starts)) { add(`starts/${st.id}`, st.label); add(`starts/${st.id}`, st.summary); }
  for (const [id, n] of Object.entries(c.registry.npcs)) add(`npcs/${id}`, n.notes);
  for (const [id, e] of Object.entries(c.registry.endings)) { add(`endings/${id}`, e.label); add(`endings/${id}`, e.description); }
  return out;
}

export const adapter: NarrativeAdapter<ContentBundle, GameState> = {
  name: 'In the Trenches',
  load: () => loadContent(),
  styleGuide: join(CONTENT_DIR, 'style-guide.md'),
  textsOf,
  play(content, runs, observe) {
    for (const start of startsOf(content)) for (let i = 0; i < runs; i++) {
      playOnce<GameState>(content, start, (seed) => newGame(content, { start, seed, name: 'Bot', sex: i % 2 ? 'female' : 'male' }), 3 + i * 7919, POLICIES[i % POLICIES.length]!, {
        observe: (s, v) => {
          const from = s.journal.at(-1)?.scene ?? s.scene;
          const texts: Seen[] = [{ kind: 'text', scene: s.scene, text: v.text }, { kind: 'title', scene: s.scene, text: v.title ?? '' }, { kind: 'outcome', scene: from, text: v.outcome?.text ?? '' }, ...v.choices.map((c) => ({ kind: 'choice' as const, scene: s.scene, text: c.text }))];
          observe({ state: s, scene: s.scene, texts });
        },
      });
    }
  },
  scenes: (content) => Object.values(content.scenes).map((s) => ({ ...s, group: s.chapter }) as never),
  cond: { validate: (src, c) => validateCond(src as never, c), test: (src, s, c) => test(src as never, s, c) },
  continuityFile: join(CONTENT_DIR, 'continuity.yaml'),
  groupOf: (content, scene) => content.scenes[scene]?.chapter,
  dead: (s, content) => Object.entries(content.registry.npcs).filter(([id]) => s.npcs[id] && !s.npcs[id]!.alive).map(([id, n]) => {
    const first = n.name.split(' ')[0]!;
    return { id, names: [n.name, ...(n.title ? [`${n.title} ${first}`] : [])] };
  }),
};
