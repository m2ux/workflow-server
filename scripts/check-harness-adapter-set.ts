/**
 * check-harness-adapter-set — the harness adapters are one set, described the same way three times.
 *
 * `resolve-harness-operation` turns a harness kind into a technique file and an operation kind into a
 * Rules section name inside it, and `spawn-agent`, `continue-agent` and `spawn-concurrent` then apply
 * whatever that resolves to. So an adapter is reached through the VALUE of a variable, never through a
 * `technique:` binding — which is exactly what every other guard reads. Nothing checks the set.
 *
 * The obligation is real and stated only in prose: each adapter exposes the same three Rules sections.
 * And the set is enumerated twice, in places that must agree — the resolution map, which calls itself
 * authoritative, and `CORE_ORCHESTRATOR_TECHNIQUES`, whose own comment explains why a technique named
 * inside another technique's Protocol has no other delivery path. A fifth adapter has to be added in
 * both. Measured before this guard existed: a fifth adapter declaring one of the three slices, a sixth
 * renaming a slice, a map row naming a file that does not exist, and deleting a slice from an existing
 * adapter all passed the whole suite.
 *
 * The corpus already guards its largest set of this shape — the prism lenses reached through
 * `{lens_name}` — on reachability, and deliberately not on shape, because a lens declares its own output
 * shape as its contract. The adapters are the same construct with the opposite property: their shape IS
 * the contract, because three callers dereference a slice name. This guard is that asymmetry closed.
 *
 * Hard zero, no baseline — the set is consistent today, so every failure here is a real divergence.
 *
 * A note on the map's form: it is prose, so a reformat breaks the parse. That must surface as unmeasured
 * rather than as a pass, which `assertScanned` does — loosening the pattern instead would trade a
 * readable failure for a silent one.
 *
 * Run: npx tsx scripts/check-harness-adapter-set.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { CORE_ORCHESTRATOR_TECHNIQUES } from '../src/loaders/core-ops.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

const GROUP = join('meta', 'techniques', 'harness-compat');
const MAP_FILE = join(GROUP, 'resolve-harness-operation.md');

/** A map row: a harness kind, then a link to the technique that serves it. */
const MAP_ROW_RE = /^\s+- `([a-z0-9-]+)` → \[[^\]]+\]\(\.\/([A-Za-z0-9._-]+)\)\s*$/;
/**
 * The slice vocabulary, written as a backticked alternation after the variable it draws from. Anything
 * non-paren is allowed between the two so the parse survives the surrounding code span and a reworded
 * sentence, without reaching past the parenthesis into unrelated prose.
 */
const SLICE_RE = /\{operation_kind\}[^(]*\(([^)]*)\)/;
/** A Rules section name inside an adapter. */
const RULE_HEADING_RE = /^###\s+([a-z][a-z0-9-]*)\s*$/;

/** The generic operations of the group — callers, not adapters, so not expected in the map. */
const GENERIC_OPS = new Set([
  'resolve-harness-operation', 'spawn-agent', 'continue-agent', 'spawn-concurrent',
]);

interface AdapterSet {
  /** Harness kind → adapter filename, from the map. */
  rows: Map<string, string>;
  /** The operation kinds a caller may ask for. */
  slices: string[];
}

function readMap(root: string): AdapterSet {
  const text = readFileSync(join(root, MAP_FILE), 'utf-8');
  const rows = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const row = MAP_ROW_RE.exec(line);
    if (row) rows.set(row[1]!, row[2]!);
  }
  const slice = SLICE_RE.exec(text);
  const slices = slice
    ? [...slice[1]!.matchAll(/`([a-z][a-z0-9-]*)`/g)].map((m) => m[1]!)
    : [];
  return { rows, slices };
}

/** The Rules a technique file declares. */
function declaredRules(path: string): Set<string> {
  const out = new Set<string>();
  let inRules = false;
  for (const line of readFileSync(path, 'utf-8').split(/\r?\n/)) {
    if (/^##\s/.test(line)) { inRules = /^##\s+Rules\s*$/.test(line); continue; }
    const heading = inRules ? RULE_HEADING_RE.exec(line) : null;
    if (heading) out.add(heading[1]!);
  }
  return out;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  const { rows, slices } = readMap(root);

  // A parse that found nothing is a reformatted map, not a clean one.
  assertScanned(rows.size, `harness rows in ${MAP_FILE}`, root);
  assertScanned(slices.length, `operation kinds in ${MAP_FILE}`, root);

  const coreAdapters = new Set(
    CORE_ORCHESTRATOR_TECHNIQUES
      .filter((ref) => ref.startsWith('harness-compat::'))
      .map((ref) => ref.slice('harness-compat::'.length))
      .filter((op) => !GENERIC_OPS.has(op)),
  );

  for (const [kind, file] of [...rows].sort()) {
    const slug = file.replace(/\.md$/, '');
    const path = join(root, GROUP, file);
    const site = `${MAP_FILE} → ${file}`;
    // Accounted for before anything can skip ahead: a mapped kind is mapped whether or not its file
    // exists, and leaving it in the set would report one missing file as unmapped as well.
    const registered = coreAdapters.delete(slug);

    if (!existsSync(path)) {
      findings.push({
        check: 'adapter-missing',
        site,
        detail: `the map sends '${kind}' to a file that does not exist — a caller resolving that kind `
          + 'has nothing to apply',
      });
      continue;
    }

    // Every slice a caller may ask for, and no slice a caller cannot: the three callers dereference
    // this name, so a section that is absent resolves to nothing and one that is extra is unreachable.
    const declared = declaredRules(path);
    for (const slice of slices) {
      if (!declared.has(slice)) {
        findings.push({
          check: 'slice-missing',
          site,
          detail: `declares no '${slice}' rule, so resolving that operation kind for '${kind}' names a `
            + 'section the file does not have',
        });
      }
    }
    for (const rule of [...declared].sort()) {
      if (!slices.includes(rule)) {
        findings.push({
          check: 'slice-unreachable',
          site,
          detail: `declares '${rule}', which no operation kind resolves to — add it to the vocabulary or `
            + 'fold it into a slice a caller can ask for',
        });
      }
    }

    if (!registered) {
      findings.push({
        check: 'adapter-undelivered',
        site,
        detail: `'harness-compat::${slug}' is absent from CORE_ORCHESTRATOR_TECHNIQUES, so an `
          + 'orchestrator reaches the dispatch step with nothing to apply for this kind',
      });
    }
  }

  // Whatever is left is delivered to every orchestrator and reachable through no harness kind.
  for (const orphan of [...coreAdapters].sort()) {
    findings.push({
      check: 'adapter-unmapped',
      site: `src/loaders/core-ops.ts → harness-compat::${orphan}`,
      detail: 'is delivered as a core operation but no map row resolves to it — add the row or drop the '
        + 'entry, because the map is where a kind becomes a technique',
    });
  }

  // An adapter file nothing maps is dead weight in a delivered group.
  const mapped = new Set([...rows.values()]);
  for (const file of readdirSync(join(root, GROUP)).sort()) {
    if (!file.endsWith('.md') || file === 'TECHNIQUE.md') continue;
    if (mapped.has(file) || GENERIC_OPS.has(file.replace(/\.md$/, ''))) continue;
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
    okMessage: 'every harness kind resolves to an adapter exposing exactly the operation kinds a caller may ask for',
    remedy: 'add the adapter to the map, give it every operation kind, and register it as a core operation',
  });
}
