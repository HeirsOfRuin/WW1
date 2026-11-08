# Style guide

Applies to all scene, choice, outcome and journal text. `npm run lint:style` enforces the two
lists at the bottom. Write the voice section from the author's own sample pages before the
first chapter: Knight of Adalia's first-pass prose was "too clipped and too quiet" until the
author's sample chapters set the target.

## Voice
- Plain and concrete: food, weather, money, hunger, injury, smell, what people wear and carry.
- Second person, present tense, consistent within a scene.
- Let people talk: most scenes have at least two lines of spoken dialogue.
- Nobody explains the theme or says what a moment means. No inspirational speeches.
- Outcomes are rarely clean. Something is usually lost even in success.
- Choice text is an action, in the imperative, under about 15 words. It does not hint at which is best.
- Fear and hurt come as body things (a heart in the throat, knees that will not stop), not named feelings.

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
- Period time and money: <the game's units, e.g. canonical hours and pence, or watches and silver by weight>.

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
# clock time (most periods told time by light, bells and meals): remove if the game has clocks
/\b(a few|several|\d+|for a) (seconds?|minutes?)\b/
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
```
