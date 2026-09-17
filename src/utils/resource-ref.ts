import { type CorpusSource, splitNamespaceRef } from '../loaders/corpus-index.js';

/**
 * Parse a resource reference that may include a namespace prefix and/or `#section`.
 *
 * Format: `[<namespace>/]<id>` — the namespace spelled by its directory name or by the path from the
 * corpus root that reaches it, and the id the path under that namespace's `resources/`.
 *
 * Examples: "meta/bootstrap-protocol"        → { namespace: "meta", id: "bootstrap-protocol" }
 *           "support/gitnexus/index-reading" → { namespace: "support/gitnexus", id: "index-reading" }
 *           "review-mode"                    → { namespace: undefined, id: "review-mode" }
 *           "pr-description#templates"       → { …, section: "templates" }
 *
 * Where a corpus is supplied, the longest leading run of segments naming a namespace is the prefix,
 * so a reference into a nested namespace is read as that namespace rather than as a deep path inside
 * a shallower one. A run naming a namespace the corpus answers twice is no prefix at all, and the
 * reference resolves to nothing — `indexCorpus` reports the collision that caused it. Where no
 * corpus is supplied the first segment is the prefix, which is what a namespace at the corpus root
 * has always been spelled as.
 */
export function parseResourceRef(ref: string, source?: CorpusSource): {
  namespace: string | undefined;
  id: string;
  section: string | undefined;
} {
  let section: string | undefined;
  let base = ref.trim();
  const hashIdx = base.indexOf('#');
  if (hashIdx >= 0) {
    section = base.substring(hashIdx + 1).trim() || undefined;
    base = base.substring(0, hashIdx);
  }
  base = base.replace(/\.md$/, '');
  const segments = base.split('/');
  if (segments.length < 2 || segments.some((segment) => segment.length === 0)) {
    return { namespace: undefined, id: base, section };
  }
  if (source === undefined) {
    return { namespace: segments[0]!, id: segments.slice(1).join('/'), section };
  }
  const split = splitNamespaceRef(source, segments);
  if (split?.form === 'namespace') {
    return { namespace: split.namespace.path, id: split.rest.join('/'), section };
  }
  return { namespace: undefined, id: base, section };
}

/**
 * Extract a single markdown section by its GitHub-style heading anchor: returns the heading line
 * and everything beneath it up to (not including) the next heading of the same or higher level.
 * Returns null when no heading matches the anchor.
 */
export function extractMarkdownSection(content: string, anchor: string): string | null {
  const slugify = (heading: string): string =>
    heading.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const lines = content.split(/\r?\n/);
  const isFence = (l: string): boolean => /^\s*(```|~~~)/.test(l);

  let startIdx = -1;
  let startLevel = 0;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (isFence(lines[i]!)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = lines[i]!.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m && slugify(m[2]!) === anchor) {
      startIdx = i;
      startLevel = m[1]!.length;
      break;
    }
  }
  if (startIdx < 0) return null;
  let endIdx = lines.length;
  inFence = false;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (isFence(lines[i]!)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = lines[i]!.match(/^(#{1,6})\s+/);
    if (m && m[1]!.length <= startLevel) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join('\n').trim();
}

/**
 * Collect get_resource-callable resource ids from projected technique / ops text.
 * Matches `resources: [...]` arrays and markdown links rewritten to bare / prefixed slugs
 * (including `#section` anchors).
 */
export function extractResourceIds(text: string): string[] {
  const ids = new Set<string>();
  for (const m of text.matchAll(/\bresources\s*:\s*\[([^\]]*)\]/gi)) {
    for (const part of m[1]!.split(/[,\n]/)) {
      const id = part.replace(/["'\s]/g, '');
      if (/^[a-z0-9][a-z0-9_/-]*(?:#[a-z0-9][a-z0-9_-]*)?$/i.test(id)) ids.add(id);
    }
  }
  for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
    let href = m[1]!.trim();
    if (href.startsWith('http') || href.startsWith('#') || href.includes('://')) continue;
    // Split the anchor off before stripping the extension, so a link carrying both
    // yields one normalised id rather than one with `.md` buried mid-string.
    const hashIdx = href.indexOf('#');
    const anchor = hashIdx >= 0 ? href.slice(hashIdx) : '';
    href = (hashIdx >= 0 ? href.slice(0, hashIdx) : href).replace(/\.md$/i, '') + anchor;
    const resourcesIdx = href.lastIndexOf('resources/');
    if (resourcesIdx >= 0) {
      // A link crossing into another workflow's tree carries that workflow in the
      // segment before `resources/`; the id it yields keeps that qualifier, so the
      // ref resolves against the tree the link points at rather than the reader's own.
      const owner = href.slice(0, resourcesIdx).replace(/\/$/, '').split('/').pop() ?? '';
      const slug = href.slice(resourcesIdx + 'resources/'.length);
      ids.add(/^[a-z0-9][a-z0-9-]*$/i.test(owner) ? `${owner}/${slug}` : slug);
      continue;
    }
    // A resource id is `[<workflow>/]<slug>`, so at most one slash. A deeper path is a
    // filesystem path — an illustrative one in prose, or a link into a non-resource tree.
    if (
      /^[a-z0-9][a-z0-9_/-]*(?:#[a-z0-9][a-z0-9_-]*)?$/i.test(href) &&
      !href.includes('::') &&
      (href.match(/\//g)?.length ?? 0) <= 1
    ) {
      ids.add(href);
    }
  }
  return [...ids];
}

/**
 * When a bare resource id was extracted from a technique authored under a
 * different namespace than the delivering session, prefix it with that technique
 * namespace so parseResourceRef / loaders resolve the correct resources/ tree.
 * Already-qualified ids (`namespace/slug`) and same-namespace bare ids pass through.
 */
export function qualifyResourceId(
  resourceId: string,
  techniqueWorkflowId: string,
  deliveryWorkflowId: string,
): string {
  const parsed = parseResourceRef(resourceId);
  if (parsed.namespace) return resourceId;
  if (techniqueWorkflowId && techniqueWorkflowId !== deliveryWorkflowId) {
    const section = parsed.section ? `#${parsed.section}` : '';
    return `${techniqueWorkflowId}/${parsed.id}${section}`;
  }
  return resourceId;
}
