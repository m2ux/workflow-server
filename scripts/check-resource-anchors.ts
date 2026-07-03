/**
 * Resource-anchor guard.
 *
 * Every relative markdown link with a heading anchor (`[x](path/to/file.md#heading-slug)`) in the
 * workflow corpus must resolve: the target file exists and contains a heading whose GitHub slug
 * equals the anchor. Techniques address resources (templates, rubrics, rules sections) by these
 * anchors (AP-42/AP-51); a slimming or restructuring pass that renames a heading silently strands
 * every referencer, and nothing else in the toolchain notices — resources are not parsed by the
 * binding-fidelity guard.
 *
 * Headings inside fenced code blocks are NOT rendered by GitHub and therefore do not produce
 * anchors; the collector skips them. Duplicate headings get `-1`, `-2`, ... suffixes per GitHub's
 * slugger. External links (scheme://), pure file links (no `#`), and non-`.md` targets are ignored.
 *
 * Hard-zero: every anchor link must resolve.
 *
 * Run: npx tsx scripts/check-resource-anchors.ts
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
// Defaults to ../workflows; --root <path> or WORKFLOWS_DIR redirects to a worktree (issue #160 #1).
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));

export interface BrokenAnchor {
  /** File containing the link, relative to the workflows root. */
  source: string;
  /** Link target as written. */
  link: string;
  /** Why it failed. */
  reason: 'missing-file' | 'missing-anchor';
}

/**
 * GitHub heading slug: lowercase, strip characters that are not word/space/hyphen, then replace
 * each space with a hyphen WITHOUT collapsing runs — "Plan & Prepare" renders as `plan--prepare`
 * (the removed `&` leaves two spaces, each becoming a hyphen), matching github-slugger.
 */
function slugify(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/ /g, '-');
}

/** Collect the anchor set of a markdown file: slugs of headings outside fenced code blocks. */
function collectAnchors(mdPath: string): Set<string> {
  const anchors = new Set<string>();
  const counts = new Map<string, number>();
  let inFence = false;
  for (const line of readFileSync(mdPath, 'utf-8').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (!m) continue;
    const base = slugify(m[1]);
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    anchors.add(n === 0 ? base : `${base}-${n}`);
  }
  return anchors;
}

function* walkFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) yield* walkFiles(p);
    else if (/\.(md|yaml)$/.test(entry)) yield p;
  }
}

const LINK_RE = /\]\(([^()\s]+\.md)#([A-Za-z0-9][\w-]*)\)/g;

export function collectBrokenAnchors(): BrokenAnchor[] {
  const broken: BrokenAnchor[] = [];
  const anchorCache = new Map<string, Set<string>>();
  for (const file of walkFiles(ROOT)) {
    // Scan only rendered prose: drop fenced code blocks (template bodies carry placeholder
    // links like NN-work-package-plan.md) and inline code spans (anti-pattern docs quote
    // illustrative link forms in backticks).
    const lines: string[] = [];
    let inFence = false;
    for (const line of readFileSync(file, 'utf-8').split('\n')) {
      if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
      if (!inFence) lines.push(line.replace(/`[^`]*`/g, ''));
    }
    const text = lines.join('\n');
    for (const m of text.matchAll(LINK_RE)) {
      const [, target, anchor] = m;
      if (/^[a-z]+:\/\//i.test(target)) continue;
      if (/[<{]/.test(target)) continue; // placeholder targets like <id>.md or {token}.md
      const targetPath = resolve(dirname(file), target);
      if (relative(ROOT, targetPath).startsWith('..' + sep)) continue; // outside the corpus
      const source = relative(ROOT, file);
      const link = `${target}#${anchor}`;
      if (!existsSync(targetPath)) {
        broken.push({ source, link, reason: 'missing-file' });
        continue;
      }
      let anchors = anchorCache.get(targetPath);
      if (!anchors) { anchors = collectAnchors(targetPath); anchorCache.set(targetPath, anchors); }
      if (!anchors.has(anchor.toLowerCase())) broken.push({ source, link, reason: 'missing-anchor' });
    }
  }
  return broken;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const broken = collectBrokenAnchors();
  if (broken.length === 0) {
    process.stdout.write('resource-anchors: OK — every relative .md#anchor link resolves to a rendered heading\n');
    process.exit(0);
  }
  process.stdout.write(`resource-anchors: ${broken.length} broken link(s) — fix the link or restore the heading:\n`);
  for (const b of broken) process.stdout.write(`  [${b.reason}] ${b.source} -> ${b.link}\n`);
  process.exit(1);
}
