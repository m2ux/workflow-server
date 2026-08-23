/**
 * Which workflows a coverage walk has to cover for a given corpus change.
 *
 * The walk drives fourteen workflows and costs about thirteen minutes, and most corpus changes
 * touch one workflow. Walking the other thirteen measures nothing the previous run did not, so this
 * names the smallest set that can still judge what changed.
 *
 * The unit of measurement is the OPTION, and an option belongs to an activity rather than to a
 * workflow: `checkpoint:<activity>:<checkpoint>=<option>`. An activity can sit in several workflows
 * — `remediate-vuln` runs fourteen of `work-package`'s — and an option is reachable if ANY of them
 * reaches it. So the scope is not "the workflows whose files changed": it is every walked workflow
 * that declares a changed activity. Miss one and an option reachable only through it reads as newly
 * unreached, which fails the run for a gap that is not there.
 *
 * A change to a workflow file itself (its variables, its rules, its activity list) scopes to that
 * workflow. A change to an activity file scopes to every walked workflow declaring that activity.
 * Anything else in the corpus — a technique, a resource — cannot move option coverage on its own and
 * scopes to nothing.
 *
 * What this cannot see, and the caller must decide: a change to the walker, the policies, or the
 * server changes how EVERY workflow walks, so it needs the full set. This reads a corpus diff and
 * nothing else.
 *
 *   npx tsx scripts/coverage-scope.ts <base-corpus-ref> [head-corpus-ref] [--root <workflows-dir>]
 *
 * Prints one workflow id per line, or nothing when the change cannot move coverage.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { requireWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = join(DIR, '..', 'workflows');

/** Corpus paths that changed between two refs, as the corpus's own git reports them. */
export function changedCorpusPaths(root: string, base: string, head = 'HEAD'): string[] {
  const diff = spawnSync('git', ['-C', root, 'diff', '--name-only', `${base}..${head}`], { encoding: 'utf-8' });
  if (diff.status !== 0) {
    throw new Error(`cannot diff corpus ${base}..${head}: ${diff.stderr.trim() || 'git failed'}`);
  }
  return diff.stdout.split('\n').map((l) => l.trim()).filter(Boolean);
}

/** The activity ids an activity file path could hold, keyed by the workflow that authored it. */
interface CorpusChange {
  /** Workflow ids whose own workflow.yaml changed. */
  workflows: Set<string>;
  /** `<authoring workflow>/<activity file>` paths that changed. */
  activityFiles: Set<string>;
}

export function classifyChange(paths: readonly string[]): CorpusChange {
  const workflows = new Set<string>();
  const activityFiles = new Set<string>();
  for (const path of paths) {
    const parts = path.split('/');
    if (parts.length < 2) continue;
    if (parts[1] === 'workflow.yaml' || parts[1] === 'workflow.yml') { workflows.add(parts[0]!); continue; }
    if (parts[1] === 'activities' && /\.ya?ml$/.test(parts[parts.length - 1]!)) activityFiles.add(path);
  }
  return { workflows, activityFiles };
}

/**
 * Every walked workflow that has to be walked to judge this change.
 *
 * A workflow's own file changing scopes to it. An activity file changing scopes to every walked
 * workflow whose graph contains that activity — which is what the loader answers, since a borrowed
 * activity reaches a workflow's graph through a string reference rather than through its directory.
 */
export async function coverageScope(
  root: string,
  changed: CorpusChange,
  walked: readonly string[],
): Promise<string[]> {
  const scope = new Set<string>();
  for (const id of changed.workflows) if (walked.includes(id)) scope.add(id);

  if (changed.activityFiles.size > 0) {
    // An activity file names its activity by `id`, and a workflow's loaded graph lists the ids it
    // holds however they got there — local directory or borrowed reference. Comparing ids rather
    // than paths is what makes a borrow visible.
    const changedIds = new Set<string>();
    for (const path of changed.activityFiles) {
      const parts = path.split('/');
      const authoring = parts[0]!;
      const loaded = await loadWorkflow(root, authoring);
      if (!loaded.success) continue;
      const filename = parts[parts.length - 1]!;
      for (const activity of loaded.value.activities ?? []) {
        // The loader records an artifactPrefix taken from the filename, which is the only link back
        // from a file to the activity it declares without re-reading it.
        if (activity.artifactPrefix && filename.startsWith(`${activity.artifactPrefix}-`)) {
          changedIds.add(activity.id);
        }
      }
    }
    for (const id of walked) {
      if (scope.has(id)) continue;
      const loaded = await loadWorkflow(root, id);
      if (!loaded.success) continue;
      if ((loaded.value.activities ?? []).some((a) => changedIds.has(a.id))) scope.add(id);
    }
  }
  return [...scope].sort();
}

/** The walked set, read from the test that owns it rather than restated here. */
export function walkedWorkflows(root: string): string[] {
  return readdirSync(root).filter((d) => existsSync(join(root, d, 'workflow.yaml'))).sort();
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const [base, head] = positional;
  if (!base) {
    process.stderr.write('usage: coverage-scope <base-corpus-ref> [head-corpus-ref] [--root <dir>]\n');
    process.exit(2);
  }
  const root = requireWorkflowsRoot(DEFAULT_ROOT);
  const { WALKED } = await import('../tests/e2e/walked-workflows.js');
  const changed = classifyChange(changedCorpusPaths(root, base, head));
  const scope = await coverageScope(root, changed, WALKED);
  process.stdout.write(scope.join('\n') + (scope.length ? '\n' : ''));
}
