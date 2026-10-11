/**
 * Checkpoint answers are a selected option or the declared auto-advance.
 *
 * AC6 is what `respond_checkpoint` accepts, so a run of that tool observes it.
 * AC7 and AC11 are facts about the server's descriptions and fields, so a check
 * over those texts observes them.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHarness, parseToolResponse, rawText, type Harness, type ToolResult } from './e2e/harness.js';
import { planningFolderPath } from './session-ops.js';

const ROOT = resolve(import.meta.dirname, '..');

/** Schema descriptions, tool descriptions, and loader messages. */
const DESCRIPTION_HOMES = [
  'src/schema',
  'src/tools',
  'src/loaders',
  'schemas',
  'scripts/generate-site-data.ts',
  'docs/api.md',
  'docs/checkpoint.md',
  'docs/fidelity.md',
  'docs/routine.md',
  'site/api/tools.html',
  'site/api/schemas.html',
  'site/specs/checkpoints.html',
];

/** The response tool, the record it writes, and the fields it returns, with the pages that publish them. */
const RESPONSE_HOMES = [
  'src/tools/workflow-tools.ts',
  'scripts/generate-site-data.ts',
  'docs/api.md',
  'docs/checkpoint.md',
  'site/api/tools.html',
];

function filesUnder(relative: string): string[] {
  const absolute = join(ROOT, relative);
  const info = statSync(absolute);
  if (!info.isDirectory()) return [absolute];
  const found: string[] = [];
  for (const name of readdirSync(absolute)) {
    const path = join(absolute, name);
    if (statSync(path).isDirectory()) found.push(...filesUnder(join(relative, name)));
    else found.push(path);
  }
  return found;
}

function texts(homes: string[]): Array<{ file: string; body: string }> {
  return homes.flatMap(filesUnder).map((file) => ({
    file: file.slice(ROOT.length + 1),
    body: readFileSync(file, 'utf8'),
  }));
}

describe('respond_checkpoint answers', () => {
  let harness: Harness;
  const slug = '2026-10-07-checkpoint-answer';

  beforeAll(async () => {
    harness = await createHarness({ workflowDir: resolve(import.meta.dirname, 'fixtures/checkpoint-response') });
  });

  afterAll(async () => { await harness.close(); });

  async function call(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    return harness.client.callTool({ name, arguments: args });
  }

  it('accepts exactly one of option_id or auto_advance — AC6', async () => {
    const started = await call('start_session', {
      workflow_id: 'answer-fixture',
      agent_id: 'orchestrator',
      planning_folder: planningFolderPath(harness.workspaceDir, slug),
    });
    expect(started.isError, rawText(started)).toBeFalsy();
    const sessionIndex = (started._meta as { session_index: string }).session_index;
    const entered = await call('next_activity', { session_index: sessionIndex, activity_id: 'answer-activity' });
    expect(entered.isError).toBeFalsy();
    const opened = await call('yield_checkpoint', { session_index: sessionIndex, checkpoint_id: 'choose' });
    expect(opened.isError).toBeFalsy();

    const refused = async (args: Record<string, unknown>) => {
      const result = await call('respond_checkpoint', { session_index: sessionIndex, ...args });
      expect(result.isError).toBe(true);
      expect(rawText(result)).toContain('Exactly one of option_id or auto_advance');
    };
    await refused({ option_id: 'proceed', auto_advance: true });
    await refused({});
    await refused({ condition_not_met: true });

    const chosen = await call('respond_checkpoint', { session_index: sessionIndex, option_id: 'stop' });
    expect(chosen.isError).toBeFalsy();
    const chosenBody = parseToolResponse(chosen);
    expect(chosenBody.resolved_option).toBe('stop');
    expect(chosenBody).not.toHaveProperty('dismissed');

    const soft = await call('yield_checkpoint', { session_index: sessionIndex, checkpoint_id: 'unattended' });
    expect(soft.isError).toBeFalsy();
    await new Promise((done) => setTimeout(done, 2100));
    const advanced = await call('respond_checkpoint', { session_index: sessionIndex, auto_advance: true });
    expect(advanced.isError).toBeFalsy();
    const advancedBody = parseToolResponse(advanced);
    expect(advancedBody.resolved_option).toBe('proceed');
    expect(advancedBody).not.toHaveProperty('dismissed');

    const status = parseToolResponse(await call('get_workflow_status', { session_index: sessionIndex }));
    expect(status.last_checkpoint).toEqual(expect.objectContaining({ checkpoint_id: 'unattended', option_id: 'proceed' }));
    expect(status.last_checkpoint).not.toHaveProperty('dismissed');
    const sessionPath = join(planningFolderPath(harness.workspaceDir, slug), 'session.json');
    const stored = JSON.parse(readFileSync(sessionPath, 'utf8')) as {
      checkpointResponses: Record<string, { optionId: string }>;
    };
    expect(Object.values(stored.checkpointResponses).map((record) => record.optionId).sort()).toEqual(['proceed', 'stop']);
  });
});

describe('checkpoint answer descriptions and fields', () => {
  it('describes no checkpoint dismissal and names no gate field that confers it — AC7', () => {
    const hits = texts(DESCRIPTION_HOMES)
      .filter(({ body }) => /dismiss/i.test(body))
      .map(({ file }) => file);
    expect(hits).toEqual([]);
  });

  it('has no condition_not_met input, sentinel record, or dismissed response field — AC11', () => {
    const banned = /condition_not_met|__condition_not_met__|\bdismissed\b/;
    const hits = texts(RESPONSE_HOMES)
      .filter(({ body }) => banned.test(body))
      .map(({ file }) => file);
    expect(hits).toEqual([]);
  });
});
