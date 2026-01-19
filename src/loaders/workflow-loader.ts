import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Workflow, safeValidateWorkflow } from '../schema/workflow.schema.js';
import { type Result, ok, err } from '../result.js';
import { WorkflowNotFoundError, WorkflowValidationError } from '../errors.js';
import { logInfo, logError } from '../logging.js';

export interface WorkflowManifestEntry { id: string; title: string; version: string; description?: string | undefined; }

export async function loadWorkflow(workflowDir: string, workflowId: string): Promise<Result<Workflow, WorkflowNotFoundError | WorkflowValidationError>> {
  const filePath = join(workflowDir, `${workflowId}.json`);
  if (!existsSync(filePath)) return err(new WorkflowNotFoundError(workflowId));
  try {
    const content = await readFile(filePath, 'utf-8');
    const result = safeValidateWorkflow(JSON.parse(content));
    if (!result.success) return err(new WorkflowValidationError(workflowId, result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)));
    logInfo('Workflow loaded', { workflowId, version: result.data.version });
    return ok(result.data);
  } catch (error) {
    logError('Failed to load workflow', error instanceof Error ? error : undefined, { workflowId });
    return err(new WorkflowValidationError(workflowId, [error instanceof Error ? error.message : 'Unknown error']));
  }
}

export async function listWorkflows(workflowDir: string): Promise<WorkflowManifestEntry[]> {
  if (!existsSync(workflowDir)) return [];
  try {
    const files = await readdir(workflowDir);
    const manifests: WorkflowManifestEntry[] = [];
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const result = await loadWorkflow(workflowDir, basename(file, '.json'));
      if (result.success) manifests.push({ id: result.value.id, title: result.value.title, version: result.value.version, description: result.value.description });
    }
    return manifests;
  } catch { return []; }
}

export function getPhase(workflow: Workflow, phaseId: string) { return workflow.phases.find(p => p.id === phaseId); }
export function getCheckpoint(workflow: Workflow, phaseId: string, checkpointId: string) { return getPhase(workflow, phaseId)?.checkpoints?.find(c => c.id === checkpointId); }

export function getValidTransitions(workflow: Workflow, fromPhaseId: string): string[] {
  const phase = getPhase(workflow, fromPhaseId);
  if (!phase) return [];
  const transitions: string[] = [];
  phase.transitions?.forEach(t => transitions.push(t.to));
  phase.decisions?.forEach(d => d.branches.forEach(b => transitions.push(b.transitionTo)));
  phase.checkpoints?.forEach(c => c.options.forEach(o => o.effect?.transitionTo && transitions.push(o.effect.transitionTo)));
  return [...new Set(transitions)];
}

export function validateTransition(workflow: Workflow, fromPhaseId: string, toPhaseId: string): { valid: boolean; reason?: string } {
  if (!getPhase(workflow, fromPhaseId)) return { valid: false, reason: `Source phase not found: ${fromPhaseId}` };
  if (!getPhase(workflow, toPhaseId)) return { valid: false, reason: `Target phase not found: ${toPhaseId}` };
  const valid = getValidTransitions(workflow, fromPhaseId);
  if (!valid.includes(toPhaseId)) return { valid: false, reason: `No valid transition. Valid: ${valid.join(', ') || 'none'}` };
  return { valid: true };
}
