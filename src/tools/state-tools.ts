import { z } from 'zod';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { NestedWorkflowStateSchema, StateSaveFileSchema } from '../schema/state.schema.js';
import type { StateSaveFile } from '../schema/state.schema.js';
import { decodeToon, encodeToon } from '../utils/toon.js';
import { withAuditLog } from '../logging.js';
import { decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';
import { buildValidation } from '../utils/validation.js';
import { getOrCreateServerKey, encryptToken, decryptToken } from '../utils/crypto.js';

const STATE_FILENAME = 'workflow-state.toon';

/** @internal Exported for testing. Validates that a path resolves within process.cwd(). */
export function validateStatePath(inputPath: string): string {
  const root = process.cwd();
  const resolved = resolve(inputPath);
  if (resolved !== root && !resolved.startsWith(root + sep)) {
    throw new Error(`Path validation failed: "${inputPath}" resolves outside the workspace root`);
  }
  return resolved;
}

function generateSaveId(): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `state-${ts}`;
}

export function registerStateTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

  server.tool(
    'save_state',
    'Save workflow execution state to a TOON file in the planning folder for cross-session resumption.',
    {
      ...sessionTokenParam,
      state: z.string().describe('Workflow state as a JSON string (validated against NestedWorkflowStateSchema)'),
      planning_folder_path: z.string().describe('Absolute or relative path to the planning folder'),
      description: z.string().optional().describe('Human-readable description of the save point'),
    },
    withAuditLog('save_state', async ({ session_token, state: stateJson, planning_folder_path, description }) => {
      await decodeSessionToken(session_token);

      const parsed = JSON.parse(stateJson);
      const stateResult = NestedWorkflowStateSchema.safeParse(parsed);
      if (!stateResult.success) {
        throw new Error(`State validation failed: ${stateResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      }
      const state = stateResult.data;

      const validatedFolder = validateStatePath(planning_folder_path);

      let sessionTokenEncrypted = false;
      if (typeof state.variables['session_token'] === 'string') {
        const key = await getOrCreateServerKey();
        state.variables['session_token'] = encryptToken(state.variables['session_token'] as string, key);
        sessionTokenEncrypted = true;
      }
      delete state.variables['_session_token_encrypted'];

      const saveFile: StateSaveFile = {
        id: generateSaveId(),
        savedAt: new Date().toISOString(),
        description,
        workflowId: state.workflowId,
        workflowVersion: state.workflowVersion,
        planningFolder: validatedFolder,
        sessionTokenEncrypted,
        state,
      };

      const filePath = join(validatedFolder, STATE_FILENAME);
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
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }],
        _meta: { session_token: await advanceToken(session_token), validation: buildValidation() },
      };
    }, traceOpts),
  );

  server.tool(
    'restore_state',
    'Restore workflow execution state from a previously saved TOON file. Returns the full nested state object for resumption.',
    {
      ...sessionTokenParam,
      file_path: z.string().describe('Path to the workflow-state.toon file'),
    },
    withAuditLog('restore_state', async ({ session_token, file_path }) => {
      await decodeSessionToken(session_token);

      const validatedPath = validateStatePath(file_path);
      const content = await readFile(validatedPath, 'utf-8');
      const decoded = decodeToon<Record<string, unknown>>(content);
      const result = StateSaveFileSchema.safeParse(decoded);
      if (!result.success) {
        throw new Error(`State file validation failed: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      }

      const restored = result.data;
      if (restored.sessionTokenEncrypted && typeof restored.state.variables['session_token'] === 'string') {
        const key = await getOrCreateServerKey();
        restored.state.variables['session_token'] = decryptToken(restored.state.variables['session_token'] as string, key);
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(restored, null, 2) }],
        _meta: { session_token: await advanceToken(session_token), validation: buildValidation() },
      };
    }, traceOpts),
  );
}
