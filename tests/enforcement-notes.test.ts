import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

/**
 * Payload-borne enforcement hints (#189 C7, R7): get_activity annotates, at delivery time, only the
 * agent-interpreted constructs the current activity actually contains — an `actions` note when a step
 * carries action verbs, an `auto_advance` note when a checkpoint declares autoAdvanceMs. An activity
 * with neither carries no block. Exercised over the MCP wire against a fixture corpus.
 */
describe('payload-borne enforcement hints (#189 C7)', () => {
  let client: Client;
  let closeTransport: () => Promise<void>;
  let workflowDir: string;
  let workspaceDir: string;

  const planningFolder = (slug: string) => join(workspaceDir, '.engineering/artifacts/planning', slug);
  const op = (capability: string, body: string): string =>
    `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\n${capability}\n\n${body}`;

  beforeAll(async () => {
    workflowDir = mkdtempSync(join(tmpdir(), 'wf-enforce-corpus-'));
    workspaceDir = mkdtempSync(join(tmpdir(), 'wf-enforce-ws-'));

    const wf = join(workflowDir, 'efwf');
    mkdirSync(join(wf, 'activities'), { recursive: true });
    mkdirSync(join(wf, 'techniques'), { recursive: true });

    writeFileSync(join(wf, 'workflow.yaml'), [
      'id: efwf',
      'version: 1.0.0',
      'title: Enforcement fixture',
      'initialActivity: acts',
      'variables:',
      '  - name: proceed_confirmed',
      '    type: boolean',
      '    required: false',
    ].join('\n'));

    // acts: an action step (action verbs) AND a checkpoint with autoAdvanceMs → both notes.
    writeFileSync(join(wf, 'activities', '01-acts.yaml'), [
      'id: acts',
      'version: 1.0.0',
      'name: Acts',
      'steps:',
      '  - kind: technique',
      '    technique: work',
      '  - kind: action',
      '    id: do-set',
      '    actions:',
      '      - action: set',
      '        target: proceed_confirmed',
      '        value: true',
      '  - kind: checkpoint',
      '    id: confirm',
      '    message: Proceed?',
      '    options:',
      '      - id: go',
      '        label: Go',
      '        effect:',
      '          transitionTo: plain',
      '    defaultOption: go',
      '    autoAdvanceMs: 1000',
      'transitions:',
      '  - to: plain',
    ].join('\n'));

    // plain: a single technique step, no action verbs, no checkpoint → no enforcement_notes.
    writeFileSync(join(wf, 'activities', '02-plain.yaml'), [
      'id: plain',
      'version: 1.0.0',
      'name: Plain',
      'steps:',
      '  - kind: technique',
      '    technique: work',
    ].join('\n'));

    writeFileSync(join(wf, 'techniques', 'work.md'), op('Do the work.', '## Protocol\n\n### 1. Go\n\n- Do it.\n'));

    const config = {
      workflowDir,
      schemasDir: join(import.meta.dirname, '../schemas'),
      workspaceDir,
      serverName: 'test-workflow-server',
      serverVersion: '2.1.0',
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
    for (const dir of [workflowDir, workspaceDir]) {
      try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
    }
  });

  type ToolResult = { isError?: boolean; content?: Array<{ text: string }>; _meta?: Record<string, unknown> };

  async function startSession(slug: string): Promise<string> {
    const result = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'efwf', agent_id: 'w1', planning_folder: planningFolder(slug) },
    }) as ToolResult;
    expect(result.isError).toBeFalsy();
    return (JSON.parse(result.content![0]!.text) as { session_index: string }).session_index;
  }

  async function enter(sessionIndex: string, activityId: string): Promise<void> {
    const result = await client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: activityId },
    }) as ToolResult;
    expect(result.isError).toBeFalsy();
  }

  async function getActivity(sessionIndex: string): Promise<{ text: string; meta: Record<string, unknown> }> {
    const result = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000 },
    }) as ToolResult;
    expect(result.isError).toBeFalsy();
    return { text: result.content![0]!.text, meta: result._meta ?? {} };
  }

  it('emits both enforcement notes for an activity with action verbs and an auto-advance checkpoint', async () => {
    const idx = await startSession('c7-acts');
    await enter(idx, 'acts');
    const { text, meta } = await getActivity(idx);

    const notes = meta['enforcement_notes'] as Record<string, string> | undefined;
    expect(notes).toBeDefined();
    expect(notes!['actions']).toContain('AGENT-executed');
    expect(notes!['actions']).toContain('applies no action verb');
    expect(notes!['auto_advance']).toContain('SERVER-timed');
    expect(notes!['auto_advance']).toContain('respond_checkpoint');

    // The block also rides the delivered text payload (where a payload-only reader looks).
    expect(text).toContain('enforcement_notes:');
  });

  it('emits no enforcement_notes for an activity with neither construct', async () => {
    const idx = await startSession('c7-plain');
    await enter(idx, 'acts');
    await enter(idx, 'plain');
    const { text, meta } = await getActivity(idx);

    expect(meta['enforcement_notes']).toBeUndefined();
    expect(text).not.toContain('enforcement_notes:');
  });
});
