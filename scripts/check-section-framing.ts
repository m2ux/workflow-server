/**
 * Section-framing guard.
 *
 * A resource cited by anchor is delivered one section at a time: `get_resource` for
 * `example.md#rules` returns that heading's span and nothing else. Prose above the first `##`
 * therefore reaches whoever loads the whole file and nobody who asks for a section — so an
 * obligation parked there governs work that never sees it.
 *
 * That is not hypothetical. The controlled-language overlay stated its precedence — the stricter
 * rule wins at word and sentence level, the base standard keeps structure and audience fit — above
 * its first heading, while the drafting step that applies the overlay cites `#writing-rules`. The
 * rule governed every drafting run and was delivered to none of them. The catalog entry
 * `framing-outside-any-section` names the defect and specifies this test; nothing implemented it.
 *
 * Detect: a resource with at least MIN_FRAMING characters of body before its first `##`, which at
 * least one other file cites by anchor. Both halves matter — framing in a resource nobody
 * section-cites is delivered whole and strands no one.
 *
 * The judgement this cannot make is whether the framing is operative or orientation. A guide that
 * opens "Creation guide for X. The reader is deciding whether to spend the run." strands nothing;
 * one that opens with a precedence rule strands it. So a site is either classified in
 * `section-framing-triage.json` with a verdict and a named rationale, or it is reported. An entry
 * matching nothing is stale and reported too, so the triage cannot outlive the prose it describes.
 *
 * Run: npx tsx scripts/check-section-framing.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));
/**
 * The triage lives with the corpus, not with this script. Its entries are judgements about corpus
 * prose, so a change that moves a rule into a section and the entry describing that prose belong in
 * one commit. Held beside this script instead, the two could never agree: fixing the prose stranded
 * the entry, and the pull request fixing it could not reach the file — the corpus and the tooling are
 * separate histories, so a corpus change was red whichever side moved first.
 *
 * The fallback beside this script carries a corpus pinned before the triage moved into it, and goes
 * once no supported pin predates the move.
 */
const CORPUS_TRIAGE = resolve(join(ROOT, 'section-framing-triage.json'));
const LEGACY_TRIAGE = resolve(join(DIR, 'section-framing-triage.json'));
const TRIAGE = existsSync(CORPUS_TRIAGE) ? CORPUS_TRIAGE : LEGACY_TRIAGE;

/**
 * Below this, framing is a line of orientation rather than a place an obligation can hide. The
 * catalog entry says "roughly 100+ characters", which is where this comes from.
 */
const MIN_FRAMING = 100;

export interface FramingFinding {
  check: 'framing-outside-any-section' | 'stale-triage';
  site: string;
  detail: string;
}

interface TriageEntry { site: string; verdict: string; rationale: string }
interface Triage { rationales?: Record<string, string>; entries?: TriageEntry[] }

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === '.git' || e === 'node_modules') continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkFiles(p, out);
    else if (e.endsWith('.md') || e.endsWith('.yaml')) out.push(p);
  }
  return out;
}

/** Characters of body before the first `##`, with frontmatter and the leading H1 removed. */
function framingLength(text: string): number {
  let body = text;
  if (body.startsWith('---\n')) {
    const end = body.indexOf('\n---', 4);
    if (end !== -1) body = body.slice(end + 4);
  }
  const lines: string[] = [];
  for (const line of body.split('\n')) {
    if (line.startsWith('## ')) break;
    if (line.startsWith('# ')) continue;
    lines.push(line);
  }
  return lines.join('\n').trim().length;
}

export function collectFramingFindings(): FramingFinding[] {
  const files = walkFiles(ROOT);

  // Which resource slugs some other file cites with an #anchor. A file citing itself does not count:
  // an internal cross-reference is read by whoever already has the whole file.
  const anchoredBy = new Map<string, Set<string>>();
  for (const file of files) {
    const rel = relative(ROOT, file);
    const text = readFileSync(file, 'utf-8');
    for (const m of text.matchAll(/\]\(([^)\s]*?)([A-Za-z0-9._-]+)\.md#[a-z0-9-]+\)/g)) {
      const slug = m[2]!.toLowerCase();
      if (!anchoredBy.has(slug)) anchoredBy.set(slug, new Set());
      anchoredBy.get(slug)!.add(rel);
    }
  }

  const triage: Triage = existsSync(TRIAGE)
    ? (JSON.parse(readFileSync(TRIAGE, 'utf-8')) as Triage)
    : {};
  const classified = new Map((triage.entries ?? []).map((e) => [e.site, e]));
  const matched = new Set<string>();

  const out: FramingFinding[] = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const rel = relative(ROOT, file);
    // Resources are what get section-delivered; a README is an index read whole.
    if (!rel.includes('/resources/') || rel.endsWith('README.md')) continue;

    const slug = rel.slice(rel.lastIndexOf('/') + 1, -3).toLowerCase();
    const citers = new Set([...(anchoredBy.get(slug) ?? [])].filter((c) => c !== rel));
    if (citers.size === 0) continue;

    const chars = framingLength(readFileSync(file, 'utf-8'));
    if (chars < MIN_FRAMING) continue;

    const entry = classified.get(rel);
    if (entry) { matched.add(rel); continue; }
    out.push({
      check: 'framing-outside-any-section',
      site: rel,
      detail: `${chars} characters before the first '##', and ${citers.size} file(s) cite this resource by anchor — `
        + `a section consumer never receives that prose. Move an obligation into a section a citer can ask for, `
        + `or classify the site in scripts/section-framing-triage.json when the framing is orientation only`,
    });
  }

  for (const [site] of classified) {
    if (!matched.has(site)) {
      out.push({
        check: 'stale-triage',
        site,
        detail: 'triaged framing no longer occurs — delete the entry from scripts/section-framing-triage.json',
      });
    }
  }
  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const findings = collectFramingFindings();
  if (findings.length === 0) {
    process.stdout.write('section-framing: OK — no resource strands prose above its first section from an anchored citer\n');
    process.exit(0);
  }
  process.stdout.write(`section-framing: ${findings.length} finding(s) — move the obligation into a section, or classify the site:\n`);
  for (const f of findings) process.stdout.write(`  [${f.check}] ${f.site}\n     ${f.detail}\n`);
  process.exit(1);
}
