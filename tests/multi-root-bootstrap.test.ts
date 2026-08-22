import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHarness, parseToolResponse, type Harness } from './e2e/harness.js';

describe('session.repo bootstrap binding', () => {
  let harness: Harness;
  let client: Client;
  let installDir: string;
  let engMulti: string;
  let wsMulti: string;

  beforeAll(async () => {
    installDir = mkdtempSync(join(tmpdir(), 'wf-multi-boot-'));
    engMulti = join(installDir, 'projects');
    wsMulti = join(installDir, 'worktrees');
    // Canonical basename checkout under the projects multi-root.
    mkdirSync(join(engMulti, 'app', '.engineering'), { recursive: true });
    mkdirSync(join(engMulti, 'app', '.worktrees'), { recursive: true });

    harness = await createHarness({ workspaceDir: wsMulti, engineeringDir: engMulti, installDir });
    client = harness.client;
  });

  afterAll(async () => {
    await harness.close();
    try {
      rmSync(installDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('discover always requires repo_binding (no session_scope branching)', async () => {
    const result = await client.callTool({ name: 'discover', arguments: {} });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { type: 'text'; text: string }).text;
    expect(text).toMatch(/repo_binding:\s*required/);
    expect(text).toMatch(/repo:\s*"owner\/repo"/);
    expect(text).not.toMatch(/session_scope:/);
  });

  it('health_check always reports repo_binding required', async () => {
    const result = await client.callTool({ name: 'health_check', arguments: {} });
    const health = parseToolResponse(result);
    expect(health.status).toBe('healthy');
    expect(health.repo_binding).toBe('required_on_start_session');
    expect(health.session_scope).toBeUndefined();
  });

  it('start_session without repo sets repo_unbound on transient meta', async () => {
    const result = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'meta', agent_id: 'orchestrator' },
    });
    expect(result.isError).toBeFalsy();
    const response = parseToolResponse(result);
    expect(response.repo_unbound).toBe(true);
    expect(response.repo).toBeUndefined();
    expect(response.session_scope).toBeUndefined();
    expect(response.promotion_requires_repo).toBeUndefined();
  });

  it('dispatch_child fails without session.repo', async () => {
    const meta = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'meta', agent_id: 'orchestrator' },
    });
    const metaIdx = parseToolResponse(meta).session_index;

    const child = await client.callTool({
      name: 'dispatch_child',
      arguments: {
        session_index: metaIdx,
        workflow_id: 'work-package',
        agent_id: 'worker-1',
        planning_slug: '2026-07-24-no-repo',
      },
    });
    expect(child.isError).toBeTruthy();
    const text = (child.content as { text: string }[])[0]?.text ?? '';
    expect(text).toMatch(/cannot promote transient session without session\.repo/i);
    expect(text).toMatch(/Bind repo on start_session or pass repo on dispatch_child/i);
  });

  it('dispatch_child binds repo onto session.json when start_session omitted it', async () => {
    const meta = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'meta', agent_id: 'orchestrator' },
    });
    expect(meta.isError).toBeFalsy();
    const metaResp = parseToolResponse(meta);
    expect(metaResp.repo_unbound).toBe(true);

    const slug = '2026-07-24-worker-repo';
    const child = await client.callTool({
      name: 'dispatch_child',
      arguments: {
        session_index: metaResp.session_index,
        workflow_id: 'work-package',
        agent_id: 'worker-1',
        planning_slug: slug,
        repo: 'acme/app',
      },
    });
    expect(child.isError).toBeFalsy();
    const childResp = parseToolResponse(child);
    expect(childResp.planning_slug).toBe(slug);

    const promoted = join(engMulti, 'app', '.engineering', 'artifacts', 'planning', slug);
    expect(existsSync(join(promoted, 'session.json'))).toBe(true);
    expect(childResp.planning_folder_path).toBe(promoted);

    const stored = JSON.parse(readFileSync(join(promoted, 'session.json'), 'utf8'));
    expect(stored.repo).toBe('acme/app');
    expect(stored.triggeredWorkflows[0].state.repo).toBe('acme/app');
  });

  it('start_session with repo binds session.json and dispatch_child promotes under projects/<repo>/.engineering', async () => {
    const meta = await client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'meta',
        agent_id: 'orchestrator',
        repo: 'acme/app',
      },
    });
    expect(meta.isError).toBeFalsy();
    const metaResp = parseToolResponse(meta);
    expect(metaResp.repo).toBe('acme/app');
    expect(metaResp.repo_unbound).toBeUndefined();

    const slug = '2026-07-24-with-repo';
    const child = await client.callTool({
      name: 'dispatch_child',
      arguments: {
        session_index: metaResp.session_index,
        workflow_id: 'work-package',
        agent_id: 'worker-1',
        planning_slug: slug,
      },
    });
    expect(child.isError).toBeFalsy();
    const childResp = parseToolResponse(child);
    expect(childResp.planning_slug).toBe(slug);

    const promoted = join(engMulti, 'app', '.engineering', 'artifacts', 'planning', slug);
    expect(existsSync(join(promoted, 'session.json'))).toBe(true);
    expect(childResp.planning_folder_path).toBe(promoted);

    const stored = JSON.parse(readFileSync(join(promoted, 'session.json'), 'utf8'));
    expect(stored.workflowId).toBe('meta');
    expect(stored.repo).toBe('acme/app');
    expect(stored.triggeredWorkflows).toHaveLength(1);
    expect(stored.triggeredWorkflows[0].workflowId).toBe('work-package');
    expect(stored.triggeredWorkflows[0].state.repo).toBe('acme/app');
  });

  it('dispatch_child rejects repo that conflicts with session.repo', async () => {
    const meta = await client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'meta',
        agent_id: 'orchestrator',
        repo: 'acme/app',
      },
    });
    const metaIdx = parseToolResponse(meta).session_index;

    const child = await client.callTool({
      name: 'dispatch_child',
      arguments: {
        session_index: metaIdx,
        workflow_id: 'work-package',
        agent_id: 'worker-1',
        planning_slug: '2026-07-24-conflict',
        repo: 'other/repo',
      },
    });
    expect(child.isError).toBeTruthy();
    const text = (child.content as { text: string }[])[0]?.text ?? '';
    expect(text).toMatch(/already bound to repo 'acme\/app'/i);
    expect(text).toMatch(/cannot rebind to 'other\/repo'/i);
  });
});
