# FRAME: <chapter id> <title>

> One frame per chapter, written before its scenes and agreed with the author. Knight of Adalia's
> chapters 4 and 5 and Vikingr's phases were built this way; the chapters that skipped it were
> the ones rewritten.

## 1. What the chapter is for
<Two sentences: what changes for the hero, and the question the player answers by playing it.>

## 2. Decisions already made
| Decision | Source (author's words, date) |
|---|---|

## 3. The spine
| Scene | Where, when | The choice that matters | What it sets (flags, counters) | Read by |
|---|---|---|---|---|

Every flag in the "sets" column has a "read by" entry: a later condition, check or branch. A flag
only text reads is flavour; a chapter of flavour reads as a corridor (`npm run audit`).

## 4. Pools and consequences
| Pool or queued event | Drawn from / queued by | Weight, once, cooldown | Why it exists |
|---|---|---|---|

## 5. Who is alive, and what they are called
| Person | Alive at the start? | Can die here? | Title or office, and when it changes |
|---|---|---|---|

Each "can die" and "title changes" row gets a continuity rule (`content/continuity.yaml`).

## 6. Endings and deaths
| Way out | Condition | Reached by the bot? |
|---|---|---|

## 7. What will be measured
| Question | Tool | Target |
|---|---|---|
| Every start reaches every ending it should | `npm run bot` | no dead ends or softlocks |
| No hollow choices on the spine | `npm run audit -- --group=<chapter> --list` | none on spine scenes |
| Text holds in every state | `npm run continuity -- --strict`, `npm run scan -- --strict` | clean |

## 8. Calibration round (before writing the rest)
- [ ] One scene written in full, in the house voice, read by the author.
- [ ] One transcript (`npm run transcript`) read aloud: does it sound like the author's sample?
- [ ] The author's corrections folded into `content/style-guide.md` (new banned or watch lines).
- [ ] Then the rest of the chapter; then `npm run check`; then a playtest with a save code.

## 9. As built
<Filled after: what changed from this frame, the measured numbers, open issues.>
