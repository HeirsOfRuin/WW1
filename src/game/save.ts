// In the Trenches's saves: the engine's codec with this game's format name, version and migrations, and
// its save-code prefix. The contract (tests/save-contract.test.ts): every save version that ever
// shipped has a fixture in tests/fixtures/, and each loads and plays on.
import { makeSaveCodec, SaveError, type SaveFile as CoreSaveFile, type LoadResult as CoreLoadResult } from '@engine/save';
import { encodeSaveCode as encodeCode, decodeSaveCode as decodeCode } from '@engine/savecode';
import type { GameState } from './state';

export { SaveError };

/** Never rename: a save without this format name is refused. */
export const SAVE_FORMAT = 'in-the-trenches-save';
export const SAVE_VERSION = 1;
/** localStorage key; never rename either. */
export const SAVE_KEY = 'in-the-trenches.save.v1';

export type SaveFile = CoreSaveFile<GameState>;
export type LoadResult = CoreLoadResult<GameState>;

/** fromVersion -> the next version's save. Add one when SAVE_VERSION rises, and commit the old fixture first. */
export const migrations: Record<number, (save: SaveFile) => SaveFile> = {};

export const { toSave, fromSave } = makeSaveCodec<GameState>({ format: SAVE_FORMAT, title: 'In the Trenches', version: SAVE_VERSION, migrations });

/** Save codes: "TRENCH1." + base64url of the deflated save (moves a game between devices). */
export const CODE_PREFIX = 'TRENCH1.';
export const encodeSaveCode = (save: unknown) => encodeCode(CODE_PREFIX, save);
export const decodeSaveCode = (text: string) => decodeCode(CODE_PREFIX, text);
