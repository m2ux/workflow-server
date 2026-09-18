/**
 * What a link in a corpus markdown file points at.
 *
 * A namespace sits at whatever depth the corpus organises it to, so the distance between two of them
 * is not a property either can know. A reference out of a namespace therefore names the namespace it
 * wants — `/meta/techniques/variable-binding.md` — and resolution is a lookup: the leading segment
 * is a namespace name, and the rest is a path within the directory discovery found it at. Agents and
 * guards follow that lookup, so the link survives either namespace moving.
 *
 * A leading slash is a namespace name, not a path from the corpus root. On the orphan `workflows`
 * branch GitHub treats `/meta/…` as repo-root, which coincides with the lookup only while that
 * namespace sits at the root. After a move the click 404s; `resolveLink` still finds the file.
 *
 * A namespace the corpus reaches only by path is named that way in a link too, the leading segments
 * spelling the path — so the lookup takes the longest leading run that names one, and the rest is
 * the path within.
 *
 * Within a namespace, an ordinary relative link is right and stays right: a namespace moves as a
 * unit, so a path between two of its own files never changes.
 */
import { dirname, join, resolve } from 'node:path';
import { type CorpusIndex, indexCorpus, splitNamespaceRef } from '../src/loaders/corpus-index.js';

/** A URL, an in-page anchor, or anything else naming no file in the corpus. */
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

export interface ResolvedLink {
  /**
   * `external` names no corpus file. `workflow` is the leading-slash form, anchored on a namespace.
   * `relative` is resolved against the file holding the link.
   */
  form: 'external' | 'workflow' | 'relative';
  /** The file named, or null for an external link or a namespace the corpus does not hold. */
  path: string | null;
  /** The namespace a `/<name>/…` link names, whether or not the corpus holds it. */
  workflow?: string;
}

export function resolveLink(
  root: string,
  sourceFile: string,
  target: string,
  index: CorpusIndex = indexCorpus(root),
): ResolvedLink {
  const clean = target.trim();
  if (clean === '' || clean.startsWith('#') || SCHEME_RE.test(clean)) return { form: 'external', path: null };
  if (clean.startsWith('/')) {
    const segments = clean.slice(1).split('/');
    if (!segments[0]) return { form: 'external', path: null };
    const split = splitNamespaceRef(index, segments);
    if (split?.form === 'namespace') {
      return { form: 'workflow', workflow: split.namespace.path, path: join(split.namespace.dir, ...split.rest) };
    }
    // Nothing the corpus holds: the leading segment is what the link meant to name, and what a
    // finding quotes back. A run naming a namespace the corpus answers twice lands here too.
    return { form: 'workflow', workflow: segments[0], path: null };
  }
  return { form: 'relative', path: resolve(dirname(sourceFile), clean) };
}
