/**
 * A workflow's declared variables, as the guards that read the corpus off disk see them (#493).
 *
 * A variable is declared in one of two places: the workflow file, for a session fact or policy
 * spanning activities, and an activity's own `variables.writes`, contributed to every workflow
 * whose graph includes that activity. A guard asking "does this workflow declare `x`?" therefore
 * has to read both, and for an included activity it has to read the file where that activity
 * lives. This assembles the same set the loader folds at runtime, without loading the workflow.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseDefinition } from '../src/utils/serialization.js';
import { type CorpusSource, workflowSubdir } from '../src/loaders/corpus-index.js';
import { mergeActivityVariables, type VariableContributor } from '../src/utils/activity-variables.js';
import { corpusFiles } from './workflows-root.js';
import type { VariableDefinition } from '../src/schema/variable.schema.js';

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
export function declaredVariables(
  root: string,
  workflowId: string,
  source: CorpusSource = root,
): Map<string, VariableDefinition> {
  const workflowYaml = workflowSubdir(source, workflowId, 'workflow.yaml');
  if (!workflowYaml || !existsSync(workflowYaml)) return new Map();
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
  // Every activity file, nested library subdirectories included.
  const activities = workflowSubdir(source, workflowId, 'activities');
  for (const path of activities ? corpusFiles(activities, (name) => /\.ya?ml$/.test(name)) : []) {
    const contributor = readContributor(path);
    if (contributor) contributors.push(contributor);
  }
  // An included activity lives in the workflow that authored it: `work-package/02-design.yaml`.
  for (const ref of refs) {
    const parts = ref.split('/');
    if (parts.length < 2) continue;
    const filename = parts.slice(1).join('/');
    const path = workflowSubdir(source, parts[0]!, filename.startsWith('activities/') ? filename : join('activities', filename));
    if (!path || !existsSync(path)) continue;
    const contributor = readContributor(path);
    if (contributor) contributors.push(contributor);
  }

  return new Map(mergeActivityVariables(own, contributors).variables.map((v) => [v.name, v]));
}
