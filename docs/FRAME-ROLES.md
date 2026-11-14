# FRAME: promotions, special assignments, the stretcher-bearer (2026-11-14)

## The request

> "Yes to all three, and begin the framework for the tank transfer, also one for a gunner
> position in the air corps" (2026-11-14). The three were recommended after measuring 2,000 wars
> per policy (ranks, roles, awards): cap the promotions, add special assignments, add a
> stretcher-bearer. The two transfers are designed in FRAME-TANK.md and FRAME-AIR.md.

## 1. Promotions (built)

**What was wrong.**
- Every leave gave a guaranteed step, and earned stripes stacked on it, all the way to company
  sergeant major.
- By the start of 1918, 60% of the men still alive were CSMs (one to a company of about 200),
  34% were officers, and nobody was below sergeant.
- The ladder ran out by 1917, so in the last two years a promotion was no reward.

**The rule now** (`PROMO` in `data.ts`).
- The guaranteed step at leave, and every earned stripe, stop at sergeant.
- Company sergeant major comes only by a vacancy, for a sergeant the officers rate highly
  (standing 80): a 12% chance at a leave, and 4% after a battle.
- An officer rises by vacancies after 1918's battles: lieutenant at a 35% chance (standing 55),
  then acting captain at 25% (standing 70). An acting captain's role reads "company commander".
- Pay gains the two officer rates. The top tier of what the family sees at leave moved from
  £50 to £38, so the third leave still splits two ways.

**Measured** (scratch run, 3,000 wars per policy).

| Rank at the start of 1918 (adaptive) | Before | After |
|---|---|---|
| Sergeant | 6% | 58% |
| Company sergeant major | 59% | 10% |
| Second lieutenant | 34% | 32% |

At the Armistice: sergeant 58%, CSM 10%, second lieutenant 14%, lieutenant 15%, acting captain 3%.

**Gate** (2,000 per policy, % ± 1 SE, before → after).
- adaptive Armistice 5.8 ±0.5 → 5.5 ±0.5; survives 1915 75.7 ±1.0 → 75.7 ±1.0.
- reckless 2.0 ±0.3 → 1.8 ±0.3; careful 4.8 → 4.8; half 4.0 → 4.8 ±0.5.
- Grade (adaptive) 32.3 → 30.6, because rank counts in the record.

Every target holds.
