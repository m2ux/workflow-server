import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { resolve, join } from 'node:path';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import type { HistoryEntry } from '../src/schema/state.schema.js';
import { corpusRoot } from './corpus-root.js';

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
      workflowDir: corpusRoot(),
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
          { step_id: 'resolve-repo-root', output: 'repo root resolved' },
        ],
      },
    });
    expect(result.isError).toBeFalsy();
    const warnings = ((result._meta as Record<string, unknown>)['validation'] as { warnings: string[] }).warnings;
    const fidelity = warnings.filter(w => w.includes('without an in-session technique fetch'));
    expect(fidelity).toHaveLength(1);
    expect(fidelity[0]).toContain('resolve-repo-root');
    expect(fidelity[0]).not.toContain('detect-review-mode');
  });

  /**
   * Dispatch accounting and delivery magnitude (#353 §1.3).
   *
   * The measured walk recorded 11 `activity_usage` events against 33 real dispatches, and its
   * delivery events carried no size at all — so every payload figure in its analysis was an
   * estimate. These tests pin the two instruments that make the same run measurable: one
   * `activity_dispatched` event per dispatched context arriving, discriminated fresh vs resume,
   * and a `chars` / `delivery` pair on every delivery event.
   */
  describe('dispatch accounting and delivery magnitude (#353)', () => {
    it('records one activity_dispatched per get_activity, fresh then resume', async () => {
      const slug = '2026-07-30-dispatch-events';
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');

      const spawn = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-1' },
      });
      const resume = await client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-1', bundle: 'reference' },
      });
      expect((spawn._meta as Record<string, unknown>)['dispatch']).toBe('fresh');
      expect((resume._meta as Record<string, unknown>)['dispatch']).toBe('resume');

      const dispatches = sessionHistory(slug).filter(h => h.type === 'activity_dispatched');
      expect(dispatches.map(d => (d.data as { dispatch: string }).dispatch)).toEqual(['fresh', 'resume']);
      expect(dispatches.every(d => d.activity === 'start-work-package')).toBe(true);
      expect(dispatches.every(d => (d.data as { agentId: string }).agentId === 'w-1')).toBe(true);

      // `chars` is the delivered payload size, so the fresh/resume pair measures what reference
      // delivery on the resume path saved — the figure the success criteria ask for.
      const [freshChars, resumeChars] = dispatches.map(d => (d.data as { chars: number }).chars);
      expect(freshChars).toBeGreaterThan(0);
      expect(resumeChars).toBeLessThan(freshChars!);
    });

    it('reads a second worker on the same session as its own fresh dispatch', async () => {
      const slug = '2026-07-30-dispatch-two-workers';
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');

      for (const agent of ['w-a', 'w-b']) {
        const result = await client.callTool({
          name: 'get_activity',
          arguments: { session_index: idx, context_tokens: 200_000, agent_id: agent, bundle: 'reference' },
        });
        expect((result._meta as Record<string, unknown>)['dispatch']).toBe('fresh');
      }

      const dispatches = sessionHistory(slug).filter(h => h.type === 'activity_dispatched');
      expect(dispatches).toHaveLength(2);
      expect(dispatches.every(d => (d.data as { dispatch: string }).dispatch === 'fresh')).toBe(true);
    });

    it('records an out-of-band dispatch that only ever fetches a technique or resource', async () => {
      const slug = '2026-07-30-dispatch-out-of-band';
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');

      // No get_activity at all — the shape of the run's out-of-band prism analysis, which cost
      // 176K tokens and left no server record. Its own agent_id is enough to record the dispatch.
      for (let i = 0; i < 2; i++) {
        const result = await client.callTool({
          name: 'get_technique',
          arguments: { session_index: idx, step_id: 'detect-review-mode', agent_id: 'prism-oob' },
        });
        expect(result.isError).toBeFalsy();
      }
      await client.callTool({
        name: 'get_resource',
        arguments: { session_index: idx, resource_id: 'review-mode', agent_id: 'prism-oob' },
      });

      // One event for the dispatch, not one per call.
      const dispatches = sessionHistory(slug).filter(h => h.type === 'activity_dispatched');
      expect(dispatches).toHaveLength(1);
      expect((dispatches[0]!.data as { agentId: string; dispatch: string })).toMatchObject({
        agentId: 'prism-oob',
        dispatch: 'fresh',
      });
    });

    it('carries chars and a full/unchanged discriminator on every delivery event', async () => {
      const slug = '2026-07-30-delivery-magnitude';
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');

      for (const bundle of [undefined, 'reference']) {
        await client.callTool({
          name: 'get_technique',
          arguments: { session_index: idx, step_id: 'detect-review-mode', agent_id: 'w-1', ...(bundle ? { bundle } : {}) },
        });
        await client.callTool({
          name: 'get_resource',
          arguments: { session_index: idx, resource_id: 'review-mode', agent_id: 'w-1', ...(bundle ? { bundle } : {}) },
        });
      }

      const history = sessionHistory(slug);
      const deliveries = history.filter(h => h.type === 'technique_fetched' || h.type === 'resource_fetched');
      expect(deliveries.length).toBe(4);
      for (const event of deliveries) {
        const data = event.data as { chars?: number; delivery?: string };
        expect(typeof data.chars, `${event.type} carries chars`).toBe('number');
        expect(data.chars!).toBeGreaterThan(0);
        expect(['full', 'unchanged']).toContain(data.delivery);
      }
      // `chars` is the FULL payload size on both paths, so delivered and saved are both summable:
      // the same content collapsed on the second pass reports the same magnitude it saved.
      const byType = (type: string): Array<{ chars: number; delivery: string }> =>
        deliveries.filter(d => d.type === type).map(d => d.data as { chars: number; delivery: string });
      for (const type of ['technique_fetched', 'resource_fetched']) {
        const pair = byType(type);
        expect(pair.map(p => p.delivery)).toEqual(['full', 'unchanged']);
        expect(pair[1]!.chars).toBe(pair[0]!.chars);
      }
    });

    it('counts a dispatch per bundled activity delivery alongside its per-step magnitudes', async () => {
      const slug = '2026-07-30-bundled-magnitude';
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');

      await client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-1' },
      });
      await client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-1', bundle: 'reference' },
      });

      const bundled = sessionHistory(slug).filter(h => h.type === 'technique_bundled');
      expect(bundled.length).toBeGreaterThan(0);
      for (const event of bundled) {
        const data = event.data as { chars?: number; delivery?: string; agentId?: string };
        expect(typeof data.chars).toBe('number');
        expect(data.agentId).toBe('w-1');
        expect(['full', 'unchanged']).toContain(data.delivery);
      }
      // The second pass collapsed what the first delivered.
      expect(bundled.some(e => (e.data as { delivery: string }).delivery === 'full')).toBe(true);
      expect(bundled.some(e => (e.data as { delivery: string }).delivery === 'unchanged')).toBe(true);
    });
  });

  describe('PR366 context fidelity and observability', () => {
    it('PR366-TC-21: bundled path emits idempotent step_started', async () => {
      const slug = '2026-07-31-pr366-step-started-bundle';
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');
      await client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-1' },
      });
      await client.callTool({
        name: 'get_activity',
        arguments: { session_index: idx, context_tokens: 200_000, agent_id: 'w-1' },
      });
      const started = sessionHistory(slug).filter(h => h.type === 'step_started');
      expect(started.length).toBeGreaterThan(0);
      const keys = started.map(e => `${e.activity}|${(e.data as { stepId: string }).stepId}|${(e.data as { agentId: string }).agentId}`);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('PR366-TC-22: step_manifest path emits step_completed at transition', async () => {
      const slug = '2026-07-31-pr366-step-completed';
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');
      await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: 'detect-review-mode', agent_id: 'w-1' },
      });
      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: idx,
          activity_id: 'design-philosophy',
          agent_id: 'w-1',
          step_manifest: [
            { step_id: 'detect-review-mode', output: 'new implementation confirmed' },
          ],
        },
      });
      expect(result.isError).toBeFalsy();
      const completed = sessionHistory(slug).filter(h => h.type === 'step_completed');
      expect(completed.some(e =>
        e.activity === 'start-work-package'
        && (e.data as { stepId: string }).stepId === 'detect-review-mode'
        && (e.data as { agentId?: string }).agentId === 'w-1',
      )).toBe(true);
    });

    it('PR366-TC-23: multi lazy get_technique starts can carry distinct timestamps', async () => {
      const slug = '2026-07-31-pr366-multi-start-ts';
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');
      await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: 'detect-review-mode', agent_id: 'w-1' },
      });
      // brief delay so timestamps can differ when the clock advances
      await new Promise(r => setTimeout(r, 5));
      await client.callTool({
        name: 'get_technique',
        arguments: { session_index: idx, step_id: 'resolve-repo-root', agent_id: 'w-1' },
      });
      const started = sessionHistory(slug).filter(h => h.type === 'step_started' && (h.data as { agentId?: string }).agentId === 'w-1');
      // Distinct timestamps are allowed when the clock advances; equal is ok if coarse — contract is "can".
      expect(started.length).toBeGreaterThanOrEqual(2);
    });

    it('PR366-TC-24/25: undeclared planning file warned; outside-folder unknown; success', async () => {
      const { writeFileSync, mkdirSync } = await import('node:fs');
      const slug = '2026-07-31-pr366-artifacts';
      const folder = planningFolder(slug);
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');
      writeFileSync(join(folder, 'rogue-undeclared.md'), '# rogue\n', 'utf8');
      const outside = join(workspaceDir, 'outside-plan.md');
      writeFileSync(outside, '# out\n', 'utf8');
      const result = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: idx,
          activity_id: 'design-philosophy',
          artifacts_produced: [
            { id: 'declared-ok', name: 'declared-ok.md' },
            { id: 'outside-art', name: 'outside-plan.md', path: outside },
          ],
          step_manifest: [{ step_id: 'detect-review-mode', output: 'ok' }],
        },
      });
      expect(result.isError).toBeFalsy();
      const warnings = ((result._meta as Record<string, unknown>)['validation'] as { warnings: string[] }).warnings;
      expect(warnings.some(w => w.includes('rogue-undeclared.md'))).toBe(true);
      expect(warnings.some(w => w.includes('outside-art') && w.includes('unknown') && w.includes('not missing'))).toBe(true);
      // Outside-folder is never framed as a plain "missing" status.
      expect(warnings.some(w => w.includes('outside-art') && /\bmissing\b/.test(w) && !w.includes('not missing'))).toBe(false);
      // declared id accumulation is on session
      const state = JSON.parse(readFileSync(join(folder, 'session.json'), 'utf8')) as {
        declaredArtifacts?: Array<{ id: string }>;
      };
      expect(state.declaredArtifacts?.some(a => a.id === 'declared-ok')).toBe(true);
    });

    it('PR366-TC-26: declaration at activity N suppresses warning at N+1', async () => {
      const { writeFileSync } = await import('node:fs');
      const slug = '2026-07-31-pr366-artifacts-accum';
      const folder = planningFolder(slug);
      const idx = await startSession(slug, 'orchestrator');
      await enterActivity(idx, 'start-work-package');
      writeFileSync(join(folder, 'kept-artifact.md'), '# keep\n', 'utf8');
      const first = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: idx,
          activity_id: 'design-philosophy',
          artifacts_produced: [{ id: 'kept-artifact', name: 'kept-artifact.md' }],
        },
      });
      expect(first.isError).toBeFalsy();
      const second = await client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: idx,
          activity_id: 'requirements-elicitation',
        },
      });
      expect(second.isError).toBeFalsy();
      const warnings = ((second._meta as Record<string, unknown>)['validation'] as { warnings: string[] }).warnings;
      expect(warnings.some(w => w.includes('kept-artifact'))).toBe(false);
    });
  });
});
