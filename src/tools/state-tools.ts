import { z } from 'zod';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NestedWorkflowStateSchema, StateSaveFileSchema } from '../schema/state.schema.js';
import type { StateSaveFile } from '../schema/state.schema.js';
import { decodeToon, encodeToon } from '../utils/toon.js';
import { withAuditLog } from '../logging.js';
import { sessionTokenParam } from '../utils/session.js';
import { getOrCreateServerKey, encryptToken, decryptToken } from '../utils/crypto.js';

const STATE_FILENAME = 'workflow-state.toon';

function generateSaveId(): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `state-${ts}`;
}

export function registerStateTools(server: McpServer): void {
  server.tool(
    'save_state',
    'Save workflow execution state to a TOON file in the planning folder for cross-session resumption. Accepts the state as a JSON string with support for nested child workflow states in triggeredWorkflows.',
    {
      ...sessionTokenParam,
      state: z.string().describe('Workflow state as a JSON string (validated against NestedWorkflowStateSchema)'),
      planning_folder_path: z.string().describe('Absolute or relative path to the planning folder'),
      description: z.string().optional().describe('Human-readable description of the save point'),
    },
    withAuditLog('save_state', async ({ state: stateJson, planning_folder_path, description }) => {
      const parsed = JSON.parse(stateJson);
      const stateResult = NestedWorkflowStateSchema.safeParse(parsed);
      if (!stateResult.success) {
        throw new Error(`State validation failed: ${stateResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      }
      const state = stateResult.data;

      if (typeof state.variables['session_token'] === 'string') {
        const key = await getOrCreateServerKey();
        state.variables['session_token'] = encryptToken(state.variables['session_token'] as string, key);
        state.variables['_session_token_encrypted'] = true;
      }

      const saveFile: StateSaveFile = {
        id: generateSaveId(),
        savedAt: new Date().toISOString(),
        description,
        workflowId: state.workflowId,
        workflowVersion: state.workflowVersion,
        planningFolder: planning_folder_path,
        state,
      };

      const filePath = join(planning_folder_path, STATE_FILENAME);
      await mkdir(dirname(filePath), { recursive: true });
      const toonContent = encodeToon(saveFile as unknown as Record<string, unknown>);
      await writeFile(filePath, toonContent, 'utf-8');

      const summary = {
        saved: true,
        path: filePath,
        id: saveFile.id,
        workflowId: state.workflowId,
        currentActivity: state.currentActivity,
        completedActivities: state.completedActivities.length,
        triggeredWorkflows: state.triggeredWorkflows.length,
        status: state.status,
      };
      return { content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }] };
    }),
  );

  server.tool(
    'restore_state',
    'Restore workflow execution state from a previously saved TOON file. Returns the full nested state object for resumption.',
    {
      ...sessionTokenParam,
      file_path: z.string().describe('Path to the workflow-state.toon file'),
    },
    withAuditLog('restore_state', async ({ file_path }) => {
      const content = await readFile(file_path, 'utf-8');
      const decoded = decodeToon<Record<string, unknown>>(content);
      const result = StateSaveFileSchema.safeParse(decoded);
      if (!result.success) {
        throw new Error(`State file validation failed: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      }

      const restored = result.data;
      if (restored.state.variables['_session_token_encrypted'] && typeof restored.state.variables['session_token'] === 'string') {
        const key = await getOrCreateServerKey();
        restored.state.variables['session_token'] = decryptToken(restored.state.variables['session_token'] as string, key);
        delete restored.state.variables['_session_token_encrypted'];
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(restored, null, 2) }] };
    }),
  );
}
