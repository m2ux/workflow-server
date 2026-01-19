import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listWorkflows, loadWorkflow, getPhase, getCheckpoint, validateTransition } from '../loaders/workflow-loader.js';
import { withAuditLog } from '../logging.js';

export function registerWorkflowTools(server: McpServer, config: ServerConfig): void {
  server.tool('list_workflows', 'List all available workflow definitions', {},
    withAuditLog('list_workflows', async () => ({ content: [{ type: 'text', text: JSON.stringify(await listWorkflows(config.workflowDir), null, 2) }] })));

  server.tool('get_workflow', 'Get a complete workflow definition by ID', { workflow_id: z.string() },
    withAuditLog('get_workflow', async ({ workflow_id }) => {
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
    }));

  server.tool('validate_transition', 'Validate if a transition between phases is allowed',
    { workflow_id: z.string(), from_phase: z.string(), to_phase: z.string() },
    withAuditLog('validate_transition', async ({ workflow_id, from_phase, to_phase }) => {
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      return { content: [{ type: 'text', text: JSON.stringify(validateTransition(result.value, from_phase, to_phase), null, 2) }] };
    }));

  server.tool('get_phase', 'Get details of a specific phase', { workflow_id: z.string(), phase_id: z.string() },
    withAuditLog('get_phase', async ({ workflow_id, phase_id }) => {
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const phase = getPhase(result.value, phase_id);
      if (!phase) throw new Error(`Phase not found: ${phase_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(phase, null, 2) }] };
    }));

  server.tool('get_checkpoint', 'Get checkpoint details', { workflow_id: z.string(), phase_id: z.string(), checkpoint_id: z.string() },
    withAuditLog('get_checkpoint', async ({ workflow_id, phase_id, checkpoint_id }) => {
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, phase_id, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpoint_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(checkpoint, null, 2) }] };
    }));

  server.tool('health_check', 'Check server health', {},
    withAuditLog('health_check', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      return { content: [{ type: 'text', text: JSON.stringify({ status: 'healthy', server: config.serverName, version: config.serverVersion, workflows_available: workflows.length, uptime_seconds: Math.floor(process.uptime()) }, null, 2) }] };
    }));
}
