/**
 * Parse a resource reference that may include a workflow prefix and/or `#section`.
 * Format: "workflow/id" for cross-workflow, or bare "id" for local.
 * Examples: "meta/bootstrap-protocol" → { workflowId: "meta", id: "bootstrap-protocol" }
 *           "review-mode"             → { workflowId: undefined, id: "review-mode" }
 *           "pr-description#templates" → { …, section: "templates" }
 */
export function parseResourceRef(ref: string): {
  workflowId: string | undefined;
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
  const slashIdx = base.indexOf('/');
  if (slashIdx > 0) {
    return { workflowId: base.substring(0, slashIdx), id: base.substring(slashIdx + 1), section };
  }
  return { workflowId: undefined, id: base, section };
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
    href = href.replace(/\.md$/i, '');
    const resourcesIdx = href.lastIndexOf('resources/');
    if (resourcesIdx >= 0) {
      ids.add(href.slice(resourcesIdx + 'resources/'.length));
      continue;
    }
    if (/^[a-z0-9][a-z0-9_/-]*(?:#[a-z0-9][a-z0-9_-]*)?$/i.test(href) && !href.includes('::')) {
      ids.add(href);
    }
  }
  return [...ids];
}
