// The war layer's public face: the step machine, its bot policies and a headless runner.
import { STAGES } from './data';
import { newWar, run, decide, done, type War, type NewWarOptions } from './war';
import { POLICIES, withForce, decideFor, type Force } from './policies';

export * from './war';
export * from './data';
export { POLICIES, withForce, decideFor, type Force } from './policies';

export const battleOf = (w: War) => STAGES[w.stage - 1]!.battles[w.r]!;

/** A whole war played by a policy, without the story engine (the engine path is tools/war-bot). */
export function playWar(o: NewWarOptions & { policy: string; force?: Force }): War {
  const pol = POLICIES[o.policy];
  if (!pol) throw new Error(`unknown policy ${o.policy}`);
  const p = withForce(pol, o.force);
  const w = run(newWar(o));
  for (let guard = 0; guard < 5000 && !done(w); guard++) decide(w, decideFor(p, w, w.pending!, battleOf));
  return w;
}
