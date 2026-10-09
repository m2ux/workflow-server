/**
 * The corpus pin a walk record cites comes from the instance that served the walk.
 *
 * One sidecar serves every session walking its corpus, and a reload moves that bind for all of
 * them at once. A record pinned from the reload that preceded the walk is unchanged by a bind
 * taken between the two, so the walk reads as a pass against definitions it never met. The
 * instance answers for itself on the call that opened the session, and that answer is what the
 * record carries.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { createHarness, parseToolResponse, type Harness } from './e2e/harness.js';

const execFileAsync = promisify(execFile);

/** The commit the container was labelled `workflow-server.corpus.pin` with. */
const LABELLED_PIN = '9f3c1aa-dirty';

/** The commit a reload taken between that label and the walk bound in its place. */
const REBOUND_PIN = 'd41b77c';

async function initRepo(dir: string): Promise<void> {
  mkdirSync(dir, { recursive: true });
  await execFileAsync('git', ['init', dir], { encoding: 'utf8' });
  await execFileAsync('git', ['-C', dir, 'config', 'user.email', 'test@example.com']);
  await execFileAsync('git', ['-C', dir, 'config', 'user.name', 'test']);
  await execFileAsync('git', ['-C', dir, 'remote', 'add', 'origin', 'https://github.com/acme/workflow-server.git']);
}

async function openWalk(harness: Harness): Promise<Record<string, unknown>> {
  const checkout = join(harness.workspaceDir, 'workflow-server');
  await initRepo(checkout);
  const result = await harness.client.callTool({
    name: 'start_session',
    arguments: {
      workflow_id: 'seed-fixture',
      agent_id: 'orchestrator',
      working_directory: checkout,
    },
  });
  expect(result.isError).toBeFalsy();
  return parseToolResponse(result);
}

describe('the serving bind a walk record cites', () => {
  let harness: Harness | undefined;

  afterEach(async () => {
    await harness?.close();
    harness = undefined;
  });

  it('answers the opening call with the corpus the instance is serving', async () => {
    harness = await createHarness({
      workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model'),
      corpusPin: LABELLED_PIN,
    });
    const body = await openWalk(harness);
    expect(body['serving']).toEqual({ corpus_pin: LABELLED_PIN });
  });

  // A reload between the label and the walk rebinds the instance. The record built from the
  // response then carries the corpus that answered, and reading it against the pin the walk set
  // out with is what shows the displacement — the comparison the record exists to allow.
  it('shows a displaced walk as a record that disagrees with the pin it set out with', async () => {
    harness = await createHarness({
      workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model'),
      corpusPin: REBOUND_PIN,
    });
    const body = await openWalk(harness);
    const record = { corpus_pin: (body['serving'] as { corpus_pin: string }).corpus_pin };
    expect(record.corpus_pin).toBe(REBOUND_PIN);
    expect(record.corpus_pin).not.toBe(LABELLED_PIN);
  });

  it('answers with no serving pin when the bind was made without one', async () => {
    harness = await createHarness({
      workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model'),
    });
    const body = await openWalk(harness);
    expect(body).not.toHaveProperty('serving');
  });
});
