import { z } from 'zod';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { NestedWorkflowStateSchema, StateSaveFileSchema } from '../schema/state.schema.js';
import type { StateSaveFile } from '../schema/state.schema.js';
import { decodeToonRaw, encodeToon } from '../utils/toon.js';
import { withAuditLog } from '../logging.js';
import { decodeSessionToken, advanceToken, sessionTokenParam, assertCheckpointsResolved } from '../utils/session.js';
import { buildValidation, validateWorkflowConsistency } from '../utils/validation.js';
import { getOrCreateServerKey, encryptToken, decryptToken } from '../utils/crypto.js';

const STATE_FILENAME = 'workflow-state.toon';
const SESSION_TOKEN_KEY = 'session_token';
const SESSION_TOKEN_ENCRYPTED_KEY = '_session_token_encrypted';

/** @internal Exported for testing. Validates that a path resolves within the workspace root. */
export function validateStatePath(inputPath: string, workspaceRoot?: string): string {
  const root = workspaceRoot ?? process.cwd();
  const resolved = resolve(inputPath);
  if (resolved !== root && !resolved.startsWith(root + sep)) {
    throw new Error(`Path validation failed: "${inputPath}" resolves outside the workspace root ("${root}")`);
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
    'Save the current workflow execution state to a TOON file for resumption in a later session. Writes a workflow-state.toon file to the specified planning folder. The state JSON must conform to the NestedWorkflowStateSchema (including workflowId, currentActivity, completedActivities, variables, and status). Session tokens in the state are automatically encrypted at rest. Use this before ending a session that should be resumable.',
    {
      ...sessionTokenParam,
      state: z.string().describe('Workflow state as a JSON string (validated against NestedWorkflowStateSchema)'),
      planning_folder_path: z.string().describe('Absolute or relative path to the planning folder'),
      description: z.string().optional().describe('Human-readable description of the save point'),
    },
    withAuditLog('save_state', async ({ session_token, state: stateJson, planning_folder_path, description }) => {
      const token = await decodeSessionToken(session_token);
      assertCheckpointsResolved(token);

      let parsed: unknown;
      try {
        parsed = JSON.parse(stateJson);
      } catch (e) {
        throw new Error(`Invalid JSON in state parameter: ${e instanceof Error ? e.message : String(e)}`);
      }
      const stateResult = NestedWorkflowStateSchema.safeParse(parsed);
      if (!stateResult.success) {
        throw new Error(`State validation failed: ${stateResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      }
      const state = stateResult.data;

      const validatedFolder = validateStatePath(planning_folder_path);

      let sessionTokenEncrypted = false;
      if (typeof state.variables[SESSION_TOKEN_KEY] === 'string') {
        const key = await getOrCreateServerKey();
        state.variables[SESSION_TOKEN_KEY] = encryptToken(state.variables[SESSION_TOKEN_KEY] as string, key);
        sessionTokenEncrypted = true;
      }
      delete state.variables[SESSION_TOKEN_ENCRYPTED_KEY];

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
      const toonContent = encodeToon(saveFile as Record<string, unknown>);
      await writeFile(filePath, toonContent, 'utf-8');

      const advancedToken = await advanceToken(session_token);
      const summary = {
        saved: true,
        path: filePath,
        id: saveFile.id,
        workflowId: state.workflowId,
        currentActivity: state.currentActivity,
        completedActivities: state.completedActivities.length,
        triggeredWorkflows: state.triggeredWorkflows.length,
        status: state.status,
        session_token: advancedToken,
        deprecated: 'save_state is deprecated. Use the state-management skill to persist state via agent file operations. The session token + get_trace provide all data needed for resume and audit.',
      };
      const validation = buildValidation(
        validateWorkflowConsistency(token, state.workflowId),
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(summary) }],
        _meta: { session_token: advancedToken, validation, deprecated: 'save_state is deprecated. Use agent-managed persistence with the session token and get_trace.' },
      };
    }, traceOpts),
  );

  server.tool(
    'restore_state',
    'Restore workflow execution state from a previously saved workflow-state.toon file. Returns the full nested state object including workflow ID, current activity, completed activities, variables, and status — everything needed to resume where the previous session left off. Encrypted session tokens are automatically decrypted. The state file must have been created by save_state with the current server key; key rotation invalidates saved tokens.',
    {
      ...sessionTokenParam,
      file_path: z.string().describe('Path to the workflow-state.toon file'),
    },
    withAuditLog('restore_state', async ({ session_token, file_path }) => {
      const token = await decodeSessionToken(session_token);
      assertCheckpointsResolved(token);

      const validatedPath = validateStatePath(file_path);
      const content = await readFile(validatedPath, 'utf-8');
      const decoded = decodeToonRaw(content);
      const result = StateSaveFileSchema.safeParse(decoded);
      if (!result.success) {
        throw new Error(`State file validation failed: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      }

      const restored = result.data;
      if (restored.sessionTokenEncrypted && typeof restored.state.variables[SESSION_TOKEN_KEY] === 'string') {
        try {
          const key = await getOrCreateServerKey();
          restored.state.variables[SESSION_TOKEN_KEY] = decryptToken(restored.state.variables[SESSION_TOKEN_KEY] as string, key);
        } catch (decryptErr) {
          const cause = decryptErr instanceof Error ? decryptErr.message : String(decryptErr);
          throw new Error(
            `Failed to decrypt session token from saved state (${cause}). ` +
            'Possible causes: server key rotation (~/.workflow-server/secret was regenerated), ' +
            'corrupted state file, or manually edited save. The saved state must be re-created with the current key.',
          );
        }
      }

      const advancedToken = await advanceToken(session_token);
      const validation = buildValidation(
        validateWorkflowConsistency(token, restored.state.workflowId),
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ ...restored, session_token: advancedToken, deprecated: 'restore_state is deprecated. Use start_session with a saved session_token to resume. Variables and trace are managed by the agent via the state-management skill.' }) }],
        _meta: { session_token: advancedToken, validation, deprecated: 'restore_state is deprecated. Use start_session(session_token=saved_token) to resume.' },
      };
    }, traceOpts),
  );
}
