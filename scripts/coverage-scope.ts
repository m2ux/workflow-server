/**
 * Which workflows a coverage walk has to cover for a given corpus change.
 *
 * The walk drives fourteen workflows and costs about 21 minutes, and most corpus changes
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
 * What this cannot see, and the caller must decide: a change to the walker or the policies
 * changes how EVERY workflow walks, so it needs the full set. This reads a corpus diff and the
 * walked ids the caller passes in `WF_WALKED`. A 100% rename is not a coverage change.
 *
 *   WF_WALKED=id,id npx tsx scripts/coverage-scope.ts <base-corpus-ref> [head-corpus-ref] [--root <dir>]
 *
 * Prints one workflow id per line, or nothing when the change cannot move coverage.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { workflowIdFromCorpusPath } from '../src/loaders/corpus-index.js';
import { parseDefinition } from '../src/utils/serialization.js';
import { requireWorkflowsRoot, defaultCorpusDest } from '../guards/workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/**
 * Paths from `git diff --name-status` that can move option coverage.
 *
 * A 100% rename leaves every definition byte where the walk already measured it, so the new path
 * is not a coverage change. A rename that also edits, or an add/modify/delete, is.
 */
export function pathsFromNameStatus(stdout: string): string[] {
  const paths: string[] = [];
  for (const line of stdout.split('\n')) {
    if (!line) continue;
    const [status, ...rest] = line.split('\t');
    if (!status || rest.length === 0) continue;
    if (status === 'R100') continue;
    paths.push(rest[rest.length - 1]!);
  }
  return paths;
}

/** Corpus paths that changed between two refs, as the corpus's own git reports them. */
export function changedCorpusPaths(root: string, base: string, head = 'HEAD'): string[] {
  const diff = spawnSync(
    'git',
    ['-C', root, 'diff', '--name-status', '-M100', `${base}..${head}`],
    { encoding: 'utf-8' },
  );
  if (diff.status !== 0) {
    throw new Error(`cannot diff corpus ${base}..${head}: ${diff.stderr.trim() || 'git failed'}`);
  }
  return pathsFromNameStatus(diff.stdout);
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
    const id = workflowIdFromCorpusPath(path);
    if (!id) continue;
    if (parts.some((part) => part === 'workflow.yaml' || part === 'workflow.yml')) {
      workflows.add(id);
      continue;
    }
    if (parts.includes('activities') && /\.ya?ml$/.test(parts[parts.length - 1]!)) activityFiles.add(path);
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
    //
    // The id comes from the file, not from a load of the workflow around it. A changed activity is a
    // fact the file carries, so whether its workflow loads is a different question — and it is
    // exactly the change most likely to stop one loading that this has to size.
    const changedIds = new Set<string>();
    for (const path of changed.activityFiles) {
      const id = activityIdAt(join(root, path));
      if (id !== undefined) changedIds.add(id);
    }
    for (const id of walked) {
      if (scope.has(id)) continue;
      const loaded = await loadWorkflow(root, id);
      // A workflow this cannot read is a workflow it cannot rule out. Skipping it narrows the walk
      // by exactly the workflow most likely to need one, and the walk reports the load failure where
      // a silently empty scope reports success having measured nothing.
      if (!loaded.success) { scope.add(id); continue; }
      if ((loaded.value.activities ?? []).some((a) => changedIds.has(a.id))) scope.add(id);
    }
  }
  return [...scope].sort();
}

/**
 * The activity id a file declares, read from the file.
 *
 * Undefined where the path holds no readable activity — a deletion, most often, the diff naming a
 * path the worktree no longer has.
 */
function activityIdAt(file: string): string | undefined {
  if (!existsSync(file)) return undefined;
  try {
    const parsed = parseDefinition(readFileSync(file, 'utf-8')) as { id?: unknown } | null;
    return typeof parsed?.id === 'string' ? parsed.id : undefined;
  } catch {
    return undefined;
  }
}

/** Comma-separated workflow ids, as the coverage walk and this CLI take them. */
export function parseWorkflowIds(raw: string | undefined): string[] {
  return (raw ?? '').split(',').map((s) => s.trim()).filter(Boolean);
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const [base, head] = positional;
  if (!base) {
    process.stderr.write('usage: WF_WALKED=id,id coverage-scope <base-corpus-ref> [head-corpus-ref] [--root <dir>]\n');
    process.exit(2);
  }
  const walked = parseWorkflowIds(process.env.WF_WALKED);
  if (walked.length === 0) {
    process.stderr.write('WF_WALKED is empty — pass the walked ids the corpus roster names\n');
    process.exit(2);
  }
  const root = requireWorkflowsRoot(DEFAULT_ROOT);
  const paths = changedCorpusPaths(root, base, head);
  const scope = await coverageScope(root, classifyChange(paths), walked);
  process.stdout.write(scope.join('\n') + (scope.length ? '\n' : ''));
}
