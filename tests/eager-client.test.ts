import { describe, it, expect, afterEach } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { createHarness, parseToolResponse, type Harness } from './e2e/harness.js';
import { liveCorpusRoot } from './corpus-root.js';
import { planningFolderPath } from './session-ops.js';
import { createInitialSessionFile } from '../src/schema/session.schema.js';
import { tryEagerClientDispatch } from '../src/utils/eager-client.js';
import { resolveOpeningIntent } from '../src/utils/opening-intent.js';
import { scanSavedClientSessions } from '../src/utils/scan-saved-clients.js';
import { ensurePlanningFolder, setPlanningRelativeDir, PLANNING_RELATIVE_DIR, writeSessionFile } from '../src/utils/session/index.js';
import { mkdtemp, rm } from 'node:fs/promises';

const execFileAsync = promisify(execFile);

const QUERY =
  'At present the time taken from first prompt to dispatching the client workflow with workflow server is too long. I suspect a lot of the preamble can be scripted with Python or TypeScript, e.g. workflow discovery. Workflows have embedded keywords to aid discovery. Maybe we can add a discover-workflow tool that permits fuzzy discovery based upon keywords provided by an agent. Measure time to dispatch client and use this as a reference for optimisation. Consider other novel techniques also like scripts, new workflow-server MCP tools, or other.';

async function originCheckout(workspaceDir: string): Promise<string> {
  const checkout = join(workspaceDir, 'workflow-server');
  mkdirSync(checkout, { recursive: true });
  await execFileAsync('git', ['init', checkout]);
  await execFileAsync('git', ['-C', checkout, 'config', 'user.email', 'test@example.com']);
  await execFileAsync('git', ['-C', checkout, 'config', 'user.name', 'test']);
  await execFileAsync('git', ['-C', checkout, 'remote', 'add', 'origin', 'https://github.com/acme/workflow-server.git']);
  return checkout;
}

describe.skipIf(!liveCorpusRoot())('eager client dispatch', () => {
  let harness: Harness | undefined;

  afterEach(async () => {
    await harness?.close();
    harness = undefined;
  });

  it('tryEagerClientDispatch embeds work-package when the id is pinned', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'eager-'));
    const parent = createInitialSessionFile({
      sessionIndex: 'AAAAAA',
      workflowId: 'meta',
      workflowVersion: '6.4.0',
      agentId: 'orchestrator',
    });
    const result = await tryEagerClientDispatch({
      parent,
      parentFolder: dir,
      workflowDir: liveCorpusRoot()!,
      workflowId: 'work-package',
      bagFacts: { component_path: '.' },
    });
    expect(result.client.workflow.id).toBe('work-package');
    expect(result.client.workflow.initialActivity).toBe('start-work-package');
    expect(result.parent.variables?.['component_path']).toBe('.');
    expect(existsSync(join(dir, 'session.json'))).toBe(false);
  });

  it('start_session on durable meta with the baseline request returns the client', async () => {
    harness = await createHarness();
    const checkout = await originCheckout(harness.workspaceDir);
    const result = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'meta',
        agent_id: 'orchestrator',
        working_directory: checkout,
        user_request: QUERY,
      },
    });
    const body = parseToolResponse(result);
    const client = body.client as { session_index?: string; workflow?: { id?: string; initialActivity?: string } } | undefined;
    expect(client?.workflow?.id).toBe('work-package');
    expect(client?.workflow?.initialActivity).toBe('start-work-package');
    expect(client?.session_index).toMatch(/^[A-Z2-7]{6}$/);
    expect(body.session_index).toMatch(/^[A-Z2-7]{6}$/);
    expect(body.session_index).not.toBe(client?.session_index);
  });

  it('returns workflow-selection when durable meta has no user_request and no pin', async () => {
    harness = await createHarness();
    const checkout = await originCheckout(harness.workspaceDir);
    const result = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'meta',
        agent_id: 'orchestrator',
        working_directory: checkout,
      },
    });
    const body = parseToolResponse(result);
    expect(body.session_index).toBeUndefined();
    expect(body.decision).toBe('workflow-selection');
  });

  it('opens the client from a branch-named working_directory', async () => {
    harness = await createHarness();
    const checkout = join(harness.workspaceDir, 'feat', 'start-session-computed-bag');
    mkdirSync(checkout, { recursive: true });
    await execFileAsync('git', ['init', checkout]);
    await execFileAsync('git', ['-C', checkout, 'config', 'user.email', 'test@example.com']);
    await execFileAsync('git', ['-C', checkout, 'config', 'user.name', 'test']);
    await execFileAsync('git', ['-C', checkout, 'remote', 'add', 'origin', 'https://github.com/acme/workflow-server.git']);
    const result = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'meta',
        agent_id: 'orchestrator',
        working_directory: checkout,
        user_request: QUERY,
      },
    });
    const body = parseToolResponse(result);
    expect(body.decision).toBeUndefined();
    expect((body.client as { workflow?: { id?: string } } | undefined)?.workflow?.id).toBe('work-package');
  });

  it('tryEagerClientDispatch throws when the client workflow cannot be loaded', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'eager-missing-'));
    const parent = createInitialSessionFile({
      sessionIndex: 'AAAAAA',
      workflowId: 'meta',
      workflowVersion: '7.0.0',
      agentId: 'orchestrator',
    });
    await expect(tryEagerClientDispatch({
      parent,
      parentFolder: dir,
      workflowDir: liveCorpusRoot()!,
      workflowId: 'no-such-workflow',
    })).rejects.toThrow();
    expect(existsSync(join(dir, 'session.json'))).toBe(false);
  });

  it('tryEagerClientDispatch throws when the parent is not meta', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'eager-not-meta-'));
    const parent = createInitialSessionFile({
      sessionIndex: 'AAAAAA',
      workflowId: 'work-package',
      workflowVersion: '4.1.0',
      agentId: 'orchestrator',
    });
    await expect(tryEagerClientDispatch({
      parent,
      parentFolder: dir,
      workflowDir: liveCorpusRoot()!,
      workflowId: 'work-package',
    })).rejects.toThrow(/not meta/);
  });

  it('returns resume-session when the request states resume intent and a client exists', async () => {
    harness = await createHarness();
    const saved = planningFolderPath(harness.workspaceDir, '2026-09-14-saved-wp');
    await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'work-package',
        agent_id: 'orchestrator',
        planning_folder: saved,
        user_request: QUERY,
      },
    });
    const checkout = await originCheckout(harness.workspaceDir);
    const result = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'meta',
        agent_id: 'orchestrator',
        working_directory: checkout,
        user_request: 'resume the work package where we left off',
      },
    });
    const body = parseToolResponse(result);
    expect(body.session_index).toBeUndefined();
    expect(body.decision).toBe('resume-session');
    expect(Array.isArray(body.candidates)).toBe(true);
  });

  it('returns workflow-selection when target_workflow_id is unknown', async () => {
    harness = await createHarness();
    const checkout = await originCheckout(harness.workspaceDir);
    const result = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'meta',
        agent_id: 'orchestrator',
        working_directory: checkout,
        user_request: QUERY,
        target_workflow_id: 'no-such-workflow',
      },
    });
    const body = parseToolResponse(result);
    expect(body.session_index).toBeUndefined();
    expect(body.decision).toBe('workflow-selection');
  });

  it('embeds a new client when fresh is set despite resume phrasing', async () => {
    harness = await createHarness();
    const checkout = await originCheckout(harness.workspaceDir);
    const result = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'meta',
        agent_id: 'orchestrator',
        working_directory: checkout,
        user_request: 'resume the work package where we left off',
        fresh: true,
      },
    });
    const body = parseToolResponse(result);
    expect(body.client).toBeDefined();
    expect((body.client as { workflow?: { id?: string } }).workflow?.id).toBe('work-package');
  });
});

describe.skipIf(!liveCorpusRoot())('resolveOpeningIntent', () => {
  it('embeds work-package for the baseline request', async () => {
    const opening = await resolveOpeningIntent({
      userRequest: QUERY,
      workflowDir: liveCorpusRoot()!,
      planningRootDir: mkdtempSync(join(tmpdir(), 'opening-')),
    });
    expect(opening).toMatchObject({ kind: 'embed', workflowId: 'work-package' });
  });

  it('yields workflow-selection when the pin is unknown', async () => {
    const opening = await resolveOpeningIntent({
      userRequest: QUERY,
      workflowDir: liveCorpusRoot()!,
      planningRootDir: mkdtempSync(join(tmpdir(), 'opening-')),
      targetWorkflowId: 'no-such-workflow',
    });
    expect(opening.kind).toBe('decision');
    if (opening.kind === 'decision') {
      expect(opening.decision).toBe('workflow-selection');
    }
  });
});

describe('scanSavedClientSessions', () => {
  it('finds a top-level client session by workflow id', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'scan-saved-'));
    try {
      setPlanningRelativeDir(PLANNING_RELATIVE_DIR);
      const folder = await ensurePlanningFolder(workspace, '2026-09-14-scan-wp');
      await writeSessionFile(folder, {
        schemaVersion: 1,
        sessionIndex: 'SCAN01',
        workflowId: 'work-package',
      });
      const hits = await scanSavedClientSessions({
        workspaceDir: workspace,
        workflowId: 'work-package',
      });
      expect(hits).toEqual([
        expect.objectContaining({
          session_index: 'SCAN01',
          workflow_id: 'work-package',
          planning_slug: '2026-09-14-scan-wp',
        }),
      ]);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
