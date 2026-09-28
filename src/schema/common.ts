import { z } from 'zod';

export const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/).describe('Version in numeric `major.minor.patch` form.');

/** The technique reference grammar as authors read it, written once for every site that names a technique. */
export const TechniqueReferenceSchema = z.string().describe(
  'Technique reference: `[namespace::]technique[::nested…]`, segments separated by `::`, none of them empty. '
  + 'When its leading segments spell a namespace the corpus holds and at least one segment follows them, the rest of the path resolves in that namespace and nowhere else. '
  + 'A namespace is spelled by its directory name, by the path from the corpus root that reaches it, or by as much of the end of that path as reaches it alone (`gitnexus` and `support::gitnexus` name the same one); the longest leading run that spells a namespace wins. '
  + 'Otherwise every segment is a path under the referring workflow\'s `techniques/`, the first naming a group and the last the technique, resolved in the referring workflow and then in `meta`; a borrowed activity\'s referring workflow is the one it is borrowed from. '
  + 'A reference that reads both ways is refused, naming both files. '
  + 'The older spelling `namespace/technique` names a namespace; a second slash, or a slash after a `::`, is malformed. '
  + 'Where no nested technique matches, the last segment names a rule on the technique before it, and a group name `{group}` stands for every rule named `{group}-*`.',
);

/**
 * The number a value stands for in a numeric comparison: a finite number, or a string that reads as
 * one. Anything else — a boolean, null, an absent value, a blank string — stands for no number, and
 * a comparison with it is false. Shared by the `when` dialect and structured conditions, so the two
 * compare alike.
 */
export function comparableNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}
