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
 * they look for is itself backticked — the bare-rule check depends on the backticks. Two consequences
 * worth knowing. A link may be shown inside a fence as illustration, but a rule address shown there
 * still reports, because the address is recognised by corpus lookup rather than by position. And
 * indentation is read absolutely, where CommonMark reads it relative to the containing block, so a link
 * indented four spaces reports even where CommonMark renders it as code. Telling an indented code block
 * from a list item's continuation wants a block-level parser, and over-reporting is the affordable
 * direction: fence the illustration, at any indent, and it goes quiet.
 *
 * That lookup is on the PAIR rather than the left half: forty-five rule owners carry a single-word name,
 * so a left-half test reads `plan.json` and `context.yaml` as addresses. Requiring the corpus to
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
import { fencedLines, linkDestinations, stripDestinations, toLines } from './markdown-refs.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

/** The one resource `discover` delivers before a session exists. */
const PRE_SESSION_RESOURCE = join('meta', 'resources', 'bootstrap-protocol.md');
/** Prose the procedure cannot be shorter than and still be one. It runs to 56 lines today. */
export const MIN_PROSE_LINES = 20;

/** A run of dot-joined lowercase segments — `a.b`, `a.b.c`. Each adjacent pair is tested separately. */
const DOTTED_RE = /\b([a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+)\b/g;
/** An inline code span, which is the only form the bare-rule check considers. */
const CODE_SPAN_RE = /`([^`]+)`/g;
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


/** A destination the reader already holds: their client resolves it, or it names this same document. */
function resolvableHere(target: string): boolean {
  return SCHEME_RE.test(target) || AUTHORITYLESS_SCHEME_RE.test(target) || target.startsWith('#');
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  const file = join(root, PRE_SESSION_RESOURCE);
  // A CR left on the end of every line would stop each one looking like a fence, taking the fence
  // matcher out of service on a CRLF checkout — so line endings are normalised before anything reads a
  // line's shape.
  const lines = existsSync(file) ? toLines(readFileSync(file, 'utf-8')) : [];
  const prose = lines.filter((line) => line.trim() !== '').length;
  // A floor rather than mere presence. An emptied file and a clean one look identical to a hard-zero
  // guard, and so does a file gutted to its heading — which is the shape a bad merge leaves. The
  // procedure runs to 56 lines of prose; the floor sits well under that and far above a stub.
  assertScanned(
    prose >= MIN_PROSE_LINES ? prose : 0,
    `lines of pre-session prose (${PRE_SESSION_RESOURCE}, at least ${MIN_PROSE_LINES} expected)`,
    root,
  );

  const declared = declaredRules(root);
  const { fenced, unclosed } = fencedLines(lines);
  if (unclosed !== null) {
    findings.push({
      check: 'unbalanced-fence',
      site: `${PRE_SESSION_RESOURCE}:${unclosed}`,
      detail: 'this code fence never closes, so nothing below it can be told from illustration — close '
        + 'it, because fence state is what separates a shown link from an instruction here',
    });
  }

  lines.forEach((line, index) => {
    const site = `${PRE_SESSION_RESOURCE}:${index + 1}`;

    // Links are read from rendered prose only: a fenced block or a code span quoting a link form is
    // illustration, not an instruction.
    if (!fenced.has(index)) {
      for (const to of linkDestinations(line)) {
        if (resolvableHere(to)) continue;
        findings.push({
          check: 'corpus-link',
          site,
          detail: `links to '${to}' before a session exists, so nothing can follow it — `
            + 'inline the instruction and keep the name only as a label for later',
        });
      }
    }

    // Link destinations are paths; a dotted segment inside one is not a rule address.
    const prose = stripDestinations(line);
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

    // The shortened spelling: a backticked hyphenated rule name, alone in the span.
    //
    // Two restrictions keep this off ordinary writing. The span, because unrestricted it would read
    // prose — 'every worker you spawn' — as an address. And the hyphen, because four declared rules are
    // named with a single word (`spawn`, `resume`, `concurrent`, `posting`) and three of those are also
    // topology and operation-kind values this very text trades in, backticked, in their ordinary sense:
    // it already writes `persistent` and `fresh` that way, so a sibling value named `concurrent` would
    // report. Those four stay addressable in the dotted form, which is unambiguous.
    for (const [, span] of line.matchAll(CODE_SPAN_RE)) {
      if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(span!) || !declared.names.has(span!)) continue;
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
