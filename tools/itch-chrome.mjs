// Adds CLAUDE-IN-CHROME.txt to the itch kit: one prompt the author pastes into Claude in Chrome so
// it sets up the itch.io page as a DRAFT. Claude in Chrome cannot read files on the author's disk,
// so every text value goes into the prompt inline, read from docs/itch/ (the page copy, the short
// line, the settings table in ITCH.md); the files to attach are named, for the author to pick.
// Run after make-itch-kit.mjs:
//   node tools/itch-chrome.mjs --slug=in-the-trenches --name="In the Trenches"
// (the author, 2026-11-21: "Set up an itch launch kit I can give to Claude chrome to set up the
// draft for me")
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { zip } from './zip.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, ...v]) => [k, v.join('=')]));
const slug = args.slug, name = args.name || slug, itch = 'docs/itch';
const KIT = 'release/itch-kit', OUT = `release/${slug}-itch-kit.zip`;

const md = await readFile(join(itch, 'ITCH.md'), 'utf8');
const field = (f) => new RegExp(`^\\| ${f} \\| (.*) \\|$`, 'm').exec(md)?.[1]?.replace(/\*\*/g, '').trim() ?? '';
const short = (await readFile(join(itch, 'short-description.txt'), 'utf8')).trim();
const desc = (await readFile(join(itch, 'description.html'), 'utf8')).replace(/<!--[\s\S]*?-->\n?/g, '').trim();
const single = (await readdir(KIT)).includes('2-download');
const android = (await readdir('.github/workflows').catch(() => [])).includes('android.yml'); // the APK is built by GitHub, not in the kit
const shots = (await readdir(join(KIT, '4-page'))).filter((f) => /^shot\d/.test(f)).sort();
const embed = /(\d+) ?x ?(\d+)/.exec(field('Embed'));
const tags = field('Tags').split(',').map((t) => t.trim()).filter(Boolean);
for (const [k, v] of Object.entries({ embed: embed?.[0], genre: field('Genre'), tags: tags.length, short, desc })) if (!v) throw new Error(`itch-chrome: ${k} missing from docs/itch`);

const brief = `Set up a new itch.io project page for my game "${name}" as a DRAFT. I am signed in to
itch.io in this browser. Work only on itch.io.

Hard rules
- Never set the page Public, and never press any button that publishes. Visibility stays "Draft".
- Never pay for anything, change account settings, or touch any other project.
- When a file must be attached (the game zip, the cover, the screenshots), stop and ask me to pick
  the file in the file chooser, naming the file and its folder exactly as below. Then carry on.
- If a field below is not on the form, or the form has a field not listed, tell me rather than guess.
- At the end, press "Save" (it saves the draft) and tell me the page's edit URL and anything you
  could not do.

Where: first open https://itch.io/dashboard. If a project called "${name}" is already there, this
is an UPDATE: open its "Edit" page instead of making a new one, delete the old uploaded zip and the
old screenshots, attach the new ones as below, and set every field below to these values. Otherwise
create it at https://itch.io/game/new.

Fields, in the form's order
- Title: ${name}
- Project URL: ${slug}
- Short description or tagline: ${short}
- Classification: Games
- Kind of project: HTML
- Release status: ${field('Release status').replace(/ \(.*\)$/, '')}
- Pricing: ${field('Pricing').replace(/ \(.*\)$/, '')}

Uploads
- Upload files: ask me to attach 1-play-on-the-page/${slug}-web.zip (from the kit folder).
  When it has uploaded, tick "This file will be played in the browser".
${single ? `- Then a second upload: ask me to attach 2-download/${slug}.html. Do NOT tick "played in the
  browser" for this one. Tick the platforms Windows, macOS and Linux, and set its display name to
  "${name} (download: opens in any browser, plays offline)".
` : ''}${android ? `- Then an Android upload: ask me to attach in-the-trenches.apk (I download it from GitHub:
  Actions > Android app > the latest run > Artifacts > in-the-trenches-android, then unzip it).
  Do NOT tick "played in the browser". Tick Android only, and set its display name to
  "${name} (Android)".
` : ''}
Embed options (they appear once the zip is marked to play in the browser)
- Viewport dimensions: ${embed[1]} x ${embed[2]}
- Mobile friendly: ticked. Orientation: Portrait
- Automatically start on page load: not ticked
- Fullscreen button: ticked
- Enable scrollbars: ticked (the game scrolls inside its frame)

Details
- Description: switch the editor to HTML (the "<>" or "Source" button) and paste exactly the HTML
  between the two lines below. Then switch back and check it shows headings and bullet lists.
------- description start -------
${desc}
------- description end -------
- Genre: ${field('Genre')}
- Tags (type each and pick it from the list; if one is not offered, skip it and tell me):
  ${tags.join(', ')}
- AI generation disclosure: Yes, this project contains the output of generative AI. Tick: Graphics,
  Text and dialogue, Code. Do not tick Sound (the game has none).
- App store links: none
- Custom noun: leave empty
- Community: Comments
- Visibility & access: Draft

Images (right-hand side of the form)
- Cover image: ask me to attach 4-page/cover-630x500.png
- Screenshots: ask me to attach, in this order: ${shots.map((s) => `4-page/${s}`).join(', ')}

Then: Save. Open the draft's page (View page) and tell me whether the game loads in its frame, and
whether the frame looks about ${embed[1]} wide by ${embed[2]} tall. Do not press Publish.
`;

await writeFile(join(KIT, 'CLAUDE-IN-CHROME.txt'), brief);
const walk = async (d) => (await Promise.all((await readdir(d)).map(async (n) => ((await stat(join(d, n))).isDirectory() ? walk(join(d, n)) : [join(d, n)])))).flat();
const files = (await walk(KIT)).sort();
await writeFile(OUT, zip(await Promise.all(files.map(async (f) => ({ name: f.slice(KIT.length + 1), data: await readFile(f) })))));
console.log(`${KIT}/CLAUDE-IN-CHROME.txt (${brief.length} characters)\n${OUT} (${files.length} files)`);
