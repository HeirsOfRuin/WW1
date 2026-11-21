// tools/press.config.mjs: what tools/press.mjs photographs. Each shot drives the REAL build to a
// moment worth showing. The saves are real games played by the game's own engine (tools/press-seed.mts:
// pit, seed 1, and mill, seed 20), loaded through the game's own save link (#save=), so
// every word and number on screen is the game's.
import { readFileSync } from 'node:fs';

const save = (n) => readFileSync(new URL(`../release/_press-${n}.txt`, import.meta.url), 'utf8').trim();
async function load(page, url, n) {
  await page.goto(`${url}#save=${save(n)}`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
}

export default {
  site: 'dist',
  size: [390, 844], // the measured embed size (tools/embed-measure.mjs)
  cover: 'docs/itch/cover.html',
  hide: ['.toast', '.banner'],
  shots: [
    { name: 'loos', async drive({ page, url }) { await load(page, url, 'loos'); } },
    {
      name: 'the-sniper',
      async drive({ page, url }) {
        await load(page, url, 'sniper');
        await page.locator('[data-action]').last().scrollIntoViewIfNeeded();
      },
    },
    {
      name: 'the-year-review',
      async drive({ page, url }) {
        await load(page, url, 'review');
        const c = page.locator('[data-action=continue]'); while (await c.count()) { await c.first().click(); await page.waitForTimeout(150); }
        await page.evaluate(() => { const h = document.querySelector('.warmap h2'); const sc = [document.scrollingElement, ...document.querySelectorAll('main, .panel')].find((e) => e && e.scrollHeight > e.clientHeight + 4); const top = h.getBoundingClientRect().top - 120; if (sc) sc.scrollTop += top; });
      },
    },
    { name: 'the-map', async drive({ page, url }) { await load(page, url, 'map'); await page.click('[data-tab=map]'); } },
    { name: 'the-soldier', async drive({ page, url }) { await load(page, url, 'map'); await page.click('[data-tab=soldier]'); } },
  ],
};
