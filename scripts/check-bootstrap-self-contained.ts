/**
 * check-bootstrap-self-contained — the pre-session bootstrap text sends nobody anywhere (#407).
 *
 * `discover` reads `meta/resources/bootstrap-protocol.md` raw and returns it verbatim, before the
 * caller has a session. That is the whole difficulty: with no `session_index` there is no
 * `get_resource` and no `get_activity`, so the agent reading this text cannot open a corpus file, and
 * a link or a rule address is an instruction it has no way to follow. Everywhere else in the corpus,
 * citing the home rather than restating it is the right economy; on this one surface it strands the
 * reader.
 *
 * So three constructs are refused here and nowhere else:
 *
 *   corpus-link      a markdown link into the corpus. Nothing can follow it yet.
 *   dotted-rule      `<technique>.<rule>` or `<workflow>.<technique>.<rule>`, where the corpus declares
 *                    that rule on that technique. A rule address needs the file that defines it.
 *   bare-rule        a backticked bare rule name. `dotted-rule-address` sanctions the shortened form
 *                    for a rule inherited from self, group, or workflow root, and a bare name strands
 *                    the reader exactly as a dotted one does — so the guard has to know both spellings,
 *                    or the regression it exists to catch escapes under a spelling the house style
 *                    blesses.
 *
 * What stays legitimate, and why the checks are shaped to allow it: a URI the reader's own client
 * resolves (`workflow-server://schemas/workflow`, `mailto:`), a same-document anchor, and a
 * `group::operation` name carried as a LABEL for the home a rule keeps once the operations bundle
 * arrives — a name the text says is for later and nothing depends on following now. None is a link or
 * a rule address, so no check sees it.
 *
 * The rule checks cannot strip inline code spans the way the anchor guard does, because the construct
 * they look for is itself backticked — the bare-rule check depends on the backticks. One consequence
 * worth knowing: a link may be shown inside a fence as illustration, but a rule address shown there
 * still reports, because the address is recognised by corpus lookup rather than by position.
 *
 * That lookup is on the PAIR rather than the left half: around thirty techniques carry a single-word
 * name, so a left-half test reads `plan.json` and `context.yaml` as addresses. Requiring the corpus to
 * declare that rule on that technique keeps ordinary filenames out while
 * `resolve-host-repo.prose-sources-are-fallback-only` lands in the findings.
 *
 * Hard zero, no baseline — the file is clean today and this guard is here to keep it that way. The
 * resource id is hard-coded because it is hard-coded in the server too: see the `discover` handler in
 * `src/tools/workflow-tools.ts`, which is the only caller that delivers a resource before a session.
 *
 * Run: npx tsx scripts/check-bootstrap-self-contained.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

/** The one resource `discover` delivers before a session exists. */
const PRE_SESSION_RESOURCE = join('meta', 'resources', 'bootstrap-protocol.md');

/**
 * An inline link's destination, with the optional title CommonMark allows after it. Without the title
 * arm, `[x](../a/b.md "its home")` is ordinary markdown that reads as no link at all.
 */
const LINK_RE = /\]\(\s*(<[^>]*>|[^)\s]*)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
/** A reference definition. The destination lives here rather than at the `[text][ref]` that uses it. */
const REF_DEF_RE = /^ {0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)/;
/** A run of dot-joined lowercase segments — `a.b`, `a.b.c`. Each adjacent pair is tested separately. */
const DOTTED_RE = /\b([a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+)\b/g;
/** An inline code span, which is the only form the bare-rule check considers. */
const CODE_SPAN_RE = /`([^`]+)`/g;
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
/** A scheme the reader's own client resolves, per RFC 3986: letter, then letters, digits, `+`, `-`, `.`. */
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i;
/** Schemes that carry no authority, so they never show `//` and are still the client's to resolve. */
const AUTHORITYLESS_SCHEME_RE = /^(?:mailto|tel|sms|data):/i;

interface Declared {
  /** `<technique>.<rule>` for every rule the corpus declares. */
  pairs: Set<string>;
  /** Every declared rule name, for the shortened form that carries no technique. */
  names: Set<string>;
}

/**
 * Every rule the corpus declares, by qualified pair and by bare name.
 *
 * A dotted pair is a rule address only when the corpus declares that rule on that technique — the
 * discriminator has to be the pair, not the left half alone. Around thirty techniques are named with a
 * single common word (`plan`, `test`, `context`, `query`, `record`), so a left-half test reads
 * `plan.json`, `context.yaml` and `test.each` as addresses.
 *
 * Rule names are the `### ` headings under a technique's `## Rules`, which is how the corpus addresses
 * them everywhere else. A `TECHNIQUE.md` declares the rules of the thing it sits in — the group for one
 * nested a level down, the workflow for one directly under `techniques/` — and is keyed on that name,
 * since keying it on the literal string `TECHNIQUE` produces a left half no reference ever writes.
 */
function declaredRules(root: string): Declared {
  const pairs = new Set<string>();
  const names = new Set<string>();
  const addFile = (file: string, owner: string): void => {
    let inRules = false;
    for (const line of readFileSync(file, 'utf-8').split('\n')) {
      if (/^##\s/.test(line)) { inRules = /^##\s+Rules\s*$/.test(line); continue; }
      const heading = inRules ? /^###\s+([a-z][a-z0-9-]*)\s*$/.exec(line) : null;
      if (heading) { pairs.add(`${owner}.${heading[1]}`); names.add(heading[1]!); }
    }
  };
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const entry of readdirSync(techniquesDir, { withFileTypes: true })) {
      const entryPath = join(techniquesDir, entry.name);
      if (entry.isDirectory()) {
        for (const op of readdirSync(entryPath)) {
          if (!op.endsWith('.md')) continue;
          addFile(join(entryPath, op), op === 'TECHNIQUE.md' ? entry.name : op.slice(0, -3));
        }
      } else if (entry.name === 'TECHNIQUE.md') {
        // Directly under `techniques/`, so these are the workflow's own rules.
        addFile(entryPath, workflow);
      } else if (entry.name.endsWith('.md')) {
        addFile(entryPath, entry.name.slice(0, -3));
      }
    }
  }
  return { pairs, names };
}

/**
 * Which lines sit inside a closed fence, and whether one is left open.
 *
 * A close has to match its opener's character, run at least as long, and carry no info string — the
 * rules CommonMark states. Tracking fences as a parity count instead reads a 3-backtick example nested
 * in a 4-backtick wrapper as two blocks and inverts the phase, so illustration reports as instruction.
 *
 * An unclosed fence returns no fenced lines at all, so every line is read. That is the fail-safe
 * direction: an unclosed fence must not be able to take the link check out of service behind a green
 * verdict, which is the one failure this guard must not have.
 */
function fencedLines(lines: string[]): { fenced: Set<number>; unclosed: boolean } {
  const fenced = new Set<number>();
  let open: { char: string; len: number; start: number } | null = null;
  lines.forEach((line, index) => {
    const match = FENCE_RE.exec(line);
    if (open) {
      if (match && match[1]![0] === open.char && match[1]!.length >= open.len && match[2]!.trim() === '') {
        for (let line = open.start; line <= index; line++) fenced.add(line);
        open = null;
      }
      return;
    }
    if (match) open = { char: match[1]![0]!, len: match[1]!.length, start: index };
  });
  if (open) return { fenced: new Set<number>(), unclosed: true };
  return { fenced, unclosed: false };
}

/** A destination the reader already holds: their client resolves it, or it names this same document. */
function resolvableHere(target: string): boolean {
  return SCHEME_RE.test(target) || AUTHORITYLESS_SCHEME_RE.test(target) || target.startsWith('#');
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  const file = join(root, PRE_SESSION_RESOURCE);
  // An absent or emptied file must not read as clean: nothing scanned and nothing wrong look identical.
  const lines = existsSync(file) ? readFileSync(file, 'utf-8').split('\n') : [];
  assertScanned(
    lines.filter((line) => line.trim() !== '').length,
    `lines of pre-session prose (${PRE_SESSION_RESOURCE})`,
    root,
  );

  const declared = declaredRules(root);
  const { fenced, unclosed } = fencedLines(lines);
  if (unclosed) {
    findings.push({
      check: 'unbalanced-fence',
      site: PRE_SESSION_RESOURCE,
      detail: 'a code fence never closes, so nothing below it can be told from illustration — close it, '
        + 'because fence state is what separates a shown link from an instruction here',
    });
  }

  lines.forEach((line, index) => {
    const site = `${PRE_SESSION_RESOURCE}:${index + 1}`;

    // Links are read from rendered prose only: a fenced block or a code span quoting a link form is
    // illustration, not an instruction.
    if (!fenced.has(index)) {
      const refDef = REF_DEF_RE.exec(line);
      const targets = [...line.replace(/`[^`]*`/g, '').matchAll(LINK_RE)].map((m) => m[1]!);
      if (refDef) targets.push(refDef[1]!);
      for (const target of targets) {
        const to = target.replace(/^<|>$/g, '');
        // An empty destination points nowhere, so it strands nobody.
        if (to === '' || resolvableHere(to)) continue;
        findings.push({
          check: 'corpus-link',
          site,
          detail: `links to '${to}' before a session exists, so nothing can follow it — `
            + 'inline the instruction and keep the name only as a label for later',
        });
      }
    }

    // Link destinations are paths; a dotted segment inside one is not a rule address.
    const prose = line.replace(LINK_RE, ']()').replace(REF_DEF_RE, '[]:');
    for (const [, run] of prose.matchAll(DOTTED_RE)) {
      // Every adjacent pair, not the leftmost match: a full ancestry address puts the technique and the
      // rule in the last two segments, and a single scan consumes `<workflow>.<technique>` and moves
      // past the pair that matters.
      const parts = run.split('.');
      const pair = parts.slice(0, -1).map((left, i) => `${left}.${parts[i + 1]}`).find((p) => declared.pairs.has(p));
      if (!pair) continue;
      findings.push({
        check: 'dotted-rule',
        site,
        detail: `cites rule address '${run}' — the corpus declares '${pair}', and it cannot be read `
          + 'without a session — state the rule\'s substance instead',
      });
    }

    // The shortened spelling: a backticked bare rule name and nothing else in the span. Restricting to
    // code spans is what makes this safe — a rule name is a hyphenated phrase, and unrestricted it would
    // read ordinary prose ('every worker you spawn') as an address.
    for (const [, span] of line.matchAll(CODE_SPAN_RE)) {
      if (!/^[a-z][a-z0-9-]*$/.test(span!) || !declared.names.has(span!)) continue;
      findings.push({
        check: 'bare-rule',
        site,
        detail: `cites rule '${span}' by bare name — the shortened form the corpus allows elsewhere, and `
          + 'unreadable here for the same reason the dotted one is — state the rule\'s substance instead',
      });
    }
  });

  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('bootstrap-self-contained', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'the pre-session bootstrap text sends the reader nowhere it cannot go',
    remedy: "inline the instruction's substance and keep the reference only as a label for after the bundle arrives",
  });
}
