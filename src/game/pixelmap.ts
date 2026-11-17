// The war map drawn as pixels (src/game/warmap.ts gives what to draw). Pure: no DOM, so a test can
// read a pixel. Every pixel is decided here: polygons by pixel centre, lines by Bresenham, labels in
// a 3x5 pixel font, so the map is pixel art at any size the screen shows it (CSS: pixelated).
import { SEA, FRONTIER, SOMME, PLACES, project, type LatLon, type MapView } from './warmap';

export const MAP_W = 180, MAP_H = 144;
type RGB = readonly [number, number, number];
export const MAP_COLOURS = {
  land: [86, 84, 58], german: [104, 56, 46], sea: [26, 46, 70], frontier: [110, 104, 80], river: [52, 82, 100],
  first: [130, 96, 60], line: [204, 60, 44], label: [222, 214, 194], shadow: [16, 16, 12],
  here: [244, 202, 76], fought: [236, 231, 220], missed: [150, 144, 130],
} as const satisfies Record<string, RGB>;

// a 3x5 pixel font, row by row, for the place names
const GLYPHS: Record<string, string[]> = {
  'A': ['.#.', '#.#', '###', '#.#', '#.#'],
  'B': ['##.', '#.#', '##.', '#.#', '##.'],
  'C': ['.##', '#..', '#..', '#..', '.##'],
  'D': ['##.', '#.#', '#.#', '#.#', '##.'],
  'E': ['###', '#..', '##.', '#..', '###'],
  'G': ['.##', '#..', '#.#', '#.#', '.##'],
  'H': ['#.#', '#.#', '###', '#.#', '#.#'],
  'I': ['###', '.#.', '.#.', '.#.', '###'],
  'K': ['#.#', '#.#', '##.', '#.#', '#.#'],
  'L': ['#..', '#..', '#..', '#..', '###'],
  'M': ['#.#', '###', '###', '#.#', '#.#'],
  'N': ['##.', '#.#', '#.#', '#.#', '#.#'],
  'O': ['.#.', '#.#', '#.#', '#.#', '.#.'],
  'P': ['##.', '#.#', '##.', '#..', '#..'],
  'R': ['##.', '#.#', '##.', '#.#', '#.#'],
  'S': ['.##', '#..', '.#.', '..#', '##.'],
  'T': ['###', '.#.', '.#.', '.#.', '.#.'],
  'U': ['#.#', '#.#', '#.#', '#.#', '###'],
  'V': ['#.#', '#.#', '#.#', '#.#', '.#.'],
  'Y': ['#.#', '#.#', '.#.', '.#.', '.#.'],
  ' ': ['...', '...', '...', '...', '...'],
};
const glyph = (c: string) => (GLYPHS[c] ?? GLYPHS[' ']!).join('');

/** The map as RGBA, MAP_W x MAP_H. */
export function rasterize(v: MapView): Uint8ClampedArray {
  const px = new Uint8ClampedArray(MAP_W * MAP_H * 4);
  const put = (x: number, y: number, c: RGB) => {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;
    const i = (y * MAP_W + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
  };
  const P = (p: LatLon) => project(p, MAP_W, MAP_H);
  const inside = (x: number, y: number, poly: [number, number][]) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i]!; const [xj, yj] = poly[j]!;
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const fill = (poly: [number, number][], c: RGB) => {
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (inside(x + 0.5, y + 0.5, poly)) put(x, y, c);
  };
  const stroke = (pts: LatLon[], c: RGB, every = 1) => {
    let n = 0;
    for (let k = 1; k < pts.length; k++) {
      let [x0, y0] = P(pts[k - 1]!); const [x1, y1] = P(pts[k]!);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        if (n++ % every === 0) put(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
  };
  const text = (s: string, x: number, y: number) => {
    for (const [dx, dy, c] of [[1, 1, MAP_COLOURS.shadow], [0, 0, MAP_COLOURS.label]] as const) {
      [...s].forEach((ch, k) => { const g = glyph(ch); for (let i = 0; i < 15; i++) if (g[i] === '#') put(x + dx + k * 4 + (i % 3), y + dy + Math.floor(i / 3), c); });
    }
  };

  fill([[0, 0], [MAP_W, 0], [MAP_W, MAP_H], [0, MAP_H]], MAP_COLOURS.land);
  // the German side: east of the line, out to the map's edge
  const line = v.line.points.map(P);
  const [fx] = line[0]!; const [lx, ly] = line[line.length - 1]!;
  fill([...line, ...(ly >= MAP_H - 1 ? [] : [[lx, MAP_H] as [number, number]]), [MAP_W, MAP_H], [MAP_W, 0], [fx, 0]], MAP_COLOURS.german);
  fill(SEA.map(P), MAP_COLOURS.sea);
  stroke(SOMME, MAP_COLOURS.river);
  stroke(FRONTIER, MAP_COLOURS.frontier, 3);
  if (v.line.key !== v.first.key) stroke(v.first.points, MAP_COLOURS.first, 2);
  stroke(v.line.points, MAP_COLOURS.line);
  for (const p of PLACES) { const [x, y] = P(p.at); put(x, y, MAP_COLOURS.label); text(p.name, x + p.dx, y + p.dy); }
  for (const b of v.battles) {
    const [x, y] = P(b.at);
    const cells = b.fought ? [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]] : [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
    for (const [dx, dy] of cells) put(x + dx!, y + dy!, b.fought ? MAP_COLOURS.fought : MAP_COLOURS.missed);
  }
  if (v.here.at) {
    const [x, y] = P(v.here.at);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) put(x + dx, y + dy, Math.abs(dx) === 2 || Math.abs(dy) === 2 ? MAP_COLOURS.shadow : MAP_COLOURS.here);
  }
  return px;
}
