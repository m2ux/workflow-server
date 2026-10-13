/**
 * check-inherited-input-never-spent — a container contract may not hand a step a required slot that
 * nothing produces, for a value the bound technique never reads (`inherited-input-never-spent`).
 *
 * The loader composes a workflow-root `TECHNIQUE.md` and any group `TECHNIQUE.md` into every
 * descendant, so a step binding the descendant receives each container input as an inherited slot.
 * Where the input is required, the descendant never reads it, and nothing in the step's scope holds
 * it, the delivered technique shows the slot as ambient context with no producer: the agent is told
 * a value is required that it has no source for and no use of.
 *
 * Scope is the server's own: `resolveInputSource` from `binding-provenance` decides whether a step
 * binding, a workflow variable, or a producer anywhere in the workflow holds the input, and a step
 * is reported only where it resolves to `inherited-ambient`. A routine parameter reaches the step as
 * its materialised binding, and a loop variable as a producer. A name the server seeds into every
 * session of the workflow is held from the start.
 *
 * A descendant spends an input when its own Protocol or Rules reference `{id}`, when it declares the
 * input itself, or when an op it applies by link spends it. Two look-alikes are not this defect and
 * are not reported: a container input no descendant spends (`declared-input-never-read`, whose fix
 * is deletion), and a leaf redeclaring the input, which makes the slot its own.
 *
 * workflow-design is deprecated and is not edited, so its steps are excused (`EXCUSED_WORKFLOWS`).
 *
 * Run: npx tsx guards/check-inherited-input-never-spent.ts [--root <workflows-dir>] [--json]
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { indexCorpus, namespaceSubdir } from '../src/loaders/corpus-index.js';
import { tryLoadMarkdownTechnique } from '../src/loaders/markdown-technique-loader.js';
import { composeActivityTechnique } from '../src/loaders/technique-loader.js';
import { parseTechniqueRef } from '../src/loaders/technique-ref.js';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { flattenActivitySteps, techniqueName, type TechniqueBinding } from '../src/schema/activity.schema.js';
import type { Technique } from '../src/schema/technique.schema.js';
import {
  OPTIONAL_INPUT_RE, buildProducerIndex, provenanceContextFor, resolveInputSource,
} from '../src/utils/binding-provenance.js';
import { seededNamesFor } from '../src/utils/eager-client.js';
import { assertScanned, corpusWorkflows, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** Workflows whose steps are not measured, each with the reason. */
export const EXCUSED_WORKFLOWS: Readonly<Record<string, string>> = {
  'workflow-design': 'deprecated, and not edited',
};

const CONTAINER = 'TECHNIQUE.md';
/** A markdown link, label and target. */
const LINK = /\[[^\]]+\]\(([^)\s]+)\)/g;

/** Whether `text` reads `id`: `{id}`, or a member of it, `{id.member}`. */
function references(text: string, id: string): boolean {
  return new RegExp(`\\{${id}(?:\\.[a-zA-Z0-9_.]+)?\\}`).test(text);
}

/** The text a technique's own Protocol and Rules state. */
function ownTexts(technique: Technique): string[] {
  const texts: string[] = [];
  for (const block of technique.protocol ?? []) {
    if (block.title) texts.push(block.title);
    texts.push(...block.steps);
  }
  for (const rule of Object.values(technique.rules ?? {})) {
    texts.push(...(Array.isArray(rule) ? rule : [rule]));
  }
  return texts;
}

function isRequired(input: { default?: unknown; description?: string | undefined }): boolean {
  return input.default === undefined && !OPTIONAL_INPUT_RE.test(input.description?.trim() ?? '');
}

/** Reads technique files uncomposed, as written, and answers which of them spend an input. */
class Spending {
  private readonly loaded = new Map<string, Promise<Technique | null>>();
  private readonly verdicts = new Map<string, Promise<boolean>>();

  constructor(private readonly root: string) {}

  /** The technique a file holds, parsed alone, or null where it holds none. */
  load(path: string): Promise<Technique | null> {
    let hit = this.loaded.get(path);
    if (!hit) {
      const parts = path.split(sep);
      const at = parts.lastIndexOf('techniques');
      const id = parts.slice(at + 1).join('/').replace(/\.md$/, '');
      hit = at < 0 ? Promise.resolve(null) : tryLoadMarkdownTechnique(parts.slice(0, at + 1).join(sep), id).catch(() => null);
      this.loaded.set(path, hit);
    }
    return hit;
  }

  /** Whether the op at `path` spends `id`, following the ops it applies. */
  spends(path: string, id: string, seen: Set<string> = new Set()): Promise<boolean> {
    const key = `${path}\u0000${id}`;
    let hit = this.verdicts.get(key);
    if (!hit) {
      hit = this.decide(path, id, seen);
      this.verdicts.set(key, hit);
    }
    return hit;
  }

  private async decide(path: string, id: string, seen: Set<string>): Promise<boolean> {
    if (seen.has(path)) return false;
    seen.add(path);
    const technique = await this.load(path);
    if (!technique) return false;
    if ((technique.inputs ?? []).some((input) => input.id === id)) return true;
    const texts = ownTexts(technique);
    if (texts.some((text) => references(text, id))) return true;
    for (const callee of this.applied(path, texts)) {
      if (await this.decide(callee, id, seen)) return true;
    }
    return false;
  }

  /** The op files a technique's prose links to: an applied op, as the corpus spells one. */
  private applied(path: string, texts: string[]): string[] {
    const out = new Set<string>();
    for (const text of texts) {
      for (const match of text.matchAll(LINK)) {
        const target = match[1]!.split('#')[0]!;
        if (!target.endsWith('.md') || target.includes('://')) continue;
        const landed = target.startsWith('/') ? join(this.root, target) : resolve(dirname(path), target);
        const name = landed.split(sep).pop()!;
        if (name === CONTAINER || name === 'README.md' || !landed.includes(`${sep}techniques${sep}`)) continue;
        if (existsSync(landed)) out.add(landed);
      }
    }
    return [...out];
  }

  /** The nearest container above `leaf` declaring `id`, up to its `techniques/` directory. */
  async container(leaf: string, id: string): Promise<string | undefined> {
    let dir = dirname(leaf);
    for (;;) {
      const path = join(dir, CONTAINER);
      const technique = existsSync(path) ? await this.load(path) : null;
      if (technique?.inputs?.some((input) => input.id === id)) return path;
      if (dir.split(sep).pop() === 'techniques' || dirname(dir) === dir) return undefined;
      dir = dirname(dir);
    }
  }

  /** Whether any op beneath `container` spends `id`. */
  async anyDescendantSpends(container: string, id: string): Promise<boolean> {
    const walk = (dir: string): string[] => readdirSync(dir).sort().flatMap((name) => {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) return walk(p);
      return name.endsWith('.md') && name !== CONTAINER && name !== 'README.md' ? [p] : [];
    });
    for (const leaf of walk(dirname(container))) {
      if (await this.spends(leaf, id)) return true;
    }
    return false;
  }
}

/** The file a composed step reference was read from. */
function techniqueFile(
  root: string,
  index: ReturnType<typeof indexCorpus>,
  techniqueId: string,
  sourceWorkflowId: string,
): string | undefined {
  const techniquesDir = namespaceSubdir(index, sourceWorkflowId, 'techniques');
  if (!techniquesDir) return undefined;
  let segments: string[];
  try {
    segments = parseTechniqueRef(techniqueId, index).segments;
  } catch {
    return undefined;
  }
  const path = join(techniquesDir, ...segments) + '.md';
  return existsSync(path) ? path : undefined;
}

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  const findings: Finding[] = [];
  const index = indexCorpus(root);
  const spending = new Spending(root);
  const workflows = corpusWorkflows(root, index).map(({ id }) => id);
  assertScanned(workflows.length, 'workflows with a workflow.yaml', root);

  for (const workflowId of workflows) {
    if (workflowId in EXCUSED_WORKFLOWS) continue;
    const loaded = await loadWorkflowWithDiagnostics(root, workflowId);
    if (!loaded.success) {
      findings.push({ check: 'workflow-load', site: `${workflowId}/workflow.yaml`, detail: loaded.error.message });
      continue;
    }
    const { workflow, activitySourceWorkflow } = loaded.value;
    const producers = await buildProducerIndex({ workflow, workflowDir: root, activitySourceWorkflow });
    const seeded = seededNamesFor(workflowId);

    for (const activity of workflow.activities ?? []) {
      const scopeWorkflowId = activitySourceWorkflow.get(activity.id) ?? workflowId;
      for (const step of flattenActivitySteps(activity)) {
        if (step.kind !== 'technique') continue;
        const ref = techniqueName(step.technique);
        if (!ref || step.id === undefined) continue;
        const composed = await composeActivityTechnique(ref, root, scopeWorkflowId, activity.id);
        if (!composed.success) continue;
        const inherited = (composed.value.technique.inherited_inputs?.items ?? []).filter(isRequired);
        if (inherited.length === 0) continue;
        const leaf = techniqueFile(root, index, composed.value.techniqueId, composed.value.sourceWorkflowId);
        const ctx = provenanceContextFor(producers, activity.id, step.id);
        if (!leaf || !ctx) continue;
        const binding: TechniqueBinding | undefined = typeof step.technique === 'object' ? step.technique : undefined;

        for (const input of inherited) {
          if (seeded.has(input.id)) continue;
          const source = resolveInputSource(input.id, ctx, binding, { hasDefault: false, optional: false, inherited: true });
          if (source.kind !== 'inherited-ambient') continue;
          if (await spending.spends(leaf, input.id)) continue;
          const container = await spending.container(leaf, input.id);
          if (!container || !(await spending.anyDescendantSpends(container, input.id))) continue;
          findings.push({
            check: 'inherited-input-never-spent',
            site: `${workflowId}::${activity.id}::${step.id}`,
            detail: `binds '${composed.value.techniqueId}', which inherits required input '${input.id}' from `
              + `${relative(root, container)} and never reads it, and nothing in the step's scope holds it — `
              + 'the agent receives a required slot as ambient context that nothing produces. Give the input a '
              + '#### default its spending ops accept, mark it optional where they handle its absence, or move it '
              + 'to the smallest container its spenders share.',
          });
        }
      }
    }
  }
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('inherited-input-never-spent', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no step is handed a required inherited input that nothing produces and its op never reads',
    remedy: "default the container input, mark it optional, or move it to its spenders' smallest shared container",
  });
}
