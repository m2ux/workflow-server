import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { createHarness, parseToolResponse, type Harness } from './e2e/harness.js';
import { SESSION_FILE_NAME } from '../src/utils/session/store.js';

const execFileAsync = promisify(execFile);

async function initRepo(dir: string, origin: string): Promise<void> {
  mkdirSync(dir, { recursive: true });
  await execFileAsync('git', ['init', dir], { encoding: 'utf8' });
  await execFileAsync('git', ['-C', dir, 'remote', 'add', 'origin', origin], { encoding: 'utf8' });
}

function datedSlug(workflowId: string): string {
  return `${new Date().toISOString().slice(0, 10)}-${workflowId}`;
}

function toolText(result: { content: Array<{ text?: string }> }): string {
  return result.content[0]?.text ?? '';
}

/**
 * A projects root serving two clones of one repository: the canonical checkout, named for the
 * repository, and a second clone under another folder name.
 */
describe.sequential('planning root under a projects multi-root follows the checkout', () => {
  let harness: Harness;
  let projects: string;
  let canonical: string;
  let clone: string;
  const origin = 'https://github.com/acme/agent-eng.git';
  const planningOf = (checkout: string) => join(checkout, '.engineering/artifacts/planning');

  beforeAll(async () => {
    projects = join(mkdtempSync(join(tmpdir(), 'wf-multi-')), 'projects');
    canonical = join(projects, 'agent-eng');
    clone = join(projects, 'agent-eng-clone');
    await initRepo(canonical, origin);
    await initRepo(clone, origin);
    harness = await createHarness({
      workspaceDir: projects,
      engineeringDir: projects,
      workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model'),
    });
  });

  afterAll(async () => {
    await harness.close();
    rmSync(resolve(projects, '..'), { recursive: true, force: true });
  });

  async function callOk(name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result = await harness.client.callTool({ name, arguments: args });
    expect(result.isError, toolText(result as { content: Array<{ text?: string }> })).toBeFalsy();
    return parseToolResponse(result);
  }

  function readSession(folder: string): { variables: Record<string, unknown>; triggeredWorkflows: Array<{ state: { variables: Record<string, unknown> } }> } {
    return JSON.parse(readFileSync(join(folder, SESSION_FILE_NAME), 'utf8'));
  }

  it('plans under the checkout passed in, not the folder named for its repository', async () => {
    const body = await callOk('start_session', { workflow_id: 'seed-fixture', working_directory: clone });
    const folder = join(planningOf(clone), datedSlug('seed-fixture'));
    expect(body['repo']).toBe('acme/agent-eng');
    expect(body['planning_folder_path']).toBe(folder);
    expect(existsSync(join(folder, SESSION_FILE_NAME))).toBe(true);
    expect(existsSync(join(planningOf(canonical), datedSlug('seed-fixture')))).toBe(false);
  });

  it('numbers a dated slug against the checkout\'s own root alone', async () => {
    const first = await callOk('start_session', { workflow_id: 'child-fixture', working_directory: canonical });
    expect(first['planning_slug']).toBe(datedSlug('child-fixture'));
    const second = await callOk('start_session', { workflow_id: 'child-fixture', working_directory: clone });
    expect(second['planning_slug']).toBe(datedSlug('child-fixture'));
    const third = await callOk('start_session', { workflow_id: 'child-fixture', working_directory: clone });
    expect(third['planning_slug']).toBe(`${datedSlug('child-fixture')}-2`);
  });

  it('creates a pinned new folder under the checkout root', async () => {
    const folder = join(planningOf(clone), '2026-09-29-pinned');
    const body = await callOk('start_session', {
      workflow_id: 'seed-fixture',
      working_directory: clone,
      planning_folder: folder,
    });
    expect(body['planning_folder_path']).toBe(folder);
    expect(existsSync(join(folder, SESSION_FILE_NAME))).toBe(true);
  });

  it('refuses a pinned new folder under another root, naming the checkout root, and creates nothing', async () => {
    const elsewhere = join(planningOf(canonical), '2026-09-29-misplaced');
    const result = await harness.client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'seed-fixture', working_directory: clone, planning_folder: elsewhere },
    });
    expect(result.isError).toBeTruthy();
    const text = toolText(result as { content: Array<{ text?: string }> });
    expect(text).toMatch(/not in the planning root/);
    expect(text).toContain(planningOf(clone));
    expect(existsSync(elsewhere)).toBe(false);
    expect(existsSync(join(planningOf(clone), '2026-09-29-misplaced'))).toBe(false);
  });

  it('resumes a pinned folder by its exact path, without working_directory or repo', async () => {
    const folder = join(planningOf(clone), '2026-09-29-resumed');
    const first = await callOk('start_session', {
      workflow_id: 'seed-fixture',
      working_directory: clone,
      planning_folder: folder,
    });
    const resumed = await callOk('start_session', { planning_folder: folder });
    expect(resumed['session_index']).toBe(first['session_index']);
    expect(resumed['planning_folder_path']).toBe(folder);
  });

  it('seeds the planning folder and the checkout facts, and a child inherits them', async () => {
    const folder = join(planningOf(clone), '2026-09-29-facts');
    const body = await callOk('start_session', {
      workflow_id: 'seed-fixture',
      working_directory: clone,
      planning_folder: folder,
    });
    await callOk('dispatch_child', { session_index: body['session_index'], workflow_id: 'child-fixture' });
    const stored = readSession(folder);
    const facts = {
      planning_folder_path: folder,
      host_repo_path: clone,
      target_repo: 'acme/agent-eng',
      component_path: '.',
      is_monorepo: false,
    };
    expect(stored.variables).toMatchObject(facts);
    expect(stored.triggeredWorkflows[0]?.state.variables).toMatchObject(facts);
  });

  it('seeds the same facts into the client a meta start opens', async () => {
    const body = await callOk('start_session', {
      workflow_id: 'meta',
      working_directory: clone,
      target_workflow_id: 'seed-fixture',
    });
    const folder = String(body['planning_folder_path']);
    expect(folder.startsWith(planningOf(clone))).toBe(true);
    const stored = readSession(folder);
    expect(stored.triggeredWorkflows[0]?.state.variables).toMatchObject({
      planning_folder_path: folder,
      host_repo_path: clone,
    });
  });
});
