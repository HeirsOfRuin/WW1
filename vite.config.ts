import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// base './' so the build works from any path: Pages (/<repo>/), itch's frame, a zip.
// The build id is NOT set here: tools/stamp.mjs writes it over __BUILD_ID__ in
// dist/ after the build (sw.js and the bundled sw-register), and fails if it
// did not land. One mechanism for every shape.
export default defineConfig({
  base: './',
  plugins: [preact()],
  resolve: { alias: { '@engine': here('./packages/engine/src'), '@tools': here('./packages/tools/src') } },
  test: { include: ['tests/**/*.test.ts', 'packages/**/tests/*.test.ts'] },
} as never);
