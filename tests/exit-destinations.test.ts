import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

/**
 * get_activity delivers where each of the current activity's exits leads. The exits ride the
 * activity body; their destinations live in the workflow graph, which reaches an agent only through
 * the orchestrator-only `get_workflow` — so without this block the routing a worker is asked to
 * report is unresolvable from what it was given. An activity declaring no exits carries no block.
 * Exercised over the MCP wire against a fixture corpus.
 */
describe('exit destinations on activity delivery', () => {
  let harness: Harness;
  let client: Client;
  let session: SessionOps;
  let workflowDir: string;

  const op = (capability: string, body: string): string =>
    `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\n${capability}\n\n${body}`;

  beforeAll(async () => {
    workflowDir = mkdtempSync(join(tmpdir(), 'wf-exitdest-corpus-'));

    const wf = join(workflowDir, 'edwf');
    mkdirSync(join(wf, 'activities'), { recursive: true });
    mkdirSync(join(wf, 'techniques'), { recursive: true });

    writeFileSync(join(wf, 'workflow.yaml'), [
      'id: edwf',
      'version: 1.0.0',
      'title: Exit destinations fixture',
      'initialActivity: fork',
      'graph:',
      '  fork:',
      '    proceed: last',
      '    give-up: __terminal__',
      'variables:',
      '  - name: worth_continuing',
      '    type: boolean',
      '    required: false',
    ].join('\n'));

    // fork: two exits, one to a sibling activity and one ending the run.
    writeFileSync(join(wf, 'activities', '01-fork.yaml'), [
      'id: fork',
      'version: 1.0.0',
      'name: Fork',
      'steps:',
      '  - kind: technique',
      '    technique: work',
      'exits:',
      '  - id: give-up',
      '    when: worth_continuing == false',
      '  - id: proceed',
      '    isDefault: true',
    ].join('\n'));

    // last: declares no exits, so it binds nothing in the graph and carries no block.
    writeFileSync(join(wf, 'activities', '02-last.yaml'), [
      'id: last',
      'version: 1.0.0',
      'name: Last',
      'steps:',
      '  - kind: technique',
      '    technique: work',
    ].join('\n'));

    writeFileSync(join(wf, 'techniques', 'work.md'), op('Do the work.', '## Protocol\n\n### 1. Go\n\n- Do it.\n'));

    harness = await createHarness({ workflowDir });
    client = harness.client;
    session = sessionOps(harness, 'edwf');
  });

  afterAll(async () => {
    await harness.close();
    try { rmSync(workflowDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  type ToolResult = { isError?: boolean; content?: Array<{ text: string }>; _meta?: Record<string, unknown> };

  async function getActivity(sessionIndex: string): Promise<{ text: string; meta: Record<string, unknown> }> {
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000 },
    }) as ToolResult;
    expect(result.isError).toBeFalsy();
    return { text: result.content![0]!.text, meta: result._meta ?? {} };
  }

  it('names the destination of every declared exit, terminal included', async () => {
    const idx = await session.start('exit-dest-fork', 'w1');
    await session.enter(idx, 'fork');
    const { text, meta } = await getActivity(idx);

    expect(meta['exit_destinations']).toEqual({ 'give-up': '__terminal__', proceed: 'last' });

    // The block also rides the delivered text payload, which is where a worker reads.
    expect(text).toContain('exit_destinations:');
    expect(text).toContain('proceed: last');
    expect(text).toContain('give-up: __terminal__');
  });

  it('carries no block for an activity that declares no exits', async () => {
    const idx = await session.start('exit-dest-last', 'w1');
    await session.enter(idx, 'fork');
    await session.enter(idx, 'last');
    const { text, meta } = await getActivity(idx);

    expect(meta['exit_destinations']).toBeUndefined();
    expect(text).not.toContain('exit_destinations:');
  });
});
