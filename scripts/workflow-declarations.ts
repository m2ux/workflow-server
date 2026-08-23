/**
 * A workflow's declared variables, as the guards that read the corpus off disk see them (#493).
 *
 * A variable is declared in one of two places: the workflow file, for a session fact or policy
 * spanning activities, and an activity's own `variables.writes`, contributed to every workflow
 * whose graph includes that activity. A guard asking "does this workflow declare `x`?" therefore
 * has to read both, and for an included activity it has to read the file where that activity
 * lives. This assembles the same set the loader folds at runtime, without loading the workflow.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseDefinition } from '../src/utils/serialization.js';
import { mergeActivityVariables, type VariableContributor } from '../src/utils/activity-variables.js';
import type { VariableDefinition } from '../src/schema/variable.schema.js';

/** Every activity file under a directory, nested library subdirectories included. */
function activityFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...activityFiles(path));
    else if (/\.ya?ml$/.test(entry)) out.push(path);
  }
  return out;
}

function readContributor(path: string): VariableContributor | null {
  try {
    const parsed = parseDefinition(readFileSync(path, 'utf-8')) as VariableContributor | null;
    return parsed && typeof parsed.id === 'string' ? parsed : null;
  } catch {
    return null; // Structural errors are validate-activities' finding, not this module's.
  }
}

/**
 * The declarations one workflow runs with, keyed by name: its file's own, plus those of the
 * activities in its `activities/` directory and of any it includes from another workflow.
 */
export function declaredVariables(root: string, workflowId: string): Map<string, VariableDefinition> {
  const workflowYaml = join(root, workflowId, 'workflow.yaml');
  if (!existsSync(workflowYaml)) return new Map();
  let own: VariableDefinition[] = [];
  let refs: string[] = [];
  try {
    const parsed = parseDefinition(readFileSync(workflowYaml, 'utf-8')) as
      { variables?: VariableDefinition[]; activities?: unknown[] } | null;
    own = Array.isArray(parsed?.variables) ? parsed.variables : [];
    refs = (parsed?.activities ?? []).filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return new Map();
  }

  const contributors: VariableContributor[] = [];
  for (const path of activityFiles(join(root, workflowId, 'activities'))) {
    const contributor = readContributor(path);
    if (contributor) contributors.push(contributor);
  }
  // An included activity lives in the workflow that authored it: `work-package/02-design.yaml`.
  for (const ref of refs) {
    const parts = ref.split('/');
    if (parts.length < 2) continue;
    const filename = parts.slice(1).join('/');
    const path = filename.startsWith('activities/')
      ? join(root, parts[0]!, filename)
      : join(root, parts[0]!, 'activities', filename);
    if (!existsSync(path)) continue;
    const contributor = readContributor(path);
    if (contributor) contributors.push(contributor);
  }

  return new Map(mergeActivityVariables(own, contributors).variables.map((v) => [v.name, v]));
}
