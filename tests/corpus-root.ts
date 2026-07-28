import { resolve } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The workflows corpus the test suite runs against.
 *
 * Tests used to pin `resolve(import.meta.dirname, '../workflows')` in fourteen places, so a suite run
 * from a worktree validated the main checkout's corpus while the guards validated the worktree's —
 * two measurements of two different trees, reported as one (issue #327 S2). This mirrors
 * `scripts/workflows-root.ts` precedence for the one knob tests need: `WORKFLOWS_DIR`.
 *
 * It also refuses to hand back an empty corpus. A suite pointed at nothing passes the checks that
 * iterate the corpus and fails the ones that load a named workflow, which reads as an unrelated
 * regression rather than "the corpus is not there".
 */
export function corpusRoot(): string {
  const root = process.env.WORKFLOWS_DIR
    ? resolve(process.env.WORKFLOWS_DIR)
    : resolve(import.meta.dirname, '../workflows');
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(
      `workflows corpus root '${root}' does not exist. In a fresh worktree run `
      + `'npm run worktree:provision' to check out the workflows submodule.`,
    );
  }
  const workflows = readdirSync(root).filter((d) => {
    const p = join(root, d);
    return statSync(p).isDirectory() && existsSync(join(p, 'workflow.yaml'));
  });
  if (workflows.length === 0) {
    throw new Error(
      `workflows corpus root '${root}' contains no workflow — an empty submodule checkout. `
      + `Run 'npm run worktree:provision'.`,
    );
  }
  return root;
}
