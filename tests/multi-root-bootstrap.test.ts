import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  lookupTransientRepoByFolder,
  registerTransient,
  createTransientFolder,
} from '../src/utils/session/store.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseToolResponse(result: any): any {
  const text = (result.content[0] as { type: 'text'; text: string }).text;
  return JSON.parse(text);
}

describe('multi-root bootstrap binding', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let installDir: string;
  let engMulti: string;
  let wsMulti: string;

  beforeAll(async () => {
    installDir = mkdtempSync(join(tmpdir(), 'wf-multi-boot-'));
    engMulti = join(installDir, 'engineering');
    wsMulti = join(installDir, 'workspace');
    mkdirSync(join(engMulti, 'acme', 'app'), { recursive: true });
    mkdirSync(join(wsMulti, 'acme', 'app'), { recursive: true });

    const config = {
      workflowDir: resolve(import.meta.dirname, '../workflows'),
      schemasDir: resolve(import.meta.dirname, '../schemas'),
      workspaceDir: wsMulti,
      engineeringDir: engMulti,
      installDir,
      serverName: 'test-multi-root',
      serverVersion: '1.0.0',
      minCheckpointResponseSeconds: 0,
    };

    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    client = new Client({ name: 'test-client', version: '1.0.0' }, {});
    await client.connect(clientTransport);

    closeTransport = async () => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await closeTransport();
    try {
      rmSync(installDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('discover reports session_scope multi and repo_binding', async () => {
    const result = await client.callTool({ name: 'discover', arguments: {} });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { type: 'text'; text: string }).text;
    expect(text).toMatch(/session_scope:\s*multi/);
    expect(text).toMatch(/repo_binding:\s*required/);
    expect(text).toMatch(/repo:\s*"owner\/repo"/);
  });

  it('health_check reports session_scope multi', async () => {
    const result = await client.callTool({ name: 'health_check', arguments: {} });
    const health = parseToolResponse(result);
    expect(health.status).toBe('healthy');
    expect(health.session_scope).toBe('multi');
    expect(health.repo_binding).toBe('required_on_start_session');
  });

  it('start_session without repo sets promotion_requires_repo on multi-root meta', async () => {
    const result = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'meta', agent_id: 'orchestrator' },
    });
    expect(result.isError).toBeFalsy();
    const response = parseToolResponse(result);
    expect(response.session_scope).toBe('multi');
    expect(response.promotion_requires_repo).toBe(true);
    expect(response.repo).toBeUndefined();
  });

  it('dispatch_child fails without a stashed repo on multi-root', async () => {
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
    expect(text).toMatch(/cannot promote transient session without a target repo/i);
    expect(text).toMatch(/Pass repo on start_session/i);
  });

  it('start_session with repo binds and dispatch_child promotes under engineering/owner/repo', async () => {
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
    expect(metaResp.session_scope).toBe('multi');
    expect(metaResp.repo).toBe('acme/app');
    expect(metaResp.promotion_requires_repo).toBeUndefined();

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

    const promoted = join(engMulti, 'acme', 'app', 'artifacts', 'planning', slug);
    expect(existsSync(join(promoted, 'session.json'))).toBe(true);
    expect(childResp.planning_folder_path).toBe(promoted);

    const stored = JSON.parse(readFileSync(join(promoted, 'session.json'), 'utf8'));
    expect(stored.workflowId).toBe('meta');
    expect(stored.triggeredWorkflows).toHaveLength(1);
    expect(stored.triggeredWorkflows[0].workflowId).toBe('work-package');
  });
});

describe('transient repo stash helpers', () => {
  it('registerTransient stores and lookupTransientRepoByFolder returns repo', async () => {
    const folder = await createTransientFolder();
    try {
      registerTransient('ABC234', folder, undefined, 'acme/app');
      expect(lookupTransientRepoByFolder(folder)).toBe('acme/app');
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });
});
