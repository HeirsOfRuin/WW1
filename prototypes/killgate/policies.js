// Fixed policies for the kill gate. Each is a written rule, not a search.
// volunteer(s, key, duty, friendAtRisk) · battle(s, phase, battle) -> push|help|ground
// sick(s) · course(s, skill) · tunnel(s) · leave(s, offers, commission) -> back|posting|commission

const anyFriend = (s) => s.friends.some(Boolean);

const always = { sick: () => false, course: () => true, tunnel: () => false };

const reckless = {
  ...always,
  volunteer: () => true,
  battle: () => 'push',
  leave: (s, o, c) => (c ? 'commission' : 'back'),
};

const careful = {
  volunteer: () => false,
  battle: () => 'ground',
  sick: (s) => s.nerve < 40,
  course: () => true,
  tunnel: () => true,
  leave: () => 'back',
};

const mates = {
  volunteer: (s, k, d, friendAtRisk) => friendAtRisk,
  battle: (s) => (anyFriend(s) ? 'help' : 'push'),
  sick: (s) => s.nerve < 20,
  course: () => false, // stays with the section
  tunnel: () => false,
  leave: () => 'back',
};

const climber = {
  ...always,
  volunteer: (s, k, d) => d.standing >= 3,
  battle: (s) => (s.nerve > 25 ? 'push' : 'ground'),
  leave: (s, offers, c) => (c ? 'commission' : !s.promotedThisStage && offers.length ? 'posting' : 'back'),
};

// The competent reference: spends nerve while it has it, protects it when low.
// It reads the phase: push across no man's land, keep down in the enemy trench unless
// nerve is high, look after the section on the hold.
const PHASE_RULE = {
  advance: () => 'push',
  trench: (s) => (s.nerve > 60 ? 'push' : anyFriend(s) ? 'help' : 'ground'),
  hold: (s) => (anyFriend(s) ? 'help' : 'ground'),
  defence: (s) => (s.nerve > 50 ? 'push' : 'help'),
};
const adaptive = {
  volunteer: (s, k, d) => (d.hit <= 0.04 ? s.nerve > 55 : s.nerve > 75),
  battle: (s, i, b, stalled) => (stalled ? 'ground' : PHASE_RULE[b.phases[i][2]](s)),
  sick: (s) => s.nerve < 25,
  course: () => true,
  tunnel: () => true,
  leave: (s, o, c) => (c ? 'commission' : 'back'),
};

// Adaptive in the line; takes a home posting at the first leave from stage N on.
const quitter = (n) => ({
  ...adaptive,
  leave: (s, offers, c) => (s.stage >= n && offers.length ? 'posting' : c ? 'commission' : 'back'),
});

export const POLICIES = {
  reckless, careful, mates, climber, adaptive,
  quit1: quitter(1), quit2: quitter(2), quit3: quitter(3),
};
