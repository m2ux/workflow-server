/**
 * check-rule-citation-form — a technique names a rule; it does not link to where the rule is written.
 *
 * A rule citation and a resource citation look alike and mean opposite things. A resource link is a
 * delivery instruction: the reader does not hold the body and the link is how it arrives. A rule is
 * already in the reader's hands — the loader merges a container's rules into every technique beneath
 * it, and a technique's own rules travel with it — so the citation only has to name which rule, and
 * `dotted-rule-address` gives it the naming form: the dotted symbol, shortened to a bare slug where
 * the ancestry already carries it.
 *
 * Written as a hyperlink instead, the citation resolves. That is the whole difficulty. `resource-anchors`
 * confirms the anchor exists and passes it, a reader following it lands in a file whose rules they were
 * already handed, and a catalogue walk hunting the prose spellings — "per the X rule" — steps past a
 * form that looks like every other link on the page. Nothing was measuring it, and 123 of them
 * accumulated across six groups.
 *
 * What makes a link a rule citation, mechanically: its anchor names a `### slug` under the target
 * file's `## Rules`. Anchors into a resource, a README heading, or a technique's Protocol phase are
 * not rules and are not this guard's business.
 *
 * Who is held to it: technique files. A resource and a README run no Protocol and inherit nothing, so
 * a link is the only thing that reaches a rule from there, and baring it would leave a slug pointing
 * at nothing. That carve-out is the citer's kind, not the rule's location — a technique reaching for
 * a rule outside its own ancestry still names it, at full dotted length.
 *
 * The finding says which shortened form applies, because the answer follows from where the rule is
 * declared relative to the citer and the author should not have to re-derive it:
 *
 *   own-rule        the rule is declared in the citing file — the bare slug.
 *   inherited-rule  the rule is on a container the citing file sits beneath, so the loader merges it
 *                   in before the reader sees the file — the bare slug.
 *   foreign-rule    the rule belongs to a technique the citer does not inherit — the dotted address.
 *
 * The second family is the other half of the same entry, and takes the rule roster the link graph
 * could not supply. A bare slug is correct exactly where the rule arrives with the reader, and a
 * delivery carries more than the folder tree shows: a role's bundle brings the contracts of every
 * scope it names, so a sibling operation's rules reach a technique that sits nowhere near it.
 * Nothing static says which roles serve a technique, so the library is the bound this proves —
 * within one, a rule may arrive by a route no walk sees; from another, it never does.
 *
 *   rule-outside-ancestry  a bare slug declared in another library, naming nothing the reader holds.
 *
 * What this does NOT prove: that a bare slug resolves to a declared rule at all, which stays the
 * dangling half. Nor does it read prose citations, the spelling the catalogue entry already
 * describes and a reader can see.
 *
 * Hard zero, no baseline.
 *
 * Run: npx tsx guards/check-rule-citation-form.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname, basename, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { fencedLines, toLines } from './markdown-refs.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** `[text](dest#anchor)` — the destination may be empty, which points into the citing file itself. */
const RULE_LINK = /\[([^\]]+)\]\(([^)\s#]*)#([a-z0-9][a-z0-9-]*)\)/g;
/** A rule heading: a `###` slug under `## Rules`, in the kebab grammar rule names are declared in. */
const RULES_SECTION = /^## Rules[ \t]*$([\s\S]*?)(?=^## |$(?![\s\S]))/m;
const RULE_HEADING = /^### ([a-z0-9][a-z0-9-]*)[ \t]*$/gm;

export type CiterKind = 'technique' | 'resource' | 'readme' | 'other';

/** Which surface is doing the citing. Only a technique is held to the naming form. */
export function citerKind(relPath: string): CiterKind {
  const parts = relPath.split(/[\\/]/);
  if (parts[parts.length - 1] === 'README.md') return 'readme';
  if (parts.includes('resources')) return 'resource';
  if (parts.includes('techniques')) return 'technique';
  return 'other';
}

/** The rule slugs a file declares under its own `## Rules`. */
export function declaredRules(text: string): Set<string> {
  const section = RULES_SECTION.exec(text);
  if (!section) return new Set();
  const slugs = new Set<string>();
  for (const m of (section[1] ?? '').matchAll(RULE_HEADING)) {
    if (m[1]) slugs.add(m[1]);
  }
  return slugs;
}

/**
 * Whether `citer` sits beneath the container that declares the rule, which is what makes the rule
 * inherited rather than foreign. Only a `TECHNIQUE.md` is a container; a sibling technique's rules
 * are merged into nobody.
 */
export function inherits(citerAbs: string, targetAbs: string): boolean {
  if (basename(targetAbs) !== 'TECHNIQUE.md') return false;
  const container = dirname(targetAbs);
  return citerAbs.startsWith(container + sep);
}

export interface RuleCitation {
  line: number;
  text: string;
  anchor: string;
  /** Absolute path of the file declaring the rule. */
  targetAbs: string;
}

/** Every rule-anchor link in one file, fences passed over — a fenced block shows markup, not a citation. */
export function ruleCitations(
  text: string,
  citerAbs: string,
  rulesOf: (abs: string) => Set<string>,
): RuleCitation[] {
  const lines = toLines(text);
  // `read-all` is the direction for a caller hunting what the text points at: an unclosed fence
  // must not take the check out of service behind a green verdict.
  const { fenced } = fencedLines(lines);
  const out: RuleCitation[] = [];
  for (const [i, line] of lines.entries()) {
    if (fenced.has(i)) continue;
    for (const m of line.matchAll(RULE_LINK)) {
      const [, linkText, dest, anchor] = m;
      if (linkText === undefined || dest === undefined || anchor === undefined) continue;
      const targetAbs = dest === '' ? citerAbs : resolve(dirname(citerAbs), dest);
      if (!rulesOf(targetAbs).has(anchor)) continue;
      out.push({ line: i + 1, text: linkText, anchor, targetAbs });
    }
  }
  return out;
}

/** A backticked token that is nothing but a kebab slug — the spelling a bare rule citation takes. */
const BARE_SLUG = /`([a-z0-9]+(?:-[a-z0-9]+)+)`/g;

/**
 * The library or workflow a file belongs to — the segment under the corpus root, and the namespace
 * beneath it where that segment is `support`.
 *
 * Reachability is wider than the folder tree: a role's bundle carries the contracts of every scope
 * it names, so a technique holds a sibling operation's rules without sitting beneath it. Nothing
 * static says which roles serve a technique, so the area is the bound this guard can prove — within
 * one area a rule may arrive by a route this check cannot see, and across areas it never does.
 */
export function areaOf(relPath: string): string {
  const parts = relPath.split(/[\\/]/);
  // Discovery is rooted at the branch, so a path may or may not carry the `corpus/` grouping.
  if (parts[0] === 'corpus') parts.shift();
  const head = parts[0] ?? '';
  return head === 'support' ? `support/${parts[1] ?? ''}` : head;
}

/**
 * The rules the loader merges into a technique: its own, and every container it sits beneath. This
 * is the set a bare slug can name, because the reader holds this and nothing else.
 */
export function reachableRules(citerAbs: string, root: string, rulesOf: (abs: string) => Set<string>): Set<string> {
  const reachable = new Set(rulesOf(citerAbs));
  let dir = dirname(citerAbs);
  const stop = resolve(root);
  for (;;) {
    for (const slug of rulesOf(join(dir, 'TECHNIQUE.md'))) reachable.add(slug);
    if (dir === stop || dirname(dir) === dir) break;
    dir = dirname(dir);
  }
  return reachable;
}

/** Every bare slug a file mentions, fences passed over, skipping its own `### slug` rule headings. */
export function bareRuleMentions(text: string): { line: number; slug: string }[] {
  const lines = toLines(text);
  const { fenced } = fencedLines(lines);
  const out: { line: number; slug: string }[] = [];
  for (const [i, line] of lines.entries()) {
    if (fenced.has(i) || /^### /.test(line)) continue;
    for (const m of line.matchAll(BARE_SLUG)) {
      const slug = m[1];
      // A dot before the backtick is a dotted address whose tail this is, not a bare citation.
      if (slug !== undefined && line[(m.index ?? 0) - 1] !== '.') out.push({ line: i + 1, slug });
    }
  }
  return out;
}

export function checkCitation(citation: RuleCitation, citerAbs: string, site: string): Finding | null {
  const { anchor, targetAbs } = citation;
  if (targetAbs === citerAbs) {
    return {
      check: 'own-rule',
      site,
      detail: `${anchor} is declared in this file — cite it as the bare name \`${anchor}\`, not a link to its heading`,
    };
  }
  // A rule the citer inherits is merged into the file before the reader sees it, so the link
  // navigates to text they were already handed. The ancestry supplies the owner, leaving the name.
  if (inherits(citerAbs, targetAbs)) {
    return {
      check: 'inherited-rule',
      site,
      detail: `${anchor} is merged into this file from its container — cite it as the bare name \`${anchor}\`, not a link to its heading`,
    };
  }
  // A container is named by its folder — every group's contract file is spelled `TECHNIQUE.md`.
  const owner =
    basename(targetAbs) === 'TECHNIQUE.md' ? basename(dirname(targetAbs)) : basename(targetAbs, '.md');
  return {
    check: 'foreign-rule',
    site,
    detail: `${anchor} belongs to ${owner}, which this file does not inherit — cite it by dotted address, shortened per ancestry`,
  };
}

export function collectFindings(root: string): Finding[] {
  const cache = new Map<string, Set<string>>();
  const rulesOf = (abs: string): Set<string> => {
    let hit = cache.get(abs);
    if (!hit) {
      hit = existsSync(abs) ? declaredRules(readFileSync(abs, 'utf-8')) : new Set<string>();
      cache.set(abs, hit);
    }
    return hit;
  };

  // Which files declare each slug, so a bare mention can be told from a rule nobody declares.
  const declaringFiles = new Map<string, string[]>();
  for (const path of markdownUnder(root)) {
    for (const slug of rulesOf(path)) {
      const homes = declaringFiles.get(slug) ?? [];
      homes.push(path);
      declaringFiles.set(slug, homes);
    }
  }

  const findings: Finding[] = [];
  let scanned = 0;
  for (const path of markdownUnder(root)) {
    scanned++;
    const rel = relative(root, path);
    if (citerKind(rel) !== 'technique') continue;
    const text = readFileSync(path, 'utf-8');
    for (const citation of ruleCitations(text, path, rulesOf)) {
      const finding = checkCitation(citation, path, `${rel}:${citation.line}`);
      if (finding) findings.push(finding);
    }
    // A bare slug names what the reader's own delivery carries. Shortened past that, the citation
    // resolves in a checkout and names nothing that arrived.
    const reachable = reachableRules(path, root, rulesOf);
    for (const { line, slug } of bareRuleMentions(text)) {
      if (reachable.has(slug)) continue;
      const homes = declaringFiles.get(slug);
      if (!homes || homes.length === 0) continue;
      const home = homes[0]!;
      const homeRel = relative(root, home);
      if (areaOf(homeRel) === areaOf(rel)) continue;
      // A namespace's root index is named by the namespace, not by the `techniques` folder every
      // library spells alike.
      const area = areaOf(homeRel);
      const owner =
        basename(home) === 'TECHNIQUE.md'
          ? (area.split('/').pop() ?? basename(dirname(home)))
          : basename(home, '.md');
      findings.push({
        check: 'rule-outside-ancestry',
        site: `${rel}:${line}`,
        detail: `${slug} is declared by ${owner}, which this file neither sits beneath nor shares a library with — the bare name reaches nothing this reader was delivered; cite it as \`${owner}.${slug}\``,
      });
    }
  }
  assertScanned(scanned, 'markdown files', root);
  return findings;
}

function* markdownUnder(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir).sort()) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* markdownUnder(path);
    else if (entry.endsWith('.md')) yield path;
  }
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('rule-citation-form', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every technique names the rules it cites, rather than linking to where they are written',
    remedy: 'replace the link with the rule name, at the length its ancestry allows',
  });
}
