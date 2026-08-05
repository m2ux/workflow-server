/**
 * check-harness-adapter-set — the harness adapters are one set, described the same way three times.
 *
 * `resolve-harness-operation` turns a harness kind into a technique file and an operation kind into a
 * Rules section name inside it, and `spawn-agent`, `continue-agent` and `spawn-concurrent` then apply
 * whatever that resolves to. So an adapter is reached through the VALUE of a variable, never through a
 * `technique:` binding — which is what every other guard reads. Nothing else checks the set.
 *
 * The obligation is real and stated only in prose: each adapter exposes the same operation kinds. And the
 * set is enumerated twice, in places that must agree — the resolution map, which calls itself
 * authoritative, and `CORE_ORCHESTRATOR_TECHNIQUES`, whose own comment explains why a technique named
 * inside another technique's Protocol has no other delivery path. A fifth adapter has to be added in both.
 *
 * ## Reading prose safely
 *
 * Both enumerations live in numbered Protocol steps, so both are read from INSIDE the step that owns
 * them. A first review of this guard matched the operation-kind vocabulary with a whole-file scan, and
 * the first match landed in the `## Outputs` section — which describes the same names in passing. The
 * guard was therefore reading a sentence nobody edits to change behaviour, and a rewrite of the step
 * that actually decides the vocabulary passed clean. Scoping to the step is what makes the parse mean
 * what it claims.
 *
 * A name that does not parse must never narrow the set silently: an operation kind the pattern rejects
 * would drop out of the vocabulary AND out of every adapter's declared set, so a genuinely missing slice
 * would go unnoticed. Anything name-shaped that fails to parse is reported rather than skipped.
 *
 * Fences are honoured when reading an adapter's Rules, because a technique file may show a rule heading
 * as an example, and an example is not a declaration.
 *
 * Hard zero, no baseline — the set is consistent today.
 *
 * Run: npx tsx scripts/check-harness-adapter-set.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { fencedLines, toLines } from './markdown-refs.js';
import { CORE_ORCHESTRATOR_TECHNIQUES } from '../src/loaders/core-ops.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

const GROUP = join('meta', 'techniques', 'harness-compat');
const MAP_FILE = join(GROUP, 'resolve-harness-operation.md');

/** A numbered Protocol step heading, which is what scopes each enumeration. */
const STEP_RE = /^###\s+(\d+)\./;
/** A map row: a harness kind, then a link to the technique that serves it. */
const MAP_ROW_RE = /^\s+- `([^`]+)` → \[[^\]]+\]\(\.\/([^)]+)\)\s*$/;
/** Anything backticked in the vocabulary sentence, parseable or not. */
const VOCAB_TOKEN_RE = /`([^`]+)`/g;
/** A Rules section heading in an adapter, parseable or not. */
const RULE_HEADING_RE = /^###\s+(\S.*?)\s*$/;
/** What an operation kind and a harness kind may be spelled as. */
const NAME_RE = /^[a-z][a-z0-9-]*$/;

/** The generic operations of the group — callers, not adapters, so not expected in the map. */
const GENERIC_OPS = new Set([
  'resolve-harness-operation', 'spawn-agent', 'continue-agent', 'spawn-concurrent',
]);

/** The lines of one numbered Protocol step, so a sentence elsewhere cannot stand in for it. */
function stepLines(lines: readonly string[], step: number): string[] {
  const out: string[] = [];
  let inStep = false;
  for (const line of lines) {
    const heading = STEP_RE.exec(line);
    if (heading) { inStep = Number(heading[1]) === step; continue; }
    if (inStep) out.push(line);
  }
  return out;
}

interface Parsed {
  /** Harness kind → adapter filename, in map order, with duplicates preserved. */
  rows: Array<{ kind: string; file: string }>;
  /** The operation kinds a caller may ask for. */
  slices: string[];
  /** Names in either enumeration that do not parse, and so cannot be matched. */
  unparseable: string[];
}

function parseMap(root: string): Parsed {
  const lines = toLines(readFileSync(join(root, MAP_FILE), 'utf-8'));
  const rows: Array<{ kind: string; file: string }> = [];
  const unparseable: string[] = [];

  for (const line of stepLines(lines, 1)) {
    const row = MAP_ROW_RE.exec(line);
    if (!row) continue;
    if (!NAME_RE.test(row[1]!)) { unparseable.push(`harness kind '${row[1]}'`); continue; }
    rows.push({ kind: row[1]!, file: row[2]! });
  }

  // The vocabulary sentence, from the step that sets it — not from a passing mention elsewhere.
  const vocabulary = stepLines(lines, 2).join('\n');
  const slices: string[] = [];
  const opening = vocabulary.indexOf('{operation_kind}');
  if (opening >= 0) {
    const paren = vocabulary.indexOf('(', opening);
    const close = paren >= 0 ? vocabulary.indexOf(')', paren) : -1;
    if (close > paren) {
      for (const [, token] of vocabulary.slice(paren, close).matchAll(VOCAB_TOKEN_RE)) {
        if (NAME_RE.test(token!)) slices.push(token!);
        else unparseable.push(`operation kind '${token}'`);
      }
    }
  }
  return { rows, slices, unparseable };
}

/** The Rules an adapter declares, and any heading there that does not parse as a name. */
function declaredRules(path: string): { declared: string[]; unparseable: string[] } {
  const lines = toLines(readFileSync(path, 'utf-8'));
  // A rule heading shown inside a fence is an example, not a declaration.
  const { fenced } = fencedLines(lines, { onUnclosed: 'suppress-to-end' });
  const declared: string[] = [];
  const unparseable: string[] = [];
  let inRules = false;
  lines.forEach((line, index) => {
    if (fenced.has(index)) return;
    if (/^##\s/.test(line)) { inRules = /^##\s+Rules\s*$/.test(line); return; }
    if (!inRules) return;
    const heading = RULE_HEADING_RE.exec(line);
    if (!heading) return;
    if (NAME_RE.test(heading[1]!)) declared.push(heading[1]!);
    else unparseable.push(heading[1]!);
  });
  return { declared, unparseable };
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  const mapPath = join(root, MAP_FILE);

  // An absent map is nothing measured, not a clean set. Reading it unguarded would exit 1 with a stack
  // trace, and the sweep reads exit 1 as findings.
  assertScanned(existsSync(mapPath) ? 1 : 0, `the harness map (${MAP_FILE})`, root);

  const { rows, slices, unparseable } = parseMap(root);
  assertScanned(rows.length, `harness rows in ${MAP_FILE}`, root);
  assertScanned(slices.length, `operation kinds in ${MAP_FILE}`, root);

  for (const name of unparseable) {
    findings.push({
      check: 'name-unparseable',
      site: MAP_FILE,
      detail: `${name} is not a name this guard can match, so it would drop silently out of both the `
        + 'vocabulary and every adapter — spell it lowercase with hyphens',
    });
  }

  const coreAdapters = new Set(
    CORE_ORCHESTRATOR_TECHNIQUES
      .filter((ref) => ref.startsWith('harness-compat::'))
      .map((ref) => ref.slice('harness-compat::'.length))
      .filter((op) => !GENERIC_OPS.has(op)),
  );

  const seenFiles = new Map<string, string>();
  for (const { kind, file } of rows) {
    const slug = file.replace(/\.md$/, '');
    const site = `${MAP_FILE} → ${file}`;

    // Two kinds onto one file: the second would otherwise be reported as undelivered, naming a file that
    // is registered perfectly well.
    const already = seenFiles.get(file);
    if (already !== undefined) {
      findings.push({
        check: 'adapter-aliased',
        site,
        detail: `both '${already}' and '${kind}' resolve to this file — one adapter cannot answer for two `
          + 'kinds without saying how they differ; give the second its own file or drop the row',
      });
      continue;
    }
    seenFiles.set(file, kind);
    const registered = coreAdapters.delete(slug);

    if (!existsSync(join(root, GROUP, file))) {
      findings.push({
        check: 'adapter-missing',
        site,
        detail: `the map sends '${kind}' to a file that does not exist — a caller resolving that kind has `
          + 'nothing to apply',
      });
      continue;
    }

    const { declared, unparseable: badHeadings } = declaredRules(join(root, GROUP, file));
    for (const heading of badHeadings) {
      findings.push({
        check: 'name-unparseable',
        site,
        detail: `declares a rule '${heading}' this guard cannot match against an operation kind — spell `
          + 'it lowercase with hyphens, or the slice it answers for goes unchecked',
      });
    }

    // Exactly the callable kinds: one absent resolves to nothing, one extra is unreachable, and one
    // declared twice leaves three callers dereferencing an ambiguous name.
    for (const slice of slices) {
      const count = declared.filter((rule) => rule === slice).length;
      if (count === 0) {
        findings.push({
          check: 'slice-missing',
          site,
          detail: `declares no '${slice}' rule, so resolving that operation kind for '${kind}' names a `
            + 'section the file does not have',
        });
      } else if (count > 1) {
        findings.push({
          check: 'slice-ambiguous',
          site,
          detail: `declares '${slice}' ${count} times — the callers dereference that name, and two `
            + 'sections answering to it leave which one applies undecided',
        });
      }
    }
    for (const rule of [...new Set(declared)].sort()) {
      if (!slices.includes(rule)) {
        findings.push({
          check: 'slice-unreachable',
          site,
          detail: `declares '${rule}', which no operation kind resolves to — add it to the vocabulary in `
            + 'the map, or fold it into a slice a caller can ask for',
        });
      }
    }

    if (!registered) {
      findings.push({
        check: 'adapter-undelivered',
        site,
        detail: `'harness-compat::${slug}' is absent from CORE_ORCHESTRATOR_TECHNIQUES, so an orchestrator `
          + 'reaches the dispatch step with nothing to apply for this kind',
      });
    }
  }

  for (const orphan of [...coreAdapters].sort()) {
    findings.push({
      check: 'adapter-unmapped',
      site: `src/loaders/core-ops.ts → harness-compat::${orphan}`,
      detail: 'is delivered as a core operation but no map row resolves to it — add the row or drop the '
        + 'entry, because the map is where a kind becomes a technique',
    });
  }

  for (const file of readdirSync(join(root, GROUP)).sort()) {
    if (!file.endsWith('.md') || file === 'TECHNIQUE.md') continue;
    if (seenFiles.has(file) || GENERIC_OPS.has(file.replace(/\.md$/, ''))) continue;
    findings.push({
      check: 'adapter-unmapped',
      site: join(GROUP, file),
      detail: 'is neither a generic operation nor a mapped adapter, so nothing can resolve to it',
    });
  }

  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('harness-adapter-set', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every harness kind resolves to an adapter declaring exactly the operation kinds the map offers',
    remedy: 'add the adapter to the map, give it every operation kind once, and register it as a core operation',
  });
}
