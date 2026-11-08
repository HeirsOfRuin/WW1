// The master palette, "Field Service" (DESIGN §11). tools/art.ts snaps every scene image to these
// colours, so every scene in the game shares one palette. Append only: reordering changes ramps.
// Chalk is warm and stops short of white, so the chalk of Loos cannot read as snow.

export const MASTER = [
  // shadow, warm neutral, dark to light
  '#121210', '#1b1b17', '#26251f', '#34322a', '#46433a', '#5c584c', '#767061', '#908979', '#aba390', '#c8bfa8',
  // chalk: warm and short of white, or the chalk of Loos reads as snow (calibration, 2026-11-09)
  '#d2c5a2', '#ddd0ac', '#e6dab8',
  // khaki: the uniform
  '#2e2a1a', '#433c24', '#5a5030', '#73663e', '#8b7d4f', '#a5966a', '#bfb08a',
  // mud and earth
  '#241a12', '#352619', '#4a3622', '#63492e', '#7e5f3e', '#9a7a55',
  // sky: wet slate
  '#1c2228', '#283039', '#36414b', '#4b5761', '#64717a', '#808c93', '#9fa9ad', '#bfc6c7',
  // brick
  '#3a1c14', '#55291b', '#723823', '#8f4a2e', '#a8623f',
  // gaslight, fire, lamplight
  '#6b4317', '#9c6420', '#c98e34', '#e6b85c', '#f5dc9a',
  // gas (sparingly)
  '#6e7034', '#9a9a4a',
  // blood (more sparingly)
  '#5a1612', '#8a2219',
  // skin
  '#5e3f30', '#9a6e56', '#c79a7a', '#e0bfa0',
  // grass and fields, muted
  '#2d3322', '#434b30', '#5f6843', '#7f8758',
] as const;
