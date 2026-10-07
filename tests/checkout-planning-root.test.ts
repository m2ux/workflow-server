import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } from 'node:fs';
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

/** Shape of a planning slug the server mints for a session that pinned no folder. */
const UNNAMED_SLUG = /^\d{4}-\d{2}-\d{2}-[A-Z2-7]{6}$/;

function toolText(result: { content: Array<{ text?: string }> }): string {
  return result.content[0]?.text ?? '';
}

/**
 * A projects root serving two clones of one repository: the canonical checkout, named for the
 * repository, and a second clone under another folder name.
 */
describe.sequential('planning root under a projects multi-root follows the project folder', () => {
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

  it('plans under the project folder passed in, not the folder named for its repository', async () => {
    const body = await callOk('start_session', { workflow_id: 'seed-fixture', working_directory: clone });
    const slug = body['planning_slug'] as string;
    expect(slug).toMatch(UNNAMED_SLUG);
    expect(body['repo']).toBe('acme/agent-eng');
    expect(body['planning_folder_path']).toBe(join(planningOf(clone), slug));
    expect(existsSync(join(planningOf(clone), slug, SESSION_FILE_NAME))).toBe(true);
    expect(existsSync(join(planningOf(canonical), slug))).toBe(false);
  });

  it('gives each unnamed session a folder of its own, in the root of the project it plans', async () => {
    const first = await callOk('start_session', { workflow_id: 'child-fixture', working_directory: canonical });
    const second = await callOk('start_session', { workflow_id: 'child-fixture', working_directory: clone });
    const third = await callOk('start_session', { workflow_id: 'child-fixture', working_directory: clone });
    for (const body of [first, second, third]) expect(body['planning_slug']).toMatch(UNNAMED_SLUG);
    expect(new Set([first, second, third].map((b) => b['planning_slug'])).size).toBe(3);
    expect(first['planning_folder_path']).toBe(join(planningOf(canonical), first['planning_slug'] as string));
    expect(second['planning_folder_path']).toBe(join(planningOf(clone), second['planning_slug'] as string));
    expect(third['planning_folder_path']).toBe(join(planningOf(clone), third['planning_slug'] as string));
  });

  it('creates a pinned new folder under the project root', async () => {
    const folder = join(planningOf(clone), '2026-09-29-pinned');
    const body = await callOk('start_session', {
      workflow_id: 'seed-fixture',
      working_directory: clone,
      planning_folder: folder,
    });
    expect(body['planning_folder_path']).toBe(folder);
    expect(existsSync(join(folder, SESSION_FILE_NAME))).toBe(true);
  });

  it('refuses a pinned new folder under another root, naming the project root, and creates nothing', async () => {
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

  it('plans a nested clone and a branch worktree under their project folder, and finds the session by index after', async () => {
    const nested = join(clone, '.project', 'main');
    const worktree = join(clone, '.worktrees', 'feat');
    await initRepo(nested, origin);
    await initRepo(worktree, origin);
    for (const [checkout, workflowId] of [[nested, 'bare-fixture'], [worktree, 'bare-fixture']] as const) {
      const body = await callOk('start_session', { workflow_id: workflowId, working_directory: checkout });
      const folder = String(body['planning_folder_path']);
      expect(folder.startsWith(planningOf(clone) + '/')).toBe(true);
      expect(existsSync(join(checkout, '.engineering'))).toBe(false);
      const status = await callOk('get_workflow_status', { session_index: body['session_index'] });
      expect(status['status']).toBeDefined();
    }
  });

  it('reports whether a call resumed a session that already existed', async () => {
    const folder = join(planningOf(clone), '2026-09-29-resumed-flag');
    const created = await callOk('start_session', { workflow_id: 'seed-fixture', working_directory: clone, planning_folder: folder });
    expect(created['resumed']).toBe(false);
    const resumed = await callOk('start_session', { planning_folder: folder });
    expect(resumed['resumed']).toBe(true);
    const missed = await callOk('start_session', { workflow_id: 'seed-fixture', working_directory: clone, planning_folder: join(planningOf(clone), '2026-09-29-never-made') });
    expect(missed['resumed']).toBe(false);
  });

  it('re-stamps the planning folder in every embedded session when the folder has moved', async () => {
    const before = join(planningOf(clone), '2026-09-29-before-move');
    const after = join(planningOf(clone), '2026-09-29-after-move');
    const body = await callOk('start_session', { workflow_id: 'seed-fixture', working_directory: clone, planning_folder: before });
    await callOk('dispatch_child', { session_index: body['session_index'], workflow_id: 'child-fixture' });
    renameSync(before, after);
    await callOk('start_session', { planning_folder: after });
    const stored = readSession(after);
    expect(stored.variables['planning_folder_path']).toBe(after);
    expect(stored.triggeredWorkflows[0]?.state.variables['planning_folder_path']).toBe(after);
  });
});
