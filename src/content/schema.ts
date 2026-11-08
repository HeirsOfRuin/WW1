// In the Trenches's content schema: the engine's core schema plus this game's own. One Zod definition
// gives both the TypeScript types and the validation tools/build-content.ts runs on every YAML file.
//
// To add a game effect: its Zod object in GAME_EFFECTS, its handler in src/game/module.ts
// (effects), and its stakes there too (stakesOf) if the player should see it under a choice.
// To add a scene field of the game's own: the second argument of makeSceneSchemas.
import { z } from 'zod';
import { CORE_EFFECTS, CORE_REGISTRY, Id, makeSceneSchemas, wrapEffects, type CondInput, type CoreContent } from '@engine/schema';

export { CondInputSchema, ConfigSchema, Id } from '@engine/schema';
export type { CondInput, Config } from '@engine/schema';

/** The game module id this content belongs to (src/game/module.ts registers it). */
export const GAME_ID = 'trenches';

// ---- Effects --------------------------------------------------------------
const HOME = z.enum(['dig', 'mech', 'lit', 'field', 'stamina', 'firstaid', 'sport', 'voice']);
export const DECISION = z.enum(['transfer', 'stay', 'volunteer', 'stay_back', 'go', 'decline', 'report', 'carry_on', 'take', 'push', 'help', 'ground', 'back', 'commission', 'posting:0', 'posting:1', 'posting:2', 'bold', 'steady', 'careful']);
export const GAME_EFFECTS = [
  z.object({ war_home: z.array(HOME).length(2) }).strict(), // creation: the two town skills
  z.object({ war_general: z.enum(['firstaid', 'sport', 'voice']) }).strict(), // creation: the general skill
  z.object({ war_run: z.literal(true) }).strict(), // the war begins: run to its first question
  z.object({ war: DECISION }).strict(), // the answer to the war's pending question (src/game/war/war.ts decide)
  z.object({ war_ack: z.enum(['wound', 'fallen', 'sortie']) }).strict(), // a wound or a friend's death has been shown
] as const;
const BaseEffectSchema = z.union([...CORE_EFFECTS, ...GAME_EFFECTS]);
export type BaseEffect = z.infer<typeof BaseEffectSchema>;
export type Effect = BaseEffect | { if: CondInput; then: Effect[]; else?: Effect[] } | { chance: number; then: Effect[]; else?: Effect[] };
export const EffectSchema: z.ZodType<Effect> = z.lazy(() => wrapEffects<Effect>(BaseEffectSchema, () => EffectSchema));

// ---- Scenes ---------------------------------------------------------------
export const { OutcomeSchema, ChoiceSchema, SceneSchema } = makeSceneSchemas(EffectSchema);
export type Outcome = z.infer<typeof OutcomeSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type Scene = z.infer<typeof SceneSchema>;

// ---- Registries -----------------------------------------------------------
export const RegistrySchema = z.object({ ...CORE_REGISTRY }).strict();
export type Registry = z.infer<typeof RegistrySchema>;

// ---- Starts: who you are when the game begins (content/starts/*.yaml) ----
const StatBlock = z.record(Id, z.number().int());
export const StartSchema = z.object({
  id: Id,
  label: z.string(),
  summary: z.string(),
  start_scene: Id,
  hero: z.object({ age: z.number().int(), station: Id, attributes: StatBlock, skills: StatBlock, coin: z.number().int() }).strict(),
  /** the war layer's town (src/game/war/data.ts TOWNS) */
  town: z.enum(['pit', 'mill', 'city', 'farm']),
}).strict();
export type Start = z.infer<typeof StartSchema>;

export interface ContentBundle extends CoreContent {
  registry: Registry;
  scenes: Record<string, Scene>;
  starts: Record<string, Start>;
}
