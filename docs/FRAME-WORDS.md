# FRAME: words, French, lasses and rivals (2026-11-20)

The author, 2026-11-20: "determine how much of the writing is written with words and phrases that the
average player wouldn't understand. Words for equipment, common sayings, accent words ... But I don't
want it to sound too modern either. ... add more French words to the French places, areas, signs, and
people speaking French. Even adding in some of the slang the soldiers started picking up, like pet
names for people or officers, places, germans ... more opportunities for French lasses or different
lasses in one life ... Sometimes the lass you flirted with that one day was the last time you saw her.
Sometimes the village you have been taking leave in is bombed in-between your leaves. ... more rivals."

## 1. The soldier's words (how hard words are handled)

The text keeps its period words. A word a present-day player may not know goes in the glossary
(`content/glossary/*.yaml`) and is then underlined in the game: tap it and its meaning shows in place.
The Journal tab lists them all. `npm run gloss` counts them and fails (`--strict`) on a listed word
that appears nowhere.

**Rules for anyone editing text:**
1. **Gloss, don't modernise.** Equipment (firestep, puttees, dixie, Mills bomb), army terms (stand-to,
   fatigue, sap, traverse), period things (Woodbines, the Co-op, a tackler), dialect (marra, bairn,
   owt) and soldier slang stay, each with a glossary entry.
2. **Reword only what a gloss cannot save:** a sentence that leans on two or more unexplained terms at
   once, an idiom whose sense is lost, a dialect spelling that reads as a typo. Reword in the same
   plain period voice. Never use a modern word or idiom (okay, guys, stressed, trauma, no problem).
3. **A glossary entry:** `- { term: dixie, also: [dixies], means: "A large iron cooking pot with a lid; the company's stew and tea came up the line in them." }`
   `term` exactly as written in the text (the match ignores case; whole words only); `also` for
   plurals and other spellings used; `means` one plain sentence, 20 words or fewer, true for
   1914-18, no modern slang. Every term must occur in the text.
4. **Do not gloss** plain words, proper names of fictional people, or anything the sentence already
   explains.

## 2. French, and the slang the soldiers picked up

Use it where it belongs and sparingly: at most one or two such words in a passage, with the sense
clear from the sentence, and every one in the glossary.

- **Real French** on signs, shop fronts and in French mouths: *Estaminet du Commerce*, *Boulangerie*,
  *Mairie*, *Vins et bières*, *Oeufs et frites*, *Défense d'entrer*, *À vendre*; "Bonjour, monsieur",
  "C'est la guerre", "Pas bon", "Les Boches". A French speaker says a short line in French and the
  narration carries the meaning (he half-understands; so does the player).
- **Soldiers' French** (mangled by ear): napoo (*il n'y en a plus*: finished, gone, dead), san fairy
  ann (*ça ne fait rien*: it doesn't matter), toot sweet (*tout de suite*: at once), compree?
  (*compris?*), tray bon / no bon, merci boko, parley-voo, alley! (*allez*: clear off),
  mamzelle, vin blank or plonk (*vin blanc*), oofs (*oeufs*, eggs), "just-a-minute" (estaminet).
- **The enemy:** Fritz (all war), the Boche (officers, the papers, the French), the Hun (the papers,
  officers), Alleyman (from *Allemand*; 1914-16), Jerry (**from 1917 only**). "Kamerad" for surrender.
- **Home and wounds:** Blighty; a Blighty one; gone west, copped it, stopped one (killed or hit);
  got the wind up (frightened); swinging the lead (shamming sick); cushy (easy, safe).
- **People:** Tommy; the Old Man (the commanding officer); brass hats and red tabs (staff officers);
  a wart or one-pip wonder (a second lieutenant); lance jack (lance corporal); quarter bloke
  (quartermaster sergeant); the MO (medical officer); padre or sky pilot (chaplain); old sweat (a
  pre-war regular); base wallah (a man with a safe job at the base); poilu (a French soldier); Jocks
  (Scots); Aussies (diggers **from 1917**).
- **Places:** Wipers (Ypres), Pop (Poperinghe), Plugstreet (Ploegsteert), Armentears (Armentières),
  Eat Apples (Étaples) and its Bull Ring (the training ground), Ocean Villas (Auchonvillers), Funky
  Villas (Foncquevillers, by Gommecourt), Mucky Farm (Mouquet Farm), Hell Fire Corner (on the Menin
  Road, Ypres).
- **Things:** whizz-bang (a fast light shell), Jack Johnson or coal box (a heavy shell with black
  smoke; 1914-15), five-nine (a German 5.9-inch shell), minnie (*Minenwerfer*, trench mortar), toffee
  apple (a British trench mortar bomb), potato masher (German stick grenade), Archie (anti-aircraft
  fire), the morning hate (the daily shelling), strafe (a bombardment, or a telling-off; from 1915),
  dud; dixie, bully (tinned beef), Maconochie (tinned stew), pozzy (jam), hard tack, char (tea),
  gaspers (cheap cigarettes), iron rations; chats (lice) and chatting; funk hole; jankers (punishment
  drill); tin hat (the steel helmet, **from 1916**).

**Dating rule:** a word dated above is not used before its date. When unsure of a word's date, leave it out.

## 3. More lasses (content/scenes/war/lasses.yaml)

Brief encounters across the war with different women, besides the sweetheart at home and Marthe: about
ten events and their follow-ups, shared by all four towns (`pools:`), a few in the tank and air pools.
Some are the only time he sees her (the battalion moves on; next rest he looks and the house is shut).
At least one rest village is shelled or bombed between two rests: he comes back to it and finds what is
left. A man who is engaged or married has a faithful choice, and flirting costs him something. Women
are people with their own war (a baker's daughter, a widow keeping a farm, a nurse at the rest station,
a refugee on the road in 1918, a girl in a village freed in October 1918). Plain; no explicit scenes.

## 4. More rivals (content/scenes/war/rivals.yaml; the Soldier tab's Rivals)

Until now the only rival was the sniper at the crater. Four more, each an arc of three or four events
across the years whose end depends on his choices, shared by all towns:
1. **A regular sergeant, an old sweat,** who rides the New Army men, and him most.
2. **A man of the platoon from another town,** after the same stripe: takes credit, deals cards, fights.
3. **The enemy opposite:** a trench-mortar crew or a raiding officer the battalion gives a name to.
4. **The man who stayed at home** (a reserved job, or exempted by the tribunal), and what the letters
   say about him and the sweetheart, or about the job he left.
Each shows on the Soldier tab under Rivals, its note following the arc.

## Measure

`npm run gloss` (words listed, places marked, share of scenes carrying one; every word used); the
story-share tests; the gate (events move nerve only through small `war_mood` effects); transcripts read.
