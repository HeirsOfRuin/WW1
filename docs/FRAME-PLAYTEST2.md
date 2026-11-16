# FRAME: playtest 2 (2026-11-15)

> **Built 2026-11-16** (the author: "yes, then yes on number, players would like that, then your
> recomendation"). All eight items are in. What changed from the proposals, measured:
> - **A:** a close moment before about half the advance and trench phases (not for a stretcher-bearer,
>   a tank man or an air gunner) and in 60% of the raids and bombing raids he chooses to go on. Each
>   answer best somewhere (adaptive, 4,000 wars each, the answer forced): bayonet the most medals
>   (29.9%) and home alive (41.7%); prisoner the best grade (29.9) and standing; let him go the most
>   Armistices (5.0%) and fewest breakdowns (15.8%); shoot between them. The bayonet was a trap as first
>   tuned (worst everywhere): its award points went from 2.5 to 4. The Soldier tab counts "men you
>   know you killed" (close moments, and a sniper's morning that went well) and prisoners taken.
> - **B:** an NCO picks who goes; the officer still wants an NCO on it one time in five (without this,
>   careful play beat best play: 5.7% to 5.5%). Sergeants and officers have a fourth battle order. The
>   commission board's leadership bar is 3, not 3.5. The Soldier tab shows the next step.
> - **C:** named in battalion orders one time in four after a job he chose went well.
> - **D:** a close call when a roll lands within 0.08 (a step) or 0.12 (a battle phase) of a hit: about
>   one roll in six. The odds are untouched.
> - **G:** an engine "pass" scene: the tour page, then the event (drawn while the war is still on that
>   tour, so dated events keep their tour), then the war goes on.
> - The gate after all of it: best play 5.2% +-0.5 (target 5-10), survives 1915 74.5%.

The author played a mill game on the phone and sent three screenshots, the save code and these
notes. This frame classifies each point, traces it to its cause, and proposes the fix. The bugs are
already fixed (commit e0d40f3); the design items wait for the author's word.

## The save

Mill. Lewis gun course in May 1915; Loos as a rifleman; lance corporal at the leave; corporal on
standing; the leadership (NCO) course in spring 1916; sergeant in August 1916 after a raid went well;
the Somme in the autumn as a Lewis gunner; the tanks in January 1917; badly wounded on the first
morning of Arras, so he missed Passchendaele in hospital; Cambrai; signed for Pring's Whippet in
February 1918; overrun and taken prisoner on the first day of the German offensive, tour 32. No
award. Sergeant from August 1916 to the end. Standing 100.

## The author's points, classified

| # | The author | Class | Cause | Status |
|---|---|---|---|---|
| 1 | Screenshot: "Nerve +34" after a raid in December 1915 | Bug | The changes line added the leave's nerve to the raid's cost | Fixed: shown apart |
| 2 | Screenshot: the leave's picture over a raid's result | Bug | Pictures followed the question pending, not the scene shown | Fixed |
| 3 | Screenshot: "February, and the thaw" then the railhead, home "a day and a half behind you" | Bug | Line order; the leave was in December | Fixed: first, as a memory |
| 4 | Screenshot: "Nerve +7" after covering a raid | Bug | Rest after the mission counted as the mission's | Fixed |
| 5 | "Some of the battles ended without me realizing properly. I think we need to have battle overviews" | Missing explanation | A course on the tour before 1 July took him away without a word; no battle ever summed up | Fixed: no course before a battle; an overview after every battle, fought or missed |
| 6 | "Being a gunner and shooting at the planes was never different then covering a raid" | Bug | The announcement and the steps drew their take from two counters, and the Lewis steps were written only as a raid. Signaller, stretcher-bearer, tank and air had the same fault | Fixed: one counter; anti-aircraft steps written |
| 7 | "Why didn't I get any rewards?" | Missing explanation, then design | Medals come only from battles and missions, at up to 60% a battle scaled by what he did; four battles, none came, and a recommendation that came to nothing was silent | Partly fixed (the overview says so). Item C below |
| 8 | "I never got promotions past sergeant, despite taking the nco course" | Missing explanation, then design | CSM needs standing 80 and a 12% roll at leave or 4% after a battle; a commission needs the board at the 1917 leave and reading, a gallantry medal or leadership 3.5 (the course gives about 2); the tanks offer none. Nothing on screen says any of it | Item B |
| 9 | "You never get a sense of the promotions meaning anything, nor ... that you make any difference" | Design | Rank changes pay, the status line and a few battle multipliers; no question changes with rank | Item B |
| 10 | "It never feels like I am killing anyone, or fighting really" | Design | A battle phase is three abstract orders (push, help, go to ground); no enemy is ever in front of him | Item A |
| 11 | "The risk warnings never feel real, because the same mission always goes the same way based on your choices" | Design (a display fault, not a numbers one) | Each choice prints one fixed sentence; the roll only decides a rare hit (1-3% a step), so most players never see risk land | Item D |
| 12 | "When I died in my last game, it felt way to abrupt" | Design | Killed goes straight to one generic ending page | Item E |
| 13 | "When I got wounded, I really would have preferred more context" | Design | Two generic wound pages, light and severe | Item E |
| 14 | "No points of being able to write back to a sweetheart or meeting some French girl you fancy" | Design (new content) | Neither exists | Item F |
| 15 | "Events still feel very jumpy and scrambled, not in a coherent order, like some of the missions felt generic and out of place" | Design | A tour shows its story event, then the tour page, then the night's work; missions are two takes per role with no year or place in them | Item G |
| 16 | "Being a tank gunner was kind of cool, but I never got to ride in the whippet I signed up for" | Design | The Whippet road began at tour 33; he was taken at tour 32, the first battle after he signed | Item H |

Also fixed while tracing (siblings): a battle he missed cost his section only a quiet tour's losses
(it now fights it); his friends could be "killed at Cambrai", a battle only the tank man fought.

## The design items

### A. Fighting: a man in front of you

**Recommendation.** In each battle, on an advance or trench phase (about one battle phase in two),
a close moment before the phase's order: a German in front of him, written for that battle and
phase. Four answers: **shoot**, **the bayonet** (or the butt, or the bomb), **take him prisoner**,
**let him go**. What each does, through the existing resolver:
- Shoot or bayonet: award points and standing; a nerve cost that is higher at close range; a flag
  the story reads later (a dream, a letter he cannot write, a face at the Armistice).
- Take him prisoner: standing and award points (prisoners were wanted for intelligence), a small
  risk he is shot doing it, no nerve cost.
- Let him go: no points, a small standing cost if seen, nerve kept; a flag.
- Raids and the bomber's mission get the same moment in their second step.

No tally on screen of men killed: most soldiers never knew. The Soldier tab keeps "men you know you
killed" only from these moments. **Measure:** each answer best somewhere (the choices ablation);
the gate holds.

**Cost:** about 80 lines of war layer; about 15 scenes (9 battles, with lines by role, and 3 sortie
steps).

### B. Rank that changes what you decide

**Recommendation.**
1. **Show the next step.** The Soldier tab says what the next rank needs and what he has: "Company
   sergeant major: a vacancy, standing 80 (you have 100), at a leave or after a battle", "A
   commission: the board at the 1917 leave wants reading and figures, a gallantry medal or
   leadership 3.5 (you have 2.0)". The rule 6 fault: correct but silent.
2. **Rank changes the question.** As a lance corporal or corporal, a duty call becomes "who goes":
   yourself, a man from home, or a new man from the draft. Each costs something different (risk
   to you, risk to a friend, standing and the new man's life). As a sergeant, battles gain a
   fourth order, "get them across", which lowers the section's losses at a cost to your own risk
   and nerve. As an officer, he names the raid party and answers for it.
3. **The NCO course counts.** It gives leadership to 2.5 and makes the commission's 3.5 reachable
   by 1917 for a man who leads in battle.

**Measure:** the gate, the roles table, and the share of men who reach company sergeant major or a
commission (now 10% and 32% at the start of 1918; the aim is that a leader who plays for it gets
there more often than one who does not).

### C. Rewards

**Recommendation.** Keep medals rare: about one man in five ends the war with one at best play, and
history was rarer. Add smaller recognition that he can see: his name read out in orders after a
mission that went well (standing), a commanding officer's card for gallantry (some divisions gave
printed cards; to check), the mention in despatches as now, and the overview's "your name went in"
when a recommendation came to nothing. **Measure:** medals per war unchanged; recognition of some
kind in most wars that fight two battles.

### D. Risk you can see

**Recommendation.** One derivation, shown: the step's roll is already made. When it lands near the
hit (within about three times the chance), the step shows a close call from a table for that
sortie (a bullet through the pack, the man beside you hit, a bomb that does not go off); a clean
pass shows the plain sentence. A second line by the margin on the result (a clean success, a
near thing, a failure that cost someone). No number changes, so no balance change; the same choice
reads differently from game to game because the dice differ. **Measure:** a close call on about one
step in eight; the gate is unchanged by construction.

### E. Wounds and death, told

**Recommendation.**
- **Wounds:** by cause (battle phase, shellfire, sortie, sniper): the moment, then the chain. Light:
  the regimental aid post, a fortnight at the field ambulance, back. Severe: the aid post, the
  casualty clearing station, the label tied to his tunic, the ambulance train, the hospital ship,
  a hospital in England, hospital blue, the letters. One choice in each (what to write home).
- **Death:** a short sequence before the ending page. The moment, by cause; then what happened
  after: the form his mother received (Army Form B.104-82 for other ranks; a telegram for
  officers; to check), the letter from his platoon officer, a friend from home (if alive), the
  letter in his pay book (the flag exists), his effects sent home. A line for each town.

**Cost:** about 10 scenes, content only.

### F. A sweetheart at home, and a girl in France

**Recommendation.** Two threads the player chooses to follow or not.
- **A sweetheart at home**, named for each town (not a woman already written into the town).
  Letters every few months from 1915: he chooses what to tell her (the truth, a cheerful lie,
  very little). That shapes the leaves (a walk, a quarrel, an engagement; a wartime wedding at a
  leave is possible) and her lines at the Armistice; she can also end it.
- **A girl in France**, from 1916: the daughter at the estaminet in the billets village behind the
  line, where the battalion rests between tours. Egg and chips, a few words of French, her family's
  farm, the war on her side of it. Meetings at rest; choices; the battalion moves on, and letters
  follow or do not. Plain and without explicit scenes, as the rest of the game is.
- The two can conflict: the letter from home arrives the week he meets her.

**Cost:** about 20 events across the years and towns, and the leave lines.

### G. A tour that reads in order; missions with a time and a place

**Recommendation.**
1. **Order:** the tour page first (the month, coming back, what happened since), then the story
   event, then the night's work, then the result, then rest. Now the event comes before the tour
   page that introduces it.
2. **Dated missions:** each role's mission and the five duties get a take for each year, naming
   the place and the season (the Loos sector in 1915, the Somme in 1916, Arras and the salient in
   1917, open country in 1918), so the same job does not read the same in 1915 and 1918.

**Cost:** a route change (small); about 40 passages (content).

### H. The Whippet

**Recommendation.** Start the Whippet road at once when he signs: Whippets first went into action in
the German offensive, in late March 1918 (to check the date). His Spring Offensive in the tank
battle scene gets a Whippet version with Pring, and the 1918 events follow the road from the next
tour. A story choice must pay off within a tour or two.

**Cost:** small, content only.

## Order of building (recommended)

1. D, risk you can see: display only, no balance change, touches every mission.
2. B, rank that changes what you decide, with the next-step line.
3. A, a man in front of you.
4. E, wounds and death.
5. H, the Whippet; C, smaller recognition.
6. G, tour order and dated missions.
7. F, the sweetheart and the girl in France: the largest, and the author's own new ask.

Each mechanical item (A, B, C) re-runs the gate with the numbers in its commit. Each content item is
read in transcripts and passes the validator, style, continuity and render scan.

## Questions for the author

1. Approve the frame and the order, or change the order?
2. A count of men killed on the Soldier tab: none (recommended; only the close moments are
   remembered), or a number?
3. The sweetheart: one named for each town (recommended), or the player names her?
