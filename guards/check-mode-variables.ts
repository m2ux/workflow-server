/**
 * Mode-variable guard.
 *
 * Implement, review, and remediate each declare only names their activities read or write.
 * `is_review_mode` and `stealth_mode` are the combined workflow's flags. A mode workflow that
 * declares either flag, or any other name none of its activities reads or writes, fails.
 *
 * Legacy is the combined workflow and is outside this check.
 *
 *   npx tsx guards/check-mode-variables.ts [--root <workflows-dir>] [--json]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { assertScanned, corpusWorkflows, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** Workflow ids this guard holds. Legacy declares both mode flags and is not among them. */
export const MODE_WORKFLOW_IDS: ReadonlySet<string> = new Set(['implement', 'review', 'remediate']);

/** Flags of the combined workflow. A mode workflow does not declare them. */
export const MODE_FLAGS: ReadonlySet<string> = new Set(['is_review_mode', 'stealth_mode']);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function declaredNames(workflow: Record<string, unknown>): string[] {
  const variables = workflow.variables;
  if (!Array.isArray(variables)) return [];
  const names: string[] = [];
  for (const entry of variables) {
    const record = asRecord(entry);
    if (record && typeof record.name === 'string' && record.name.length > 0) names.push(record.name);
  }
  return names;
}

function writeName(entry: unknown): string | null {
  if (typeof entry === 'string' && entry.length > 0) return entry;
  const record = asRecord(entry);
  return record && typeof record.name === 'string' && record.name.length > 0 ? record.name : null;
}

/** Names an activity file lists under `variables.reads` or `variables.writes`. */
export function namesUsedByActivity(activity: Record<string, unknown>): string[] {
  const variables = asRecord(activity.variables);
  if (!variables) return [];
  const names: string[] = [];
  if (Array.isArray(variables.reads)) {
    for (const entry of variables.reads) {
      if (typeof entry === 'string' && entry.length > 0) names.push(entry);
    }
  }
  if (Array.isArray(variables.writes)) {
    for (const entry of variables.writes) {
      const name = writeName(entry);
      if (name) names.push(name);
    }
  }
  return names;
}

/**
 * Findings for one workflow's declarations against the names its activities use.
 * A workflow outside {@link MODE_WORKFLOW_IDS} has none.
 */
export function findingsForMode(
  workflowId: string,
  declared: readonly string[],
  used: ReadonlySet<string>,
): Finding[] {
  if (!MODE_WORKFLOW_IDS.has(workflowId)) return [];
  const findings: Finding[] = [];
  for (const name of declared) {
    if (MODE_FLAGS.has(name)) {
      findings.push({
        check: 'mode-flag',
        site: workflowId,
        detail: `'${name}' is a flag of the combined workflow`,
      });
      continue;
    }
    if (!used.has(name)) {
      findings.push({
        check: 'unused-variable',
        site: workflowId,
        detail: `'${name}' is declared and no activity reads or writes it`,
      });
    }
  }
  return findings;
}

function usedNamesIn(activitiesDir: string): Set<string> {
  const used = new Set<string>();
  if (!existsSync(activitiesDir)) return used;
  for (const entry of readdirSync(activitiesDir)) {
    if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
    const full = join(activitiesDir, entry);
    if (!statSync(full).isFile()) continue;
    const activity = asRecord(parseDefinition(readFileSync(full, 'utf8')));
    if (!activity) continue;
    for (const name of namesUsedByActivity(activity)) used.add(name);
  }
  return used;
}

/** Findings for the mode workflows in a corpus. Every workflow is inspected, so an empty mode set is a measurement. */
export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const workflows = corpusWorkflows(root, indexCorpus(root));
  assertScanned(workflows.length, 'workflows', root);
  const findings: Finding[] = [];
  for (const workflow of workflows) {
    const record = asRecord(parseDefinition(readFileSync(workflow.manifest, 'utf8')));
    if (!record) continue;
    findings.push(...findingsForMode(workflow.id, declaredNames(record), usedNamesIn(join(workflow.dir, 'activities'))));
  }
  return findings.sort((a, b) => (a.check + a.site + a.detail).localeCompare(b.check + b.site + b.detail));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('mode-variables', () => requireWorkflowsRoot(DEFAULT_ROOT), async (root) => collectFindings(root), {
    okMessage: 'implement, review, and remediate declare only names their activities read or write',
    remedy: 'drop the mode flag, or drop the variable no activity reads or writes',
  });
}
