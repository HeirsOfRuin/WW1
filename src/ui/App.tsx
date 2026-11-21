// The screens. Reads the engine's view(), computes nothing. Same hooks as every scaffolded game,
// so tools/smoke.mjs drives it unchanged: [data-act] for title and menu actions, .hud .turn for
// the clock, [data-action] for choices, [data-tab] for tabs.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ContentBundle } from '../content/schema';
import { newGame, view, choose, startsOf, statusOf, artOf, recordOf, mapOf, reviewFor, newsSoFar, rasterize, glossOf, MAP_W, MAP_H, MAP_COLOURS, type GameState, type SceneView, type SoldierRecord, type YearReview } from '../game/index';

// Scene pictures (DESIGN §11): tools/art.ts writes src/art/<key>.png; the game asks artOf(state) which one.
const ART = import.meta.glob('../art/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const artUrl = (key: string | undefined) => (key ? ART[`../art/${key}.png`] : undefined);
import { toSave, fromSave, encodeSaveCode, decodeSaveCode, SAVE_KEY } from '../game/save';
import { STORAGE_OK, lsGet, lsSet } from './storage.js';
import { GAME_URL, PROFILE_URL } from './itch';

function load(content: ContentBundle): GameState | null {
  const raw = lsGet(SAVE_KEY);
  if (!raw) return null;
  try { return fromSave(JSON.parse(raw), content).state; } catch { return null; }
}
// Text with the soldier's words tappable (src/game/gloss.ts cuts it; this only shows it).
/** The rating ask is shown once: the first game (and scene) to show it keeps it until it is closed or rated. */
function rateOnce(key: string, here: string): boolean {
  const was = lsGet(key);
  if (was === 'done') return false;
  if (was === null || was === undefined || was === '') { lsSet(key, here); return true; }
  return was === here;
}

function Gloss({ word, means }: { word: string; means: string }) {
  const [open, setOpen] = useState(false);
  return <><span class="gloss" role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(!open); }}>{word}</span>{open && <span class="glossed" role="note"> ({means}) </span>}</>;
}
let GLOSSARY: ContentBundle['glossary'] = [];
// A choice is a button, so its words cannot be tapped: the soldier's words in the choices are listed
// above them instead (those the passage itself has not already marked).
const choiceWords = (texts: string[], body: string) => {
  const seen = SEEN; void body;
  const found = texts.flatMap((t) => glossOf(t, GLOSSARY, seen).filter((x): x is { word: string; means: string } => typeof x !== 'string'));
  return found.length > 0 && <p class="hint choicewords">In the choices: {found.map((x, i) => <>{i > 0 && ', '}<Gloss word={x.word} means={x.means} /></>)}</p>;
};
// one set for the whole screen (result, passage and choices), so a word is underlined once on it
let SEEN = new Set<string>();
const paras = (t: string) => { const seen = SEEN; return t.trim().split(/\n\s*\n/).map((p) => <p>{glossOf(p, GLOSSARY, seen).map((x) => (typeof x === 'string' ? x : <Gloss key={x.word} word={x.word} means={x.means} />))}</p>); };

export function App({ content }: { content: ContentBundle }) {
  // the soldier's words can be switched off in the Menu (kept in this browser)
  const [words, setWords] = useState(() => lsGet('trenches.words') !== 'off');
  GLOSSARY = words ? content.glossary : [];
  SEEN = new Set<string>();
  const [state, setState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<'story' | 'soldier' | 'map' | 'journal' | 'menu'>('story');
  const [page, setPage] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [, redraw] = useState(0);
  const commit = (s: GameState | null) => { setState(s); setPage(0); if (s) lsSet(SAVE_KEY, JSON.stringify(toSave(s, content))); };
  const begin = (start: string) => { commit(newGame(content, { start, seed: (Math.random() * 2 ** 31) >>> 0, name: 'Tom' })); setTab('story'); };
  // Loading a save code (playtest 3: a 5,000-character code pasted into the phone's prompt() box came
  // through cut short, "damaged or incomplete", and the game was lost). A text box in the page holds
  // any length; a failed load changes nothing; and a save link carries the code in the address.
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const loadCode = async (t: string) => {
    try { commit(fromSave(await decodeSaveCode(t.trim()), content).state); setTab('story'); setLoading(false); setCode(''); setNote(null); return true; }
    catch (e) { setNote(`That code did not load: ${(e as Error).message} It has ${t.trim().length} characters; a whole one has several thousand.`); return false; }
  };
  useEffect(() => {
    const h = location.hash;
    if (!h.startsWith('#save=')) return;
    history.replaceState(null, '', location.pathname + location.search);
    void loadCode(decodeURIComponent(h.slice(6)));
  }, []);
  const loadBox = loading && (
    <div class="stack loadbox">
      <label for="code"><strong>Paste the whole save code</strong> (it starts TRENCH1.)</label>
      <textarea id="code" rows={6} value={code} onInput={(e) => setCode((e.target as HTMLTextAreaElement).value)} autocomplete="off" spellcheck={false} />
      <button class="primary" data-act="load-go" onClick={() => void loadCode(code)}>Load it</button>
      <button data-act="load-cancel" onClick={() => { setLoading(false); setCode(''); }}>Cancel</button>
    </div>
  );

  if (!state) {
    const saved = load(content);
    return (
      <main class="title">
        <h1>{content.config.title}</h1>
        <p class="lede">{document.querySelector('meta[name="description"]')?.getAttribute('content')}</p>
        {!STORAGE_OK && <p class="warn">This browser is refusing to store anything for this page, so progress will not be kept. Menu &gt; Save code still works.</p>}
        {note && <p class="banner">{note} <button onClick={() => setNote(null)}>OK</button></p>}
        {loadBox || <div class="stack">
          {saved && <button class="primary" data-act="continue" onClick={() => setState(saved)}>Continue</button>}
          {startsOf(content).map((id, i) => (
            <button class={!saved && i === 0 ? 'primary' : ''} data-act={i === 0 ? 'new' : `new-${id}`} onClick={() => begin(id)}>
              <strong>{content.starts[id]!.label}</strong><br /><small>{content.starts[id]!.summary}</small>
            </button>
          ))}
          <button data-act="load-code" onClick={() => setLoading(true)}>Load a save code</button>
        </div>}
        <p class="hint more"><a href={PROFILE_URL} target="_blank" rel="noopener">More historical games by Heirs of Ruin</a></p>
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
          {v.card && page === 0 && <section class="card"><h2>{v.card.title}</h2>{v.card.subtitle && <p>{v.card.subtitle}</p>}{v.card.epigraph && <p class="hint"><em>{v.card.epigraph}</em></p>}
            {/* the engine always adds Station and Purse; this game has neither, so they are not shown */}
            {v.card.rows.filter(([k]) => k !== 'Station' && k !== 'Purse').map(([k, val]) => <p class="row"><span class="hint">{k}</span> {val}</p>)}
            {v.card.since.map((l) => <p class="hint">{l}</p>)}</section>}
          {(v.outcome?.text || (v.outcome?.changes.length ?? 0) > 0) && page === 0 && <section class="outcome">{v.outcome!.text && paras(v.outcome!.text)}{v.outcome!.changes.length > 0 && <p class="hint">{v.outcome!.changes.join(' · ')}</p>}</section>}
          {v.cause && <p class="hint">Because: {v.cause.text}</p>}
          {page === 0 && artUrl(artOf(state, v.sceneId)) && <img class="band" src={artUrl(artOf(state, v.sceneId))} alt="" width={400} height={200} />}
          <h2>{v.title}</h2>
          {paras(pages[Math.min(page, pages.length - 1)] ?? '')}
          {last && (() => { const r = reviewFor(state.war, v.sceneId); return r && <WarMap s={state} review={r} />; })()}
          {last && reviewFor(state.war, v.sceneId) && rateOnce('trenches.rate.first', `${state.seed}:${v.sceneId}`) && (
            <p class="rate-ask" data-rate="first-stop">A year at the front. If you are finding it worth playing, a rating on itch.io helps other people find it.{' '}
              <a href={GAME_URL} target="_blank" rel="noopener" onClick={() => { lsSet('trenches.rate.first', 'done'); redraw((n) => n + 1); }}>Rate it on itch.io</a>{' '}
              <button onClick={() => { lsSet('trenches.rate.first', 'done'); redraw((n) => n + 1); }}>Not now</button></p>)}
          {v.ended && !last
            ? <div class="stack"><button data-action="continue" onClick={() => setPage(page + 1)}>Continue ({page + 1} / {pages.length})</button></div>
            : v.ended
            ? <>{(content.registry.endings[v.ended.ending]?.label ?? 'The end') !== v.title && <h2>{content.registry.endings[v.ended.ending]?.label ?? 'The end'}</h2>}{v.ended.cause && <p>{v.ended.cause}</p>}
                {rateOnce('trenches.rate.end', String(state.seed)) && (
                  <p class="rate-ask" data-rate="end">If this war stayed with you, a rating on itch.io helps other people find it.{' '}
                    <a href={GAME_URL} target="_blank" rel="noopener" onClick={() => { lsSet('trenches.rate.end', 'done'); redraw((n) => n + 1); }}>Rate it on itch.io</a>{' '}
                    <button onClick={() => { lsSet('trenches.rate.end', 'done'); redraw((n) => n + 1); }}>Not now</button></p>)}
                <button class="primary" data-act="new" onClick={() => setState(null)}>Play again</button>
                <p class="hint more"><a href={PROFILE_URL} target="_blank" rel="noopener">More historical games by Heirs of Ruin</a></p></>
            : !last
              ? <div class="stack"><button data-action="continue" onClick={() => setPage(page + 1)}>Continue ({page + 1} / {pages.length})</button></div>
              : <div class="stack">{v.deadEnd && <p class="warn">No choice is open here: this is a content bug. Menu &gt; Save code, and send it with a note.</p>}
                  {choiceWords(v.choices.map((c) => c.text), pages[Math.min(page, pages.length - 1)] ?? '')}
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
        {tab === 'map' && <WarMap s={state} />}
        {tab === 'journal' && <><h2>Journal</h2>{state.journal.length
          ? <ol class="journal">{[...state.journal].reverse().map((j) => <li><strong>{j.sceneTitle ?? j.scene}</strong>: {j.choice}{j.changes.length > 0 && <small> ({j.changes.join(' · ')})</small>}</li>)}</ol>
          : <p class="empty">Empty so far: every choice you make is written here.</p>}
          <h3>The soldier's words</h3><p class="hint">Tap any underlined word in the story for its meaning. All of them:</p>
          <dl class="lines">{[...content.glossary].sort((a, b) => a.term.localeCompare(b.term)).map((g) => <><dt>{g.term}</dt><dd>{g.means}</dd></>)}</dl></>}
        {tab === 'menu' && <><h2>Menu</h2><div class="stack">
          <button data-act="code" onClick={async () => { const c = await encodeSaveCode(toSave(state, content)); try { await navigator.clipboard.writeText(c); setNote(`Save code copied (${c.length} characters).`); } catch { setNote(c); } }}>Save code (copy)</button>
          <button data-act="link" onClick={async () => { const c = await encodeSaveCode(toSave(state, content)); const url = `${location.origin}${location.pathname}#save=${c}`; try { await navigator.clipboard.writeText(url); setNote('Save link copied: open it on any device to carry on from here.'); } catch { setNote(url); } }}>Save link (copy)</button>
          {loadBox || <button data-act="load-code" onClick={() => setLoading(true)}>Load a save code</button>}
          <button data-act="words" onClick={() => { lsSet('trenches.words', words ? 'off' : 'on'); setWords(!words); }}>Underline the soldier's words: {words ? 'on' : 'off'}</button>
          <button data-act="quit" onClick={() => setState(null)}>Back to the title</button></div>
          <p class="hint">Saves live in this browser on this device. A save code or a save link moves a game to another.</p>
          <p class="hint more"><a href={GAME_URL} target="_blank" rel="noopener">Rate In the Trenches on itch.io</a> · <a href={PROFILE_URL} target="_blank" rel="noopener">More games by Heirs of Ruin</a></p></>}
      </main>
      <nav class="tabs">
        {(['story', 'soldier', 'map', 'journal', 'menu'] as const).map((t) => <button data-tab={t} class={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0]!.toUpperCase() + t.slice(1)}</button>)}
      </nav>
    </>
  );
}

// The Map tab (the author, 2026-11-17: "a pixel map of the overall war"): mapOf() says what,
// rasterize() decides every pixel; this only puts them on a canvas.
const rgb = (c: readonly number[]) => `rgb(${c.join(',')})`;
function WarMap({ s, review }: { s: GameState; review?: YearReview }) {
  const v = mapOf(s.war, review?.sinceLine);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) ctx.putImageData(new ImageData(rasterize(v) as Uint8ClampedArray<ArrayBuffer>, MAP_W, MAP_H), 0, 0);
  });
  const was = review ? (review.since === 'since you went out' ? 'The line when you went out' : `The line in ${review.since.slice(6)}`) : 'The line in 1915';
  const key: [readonly number[], string][] = [[MAP_COLOURS.line, 'The front line now'], [MAP_COLOURS.first, was], [MAP_COLOURS.german, 'Held by the Germans'], [MAP_COLOURS.here, 'You'], [MAP_COLOURS.fought, 'Battle fought (x)'], [MAP_COLOURS.missed, 'Battle missed (o)']];
  const news = review ? review.news : newsSoFar(s.war);
  return (
    <div class="warmap">
      <h2>{review ? `The war ${review.since}` : `The front, ${v.month}`}</h2>
      <canvas ref={ref} width={MAP_W} height={MAP_H} class="pixelmap" role="img" aria-label={`Map of the Western Front, ${v.month}. ${v.here.where}.`} />
      <p><strong>You</strong>: {v.here.where}.</p>
      <p class="hint">{v.line.caption}</p>
      <ul class="legend">{key.map(([c, t]) => <li><span class="swatch" style={{ background: rgb(c) }} />{t}</li>)}</ul>
      {!review && v.battles.length > 0 && <><h3>Your battles</h3><dl class="lines">{v.battles.map((b) => <><dt>{b.words}</dt><dd>{b.fought ? 'Fought' : 'Missed'}</dd></>)}</dl></>}
      {news.length > 0 && <><h3>{review ? 'What happened' : 'The war so far'}</h3><dl class="lines">{news.map((n) => <><dt>{n.month}</dt><dd>{n.text}</dd></>)}</dl></>}
      {!review && <p class="hint">The line is drawn to within a few miles; the places the battalion was are the story's.</p>}
    </div>
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
      {r.next.length > 0 && <><h3>The next step</h3>{lines(r.next, '')}</>}

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

      {r.crew && <>
        <h3>{r.crew.title}</h3>
        <ul class="section">{r.crew.men.map((m) => <li class={m.alive ? '' : 'dead'}><strong>{m.name}</strong><br /><small>{m.status}</small></li>)}</ul>
      </>}

      <h3>Rivals</h3>
      {lines(r.rivals, 'None yet.')}

      <h3>In all</h3>
      {lines(r.totals, '')}
    </div>
  );
}
