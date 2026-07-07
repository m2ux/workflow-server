import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve, join } from 'node:path';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import type { HistoryEntry } from '../src/schema/state.schema.js';

/**
 * Fidelity observability (#166 B8): `get_technique` / `get_resource` record
 * fetch events into the session history, and `next_activity`'s manifest
 * validation warns (advisory) on manifested technique steps with no recorded
 * fetch. Exercised against the real workflows corpus through the MCP wire.
 */
describe('fetch observability (#166 B8)', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let workspaceDir: string;

  const planningFolder = (slug: string) => join(workspaceDir, '.engineering/artifacts/planning', slug);
  const sessionHistory = (slug: string): HistoryEntry[] => {
    const state = JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8')) as { history: HistoryEntry[] };
    return state.history;
  };

  beforeAll(async () => {
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-fetchobs-test-'));
    const config = {
      workflowDir: resolve(import.meta.dirname, '../workflows'),
      schemasDir: resolve(import.meta.dirname, '../schemas'),
      workspaceDir,
      serverName: 'test-workflow-server',
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
    try { rmSync(workspaceDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  async function startSession(slug: string, agentId: string, contextMode?: string): Promise<string> {
    const result = await client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'work-package',
        agent_id: agentId,
        planning_folder: planningFolder(slug),
        ...(contextMode ? { context_mode: contextMode } : {}),
      },
    });
    expect(result.isError).toBeFalsy();
    const body = JSON.parse((result.content as Array<{ text: string }>)[0]!.text) as Record<string, unknown>;
    return body['session_index'] as string;
  }

  async function enterActivity(sessionIndex: string, activityId: string): Promise<void> {
    const result = await client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: activityId },
    });
    expect(result.isError).toBeFalsy();
  }

  it('get_technique records a technique_fetched history event with step, technique, and agent', async () => {
    const slug = '2026-07-07-b8-technique-fetch';
    const idx = await startSession(slug, 'w1');
    await enterActivity(idx, 'start-work-package');

    const result = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: idx, step_id: 'detect-review-mode' },
    });
    expect(result.isError).toBeFalsy();

    const fetches = sessionHistory(slug).filter(h => h.type === 'technique_fetched');
    expect(fetches).toHaveLength(1);
    expect(fetches[0]!.activity).toBe('start-work-package');
    const data = fetches[0]!.data as { techniqueId: string; stepId: string; agentId: string };
    expect(data.stepId).toBe('detect-review-mode');
    expect(typeof data.techniqueId).toBe('string');
    expect(data.techniqueId.length).toBeGreaterThan(0);
    expect(data.agentId).toBe('w1');
  });

  it('get_resource records a resource_fetched history event', async () => {
    const slug = '2026-07-07-b8-resource-fetch';
    const idx = await startSession(slug, 'w2');
    await enterActivity(idx, 'start-work-package');

    const result = await client.callTool({
      name: 'get_resource',
      arguments: { session_index: idx, resource_id: 'review-mode' },
    });
    expect(result.isError).toBeFalsy();

    const fetches = sessionHistory(slug).filter(h => h.type === 'resource_fetched');
    expect(fetches).toHaveLength(1);
    expect(fetches[0]!.activity).toBe('start-work-package');
    const data = fetches[0]!.data as { resourceId: string; agentId: string };
    expect(data.resourceId).toBe('review-mode');
    expect(data.agentId).toBe('w2');
  });

  it('an unchanged-reference answer in persistent mode still records the fetch', async () => {
    const slug = '2026-07-07-b8-stub-fetch';
    const idx = await startSession(slug, 'solo', 'persistent');
    await enterActivity(idx, 'start-work-package');

    for (let i = 0; i < 2; i++) {
      const result = await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: 'detect-review-mode' },
      });
      expect(result.isError).toBeFalsy();
    }

    const fetches = sessionHistory(slug).filter(h => h.type === 'technique_fetched');
    expect(fetches).toHaveLength(2);
  });

  it('next_activity warns on manifested technique steps with no recorded fetch, and not on fetched ones', async () => {
    const slug = '2026-07-07-b8-manifest-warning';
    const idx = await startSession(slug, 'w3');
    await enterActivity(idx, 'start-work-package');

    const fetchRes = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: idx, step_id: 'detect-review-mode' },
    });
    expect(fetchRes.isError).toBeFalsy();

    const result = await client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: idx,
        activity_id: 'design-philosophy',
        step_manifest: [
          { step_id: 'detect-review-mode', output: 'new implementation confirmed' },
          { step_id: 'resolve-reference', output: 'reference resolved' },
        ],
      },
    });
    expect(result.isError).toBeFalsy();
    const warnings = ((result._meta as Record<string, unknown>)['validation'] as { warnings: string[] }).warnings;
    const fidelity = warnings.filter(w => w.includes('without an in-session technique fetch'));
    expect(fidelity).toHaveLength(1);
    expect(fidelity[0]).toContain('resolve-reference');
    expect(fidelity[0]).not.toContain('detect-review-mode');
  });
});
