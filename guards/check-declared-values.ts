/**
 * check-declared-values — a declared value is one a protocol phase leaves standing.
 *
 * An output's `values`, and a field's entry in `fieldValues`, is the closed set that output
 * admits. Each member has a phase that records it, and a later phase that settles the same field
 * names that member when the member's subjects are outside the later phase. A value no phase
 * records is a reading the contract promises and the run cannot give. A later phase that records
 * a sibling value and never names this one reassigns the field over a population that includes
 * the subjects this value describes.
 *
 * A set whose only home is prose is `value-set-in-prose` and is outside this check: the declaration
 * is what makes the set readable.
 *
 * A step that sets the output to a member of its `#### values` records every member of that set.
 * The phase names the output and the set; it does not repeat the members.
 *
 * Hard zero. Run: npx tsx guards/check-declared-values.ts [--root <workflows-dir>] [--json]
 */
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tryLoadMarkdownTechnique, tryLoadNestedTechnique } from '../src/loaders/markdown-technique-loader.js';
import { assertScanned, corpusNamespaces, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));
const GROUPED_INDEX = 'TECHNIQUE.md';

type LoadedTechnique = NonNullable<Awaited<ReturnType<typeof tryLoadMarkdownTechnique>>>;

/** Tokens a step records, the backticked spans of its text. */
function recordedTokens(step: string): Set<string> {
  return new Set([...step.matchAll(/`([^`]+)`/g)].map((match) => (match[1] ?? '').trim()).filter((token) => token.length > 0));
}

/**
 * The output id a site names. `workflow::technique::issue_type` is `issue_type`.
 * A bare site used by a unit test is that id.
 */
function outputId(site: string): string {
  const qualified = site.split('::').pop() ?? site;
  return qualified.split('.')[0] ?? qualified;
}

/**
 * A step records the whole admitted set when it sets this output to a member of its `#### values`.
 */
function recordsAdmittedSet(step: string, id: string): boolean {
  if (id.length === 0 || !step.includes('#### values')) return false;
  return step.includes(`{${id}}`) || recordedTokens(step).has(id);
}

/**
 * Findings for one closed set against the technique's protocol steps, in authored order.
 * `site` is the output, or the output and the field, already qualified by the caller.
 */
export function findingsForValueSet(site: string, values: string[], steps: string[]): Finding[] {
  const admitted = new Set(values);
  const id = outputId(site);
  const findings: Finding[] = [];
  for (const value of values) {
    const recordedAt = steps.flatMap((step, index) => (
      recordedTokens(step).has(value) || recordsAdmittedSet(step, id) ? [index] : []
    ));
    if (recordedAt.length === 0) {
      findings.push({
        check: 'value-unassigned',
        site,
        detail: `'${value}' is admitted and no protocol step records it`,
      });
      continue;
    }
    const first = recordedAt[0] ?? 0;
    for (let index = first + 1; index < steps.length; index++) {
      const step = steps[index] ?? '';
      const tokens = recordedTokens(step);
      if (tokens.has(value) || recordsAdmittedSet(step, id)) continue;
      const sibling = [...tokens].find((token) => admitted.has(token));
      if (sibling === undefined) continue;
      findings.push({
        check: 'value-reassigned',
        site,
        detail: `'${value}' is recorded and a later step settles the same field to '${sibling}' without naming '${value}'`,
      });
      break;
    }
  }
  return findings;
}

function protocolSteps(technique: LoadedTechnique): string[] {
  return (technique.protocol ?? []).flatMap((block) => block.steps);
}

function findingsForTechnique(workflow: string, techniqueId: string, technique: LoadedTechnique): Finding[] {
  const steps = protocolSteps(technique);
  const findings: Finding[] = [];
  for (const output of technique.outputs ?? []) {
    const base = `${workflow}::${techniqueId}::${output.id}`;
    if (output.values) findings.push(...findingsForValueSet(base, output.values, steps));
    for (const [field, values] of Object.entries(output.fieldValues ?? {})) {
      findings.push(...findingsForValueSet(`${base}.${field}`, values, steps));
    }
  }
  return findings;
}

async function tryLoad(load: () => Promise<LoadedTechnique | null>): Promise<LoadedTechnique | null> {
  try { return await load(); } catch { return null; }
}

async function loadWorkflowTechniques(techniquesDir: string): Promise<Array<{ id: string; technique: LoadedTechnique }>> {
  const out: Array<{ id: string; technique: LoadedTechnique }> = [];
  if (!existsSync(techniquesDir)) return out;
  for (const entry of readdirSync(techniquesDir).sort()) {
    const full = join(techniquesDir, entry);
    if (statSync(full).isDirectory()) {
      const index = join(full, GROUPED_INDEX);
      if (existsSync(index)) {
        const technique = await tryLoad(() => tryLoadMarkdownTechnique(techniquesDir, entry));
        if (technique) out.push({ id: technique.id, technique });
      }
      for (const child of readdirSync(full).sort()) {
        if (!child.endsWith('.md') || child === GROUPED_INDEX) continue;
        const op = child.slice(0, -'.md'.length);
        const technique = await tryLoad(() => tryLoadNestedTechnique(techniquesDir, entry, op));
        if (technique) out.push({ id: technique.id, technique });
      }
      continue;
    }
    if (!entry.endsWith('.md')) continue;
    const technique = await tryLoad(() => tryLoadMarkdownTechnique(techniquesDir, entry.slice(0, -'.md'.length)));
    if (technique) out.push({ id: technique.id, technique });
  }
  return out;
}

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const { ref: workflow, dir } of corpusNamespaces(root)) {
    const techniquesDir = join(dir, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const { id, technique } of await loadWorkflowTechniques(techniquesDir)) {
      scanned++;
      findings.push(...findingsForTechnique(workflow, id, technique));
    }
  }
  assertScanned(scanned, 'technique files', root);
  return findings.sort((a, b) => (a.check + a.site).localeCompare(b.check + b.site));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('declared-values', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every declared value is left standing by a protocol phase',
    remedy: 'record the value in the phase that leaves it standing, and name it from any later phase that settles the same field',
  });
}
