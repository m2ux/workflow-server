/**
 * Resolve the workflows corpus root for the guard scripts.
 *
 * By default the guards validate the repo's own `../workflows` checkout. That is the wrong
 * target when edits live in a dedicated git worktree: the guards would validate the stale
 * main copy, not the change under review (issue #160 follow-up #1). Pass `--root <path>` or
 * `--root=<path>`, or set the `WORKFLOWS_DIR` env var, to point the guards at a worktree's
 * workflows directory instead. `validate-workflow-yaml.ts` already accepts a path argument;
 * this brings the corpus-wide guards (check-all-refs, check-binding-fidelity) to parity.
 *
 * Precedence: `--root` flag > `WORKFLOWS_DIR` env var > the built-in default.
 */
import { resolve } from 'node:path';

export function resolveWorkflowsRoot(defaultDir: string, argv: string[] = process.argv.slice(2)): string {
  const eq = argv.find((a) => a.startsWith('--root='));
  if (eq) return resolve(eq.slice('--root='.length));
  const flag = argv.indexOf('--root');
  if (flag !== -1 && argv[flag + 1]) return resolve(argv[flag + 1]!);
  if (process.env.WORKFLOWS_DIR) return resolve(process.env.WORKFLOWS_DIR);
  return defaultDir;
}
