// The whole game as one HTML file, for the itch.io desktop download (the author, 2026-11-21: "the
// full download file for desktop"). Opens in any browser from the disk and plays offline.
//   node tools/single-html.mjs [--site=dist] [--out=out/in-the-trenches.html]
// The Vite build's script and stylesheet go inline; each picture the script asks for with
// new URL(`x.png`, import.meta.url) becomes a data: URL (an inline module has no file to be
// relative to). The manifest and icons are left out: a file is not installable. The service
// worker is never registered from file:// (src/ui/sw-register.js). Safari refuses storage on
// file://, so the page there plays but cannot save: the download's note says so.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const site = args.site || 'dist', out = args.out || 'out/in-the-trenches.html'; // out/: never inside the site, or the web zip carries it

let html = await readFile(join(site, 'index.html'), 'utf8');
const jsPath = /<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/.exec(html)?.[1];
const cssPath = /<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/.exec(html)?.[1];
if (!jsPath || !cssPath) throw new Error('single-html: the script or stylesheet tag was not found in index.html');

let js = await readFile(join(site, jsPath), 'utf8');
let pics = 0;
const urls = [...new Set([...js.matchAll(/new URL\(`([^`]+\.png)`,import\.meta\.url\)\.href/g)].map((m) => m[1]))];
for (const name of urls) {
  const data = (await readFile(join(site, 'assets', name))).toString('base64');
  js = js.split(`new URL(\`${name}\`,import.meta.url).href`).join(`"data:image/png;base64,${data}"`);
  pics++;
}
if (/import\.meta\.url/.test(js)) throw new Error('single-html: the script still refers to import.meta.url (a file it would look for)');
js = js.replace(/<\/script/gi, '<\\/script');
const css = await readFile(join(site, cssPath), 'utf8');

html = html
  .replace(/\s*<link rel="manifest"[^>]*>/, '')
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/, '')
  .replace(/\s*<link rel="icon"[^>]*>/, '')
  .replace(/<link rel="stylesheet" crossorigin href="[^"]+">/, () => `<style>${css}</style>`)
  .replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, () => `<script type="module">${js}</script>`);
await writeFile(out, html);
console.log(`${out}: ${(html.length / 1024 / 1024).toFixed(1)} MB, ${pics} pictures inlined`);
