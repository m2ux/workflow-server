/**
 * The rule a technique reference resolves by, written once.
 *
 * A reference is a `::`-delimited path:
 *
 *     [<namespace>::]<technique>[::<nested>…]
 *
 * The leading segments name a NAMESPACE when the corpus holds one they spell and at least one
 * segment follows them; the rest of the path is then resolved in that namespace and nowhere else.
 * Otherwise every segment is a path inside the referring workflow's `techniques/` — the first names
 * a group, the last names the technique — resolved against the referring workflow and then `meta`.
 * Depth is unbounded on both halves: `group::subgroup::operation` is an ordinary reference, and so
 * is `support::gitnexus::analyze`.
 *
 * A namespace is spelled by its directory name, or by the path from the corpus root that reaches it
 * — `gitnexus` and `support::gitnexus` name the same one. The longest leading run that spells a
 * namespace wins, so a reference into a nested namespace is read as that namespace rather than as a
 * deep path inside a shallower one. Where both readings answer, the corpus is holding one reference
 * over two files and the reference is refused naming both, rather than one being picked.
 *
 * A namespace prefix may also be spelled with a slash (`<namespace>/<technique>`), which is the same
 * reference under an older spelling and always names a namespace, whether or not the corpus holds
 * one. A slash carries no other meaning: a second slash, or one after a `::`, is malformed — so a
 * namespace named by a path is spelled with `::` throughout.
 *
 * What a leading segment means is settled by the corpus index, so it follows from what the corpus
 * HOLDS rather than from the interior shape of the referring workflow. A workflow is a namespace
 * from the moment its definition exists: a reference to one that has yet to write its first
 * technique names that workflow and fails as an unresolved technique, and a group in the referring
 * workflow sharing its name is not what the reference addresses.
 */
import { type CorpusSource, type NamespaceShadow, splitNamespaceRef } from './corpus-index.js';

/** The separator between the segments of a reference. */
export const SEGMENT_SEPARATOR = '::';

/** The older spelling of the namespace separator. */
const WORKFLOW_SLASH = '/';

/** The separator between the segments of a namespace path, as `corpus-index` spells one. */
const NAMESPACE_SEPARATOR = '/';

/** The grammar every refusal quotes, so a message says what a reference is as well as what it is not. */
const GRAMMAR = 'A reference is \'[namespace::]technique[::nested…]\' — segments separated by \'::\', '
  + 'none of them empty, with an optional namespace prefix that may name a path and may also be '
  + 'spelled \'namespace/technique\'.';

/** One reference, parsed. */
export interface TechniqueRef {
  /** The reference as written, which is how a message quotes it back to its author. */
  text: string;
  /**
   * The namespace a qualified reference names, by name or by path. Absent for a reference resolved
   * against the referring workflow and then `meta`.
   */
  namespace?: string | undefined;
  /**
   * The path under a namespace's `techniques/`, outermost group first and the technique last. Always
   * carries at least one segment.
   */
  segments: string[];
}

/**
 * A reference built from its parts rather than read from a definition, spelled canonically.
 *
 * A namespace named by a path contributes one segment per directory, because `::` is the separator
 * a reference of any depth is spelled with and a second slash is malformed.
 */
export function techniqueRef(namespace: string | undefined, segments: string[]): TechniqueRef {
  const prefix = namespace ? namespace.split(NAMESPACE_SEPARATOR) : [];
  return { text: [...prefix, ...segments].join(SEGMENT_SEPARATOR), namespace, segments };
}

/** A reference that resolves to nothing usable — refused by the grammar, or answered twice. */
export class TechniqueRefError extends Error {
  constructor(public readonly ref: string, message: string) {
    super(message);
    this.name = 'TechniqueRefError';
  }
}

/** A reference the rule refuses: it addresses nothing, whatever the corpus holds. */
function malformed(ref: string, reason: string): TechniqueRefError {
  return new TechniqueRefError(ref, `Malformed technique reference '${ref}': ${reason}. ${GRAMMAR}`);
}

/**
 * A reference the corpus answers twice: its leading segments name a namespace, and the same
 * segments name a directory inside a shorter namespace's library folder. Refused naming both, so
 * the collision is fixed in the corpus rather than settled arbitrarily at each reference.
 */
function ambiguous(ref: string, shadows: readonly NamespaceShadow[]): TechniqueRefError {
  const homes = shadows.map((shadow) => `${shadow.namespace} and ${shadow.nested}`).join('; ');
  return new TechniqueRefError(
    ref,
    `Ambiguous technique reference '${ref}': its leading segments name two directories — ${homes}. `
    + 'Rename one so the reference names one of them.',
  );
}

/**
 * Parse a reference under the rule above.
 *
 * Throws `TechniqueRefError` on a reference no corpus could answer, and on one this corpus answers
 * twice. The loader entry points convert that into their own `Result`; a caller parsing directly
 * handles it as the authoring error it is.
 */
export function parseTechniqueRef(ref: string, source: CorpusSource): TechniqueRef {
  const slashes = ref.split(WORKFLOW_SLASH).length - 1;
  if (slashes > 1) {
    throw malformed(ref, 'it carries more than one slash, and a slash spells the namespace separator');
  }
  if (slashes === 1) {
    const at = ref.indexOf(WORKFLOW_SLASH);
    const namespace = ref.slice(0, at);
    const rest = ref.slice(at + 1);
    if (namespace.includes(SEGMENT_SEPARATOR)) {
      throw malformed(ref, 'its slash follows a \'::\', and a slash spells the namespace separator, which comes first');
    }
    if (!namespace) throw malformed(ref, 'it names no namespace before its slash');
    return { text: ref, namespace, segments: splitSegments(ref, rest) };
  }

  const segments = splitSegments(ref, ref);
  const split = splitNamespaceRef(source, segments);
  if (split?.form === 'shadowed') throw ambiguous(ref, split.shadows);
  // The path, rather than the name the reference may have used: it is the spelling that resolves
  // whatever else the corpus holds, and for a namespace at the corpus root the two are one string.
  if (split) return { text: ref, namespace: split.namespace.path, segments: split.rest };
  return { text: ref, namespace: undefined, segments };
}

/** The segments of a path, refusing an empty one — which addresses no file under any reading. */
function splitSegments(ref: string, path: string): string[] {
  const segments = path.split(SEGMENT_SEPARATOR);
  if (segments.some((segment) => segment.length === 0)) {
    throw malformed(ref, segments.length === 1 ? 'it is empty' : 'it carries an empty segment');
  }
  return segments;
}

/**
 * The path a reference's segments name under a `techniques/` directory, where each segment but the
 * last is a folder. This is the form the markdown loader addresses a nested technique by.
 */
export function techniquePath(segments: readonly string[]): string {
  return segments.join('/');
}

/**
 * Whether a reference is a bare technique name — one segment, carrying neither separator.
 *
 * The activity-group convention reads such a name as an operation in the group named after its
 * activity, and only such a name: a reference that already spells a path says where it lives.
 */
export function isBareName(ref: string): boolean {
  return !ref.includes(SEGMENT_SEPARATOR) && !ref.includes(WORKFLOW_SLASH);
}
