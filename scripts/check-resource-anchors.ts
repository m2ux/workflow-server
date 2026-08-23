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
import { assertScanned, resolveWorkflowsRoot } from './workflows-root.js';
import { measureOrExit } from './guard-protocol.js';
import { fencedLines, linkDestinations, toLines } from './markdown-refs.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
// Defaults to ../workflows; --root <path> or WORKFLOWS_DIR redirects to a worktree (issue #160 #1).
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));

export interface BrokenAnchor {
  /** File containing the link, relative to the workflows root. */
  source: string;
  /** Link target as written. */
  link: string;
  /** Why it failed. */
  reason: 'missing-file' | 'missing-anchor' | 'unbalanced-fence';
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
  const lines = toLines(readFileSync(mdPath, 'utf-8'));
  // `suppress-to-end`, not the link scan's `read-all`: for collection the safe direction inverts. A
  // heading exposed from under an unclosed fence is an anchor the rendered page does not have, and it
  // makes a link to it resolve here and break in the reader's hands.
  const { fenced } = fencedLines(lines, { onUnclosed: 'suppress-to-end' });
  for (const [index, line] of lines.entries()) {
    if (fenced.has(index)) continue;
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

/** Owned by `check-bootstrap-self-contained`, which refuses every corpus link on it. */
const PRE_SESSION_RESOURCE = join('meta', 'resources', 'bootstrap-protocol.md');

/** An anchored markdown destination, once the shared reader has produced it in any spelling. */
const ANCHORED_RE = /^([^\s#]+\.md)#([A-Za-z0-9][\w-]*)$/;

export function collectBrokenAnchors(root: string = ROOT): BrokenAnchor[] {
  const broken: BrokenAnchor[] = [];
  const anchorCache = new Map<string, Set<string>>();
  let scanned = 0;
  for (const file of walkFiles(root)) {
    // The pre-session bootstrap resource belongs to `check-bootstrap-self-contained`, which refuses
    // EVERY corpus link on it — nothing can be followed before a session exists. So anything this guard
    // could report there is already a finding of that one's, and reporting it twice would make one bad
    // line yield two findings that one edit clears.
    if (relative(root, file) === PRE_SESSION_RESOURCE) continue;
    scanned++;
    // Scan only rendered prose: drop fenced code blocks (template bodies carry placeholder
    // links like NN-work-package-plan.md) and inline code spans (anti-pattern docs quote
    // illustrative link forms in backticks).
    const lines = toLines(readFileSync(file, 'utf-8'));
    const { fenced, unclosed } = fencedLines(lines);
    // Markdown only. A stray fence marker inside a YAML block scalar is not a defect in the YAML, and
    // 'close the fence' is not a remedy there. The name matches the sibling guard's, since both come
    // from the same signal and one vocabulary is easier to act on than two.
    if (unclosed !== null && file.endsWith('.md')) {
      broken.push({
        source: `${relative(root, file)}:${unclosed}`,
        link: 'a code fence left open',
        reason: 'unbalanced-fence',
      });
    }
    const destinations: string[] = [];
    for (const [index, line] of lines.entries()) {
      if (fenced.has(index)) continue;
      destinations.push(...linkDestinations(line));
    }
    for (const destination of destinations) {
      const m = ANCHORED_RE.exec(destination);
      if (!m) continue;
      const [, target, anchor] = m;
      // Requires an authority, so a relative path whose first segment carries a colon stays checked.
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target!)) continue;
      // A template body names its file with a placeholder, which resolves to nothing on purpose.
      if (/[{]/.test(target!)) continue;
      const targetPath = resolve(dirname(file), target);
      if (relative(root, targetPath).startsWith('..' + sep)) continue; // outside the corpus
      const source = relative(root, file);
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
  assertScanned(scanned, 'markdown and yaml files', root);
  return broken;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const broken = measureOrExit('resource-anchors', resolve(join(DIR, '..', 'workflows')), collectBrokenAnchors);
  if (broken.length === 0) {
    process.stdout.write('resource-anchors: OK — every relative .md#anchor link resolves to a rendered heading, and every fence closes\n');
    process.exit(0);
  }
  process.stdout.write(`resource-anchors: ${broken.length} finding(s) — fix the link, restore the heading, or close the fence:\n`);
  for (const b of broken) process.stdout.write(`  [${b.reason}] ${b.source} -> ${b.link}\n`);
  process.exit(1);
}
