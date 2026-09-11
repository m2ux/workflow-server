/**
 * check-workflow-identity — a workflow's directory name is the id its definition declares.
 *
 * Discovery keys a workflow on the directory that holds its `workflow.yaml`, and that name is what
 * every reference reaches it by: a cross-workflow activity ref (`work-package/02-design.yaml`), a
 * technique prefix (`prism::structural-analysis`), a fragment ref (`meta::confirm`), a launch
 * target. The `id` inside the file is what `list_workflows` publishes and what a session records.
 * The two are one identity. A directory whose definition names something else does not resolve,
 * under either name. This guard reports those refusals.
 *
 * Run: npx tsx guards/check-workflow-identity.ts [--root <workflows-dir>] [--json]
 */
import { relative, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { identityMismatches, indexCorpus } from '../src/loaders/corpus-index.js';
import { assertScanned, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const index = indexCorpus(root);
  const mismatched = identityMismatches(index);
  assertScanned(
    index.workflows.size,
    'workflow definitions',
    root,
  );
  return mismatched.map((clash) => ({
    check: 'workflow-id-mismatch',
    site: relative(root, clash.manifest),
    detail: `declares id '${clash.declared}' but sits in a directory named '${clash.directory}' — `
      + `references reach it by its directory and list_workflows publishes its declaration, so the `
      + `two names have to match. Rename the directory to '${clash.declared}', or change the `
      + `declaration to '${clash.directory}'.`,
  }));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('workflow-identity', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every workflow declares the id its directory names',
    remedy: 'rename the directory to the declared id, or declare the id the directory names',
  });
}
