import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { createHarness, parseToolResponse, type Harness } from './e2e/harness.js';
import { planningFolderPath } from './session-ops.js';
import {
  isTransientFolder,
  lookupTransientBySlug,
  SEAL_FILE_NAME,
  SESSION_FILE_NAME,
} from '../src/utils/session/store.js';

const execFileAsync = promisify(execFile);

async function git(dir: string, args: string[]): Promise<void> {
  await execFileAsync('git', ['-C', dir, ...args], { encoding: 'utf8' });
}

async function initRepo(dir: string, origin?: string): Promise<void> {
  mkdirSync(dir, { recursive: true });
  await execFileAsync('git', ['init', dir], { encoding: 'utf8' });
  await git(dir, ['config', 'user.email', 'test@example.com']);
  await git(dir, ['config', 'user.name', 'test']);
  if (origin) await git(dir, ['remote', 'add', 'origin', origin]);
}

function datedSlug(workflowId: string): string {
  return `${new Date().toISOString().slice(0, 10)}-${workflowId}`;
}

function toolText(result: { content: Array<{ text?: string }> }): string {
  return result.content[0]?.text ?? '';
}

function listPlanning(workspaceDir: string): string[] {
  try {
    return readdirSync(join(workspaceDir, '.engineering/artifacts/planning'));
  } catch {
    return [];
  }
}

describe.sequential('server-owned session setup (PR528-TC-01..10)', () => {
  let harness: Harness;

  beforeAll(async () => {
    harness = await createHarness({
      workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model'),
    });
  });

  afterAll(async () => {
    await harness.close();
  });

  async function callOk(name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result = await harness.client.callTool({ name, arguments: args });
    expect(result.isError, toolText(result as { content: Array<{ text?: string }> })).toBeFalsy();
    return parseToolResponse(result);
  }

  async function callErr(name: string, args: Record<string, unknown>): Promise<string> {
    const result = await harness.client.callTool({ name, arguments: args });
    expect(result.isError).toBeTruthy();
    return toolText(result as { content: Array<{ text?: string }> });
  }

  it('PR528-TC-01: working_directory binds origin, creates durable folder, no transient', async () => {
    const checkout = join(harness.workspaceDir, 'workflow-server');
    await initRepo(checkout, 'https://github.com/acme/workflow-server.git');
    const body = await callOk('start_session', {
      workflow_id: 'seed-fixture',
      agent_id: 'orchestrator',
      working_directory: checkout,
    });
    expect(body['session_index']).toMatch(/^[A-Z2-7]{6}$/);
    expect(body['repo']).toBe('acme/workflow-server');
    const slug = datedSlug('seed-fixture');
    const folder = planningFolderPath(harness.workspaceDir, slug);
    expect(existsSync(join(folder, SESSION_FILE_NAME))).toBe(true);
    expect(lookupTransientBySlug(slug)).toBeUndefined();
    expect(isTransientFolder(folder)).toBe(false);
    expect(body['planning_folder_path']).toBe(folder);
  });

  it('PR528-TC-02: submodule checkout binds the component origin; host_repo when it differs', async () => {
    const host = join(harness.workspaceDir, 'monorepo');
    const child = join(host, 'app');
    await initRepo(host, 'https://github.com/acme/monorepo.git');
    await initRepo(child, 'https://github.com/acme/app.git');
    await writeFile(
      join(host, '.gitmodules'),
      '[submodule "app"]\n\tpath = app\n\turl = https://github.com/acme/app.git\n',
    );
    const body = await callOk('start_session', {
      workflow_id: 'bare-fixture',
      agent_id: 'orchestrator',
      working_directory: child,
    });
    expect(body['repo']).toBe('acme/app');
    expect(body['host_repo']).toBe('acme/monorepo');
    expect(body['component_path']).toBe('app');
    expect(body['session_index']).toMatch(/^[A-Z2-7]{6}$/);
  });

  it('PR528-TC-03: non-git working_directory is refused; no planning folder is created', async () => {
    const dir = join(harness.workspaceDir, 'not-a-repo');
    mkdirSync(dir, { recursive: true });
    const existing = listPlanning(harness.workspaceDir);
    const err = await callErr('start_session', {
      workflow_id: 'seed-fixture',
      working_directory: dir,
    });
    expect(err).toMatch(/not a git checkout/);
    const after = listPlanning(harness.workspaceDir);
    expect(after.filter((n) => n.includes('not-a-repo'))).toEqual([]);
    expect(after.length).toBe(existing.length);
  });

  it('PR528-TC-04: caller repo disagreeing with derivation is binding-mismatch; nothing created', async () => {
    const checkout = join(harness.workspaceDir, 'tc04', 'workflow-server');
    await initRepo(checkout, 'https://github.com/acme/workflow-server.git');
    const result = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'seed-fixture',
        working_directory: checkout,
        repo: 'other/repo',
      },
    });
    expect(result.isError).toBeFalsy();
    const body = parseToolResponse(result);
    expect(body['session_index']).toBeUndefined();
    expect(body['decision']).toBe('binding-mismatch');
    expect(body['candidates']).toBeDefined();
    expect(body['recommendation']).toMatch(/acme\/workflow-server/);
    const planning = listPlanning(harness.workspaceDir);
    expect(planning.filter((n) => n.includes('tc04'))).toEqual([]);
  });

  it('PR528-TC-05: derived slug that already holds a session throws FOLDER_OCCUPIED; files byte-identical', async () => {
    const checkout = join(harness.workspaceDir, 'tc05', 'workflow-server');
    await initRepo(checkout, 'https://github.com/acme/workflow-server.git');
    const first = await callOk('start_session', {
      workflow_id: 'meta',
      working_directory: checkout,
    });
    const slug = datedSlug('meta');
    const folder = planningFolderPath(harness.workspaceDir, slug);
    const sessionBefore = readFileSync(join(folder, SESSION_FILE_NAME));
    const sealBefore = readFileSync(join(folder, SEAL_FILE_NAME));
    const err = await callErr('start_session', {
      workflow_id: 'meta',
      working_directory: checkout,
    });
    expect(err).toMatch(/already holds a run|FOLDER_OCCUPIED|already holds a session/);
    expect(err).toContain(String(first['session_index']));
    expect(readFileSync(join(folder, SESSION_FILE_NAME))).toEqual(sessionBefore);
    expect(readFileSync(join(folder, SEAL_FILE_NAME))).toEqual(sealBefore);
  });

  it('PR528-TC-06: named planning_folder with a readable session resumes', async () => {
    const slug = '2026-09-11-named-resume';
    const folder = planningFolderPath(harness.workspaceDir, slug);
    const first = await callOk('start_session', {
      workflow_id: 'seed-fixture',
      planning_folder: folder,
    });
    const second = await callOk('start_session', {
      workflow_id: 'bare-fixture',
      planning_folder: folder,
    });
    expect(second['session_index']).toBe(first['session_index']);
    expect(second['workflow']).toMatchObject({ id: 'seed-fixture' });
  });

  it('PR528-TC-07: transient dispatch_child onto an occupied folder throws FOLDER_OCCUPIED', async () => {
    const slug = '2026-09-11-promote-occupied';
    const folder = planningFolderPath(harness.workspaceDir, slug);
    const occupied = await callOk('start_session', {
      workflow_id: 'seed-fixture',
      planning_folder: folder,
      repo: 'acme/workflow-server',
    });
    const sessionBefore = readFileSync(join(folder, SESSION_FILE_NAME));
    const sealBefore = readFileSync(join(folder, SEAL_FILE_NAME));
    const meta = await callOk('start_session', {
      workflow_id: 'meta',
      agent_id: 'orchestrator',
      repo: 'acme/workflow-server',
    });
    const err = await callErr('dispatch_child', {
      session_index: meta['session_index'],
      workflow_id: 'child-fixture',
      planning_slug: slug,
    });
    expect(err).toMatch(/already holds a run|already holds a session/);
    expect(err).toContain(String(occupied['session_index']));
    expect(readFileSync(join(folder, SESSION_FILE_NAME))).toEqual(sessionBefore);
    expect(readFileSync(join(folder, SEAL_FILE_NAME))).toEqual(sealBefore);
  });

  it('PR528-TC-08: transient promote onto a broken seal throws SEAL_MISMATCH; files untouched', async () => {
    const slug = '2026-09-11-promote-unreadable';
    const folder = planningFolderPath(harness.workspaceDir, slug);
    await callOk('start_session', {
      workflow_id: 'seed-fixture',
      planning_folder: folder,
      repo: 'acme/workflow-server',
    });
    const sessionPath = join(folder, SESSION_FILE_NAME);
    const sealPath = join(folder, SEAL_FILE_NAME);
    const tampered = readFileSync(sessionPath).toString('utf8').replace('seed-fixture', 'tampered-id');
    writeFileSync(sessionPath, tampered);
    const sealAfterTamper = readFileSync(sealPath);
    const meta = await callOk('start_session', {
      workflow_id: 'meta',
      repo: 'acme/workflow-server',
    });
    const err = await callErr('dispatch_child', {
      session_index: meta['session_index'],
      workflow_id: 'child-fixture',
      planning_slug: slug,
    });
    expect(err).toMatch(/SEAL_MISMATCH|seal mismatch|rotated signing key/);
    expect(err).toMatch(/rotated signing key/);
    expect(readFileSync(sessionPath, 'utf8')).toBe(tampered);
    expect(readFileSync(sealPath)).toEqual(sealAfterTamper);
  });

  it('PR528-TC-09: persistent-parent dispatch_child still appends; occupancy does not fire', async () => {
    const slug = '2026-09-11-persistent-append';
    const folder = planningFolderPath(harness.workspaceDir, slug);
    const parent = await callOk('start_session', {
      workflow_id: 'seed-fixture',
      planning_folder: folder,
    });
    const first = await callOk('dispatch_child', {
      session_index: parent['session_index'],
      workflow_id: 'child-fixture',
      agent_id: 'worker-a',
    });
    const second = await callOk('dispatch_child', {
      session_index: parent['session_index'],
      workflow_id: 'child-fixture',
      agent_id: 'worker-b',
    });
    expect(first['session_index']).not.toBe(second['session_index']);
    const stored = JSON.parse(readFileSync(join(folder, SESSION_FILE_NAME), 'utf8')) as {
      triggeredWorkflows: Array<{ sessionIndex: string }>;
    };
    expect(stored.triggeredWorkflows).toHaveLength(2);
    expect(stored.triggeredWorkflows.map((c) => c.sessionIndex)).toEqual([
      first['session_index'],
      second['session_index'],
    ]);
  });

  it('PR528-TC-10: host with two unnamed components returns component-choice; naming one creates', async () => {
    const host = join(harness.workspaceDir, 'portfolio');
    await initRepo(host, 'https://github.com/acme/portfolio.git');
    await initRepo(join(host, 'alpha'), 'https://github.com/acme/alpha.git');
    await initRepo(join(host, 'beta'), 'https://github.com/acme/beta.git');
    await writeFile(
      join(host, '.gitmodules'),
      '[submodule "alpha"]\n\tpath = alpha\n\turl = https://github.com/acme/alpha.git\n' +
        '[submodule "beta"]\n\tpath = beta\n\turl = https://github.com/acme/beta.git\n',
    );
    const decision = await harness.client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'child-fixture', working_directory: host },
    });
    expect(decision.isError).toBeFalsy();
    const body = parseToolResponse(decision);
    expect(body['session_index']).toBeUndefined();
    expect(body['decision']).toBe('component-choice');
    expect(body['candidates']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'alpha', repo: 'acme/alpha' }),
        expect.objectContaining({ path: 'beta', repo: 'acme/beta' }),
      ]),
    );
    const created = await callOk('start_session', {
      workflow_id: 'child-fixture',
      working_directory: host,
      user_request: 'work on the alpha component',
    });
    expect(created['session_index']).toMatch(/^[A-Z2-7]{6}$/);
    expect(created['repo']).toBe('acme/portfolio');
  });

  it('rejects a relative working_directory', async () => {
    const err = await callErr('start_session', {
      workflow_id: 'seed-fixture',
      working_directory: 'relative/path',
    });
    expect(err).toMatch(/absolute path/);
  });
});
