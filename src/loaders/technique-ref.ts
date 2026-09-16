/**
 * The rule a technique reference resolves by, written once.
 *
 * A reference is a `::`-delimited path:
 *
 *     [<workflow>::]<technique>[::<nested>…]
 *
 * The leading segment names a WORKFLOW when the corpus holds a workflow of that name and at least
 * one segment follows it; the rest of the path is then resolved in that workflow and nowhere else.
 * Otherwise every segment is a path inside the referring workflow's `techniques/` — the first names
 * a group, the last names the technique — resolved against the referring workflow and then `meta`.
 * Depth is unbounded: `group::subgroup::operation` is an ordinary reference.
 *
 * A workflow prefix may also be spelled with a slash (`<workflow>/<technique>`), which is the same
 * reference under an older spelling and always names a workflow, whether or not the corpus holds
 * one. A slash carries no other meaning: a second slash, or one after a `::`, is malformed.
 *
 * Deciding the leading segment against the corpus INDEX rather than against the presence of a
 * `techniques/` directory is what keeps a reference's meaning tied to what the corpus declares. A
 * workflow is a workflow from the moment its definition exists, so a reference to one that has yet
 * to write its first technique fails as an unresolved technique rather than quietly re-reading its
 * prefix as a group in the referring workflow.
 */
import { workflowLocation, type CorpusSource } from './corpus-index.js';

/** The separator between the segments of a reference. */
export const SEGMENT_SEPARATOR = '::';

/** The older spelling of the workflow separator. */
const WORKFLOW_SLASH = '/';

/** One reference, parsed. */
export interface TechniqueRef {
  /** The reference as written, which is how a message quotes it back to its author. */
  text: string;
  /**
   * The workflow a qualified reference names. Absent for a reference resolved against the referring
   * workflow and then `meta`.
   */
  workflowId?: string | undefined;
  /**
   * The path under a workflow's `techniques/`, outermost group first and the technique last. Always
   * carries at least one segment.
   */
  segments: string[];
}

/** A reference built from its parts rather than read from a definition, spelled canonically. */
export function techniqueRef(workflowId: string | undefined, segments: string[]): TechniqueRef {
  return { text: [...(workflowId ? [workflowId] : []), ...segments].join(SEGMENT_SEPARATOR), workflowId, segments };
}

/** A reference the rule refuses: it addresses nothing, whatever the corpus holds. */
export class TechniqueRefError extends Error {
  constructor(public readonly ref: string, reason: string) {
    super(
      `Malformed technique reference '${ref}': ${reason}. A reference is '[workflow::]technique[::nested…]' — `
      + 'segments separated by \'::\', none of them empty, with an optional workflow prefix that may also be '
      + 'spelled \'workflow/technique\'.',
    );
    this.name = 'TechniqueRefError';
  }
}

/**
 * Parse a reference under the rule above.
 *
 * Throws `TechniqueRefError` on a reference no corpus could answer. The loader entry points convert
 * that into their own `Result`; a caller parsing directly handles it as the authoring error it is.
 */
export function parseTechniqueRef(ref: string, source: CorpusSource): TechniqueRef {
  const slashes = ref.split(WORKFLOW_SLASH).length - 1;
  if (slashes > 1) {
    throw new TechniqueRefError(ref, 'it carries more than one slash, and a slash spells the workflow separator');
  }
  if (slashes === 1) {
    const at = ref.indexOf(WORKFLOW_SLASH);
    const workflowId = ref.slice(0, at);
    const rest = ref.slice(at + 1);
    if (workflowId.includes(SEGMENT_SEPARATOR)) {
      throw new TechniqueRefError(ref, 'its slash follows a \'::\', and a slash spells the workflow separator, which comes first');
    }
    if (!workflowId) throw new TechniqueRefError(ref, 'it names no workflow before its slash');
    return { text: ref, workflowId, segments: splitSegments(ref, rest) };
  }

  const segments = splitSegments(ref, ref);
  if (segments.length >= 2 && workflowLocation(source, segments[0]!) !== null) {
    return { text: ref, workflowId: segments[0]!, segments: segments.slice(1) };
  }
  return { text: ref, workflowId: undefined, segments };
}

/** The segments of a path, refusing an empty one — which addresses no file under any reading. */
function splitSegments(ref: string, path: string): string[] {
  const segments = path.split(SEGMENT_SEPARATOR);
  if (segments.some((segment) => segment.length === 0)) {
    throw new TechniqueRefError(ref, segments.length === 1 ? 'it is empty' : 'it carries an empty segment');
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
