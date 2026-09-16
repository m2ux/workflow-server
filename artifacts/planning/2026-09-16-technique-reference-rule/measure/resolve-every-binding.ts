/**
 * Every technique reference the corpus makes, and what the loader does with each.
 *
 * Emits one JSON line per (workflow, activity, ref) with the resolution outcome, so two runs of the
 * same corpus against two builds of the resolver diff line-for-line.
 *
 *   npx tsx measure-technique-refs.ts > /tmp/before.json
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { indexCorpus } from '../../../../../src/loaders/corpus-index.js';
import { parseDefinition } from '../../../../../src/utils/serialization.js';
import { composeActivityTechnique, resolveTechniques } from '../../../../../src/loaders/technique-loader.js';
import { defaultCorpusDest } from '../../../../../src/corpus-dest.js';

const ROOT = process.env['WORKFLOWS_DIR'] ?? defaultCorpusDest(process.cwd());
const index = indexCorpus(ROOT);

interface Binding {
  workflowId: string;
  activityId: string;
  file: string;
  /** Where in the file: a step binding, or an entry in a `techniques[]` list. */
  site: 'step' | 'list';
  ref: string;
}

const bindings: Binding[] = [];

function refOf(technique: unknown): string | undefined {
  if (typeof technique === 'string') return technique;
  if (technique && typeof technique === 'object') {
    const name = (technique as { name?: unknown }).name;
    if (typeof name === 'string') return name;
  }
  return undefined;
}

function walkSteps(steps: unknown, add: (ref: string) => void): void {
  if (!Array.isArray(steps)) return;
  for (const step of steps) {
    if (!step || typeof step !== 'object') continue;
    const ref = refOf((step as { technique?: unknown }).technique);
    if (ref !== undefined) add(ref);
    walkSteps((step as { steps?: unknown }).steps, add);
  }
}

function collectFile(workflowId: string, file: string): void {
  let parsed: unknown;
  try {
    parsed = parseDefinition(readFileSync(file, 'utf-8'));
  } catch {
    return;
  }
  if (!parsed || typeof parsed !== 'object') return;
  const activityId = typeof (parsed as { id?: unknown }).id === 'string' ? (parsed as { id: string }).id : '(no id)';
  const rel = relative(ROOT, file);
  walkSteps((parsed as { steps?: unknown }).steps, (ref) =>
    bindings.push({ workflowId, activityId, file: rel, site: 'step', ref }));
  const list = (parsed as { techniques?: unknown }).techniques;
  if (Array.isArray(list)) {
    for (const entry of list) {
      if (typeof entry === 'string') bindings.push({ workflowId, activityId, file: rel, site: 'list', ref: entry });
    }
  }
}

function walkActivities(workflowId: string, dir: string): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walkActivities(workflowId, path);
    else if (entry.endsWith('.yaml') || entry.endsWith('.yml')) collectFile(workflowId, path);
  }
}

for (const [workflowId, location] of index.workflows) {
  walkActivities(workflowId, join(location.dir, 'activities'));
  // The workflow definition's own technique lists.
  let manifest: unknown;
  try {
    manifest = parseDefinition(readFileSync(location.manifest, 'utf-8'));
  } catch {
    manifest = null;
  }
  const lists = (manifest as { techniques?: { workflow?: unknown; activity?: unknown } } | null)?.techniques;
  for (const key of ['workflow', 'activity'] as const) {
    const entries = lists?.[key];
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (typeof entry === 'string') {
        bindings.push({ workflowId, activityId: `workflow.yaml:${key}`, file: relative(ROOT, location.manifest), site: 'list', ref: entry });
      }
    }
  }
}

const digest = (value: unknown): string => createHash('sha256').update(JSON.stringify(value) ?? 'undefined').digest('hex').slice(0, 16);

const out: unknown[] = [];
for (const binding of bindings) {
  const segments = binding.ref.split('::');
  const head = segments[0]!;
  const techniquesDir = index.workflows.get(head) ? join(index.workflows.get(head)!.dir, 'techniques') : null;
  let composed: unknown;
  try {
    const result = await composeActivityTechnique(binding.ref, ROOT, binding.workflowId, binding.site === 'step' ? binding.activityId : undefined);
    composed = result.success
      ? { ok: true, techniqueId: result.value.techniqueId, sourceWorkflowId: result.value.sourceWorkflowId, body: digest(result.value.technique) }
      : { ok: false, error: String(result.error) };
  } catch (error) {
    composed = { ok: false, threw: error instanceof Error ? error.message : String(error) };
  }
  let bundle: unknown;
  try {
    bundle = (await resolveTechniques([binding.ref], ROOT, binding.workflowId))
      .map((r) => ({ type: r.type, source: r.source, workflow: r.workflow ?? null, name: r.name, ref: r.ref, body: digest(r.body) }));
  } catch (error) {
    bundle = { threw: error instanceof Error ? error.message : String(error) };
  }
  out.push({
    ...binding,
    segments: segments.length,
    headIsWorkflow: index.workflows.has(head),
    headHasTechniques: techniquesDir !== null && existsSync(techniquesDir),
    composed,
    bundle,
  });
}

process.stdout.write(JSON.stringify(out, null, 1));
process.stderr.write(`${bindings.length} bindings over ${index.workflows.size} workflows\n`);
