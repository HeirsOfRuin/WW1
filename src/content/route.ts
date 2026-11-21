// The war's route (content/route.yaml) is where every `next: "@war"` goes. Written into each of the
// ~900 choices that use it, it made the content file 24 MB (2026-11-21, measured while preparing the
// itch release: 921 copies of a 26 KB table). The file keeps one copy (`warRoute`) and the marker;
// this puts the one table back in place of every marker, as a shared object, before the game reads it.
export const WAR_ROUTE = '@war';

export function linkRoute<T extends { scenes: object; warRoute?: unknown }>(bundle: T): T {
  const route = bundle.warRoute;
  if (!route) return bundle;
  const walk = (o: unknown): void => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    const r = o as Record<string, unknown>;
    for (const k of Object.keys(r)) {
      if (k === 'next' && r[k] === WAR_ROUTE) r[k] = route;
      else walk(r[k]);
    }
  };
  walk(bundle.scenes);
  return bundle;
}

/** The bundle as written to disk: the route once, the marker wherever it is used. */
export function packRoute(bundle: { scenes: object }, route: unknown): string {
  return JSON.stringify({ ...bundle, warRoute: route }, (k, v) => (k === 'next' && v === route ? WAR_ROUTE : v));
}
