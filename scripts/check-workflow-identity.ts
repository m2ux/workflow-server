/**
 * check-workflow-identity — a workflow's directory name is the id its definition declares.
 *
 * Discovery keys a workflow on the directory that holds its `workflow.yaml`, and that name is what
 * every reference reaches it by: a cross-workflow activity ref (`work-package/02-design.yaml`), a
 * technique prefix (`prism::structural-analysis`), a fragment ref (`meta::confirm`), a launch
 * target. The `id` inside the file is what `list_workflows` publishes and what a session records.
 * The two are one identity, and nothing at run time reconciles them: a workflow whose folder and
 * declaration disagree is listed under one name and reachable only by the other.
 *
 * The corpus organises workflows into folders at whatever depth suits it, so a directory name reads
 * as a path segment rather than as an identifier — which is exactly the condition under which the
 * two drift silently. This guard is what keeps them together.
 *
 * Run: npx tsx scripts/check-workflow-identity.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertScanned, corpusWorkflows, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;

  for (const { id, manifest } of corpusWorkflows(root)) {
    let declared: unknown;
    try {
      declared = (parseDefinition(readFileSync(manifest, 'utf-8')) as { id?: unknown } | null)?.id;
    } catch {
      continue; // Unparsable definitions are validate-workflow-yaml's finding, not this guard's.
    }
    scanned++;
    if (typeof declared !== 'string' || declared === id) continue;
    findings.push({
      check: 'workflow-id-mismatch',
      site: relative(root, manifest),
      detail: `declares id '${declared}' but sits in a directory named '${id}' — references reach it `
        + `by its directory and list_workflows publishes its declaration, so the two names have to `
        + `match. Rename the directory to '${declared}', or change the declaration to '${id}'.`,
    });
  }

  assertScanned(scanned, 'workflow definitions', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('workflow-identity', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every workflow declares the id its directory names',
    remedy: 'rename the directory to the declared id, or declare the id the directory names',
  });
}
