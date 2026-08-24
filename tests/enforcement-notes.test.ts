import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

/**
 * Payload-borne enforcement hints (#189 C7, R7): get_activity annotates, at delivery time, only the
 * agent-interpreted constructs the current activity actually contains — an `actions` note when a step
 * carries action verbs, an `auto_advance` note when a checkpoint declares autoAdvanceMs. An activity
 * with neither carries no block. Exercised over the MCP wire against a fixture corpus.
 */
describe('payload-borne enforcement hints (#189 C7)', () => {
  let harness: Harness;
  let client: Client;
  let session: SessionOps;
  let workflowDir: string;

  const op = (capability: string, body: string): string =>
    `---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\n${capability}\n\n${body}`;

  beforeAll(async () => {
    workflowDir = mkdtempSync(join(tmpdir(), 'wf-enforce-corpus-'));

    const wf = join(workflowDir, 'efwf');
    mkdirSync(join(wf, 'activities'), { recursive: true });
    mkdirSync(join(wf, 'techniques'), { recursive: true });

    writeFileSync(join(wf, 'workflow.yaml'), [
      'id: efwf',
      'version: 1.0.0',
      'title: Enforcement fixture',
      'initialActivity: acts',
      'graph:',
      '  acts:',
      '    done: plain',
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
      '          exit: done',
      '    defaultOption: go',
      '    autoAdvanceMs: 1000',
      'exits:',
      '  - id: done',
      '    isDefault: true',
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

    harness = await createHarness({ workflowDir });
    client = harness.client;
    session = sessionOps(harness, 'efwf');
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

  it('emits both enforcement notes for an activity with action verbs and an auto-advance checkpoint', async () => {
    const idx = await session.start('c7-acts', 'w1');
    await session.enter(idx, 'acts');
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
    const idx = await session.start('c7-plain', 'w1');
    await session.enter(idx, 'acts');
    await session.enter(idx, 'plain');
    const { text, meta } = await getActivity(idx);

    expect(meta['enforcement_notes']).toBeUndefined();
    expect(text).not.toContain('enforcement_notes:');
  });
});
