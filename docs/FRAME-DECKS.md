# FRAME: mission decks (2026-11-21)

The author, playtest 3: "Sniping got a bit repetitive with the role missions. I find they are all
like that. They should all have a deck of events that randomly get chosen."

## The fault

Every duty and role mission was one fixed script of three steps. Step 1 had one text; steps 2 and 3
had two takes that alternated. A sniper goes out most tours, so by 1916 he had seen the man shaving
at the mirror, and the enemy sniper bracketing his plate, four or five times each.

## The fix

Each step of each sortie draws one written situation (a card) from its deck.

- **Deck size:** step 1 (setting out) has 3 cards; steps 2 and 3 (the work, and the complication or
  the way back) have 5 each. That is 3 x 5 x 5 = 75 combinations a sortie, against 4 before.
- **Years:** a card can be limited to some years (`from`/`to`, stage 1-4: 1915 Loos sector, 1916
  Somme, 1917 Arras and the salient, 1918 the retreat and the advance). At least one card in each
  step-2 and step-3 deck belongs to one or two years, so the work changes as the war does.
- **The draw:** a card not shown since the deck was last dealt through, never the one just shown. It
  is a hash of the war's seed and the count shown, not a random stream, so the gate is unchanged by
  construction (measured: identical numbers before and after). A sortie played unseen (ordered and
  resolved without the player) burns no card.
- **Mechanics unchanged:** every card offers the step's own choices (bold, steady, careful, and
  back where the step allows it) with the step's own odds. Only the situation and the words change.

## Rules for a card

- Self-contained: a step-3 card cannot refer to a step-2 card's details (the man shaving, the
  officer at the loophole). The previous step's `text_after` is shown above it and does the joining.
- The result screen after the sortie (`x_<key>_done`) speaks to how it went, not to any one card.
- A card id is a letter; scene `s_<key>_<step>` is card `a`, `s_<key>_<step>_<b..e>` the others; a
  card is a scene plus a row in `DECKS` (src/game/war/data.ts). The content loader routes it.
- Period words (FRAME-WORDS.md): no word after its date, no modern idiom; the glossary explains what
  a reader cannot get from the sentence.

## Measure

`npm run gate` unchanged (no number moved). Tests: every card has its scene with the step's choices,
every year has a card in every step, and a deck is dealt through before it repeats.
