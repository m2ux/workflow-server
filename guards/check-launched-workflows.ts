/**
 * check-launched-workflows — the launches an activity declares are the launches it performs.
 *
 * An activity that hands work to another workflow says so twice: once in its `triggers[]`
 * declaration, which is what a reader of the definition sees, and once in the step that binds
 * `workflow-engine::handle-sub-workflow`, which is what actually dispatches. The server acts on
 * neither — it dispatches when the step's operation calls `dispatch_child` — so nothing but this
 * guard holds the two together, and either one alone reads as a capability that is not there:
 * a declaration with no step promises a launch that never happens, and a step with no declaration
 * launches a workflow the definition never admits to.
 *
 * Three rules, all hard-zero:
 *   - every declared launch is performed — by a step binding the launch operation, or by a step
 *     whose bound operation applies it
 *   - every launch step is declared by the activity it sits in
 *   - both name a workflow the corpus actually holds
 *
 * Whether a launch's RESULT is consumed is not decidable here: a run returns through the artifacts
 * it writes to the planning folder it was given, so the read-back is a technique's business and
 * belongs to corpus review.
 *
 * Run:
 *   npx tsx guards/check-launched-workflows.ts
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { type CorpusSource, asIndex, indexCorpus } from '../src/loaders/corpus-index.js';
import { corpusWorkflows, resolveWorkflowsRoot, workflowSubdir, defaultCorpusDest } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
// Defaults to ../workflows; --root <path> or WORKFLOWS_DIR redirects to a worktree.
const ROOT = resolveWorkflowsRoot(defaultCorpusDest(join(DIR, '..')));

const LAUNCH_OPERATION = 'workflow-engine::handle-sub-workflow';

export interface LaunchedWorkflowViolation { site: string; detail: string }

/** The workflow ids an activity declares it launches. */
function declaredLaunches(activity: Record<string, unknown>): string[] {
  const triggers = activity.triggers;
  if (!Array.isArray(triggers)) return [];
  return triggers
    .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object' && !Array.isArray(t))
    .map((t) => t.workflow)
    .filter((w): w is string => typeof w === 'string');
}

/** A step that binds the launch operation, with the workflow id it passes (null when it names none). */
interface LaunchStep { stepId: string; workflowId: string | null }

/** Recursively walk every `steps[]` array (including loop steps) for launch bindings. */
function collectLaunchSteps(node: unknown, out: LaunchStep[]): void {
  if (Array.isArray(node)) { for (const n of node) collectLaunchSteps(n, out); return; }
  if (!node || typeof node !== 'object') return;
  const step = node as Record<string, unknown>;
  const tech = step.technique;
  const name = typeof tech === 'string'
    ? tech
    : (tech && typeof tech === 'object' && !Array.isArray(tech))
      ? (tech as Record<string, unknown>).name
      : undefined;
  if (name === LAUNCH_OPERATION) {
    const inputs = (tech && typeof tech === 'object' && !Array.isArray(tech))
      ? (tech as Record<string, unknown>).inputs
      : undefined;
    const workflowId = (inputs && typeof inputs === 'object' && !Array.isArray(inputs))
      ? (inputs as Record<string, unknown>).workflow_id
      : undefined;
    out.push({
      stepId: typeof step.id === 'string' ? step.id : '?',
      workflowId: typeof workflowId === 'string' ? workflowId : null,
    });
  }
  for (const v of Object.values(step)) collectLaunchSteps(v, out);
}

/** Every technique ref a step binds, at any depth. */
function collectTechniqueRefs(node: unknown, out: string[]): void {
  if (Array.isArray(node)) { for (const n of node) collectTechniqueRefs(n, out); return; }
  if (!node || typeof node !== 'object') return;
  const step = node as Record<string, unknown>;
  const tech = step.technique;
  if (typeof tech === 'string') out.push(tech);
  else if (tech && typeof tech === 'object' && !Array.isArray(tech)) {
    const name = (tech as Record<string, unknown>).name;
    if (typeof name === 'string') out.push(name);
  }
  for (const v of Object.values(step)) collectTechniqueRefs(v, out);
}

/**
 * Body of the technique a ref names, or null when the ref resolves to no file. Refs take the forms
 * `[workflow::]group::operation`, the legacy `workflow/technique`, and a bare `technique` — each
 * resolving under some workflow's `techniques/` tree.
 */
function techniqueBody(source: CorpusSource, currentWorkflow: string, ref: string): string | null {
  const segs = ref.replace(/\//g, '::').split('::').filter((s) => s.length > 0);
  if (!segs.length) return null;
  const candidates: string[] = [];
  const under = (wf: string, rest: string[]): void => {
    const techniques = workflowSubdir(source, wf, 'techniques');
    if (!techniques) return;
    candidates.push(join(techniques, `${rest.join('/')}.md`));
    candidates.push(join(techniques, ...rest, 'TECHNIQUE.md'));
  };
  under(currentWorkflow, segs);
  if (segs.length >= 2) under(segs[0]!, segs.slice(1));
  for (const c of candidates) {
    if (existsSync(c)) { try { return readFileSync(c, 'utf-8'); } catch { return null; } }
  }
  return null;
}

/** Workflow ids the corpus holds — a launch target has to be one of them. */
function corpusWorkflowIds(root: string, source: CorpusSource = root): Set<string> {
  const ids = new Set<string>();
  for (const { id, manifest } of corpusWorkflows(root, asIndex(source))) {
    try {
      const wf = parseDefinition(readFileSync(manifest, 'utf-8')) as Record<string, unknown>;
      ids.add(typeof wf.id === 'string' ? wf.id : id);
    } catch { ids.add(id); }
  }
  return ids;
}

export function collectLaunchedWorkflowViolations(root: string = ROOT): LaunchedWorkflowViolation[] {
  const out: LaunchedWorkflowViolation[] = [];
  const index = indexCorpus(root);
  const known = corpusWorkflowIds(root, index);
  const wfs = corpusWorkflows(root, index).filter(({ dir }) => existsSync(join(dir, 'activities')));
  for (const { id: wf, dir } of wfs) {
    const adir = join(dir, 'activities');
    for (const f of readdirSync(adir).filter((x) => x.endsWith('.yaml'))) {
      const rel = relative(root, join(adir, f));
      let activity: Record<string, unknown>;
      try {
        activity = parseDefinition(readFileSync(join(adir, f), 'utf-8')) as Record<string, unknown>;
      } catch {
        continue; // malformed YAML is validate-workflow-yaml's job, not this guard's
      }

      const declared = declaredLaunches(activity);
      const steps: LaunchStep[] = [];
      collectLaunchSteps(activity.steps, steps);
      const launched = steps.map((s) => s.workflowId).filter((w): w is string => w !== null);

      // A step's operation may apply the launch itself rather than the activity binding it
      // directly — composition, not a missing launch.
      const refs: string[] = [];
      collectTechniqueRefs(activity.steps, refs);
      const composedLaunch = refs.some((r) => {
        if (r === LAUNCH_OPERATION) return false;
        return (techniqueBody(index, wf, r) ?? '').includes('handle-sub-workflow');
      });

      for (const id of declared) {
        if (!launched.includes(id) && !composedLaunch) {
          out.push({ site: rel, detail: `declares a launch of '${id}' that nothing performs — no step binds ${LAUNCH_OPERATION} and no bound operation applies it; perform the launch or drop the declaration` });
        }
        if (!known.has(id)) {
          out.push({ site: rel, detail: `declares a launch of '${id}', which the corpus holds no workflow for` });
        }
      }
      for (const step of steps) {
        if (step.workflowId === null) {
          out.push({ site: `${rel}[${step.stepId}]`, detail: `binds ${LAUNCH_OPERATION} without a workflow_id input — the launch names no workflow` });
          continue;
        }
        if (!declared.includes(step.workflowId)) {
          out.push({ site: `${rel}[${step.stepId}]`, detail: `launches '${step.workflowId}', which this activity does not declare under triggers` });
        }
        if (!known.has(step.workflowId)) {
          out.push({ site: `${rel}[${step.stepId}]`, detail: `launches '${step.workflowId}', which the corpus holds no workflow for` });
        }
      }
    }
  }
  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectLaunchedWorkflowViolations();
  if (violations.length) {
    process.stdout.write(`launched workflows: ${violations.length} finding(s) — a declared launch and the step that performs it must agree:\n`);
    for (const v of violations.sort((a, b) => a.site.localeCompare(b.site))) process.stdout.write(`  ${v.site} — ${v.detail}\n`);
    process.exit(1);
  }
  process.stdout.write('launched workflows: OK — every declared launch is performed, every launch is declared, and both name a workflow the corpus holds\n');
}
