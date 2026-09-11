/**
 * What a link in a corpus markdown file points at.
 *
 * A workflow sits at whatever depth the corpus organises it to, so the distance between two
 * workflows is not a property either of them can know. A reference out of a workflow therefore names
 * the workflow it wants — `/meta/techniques/variable-binding.md` — and resolution is a lookup: the
 * leading segment is a workflow id, and the rest is a path within the directory discovery found it
 * at. The link survives either workflow moving.
 *
 * Within a workflow, an ordinary relative link is right and stays right: a workflow moves as a unit,
 * so a path between two of its own files never changes.
 */
import { dirname, join, resolve } from 'node:path';
import { workflowLocation } from '../src/loaders/corpus-index.js';

/** A URL, an in-page anchor, or anything else naming no file in the corpus. */
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

export interface ResolvedLink {
  /**
   * `external` names no corpus file. `workflow` is the leading-slash form, anchored on a workflow
   * id. `relative` is resolved against the file holding the link.
   */
  form: 'external' | 'workflow' | 'relative';
  /** The file named, or null for an external link or a workflow the corpus does not hold. */
  path: string | null;
  /** The workflow a `/<id>/…` link names, whether or not the corpus holds it. */
  workflow?: string;
}

export function resolveLink(root: string, sourceFile: string, target: string): ResolvedLink {
  const clean = target.trim();
  if (clean === '' || clean.startsWith('#') || SCHEME_RE.test(clean)) return { form: 'external', path: null };
  if (clean.startsWith('/')) {
    const [id, ...rest] = clean.slice(1).split('/');
    if (!id) return { form: 'external', path: null };
    const dir = workflowLocation(root, id)?.dir ?? null;
    return { form: 'workflow', workflow: id, path: dir ? join(dir, ...rest) : null };
  }
  return { form: 'relative', path: resolve(dirname(sourceFile), clean) };
}
