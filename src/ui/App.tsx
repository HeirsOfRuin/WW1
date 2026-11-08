// The screens. Reads the engine's view(), computes nothing. Same hooks as every scaffolded game,
// so tools/smoke.mjs drives it unchanged: [data-act] for title and menu actions, .hud .turn for
// the clock, [data-action] for choices, [data-tab] for tabs.
import { useState } from 'preact/hooks';
import type { ContentBundle } from '../content/schema';
import { newGame, view, choose, startsOf, statusOf, artOf, recordOf, type GameState, type SceneView, type SoldierRecord } from '../game/index';

// Scene pictures (DESIGN §11): tools/art.ts writes src/art/<key>.png; the game asks artOf(state) which one.
const ART = import.meta.glob('../art/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const artUrl = (key: string | undefined) => (key ? ART[`../art/${key}.png`] : undefined);
import { toSave, fromSave, encodeSaveCode, decodeSaveCode, SAVE_KEY } from '../game/save';
import { STORAGE_OK, lsGet, lsSet } from './storage.js';

function load(content: ContentBundle): GameState | null {
  const raw = lsGet(SAVE_KEY);
  if (!raw) return null;
  try { return fromSave(JSON.parse(raw), content).state; } catch { return null; }
}
const paras = (t: string) => t.trim().split(/\n\s*\n/).map((p) => <p>{p}</p>);

export function App({ content }: { content: ContentBundle }) {
  const [state, setState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<'story' | 'soldier' | 'journal' | 'menu'>('story');
  const [page, setPage] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const commit = (s: GameState | null) => { setState(s); setPage(0); if (s) lsSet(SAVE_KEY, JSON.stringify(toSave(s, content))); };
  const begin = (start: string) => { commit(newGame(content, { start, seed: (Math.random() * 2 ** 31) >>> 0, name: 'Tom' })); setTab('story'); };

  if (!state) {
    const saved = load(content);
    return (
      <main class="title">
        <h1>{content.config.title}</h1>
        <p class="lede">{document.querySelector('meta[name="description"]')?.getAttribute('content')}</p>
        {!STORAGE_OK && <p class="warn">This browser is refusing to store anything for this page, so progress will not be kept. Menu &gt; Save code still works.</p>}
        <div class="stack">
          {saved && <button class="primary" data-act="continue" onClick={() => setState(saved)}>Continue</button>}
          {startsOf(content).map((id, i) => (
            <button class={!saved && i === 0 ? 'primary' : ''} data-act={i === 0 ? 'new' : `new-${id}`} onClick={() => begin(id)}>
              <strong>{content.starts[id]!.label}</strong><br /><small>{content.starts[id]!.summary}</small>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const v: SceneView = view(content, state);
  const pages = v.text.split(/^\s*\[break\]\s*$/m).map((t) => t.trim()).filter(Boolean);
  const last = page >= pages.length - 1;
  const act = (id: string) => {
    try { commit(choose(content, state, id).state); window.scrollTo(0, 0); } catch (e) { setNote((e as Error).message); }
  };
  return (
    <>
      <header class="hud"><span class="turn">{v.date}</span><span>{v.title}</span></header>
      {state.war.clock > 0 && !v.ended && (() => { const t = statusOf(state); return <p class="status" data-status>{t.rank}, {t.role} · <strong>{t.nerve}</strong> · {t.standing} · {t.section}</p>; })()}
      {note && <p class="banner">{note} <button onClick={() => setNote(null)}>OK</button></p>}
      <main class="panel">
        {tab === 'story' && <>
          {v.card && page === 0 && <section class="card"><h2>{v.card.title}</h2>{v.card.subtitle && <p>{v.card.subtitle}</p>}{v.card.epigraph && <p class="hint">{v.card.epigraph}</p>}</section>}
          {(v.outcome?.text || (v.outcome?.changes.length ?? 0) > 0) && page === 0 && <section class="outcome">{v.outcome!.text && paras(v.outcome!.text)}{v.outcome!.changes.length > 0 && <p class="hint">{v.outcome!.changes.join(' · ')}</p>}</section>}
          {v.cause && <p class="hint">Because: {v.cause.text}</p>}
          {page === 0 && artUrl(artOf(state)) && <img class="band" src={artUrl(artOf(state))} alt="" width={400} height={200} />}
          <h2>{v.title}</h2>
          {paras(pages[Math.min(page, pages.length - 1)] ?? '')}
          {v.ended
            ? <>{(content.registry.endings[v.ended.ending]?.label ?? 'The end') !== v.title && <h2>{content.registry.endings[v.ended.ending]?.label ?? 'The end'}</h2>}{v.ended.cause && <p>{v.ended.cause}</p>}
                <button class="primary" data-act="new" onClick={() => setState(null)}>Play again</button></>
            : !last
              ? <div class="stack"><button data-action="continue" onClick={() => setPage(page + 1)}>Continue ({page + 1} / {pages.length})</button></div>
              : <div class="stack">{v.deadEnd && <p class="warn">No choice is open here: this is a content bug. Menu &gt; Save code, and send it with a note.</p>}
                  {v.choices.map((c) => (
                    <button data-action={c.id} disabled={!c.available} class={c.lethal ? 'danger' : ''} onClick={() => act(c.id)}>
                      {c.text}
                      {c.band && <small> · {c.band}{c.test ? `, ${c.test}` : ''}</small>}
                      {c.warn && <><br /><small class="warn">{c.warn}</small></>}
                      {!c.available && c.lockReason && <><br /><small>{c.lockReason}</small></>}
                      {c.available && c.stakes.length > 0 && <><br /><small class="hint">{c.stakes.join(' · ')}</small></>}
                    </button>
                  ))}</div>}
        </>}
        {tab === 'soldier' && <Soldier r={recordOf(content, state)} />}
        {tab === 'journal' && <><h2>Journal</h2>{state.journal.length
          ? <ol class="journal">{[...state.journal].reverse().map((j) => <li><strong>{j.sceneTitle ?? j.scene}</strong>: {j.choice}{j.changes.length > 0 && <small> ({j.changes.join(' · ')})</small>}</li>)}</ol>
          : <p class="empty">Empty so far: every choice you make is written here.</p>}</>}
        {tab === 'menu' && <><h2>Menu</h2><div class="stack">
          <button data-act="code" onClick={async () => { const c = await encodeSaveCode(toSave(state, content)); try { await navigator.clipboard.writeText(c); setNote('Save code copied.'); } catch { setNote(c); } }}>Save code (copy)</button>
          <button data-act="load-code" onClick={async () => { const t = prompt('Paste a save code'); if (!t) return; try { commit(fromSave(await decodeSaveCode(t.trim()), content).state); setTab('story'); } catch (e) { setNote(`That code did not load: ${(e as Error).message}`); } }}>Load a save code</button>
          <button data-act="quit" onClick={() => setState(null)}>Back to the title</button></div>
          <p class="hint">Saves live in this browser on this device. A save code moves a game to another.</p></>}
      </main>
      <nav class="tabs">
        {(['story', 'soldier', 'journal', 'menu'] as const).map((t) => <button data-tab={t} class={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0]!.toUpperCase() + t.slice(1)}</button>)}
      </nav>
    </>
  );
}

// The Soldier tab: the record from recordOf(), shown, never computed here.
const bar = (value: number, max: number) => <span class="bar" role="img" aria-label={`${value} of ${max}`}><span style={{ width: `${Math.min(100, (100 * value) / max)}%` }} /></span>;
const lines = (xs: { label: string; note?: string }[], empty: string) =>
  xs.length ? <dl class="lines">{xs.map((x) => <><dt>{x.label}</dt>{x.note && <dd>{x.note}</dd>}</>)}</dl> : <p class="empty">{empty}</p>;

function Soldier({ r }: { r: SoldierRecord }) {
  return (
    <div class="soldier">
      <h2>{r.rank} {r.name}</h2>
      <p class="hint">{r.role}, {r.town}. Age {r.age}.</p>
      <p><strong>Nerve</strong>: {r.nerve.word} {bar(r.nerve.value, 100)}</p>
      <p><strong>Standing</strong>: {r.standing}</p>

      <h3>From home</h3>
      {lines(r.home, 'Nothing chosen yet.')}

      <h3>Learnt at the front</h3>
      <dl class="lines">{r.war.map((k) => <><dt>{k.label} {bar(k.level, 5)}</dt><dd>{k.note}</dd></>)}</dl>

      <h3>Traits</h3>
      {lines(r.traits, 'None yet. Traits come from what you do, and the story remembers them.')}

      <h3>Awards</h3>
      {lines(r.awards, 'None yet. Medals come from battles and missions that go well.')}

      <h3>Career</h3>
      {lines(r.career, 'Not yet begun.')}

      <h3>The section from home</h3>
      <ul class="section">{r.friends.map((f) => <li class={f.alive ? '' : 'dead'}><strong>{f.name}</strong>{f.written ? '' : ''}<br /><small>{f.status}</small></li>)}</ul>

      <h3>Rivals</h3>
      {lines(r.rivals, 'None yet.')}

      <h3>In all</h3>
      {lines(r.totals, '')}
    </div>
  );
}
