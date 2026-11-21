# In the Trenches — itch.io page kit

Everything needed to put the game on itch.io, and the things that are a
decision rather than a task. Filled from the build of 2026-11-21.
Every count in the copy is read out of the build, not from memory.

## Files

| File | What it is | Built by |
|---|---|---|
| `release/in-the-trenches-web.zip` | The game, played on the page (index.html at the zip root, no service worker) | `node tools/build-itch.mjs` |
| `release/in-the-trenches-itch-kit.zip` | All of the above, the page text and images, START-HERE.txt, and CLAUDE-IN-CHROME.txt (one prompt that sets the page up as a draft in Claude in Chrome) | `node tools/make-itch-kit.mjs`, then `node tools/itch-chrome.mjs` |

## Upload settings

| Field | Value |
|---|---|
| Kind of project | HTML |
| Upload 1 (played on the page) | `in-the-trenches-web.zip`, tick "This file will be played in the browser" |
| Embed | **390 x 844** (measured with `node tools/embed-measure.mjs`; table below) |
| Mobile friendly | On, orientation portrait |
| Fullscreen button | On |
| Automatically start on page load | Off (a title screen is the start) |
| Classification | Games |
| Release status | In development (the game is still being play-tested) |
| Pricing | No payments (the author may change this to Donate) |
| Genre | Interactive Fiction |
| Tags | historical, war, world-war-i, interactive-fiction, text-based, narrative, choices-matter, singleplayer, pixel-art, mobile-friendly |
| Cover | `cover-630x500.png` (check `cover-preview-315x250.png`: that is how browse listings show it) |
| Screenshots | shot1 Loos (a battle), shot2 the sniper (a mission and its risks), shot3 the year review, shot4 the map, shot5 the soldier |
| Links | The installable copy: https://heirsofruin.github.io/WW1/ |
| Community | Comments on, so players can post save codes with bug reports |

Embed measurement (`node tools/embed-measure.mjs`):

```
embed      game width  chrome  content  overflow  wasted
360 x 640         360      88      552        11       0
390 x 844         390      88      756         0       0
480 x 820         480      88      732         0       0
600 x 800         600      88      712         0       0
800 x 820         600      88      732         0     200
960 x 760         600      88      672         0     360
```

The 88 px of chrome is the date bar and the tab bar; the game column stops at 600 px.

## AI disclosure

itch asks whether the project uses generative AI, and for which parts. Say
plainly what was generated and what was yours. Tick the boxes that apply (Text,
Graphics, Code, Sound). Suggested wording, to adjust to your own:

> Made with AI assistance. I designed the game, its systems and its world, and
> directed, edited and play-tested it; the code, the text and the drawn art were
> generated with an AI model to that design.

## Short description (the one-line field, under ~120 characters)

> One soldier and the eight men from home, 1915 to the Armistice. Choose how far forward you go, not the war.

## Known constraints (say them on the page)

- Saves live in this browser. If a browser blocks site data in embedded frames,
  open the game fullscreen or use the save code (Menu).
- Saves on itch and in the installed copy are separate; the save code moves a game.
- There is one difficulty. Played well, about one war in ten reaches the Armistice (`npm run gate`: best policies 8.7-9.4%, careful 7.5%, reckless 2.9%). Most players will die, and are meant to: the death page says what the odds were.
- A save holds its dice: reloading replays the same rolls, so a death cannot be undone by reloading.
- Nothing is fetched from the network (checked in dist/index.html: no outside address).

## Before going public

- [ ] `npm run check` green on the commit being released
- [ ] `node tools/pre-public.mjs --zip=release/in-the-trenches-web.zip` clean (the zip in an itch-style frame, storage blocked and allowed; copy checks)
- [ ] `node tools/update-check.mjs` clean (a new deploy reaches someone who already has the app)
- [ ] Every number in the description confirmed against the build (pre-public lists them)
- [ ] Tutorial and help re-read against the build
- [ ] Cover checked at 315 x 250; shots looked at on the press sheet
- [ ] Played the uploaded draft yourself, in a private window and on a phone: start, a few turns, copy a save code, reload, load it
- [ ] Then Public

## After publishing

Watch the comments the first week; ask for a save code with every bug report.
Each fix: rebuild, `build-itch.mjs`, upload over the old file (the page stays);
a devlog for anything players would notice (`devlog.md`).

## Rebuilding the kit

```
npm run check && npm run build
npx tsx tools/press-seed.mts && node tools/press.mjs
node tools/build-itch.mjs --site=dist --slug=in-the-trenches --name="In the Trenches"
node tools/pre-public.mjs --zip=release/in-the-trenches-web.zip --site=dist
node tools/make-itch-kit.mjs --slug=in-the-trenches --name="In the Trenches"
node tools/itch-chrome.mjs --slug=in-the-trenches --name="In the Trenches"
```

