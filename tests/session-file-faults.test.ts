import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PLANNING_RELATIVE_DIR,
  computeSessionIndex,
  describeSessionStoreError,
  ensurePlanningFolder,
  loadSessionForTool,
  writeSessionFile,
} from '../src/utils/session/index.js';
import { createInitialSessionFile } from '../src/schema/session.schema.js';

/**
 * A sealed session file the server can no longer read as a session raises a code of its own, not
 * SEAL_MISMATCH: the seal verifies, so a remedy about the signing key would send the reader the
 * wrong way. Each case writes a file under a valid seal and loads it by index.
 */
describe('session file faults under a valid seal', () => {
  let workspace: string;
  const loadOpts = { planningRelativeDir: PLANNING_RELATIVE_DIR };

  beforeAll(async () => { workspace = await mkdtemp(join(tmpdir(), 'session-faults-')); });
  afterAll(async () => { await rm(workspace, { recursive: true, force: true }); });

  async function sealed(slug: string, edit: (state: Record<string, unknown>) => void): Promise<string> {
    const folder = await ensurePlanningFolder(workspace, slug);
    const sessionIndex = await computeSessionIndex(folder);
    const state = createInitialSessionFile({ sessionIndex, workflowId: 'wf', workflowVersion: '1.0.0', agentId: 'orchestrator' }) as unknown as Record<string, unknown>;
    edit(state);
    await writeSessionFile(folder, state);
    return sessionIndex;
  }

  it('raises SESSION_INVALID for a file the session schema rejects', async () => {
    const index = await sealed('2026-09-28-schema-rejected', (state) => {
      (state['history'] as unknown[]).push({ timestamp: new Date().toISOString(), type: 'loop_started' });
    });
    const failure = await loadSessionForTool(workspace, index, loadOpts).catch((e: unknown) => e);
    expect(failure).toMatchObject({ code: 'SESSION_INVALID' });
    expect(describeSessionStoreError(failure)).toContain('cannot be read as a session');
  });

  it('raises SESSION_OUTDATED for a record that predates the frontier', async () => {
    const index = await sealed('2026-09-28-pre-frontier', (state) => {
      delete state['frontier'];
      state['currentActivity'] = 'draft';
    });
    const failure = await loadSessionForTool(workspace, index, loadOpts).catch((e: unknown) => e);
    expect(failure).toMatchObject({ code: 'SESSION_OUTDATED' });
    expect(describeSessionStoreError(failure)).toContain('Start a fresh session');
  });
});
