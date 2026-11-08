# Style guide

Applies to all scene, choice, outcome and journal text. `npm run lint:style` enforces the two
lists at the bottom. Write the voice section from the author's own sample pages before the
first chapter: Knight of Adalia's first-pass prose was "too clipped and too quiet" until the
author's sample chapters set the target.

## Voice

The author, 2026-11-09, after the first calibration: "The prose isn't quite right. Keep it from
sounding too AI-esque. It should sound real, human, emotional at times, hard and action filled
when needed, and quiet or cautious in the right places. The prose needs to help fill in the other
senses that don't get used in this game."

### The other senses: the prose carries them
The screen gives one picture and some numbers. Everything else (noise, smell, taste, cold, wet,
weight, pain) comes from the words. Every scene gives at least two senses that are not sight, and
gives them as specific things: chloride of lime, the hiss of the gas cylinders, rum burning on
the way down, a wet flannel hood against the mouth, the stone floor of a scullery through socks.
The same word twice for the same smell is lazy; find the thing that smells.

### Rhythm follows the moment
- **Action:** short, hard sentences. Verbs. No adjectives you could cut. Things happen in the
  order he perceives them, sound before sight when that is true.
- **Quiet:** longer sentences, room to breathe, the small domestic thing noticed (the clock, the
  copper, the way a mother knots string).
- **Caution:** the reader is let in on less. Short, plain, watchful. What he listens for.

### Real, not written
- **People talk like themselves.** Lancashire mill folk say nowt, summat, our Albert, love, mam;
  in dialogue only, and lightly. Nobody speaks in tidy lines. People repeat themselves, trail off,
  answer the wrong question, make bad jokes because they are frightened.
- **His comparisons come from his own life**: the weaving shed, the looms, the tackler, chapel,
  the Co-op, the moors. Never from outside it (no cinema, no clockwork hearts, no tapestries).
- **Emotion arrives through a thing, then is allowed to land.** His mother puts her hand flat on
  his cheek. That is enough; do not add what it meant. But do not be afraid of a man crying,
  or being glad, or hating himself for a minute. Feelings are not banned, explanations are.
- **Period letters in period voice**: "just a few lines hoping this finds you as it leaves us".
- Second person, present tense, consistent within a scene.

### What makes prose sound machine-written (cut it)
- A neat, wry line to end a scene or a paragraph ("Somebody down the bay is already eating your
  toffee."). End where the moment ends, often mid-thought.
- Lists of three, adjectives in pairs, sentences in balanced pairs.
- "It is not X. It is Y." and "not X, but Y".
- Summary words instead of things: the weight of it, a heaviness, something shifts, a reminder.
- Everything even: every paragraph the same length and temperature. Real prose lurches.
- Explaining the moment after showing it.

### Choices
An action, in the imperative, in his words, under about 15 words. It does not hint at which is
best; the risk words after it do that, from the resolver.

## Narrator tics to cut
These read as machine prose when they repeat (both narrative games had to cut them). The lint
counts them as warnings; each is allowed rarely.
- "...which is worse."
- "It is not X. It is Y."
- "He says nothing." / "Nobody says anything." as the beat that ends a paragraph.
- "for a long time".
- Foreshadowing the player's feelings: "You will remember this."
- "That is all." and "That is its own kind of X."
- Chains of "and, and, and" clauses.

## Numbers, names and time
- The hero's age is {age_words}, never typed: play speed varies. Years and dates come from {date} or the state.
- A person's title, office or ruler only once it is true in the run: continuity.yaml holds the rules.
- Period time and money: shillings and pence (a private's shilling a day); clock times in words ("half past six"), army time only inside an order.
- Men are named the way they were: surnames among the men, Christian names at home, rank and surname from officers.

## Lint lists
Each line is one pattern. Plain lines match as whole words or phrases, case-insensitive. Lines
wrapped in `/.../` are regular expressions (case-insensitive). Lines starting with `#` are comments.

### Banned (lint error)
```banned
# modern idiom
okay
ok
awesome
guys
teenager
weekend
deal with it
at the end of the day
game changer
level up
no problem
makes sense
stressed
you've got this
# war-film and memorial phrases: the narration never editorialises the war (DESIGN §12)
lions led by donkeys
lost generation
the war to end all wars
lest we forget
the fallen
the glorious dead
heroic sacrifice
senseless slaughter
the horrors of war
hell on earth
band of brothers
brothers in arms
# machine-prose stock phrases
a testament to
tapestry
unbreakable bond
little did you know
destiny awaits
against all odds
/\bmindset\b/
/\bfeedback\b/
/\bpercent\b/
# authoring notes that leaked into prose instead of becoming [if] conditions
/if you are not\b[^.]{0,20}(son|daughter|background)/
# the hero's age, typed (use {age_words})
/\byou are (sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty)(-[a-z]+)?\b/
```

### Watch (lint warning; allowed, but check each use)
```watch
suddenly
somehow
very
truly
incredibly
in that moment
/\bfelt a sense of\b/
/\ba wave of\b/
which is worse
not unkindly
its own kind of
/\bfor a long time\b/
/\bIt is not [^.]*\. It is\b/
/\byou will (think about|remember) (this|it|that)\b/
# machine-prose summary words (the author, 2026-11-09: "keep it from sounding too AI-esque")
/\bthe weight of\b/
/\bsomething (shifts|changes|breaks) in\b/
/\ba reminder (of|that)\b/
/\bnot \w+, but\b/
/\bthe silence stretches\b/
/\bhangs in the air\b/
/\bletting out a breath\b/
/\bbreath (he|she|you) didn'?t know\b/
```
