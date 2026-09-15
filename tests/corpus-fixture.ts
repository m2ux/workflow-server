import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Make `<root>/<id>` a workflow the loaders can find, and return its directory.
 *
 * A workflow is a directory holding a `workflow.yaml`, so a fixture corpus that serves techniques,
 * resources or activities for an id declares that id the same way the real corpus does.
 */
export function writeWorkflowFixture(root: string, id: string): string {
  const dir = join(root, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'workflow.yaml'), `id: ${id}\nversion: 1.0.0\ntitle: ${id}\n`, 'utf-8');
  return dir;
}

/**
 * Declare every directory of a fixture corpus a workflow, and return the root. A guard fixture
 * builds the directories its case needs and calls this once, so the tree it hands the guard is one
 * the corpus walk discovers.
 */
export function declareFixtureWorkflows(root: string): string {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || existsSync(join(root, entry.name, 'workflow.yaml'))) continue;
    writeWorkflowFixture(root, entry.name);
  }
  return root;
}

/**
 * Make `<root>/<id>` a workflow that LOADS, not merely one discovery finds.
 *
 * `writeWorkflowFixture` writes the three lines a raw-reading guard needs, and a workflow with no
 * `initialActivity` and no graph is refused by the loader — so a guard that consumes the loader sees
 * a tree with no activities in it and reports clean for the wrong reason. A fixture for such a guard
 * declares the entry point and binds each activity in the graph.
 */
export function writeLoadableWorkflowFixture(root: string, id: string, activityIds: string[]): string {
  const dir = join(root, id);
  mkdirSync(dir, { recursive: true });
  const graph = activityIds.map((activityId) => `  ${activityId}: {}`).join('\n');
  writeFileSync(
    join(dir, 'workflow.yaml'),
    `id: ${id}\nversion: 1.0.0\ntitle: ${id}\ninitialActivity: ${activityIds[0] ?? 'start'}\ngraph:\n${graph}\n`,
    'utf-8',
  );
  return dir;
}

/** Write `<root>/<workflowId>/routines/<name>.yaml`, the home a routine reference resolves. */
export function writeRoutineFixture(root: string, workflowId: string, name: string, body: string): string {
  const dir = join(root, workflowId, 'routines');
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${name}.yaml`);
  writeFileSync(path, body, 'utf-8');
  return path;
}
