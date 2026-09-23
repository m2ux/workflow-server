/**
 * check-identity-binds — an activity step binds a same-name input by omitting it.
 *
 * The binding schema says a technique step with no deviation is the bare `technique: group::op`
 * string, and that `inputs` and `outputs` carry only what differs from same-name binding. A pair
 * whose key equals its value writes that default out longhand. Nothing failed on it, so the corpus
 * accumulated the form: a census first measured 114 such pairs and found 218 when it was re-run.
 *
 * The cost is restatement. A later remap has to be found in two places, and a reader cannot tell a
 * deviation from a no-op without comparing the two sides of a colon.
 *
 * ---
 *
 * The subject is the `inputs` and `outputs` maps on a `kind: technique` step of an ACTIVITY, and
 * the bounds are as much of the check as the rule is. Three things spell a same-name pair the same
 * way and mean something else; a check that took the shape at face value would advise a strip that
 * silently changes what a run binds.
 *
 *   A ROUTINE BODY is rewritten at each reference site, and substitution walks the binding maps a
 *   step carries. A body that omits `diff_scope: diff_scope` spells that name nowhere, so a site
 *   binding `diff_scope` to another host variable has nothing to rewrite and the step falls through
 *   to same-name binding against a bag that does not hold it. The pair is what carries a parameter
 *   into the step it parameterises. This guard reads activities and never a `routines/` file.
 *
 *   A ROUTINE STEP'S OUTPUTS have no same-name default at all: an unbound output fails the load, or
 *   is dropped where the declaration marks it optional. `repo_name: repo_name` there is the binding
 *   rather than a restatement of one. That map is `step.outputs` on a `kind: routine` step, which
 *   is a different field from the `step.technique.outputs` read here — so the two are separated by
 *   what the check addresses rather than by a test, and folding them together is the mistake.
 *
 *   AN OPTIONAL OR DEFAULTED INPUT is not a value the workflow must supply, which is why the
 *   contract derivation counts no read for one. A same-name bind on an optional input is the
 *   activity saying it does supply it, and that is what carries the name into the activity's read
 *   contract — strip it and `check-activity-variables` reports the declared read as unconsulted.
 *   So each pair is held against the bound operation's own signature, and a pair on an input that
 *   operation marks optional or gives a default is left alone.
 *
 * Where the bound operation cannot be resolved to one file, the pair is left alone too: the
 * exclusion above cannot be tested, and a guard that cannot tell a deviation from a restatement
 * should not call it one.
 *
 * Run: npx tsx guards/check-identity-binds.ts [--root <workflows-dir>] [--json]
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertScanned, citePath, corpusNamespaces, definitionsUnder, defaultCorpusDest } from './workflows-root.js';
import { requireRootOrExit, runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** The group and namespace contract file, which declares what every operation under it inherits. */
const CONTAINER = 'TECHNIQUE.md';

/** One operation file: where it sits, and the inputs it does not require. */
interface Operation {
  rel: string;
  optional: Set<string>;
}

/**
 * The input ids a technique file declares optional or defaulted.
 *
 * Both markings say the same thing for this purpose — the workflow need not supply the value — and
 * they are written differently: `*(optional)*` opens the description, a default sits in a
 * `#### default` sub-section.
 */
function optionalInputs(text: string): Set<string> {
  const out = new Set<string>();
  const section = /\n## Inputs\n([\s\S]*?)(?=\n## [A-Z]|$)/.exec(text);
  if (!section) return out;
  let current: string | null = null;
  let optional = false;
  const flush = (): void => { if (current && optional) out.add(current); };
  for (const line of section[1]!.split('\n')) {
    const heading = /^### (.+)$/.exec(line);
    if (heading) { flush(); current = heading[1]!.trim(); optional = false; continue; }
    if (!current) continue;
    if (/^#### default\s*$/.test(line) || /\*\(optional/i.test(line)) optional = true;
  }
  flush();
  return out;
}

/**
 * Every operation in the corpus, keyed by the file's basename — the leaf a reference names.
 *
 * What a step binds is the COMPOSED contract: an operation inherits the inputs its group and
 * namespace containers declare, and a container marks its own optional. `repo_path` is optional on
 * the GitHub container and appears in no leaf, so reading the leaf alone would call a same-name
 * bind on it a restatement and advise a strip that breaks the read contract. Container markings are
 * therefore collected on the way down and merged into every operation beneath them.
 *
 * A container is not itself an operation, so it is read for what it declares and not indexed as a
 * reference target.
 */
function operationsByLeaf(root: string): Map<string, Operation[]> {
  const out = new Map<string, Operation[]>();
  const visit = (dir: string, inherited: ReadonlySet<string>): void => {
    const names = readdirSync(dir).sort();
    let scope = inherited;
    if (names.includes(CONTAINER)) {
      scope = new Set([...inherited, ...optionalInputs(readFileSync(join(dir, CONTAINER), 'utf-8'))]);
    }
    for (const name of names) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) { visit(path, scope); continue; }
      if (!name.endsWith('.md') || name === 'README.md' || name === CONTAINER) continue;
      const leaf = basename(name, '.md');
      const optional = new Set([...scope, ...optionalInputs(readFileSync(path, 'utf-8'))]);
      const bucket = out.get(leaf);
      const entry = { rel: relative(root, path), optional };
      if (bucket) bucket.push(entry); else out.set(leaf, [entry]);
    }
  };
  for (const { dir } of corpusNamespaces(root)) {
    const techniques = join(dir, 'techniques');
    if (existsSync(techniques)) visit(techniques, new Set());
  }
  return out;
}

/**
 * The one operation a step's reference names, or undefined where it names several.
 *
 * A reference spells its path with either separator, and a bare leaf resolves against the workflow
 * that spells it before anywhere else — which is the rule the loader applies and the only thing
 * that tells two same-named operations apart.
 */
function resolveOperation(
  byLeaf: Map<string, Operation[]>,
  reference: string,
  homeNamespace: string,
): Operation | undefined {
  const segments = reference.split(/::|\//);
  const candidates = byLeaf.get(segments[segments.length - 1]!);
  if (!candidates || candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  if (segments.length > 1) {
    const qualifier = segments[segments.length - 2]!;
    const narrowed = candidates.filter((c) => c.rel.split('/').includes(qualifier));
    if (narrowed.length === 1) return narrowed[0];
  }
  const home = candidates.filter((c) => c.rel.split('/')[0] === homeNamespace);
  return home.length === 1 ? home[0] : undefined;
}

interface Step { kind?: string; id?: string; steps?: Step[]; technique?: unknown }

/** Same-name pairs on one binding map. */
function identityKeys(map: unknown): string[] {
  if (!map || typeof map !== 'object') return [];
  return Object.entries(map as Record<string, unknown>)
    .filter(([key, value]) => typeof value === 'string' && value === key)
    .map(([key]) => key);
}

function walkSteps(
  steps: Step[] | undefined,
  report: (stepId: string, field: string, keys: string[], reference: string) => void,
  byLeaf: Map<string, Operation[]>,
  homeNamespace: string,
): void {
  for (const step of steps ?? []) {
    if (!step || typeof step !== 'object') continue;
    if (step.kind === 'loop') walkSteps(step.steps, report, byLeaf, homeNamespace);
    if (step.kind !== 'technique') continue;
    const binding = step.technique;
    if (!binding || typeof binding !== 'object') continue;
    const { name, inputs, outputs } = binding as { name?: unknown; inputs?: unknown; outputs?: unknown };
    if (typeof name !== 'string') continue;
    const operation = resolveOperation(byLeaf, name, homeNamespace);
    if (!operation) continue;
    const required = identityKeys(inputs).filter((key) => !operation.optional.has(key));
    if (required.length > 0) report(step.id ?? '(unnamed step)', 'inputs', required, name);
    const landed = identityKeys(outputs);
    if (landed.length > 0) report(step.id ?? '(unnamed step)', 'outputs', landed, name);
  }
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  const index = indexCorpus(root);
  const byLeaf = operationsByLeaf(root);
  let scanned = 0;
  // One file sits under two namespaces where one nests inside another, so a path is read once —
  // otherwise the same pair is reported as many times as there are namespaces reaching it.
  const seen = new Set<string>();

  for (const { dir, ref } of corpusNamespaces(root, index)) {
    const activities = join(dir, 'activities');
    if (!existsSync(activities)) continue;
    for (const { path } of definitionsUnder(activities)) {
      if (seen.has(path)) continue;
      seen.add(path);
      scanned++;
      let definition: unknown;
      try { definition = parseDefinition(readFileSync(path, 'utf-8')); } catch { continue; }
      if (!definition || typeof definition !== 'object') continue;
      const site = citePath(root, path, index);
      walkSteps(
        (definition as { steps?: Step[] }).steps,
        (stepId, field, keys, reference) => {
          findings.push({
            check: 'identity-bind',
            site: `${site}::${stepId}`,
            detail:
              `binds ${keys.map((k) => `'${k}'`).join(', ')} on \`${field}\` to the same name, which is `
              + `what omitting the pair already does — '${reference}' requires it, so the bag supplies `
              + `it under its own id. Drop the pair; where nothing else differs, the whole binding `
              + `becomes the bare \`technique: ${reference}\``,
          });
        },
        byLeaf,
        ref.split('/')[0]!,
      );
    }
  }

  assertScanned(scanned, 'activity definition(s)', root);
  return findings.sort((a, b) => (a.site + a.detail).localeCompare(b.site + b.detail));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('identity-binds', () => requireRootOrExit('identity-binds', DEFAULT_ROOT), collectFindings, {
    okMessage: 'no activity step restates same-name binding it could omit',
    remedy: 'drop the pair, and collapse the binding to the bare string where nothing else differs',
  });
}
