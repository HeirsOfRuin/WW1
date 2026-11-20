// Close calls (FRAME-PLAYTEST2 D; the author, playtest 2: "The risk warnings never feel real,
// because the same mission always goes the same way based on your choices"). When a step's or a
// battle phase's roll comes near a hit without one, the outcome gains one of these lines. The odds
// are not touched: the war layer's own draw decides (war.ts riskRoll), so what is shown is what
// happened. Keyed by sortie (duty or role mission) and by battle phase type.
//
// Rules for the lines (2026-11-16): second person, present tense, one or two short sentences.
// Something nearly hits him or nearly goes wrong, and he is not hurt. No friend or character is
// named (the friends may be dead): "the man beside you", "the No. 2". No line decides what happens
// next or says how he moves (he may be crawling). No steel helmets: the lines also fall in 1915.
// Six lines a key; the same key's lines rotate (module.ts outcomeNote).
export const CLOSE_CALLS: Record<string, string[]> = {
  // ---- mission steps, by the job --------------------------------------------------------------
  raid: [
    "A bullet cracks past so close you feel the wind of it on your cheek.",
    "A flare goes up right over you and hangs there, white and hissing. Nobody fires.",
    "A stick bomb lands a yard off, fizzing. It doesn't go off.",
    "Something tugs at your sleeve. There's a hole through the cloth at the elbow, in one side and out the other.",
    "The man behind you is hit. You hear it go into him, a sound like a wet slap, a foot from your ear.",
    "A machine gun traverses across the front, and the bullets go over a hand's breadth above your back.",
  ],
  patrol: [
    "A flare comes down in the grass a few yards off and burns there, hissing, lighting you up. Nobody fires.",
    "A burst of machine-gun fire sweeps the grass and cuts the stalks over your head. Seeds fall in your collar.",
    "A German patrol goes by so close you could touch the last man's boot. None of them looks down.",
    "A stray bullet slaps into the dead man you're lying beside.",
    "A bullet hits your water bottle. You feel the water run cold down your hip.",
    "One of our own shells falls short, thirty yards behind you, and the clods come down on your back.",
  ],
  wiring: [
    "A flare goes up and you freeze with the wire in your hands, barbs in your gloves. It falls and dies, and nobody fires.",
    "A bullet rings off the screw picket by your hand and goes whining away into the dark.",
    "A rifle grenade drops among the coils at your feet and lies there. A dud.",
    "A sniper's bullet goes between you and the man on the other end of the wire, a hand's width from each of you.",
    "A shell lands behind you, in our own trench, and the pieces go humming over your head.",
    "A machine gun opens on the wiring party. The man next to you goes down, and the rest of the burst goes into the parapet.",
  ],
  listening: [
    "A bomb comes over out of the dark and lands short, in the wire. You have your face in the mud when it goes.",
    "Somebody out there fires at a noise, and the bullet goes into the earth by your head.",
    "A flare drops almost on top of the post and burns out a yard away. In all that light nobody fires.",
    "A German patrol crawls past within a few yards. You hear one of them breathing through his mouth, and then they're gone.",
    "One of our own sentries fires at nothing, and the bullet passes just over the post.",
    "A machine gun sweeps the ground. The bullets pass a foot above you and clip the wire behind.",
  ],
  carrying: [
    "A shell lands in the next bay and the blast shoves you into the trench wall, load and all.",
    "A shell comes down in the trench behind you, in the place you were a minute ago.",
    "Shrapnel bursts overhead. A ball goes clean through the load on your shoulder.",
    "The man in front of you is hit and goes down in the trench, and what he was carrying lands on your feet.",
    "A whizz-bang hits the parados beside you and doesn't go off. It lies in the mud with its nose buried.",
    "Where the trench is knocked in and shallow, a bullet cracks over the top of it a hand above your head.",
  ],
  bomb: [
    "A bomb hits the top of the traverse and rolls back down toward your feet. It drops into the sump before it goes, and you're only splashed.",
    "A stick bomb comes over the traverse and lands in the mud beside you, and lies there, and doesn't go off.",
    "A bomb thrown by one of our own clips the parapet and drops back into the trench at your feet. It's a dud.",
    "A bullet goes through the bag of bombs at your side, in one side and out the other, and touches none of them.",
    "Their bomb bursts on the far side of the traverse. The sandbags take it, a yard from your face.",
    "A bomb goes off round the corner and the pieces come whining past the traverse, between you and the man carrying the bombs.",
  ],
  // lines for both of his Lewis missions: covering a raid from a shell hole, and on the
  // firestep firing up at a German two-seater
  lewis: [
    "A round cracks past your ear so close you feel the air of it.",
    "A bullet rings off the gun's barrel casing an inch from your hand.",
    "The earth a foot from your elbow jumps twice. Then the firing goes somewhere else.",
    "The gun stops, and in the second it takes your hands to find the trouble something goes past your head.",
    "A bullet goes between you and your No. 2, at head height. He swears at it.",
    "Something hits the pan on top of the gun and goes on, and leaves a bright dent in the rim.",
  ],
  snipe: [
    "A bullet comes in through the loophole and goes into the back of the hide, a hand's breadth from your face.",
    "Their sniper hits the steel plate by your loophole, and the whole hide rings like a struck bell.",
    "The sun comes out and catches the end of your telescopic sight. You wait for the shot. It doesn't come.",
    "A bullet goes through the dummy head the old hands left propped up beside your hide.",
    "A whizz-bang bursts in front of the parapet, and the splinters spatter the sandbags round your loophole.",
    "A shell lands on the parapet ten yards along. The earth comes down over the hide and on your back, and the roof holds.",
  ],
  signals: [
    "A flare goes up as you're feeling along the wire. You lie flat with the wire in your fingers, and nobody fires.",
    "A shell lands on the line a few yards along and cuts it again. The earth comes down on you.",
    "A bullet goes into the reel of cable on your back and stops there.",
    "Shrapnel bursts over the open ground, and a ball goes through the flap of your haversack.",
    "A machine gun traverses the ground. The bullets kick up the mud a yard off and go on.",
    "The man with you is knocked flat by a bit of shell. The next bit buries itself in the ground between your knees.",
  ],
  tunnel: [
    "A slab of clay drops from the roof and lands across your legs, cold and heavy. The timbers above it hold.",
    "The candle flame shrinks and goes blue, the way it does before the air goes bad. Then it steadies.",
    "A charge goes up somewhere close, theirs. The gallery shakes, clay pattering down off the boards, and the props hold.",
    "A stone rolls off the spoil and knocks on the timbers. On the other side of the clay the German digging stops. After a long minute it starts again.",
    "A camouflet, a small charge to wreck a gallery, blows in the one next to yours. The wall bulges toward you, and holds.",
    "The man passing spoil behind you goes quiet and slumps with the gas. Your own head stays clear.",
  ],
  bearer: [
    "A bullet goes through the stretcher's canvas, between the wounded man's knees.",
    "A shell bursts near enough that the earth comes down on the stretcher and on you.",
    "A sniper's bullet chips the stretcher pole an inch from your fingers.",
    "The stretcher nearly goes over at the lip of a shell hole. The wounded man grips the side and doesn't cry out.",
    "A flare goes up and lights the whole party, down to the stretcher-bearer's band on your arm. Nobody fires.",
    "A shell comes down behind you and doesn't go off. It lies in the mud, steaming.",
  ],
  tank: [
    "A shell lands on the tape a few yards ahead of her and leaves a hole you could lose a cart in.",
    "She tips at the edge of an old trench and hangs there, nose down, and then the tracks bite.",
    "A shell bursts close, and the bits ring on her plates like gravel thrown on a tin roof.",
    "The engine coughs and nearly dies out in the open under their flares, and catches again.",
    "Gas shells come over, plopping soft in the dark, and the wind takes it the other way.",
    "She slews off the tape in the dark, toward a crater full of water, and stops a yard short of the lip.",
  ],
  air: [
    "A burst of Archie goes off just under the tail. The machine jumps, and a splinter comes up through the floor between your boots.",
    "A German scout comes down out of the sun, and his first burst puts a row of holes in the wing beside you.",
    "Your gun stops with the cold, and the scout's tracer goes by a yard off while your fingers work at it.",
    "Archie bursts so close you smell it, and the bits rattle through the fabric like hail on a skylight.",
    "A bullet comes up through the floor of the cockpit and out through the top of the fuselage behind your head.",
    "A bracing wire parts with a twang and whips past your face. The wings hold.",
  ],
  // fallback for any step without its own table
  step: [
    "Something goes past your head with a crack, close enough to leave your ear ringing.",
    "A shell lands near and doesn't go off. It lies there in the mud.",
    "A flare catches you in the open and hangs there, white. Nobody fires.",
    "A bullet goes through the skirt of your tunic and out the other side, and touches nothing.",
    "The man next to you is hit, and you are not.",
    "A splinter of shell buries itself in the ground a hand's breadth from your face.",
  ],

  // ---- battle phases, by type (infantry, in daylight) -----------------------------------------
  battle_advance: [
    "A bullet tugs at your pack, in through one side and out the other.",
    "A shell lands a few yards in front. The blast knocks the wind out of you, and nothing else.",
    "The man beside you goes down in the middle of a stride, and the line closes up past him.",
    "A burst of machine-gun fire goes along the line at knee height. The men on both sides of you are hit.",
    "A shell comes down into the ground at your feet and doesn't go off. It lies there smoking.",
    "A bullet hits the butt of your rifle, and the shock of it goes up both your arms.",
  ],
  battle_trench: [
    "A bomb comes over the traverse and lands in the mud at your feet. It doesn't go off.",
    "A German comes round the traverse with his rifle up and fires, and the shot goes past your ear into the trench wall.",
    "A bomb hits the parapet above you and goes off on the far side of it. You get the dirt and nothing else.",
    "A shot from a dugout entrance goes past your legs and splinters the duckboards.",
    "The man in front of you round the traverse is hit, and falls back against you.",
    "Somebody's bomb, ours or theirs, bursts in the next bay, and the pieces come over the traverse into the sandbags by your head.",
  ],
  battle_hold: [
    "A shell lands two bays along, and the parapet comes down on your back.",
    "A bullet comes through the sandbag in front of your face and goes over your shoulder.",
    "Their bombers get close enough to throw. One lands in the bay with you, and it's a dud.",
    "A shell bursts behind the trench, and the splinters go over in a sheet a foot above your head.",
    "The man beside you is hit and slides down. The next shot goes into the earth where his head was.",
    "Their counter-attack comes in, and a German throws a stick bomb at you from twenty yards. It falls short.",
  ],
  battle_defence: [
    "In the fog a German comes up out of nowhere, fires from the hip, and misses.",
    "A shell lands in the next bay, and the traverse takes the blast.",
    "A gas shell bursts on the parados behind you, and the wind takes it the other way.",
    "A bullet from the flank, where there shouldn't be anybody, goes through the sandbag by your face.",
    "A minnie comes over tumbling end over end and lands behind the trench. It doesn't go off.",
    "Their machine guns are already behind you. A burst goes past your back, close enough to hear each one.",
  ],
  battle_stalled: [
    "A machine gun sweeps the wire. The bullets go into the ground a foot from your face, and then along.",
    "The man lying next to you is hit. You hear it go in.",
    "A bullet strikes the wire above you, and the wire sings.",
    "A shell lands in the next crater along, and the earth comes down on you in clods.",
    "A bullet goes through the pack on your back as you lie there.",
    "Somebody near you lifts his head to look, and is hit. The next one goes over you.",
  ],
  // inside a tank in battle: the splash is the bright flakes of metal off the inside of the plate
  battle_tank: [
    "A bullet hits the plate by your head, and the splash comes off the inside in bright specks past your eyes.",
    "A shell bursts close alongside. She rocks over on one track, and rights herself.",
    "Something heavy hits the roof with a clang you feel in your teeth, and doesn't come through.",
    "A fleck of splash catches the chain of your mask instead of your eye.",
    "She lurches into a shell hole nose first and hangs there, engine roaring, until the tracks catch.",
    "After a hit near the gun housing on her side the petrol stink gets stronger, and nothing catches.",
  ],
  battle_air: [
    "Machine-gun fire from the ground comes up through the floor and out through the top wing.",
    "Archie bursts right in front of the nose, and you fly through the black smoke of it. The engine doesn't miss a beat.",
    "A German scout comes in from below, and his burst stitches a line of holes along the fuselage behind your seat.",
    "A rifle bullet from a trench below clangs off the gun ring by your hand.",
    "A burst of Archie under the wing throws the machine on its side. Then she comes level.",
    "A shell from our own guns passes so close the machine bucks in the wind of it.",
  ],
  // fallback for any battle phase without its own table
  battle: [
    "A bullet tugs at your sleeve and goes on.",
    "Something hits the ground beside you and doesn't go off.",
    "A shell bursts close enough to deafen you, and the earth comes down on your back.",
    "A splinter of shell cuts the strap of your haversack, and it drops at your feet.",
    "A machine-gun burst passes so close you hear each bullet separately.",
    "The man beside you is knocked over by something you never see. You are not touched.",
  ],
};
