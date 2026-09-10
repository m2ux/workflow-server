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
