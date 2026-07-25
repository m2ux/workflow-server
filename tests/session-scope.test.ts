import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  buildSessionScope,
  extractRepoFromPath,
  listSessionSearchRoots,
  repoCheckoutBasename,
  resolveMultiRootEngineeringDir,
  resolveSessionRoot,
} from '../src/utils/session/scope.js';
import { REPO_PLANNING_RELATIVE_DIR } from '../src/config.js';
import {
  ensurePlanningFolder,
  findPlanningFolderBySlug,
  planningRoot,
  writeSessionFile,
  resolveSessionLocation,
  PLANNING_RELATIVE_DIR,
} from '../src/utils/session/store.js';
import { createInitialSessionFile } from '../src/schema/session.schema.js';
import { computeSessionIndex } from '../src/utils/session/derivation.js';

describe('session scope (multi-root)', () => {
  it('detects multi-root when engineeringDir is $INSTALL/projects and no process repo', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/projects',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    expect(scope.mode).toBe('multi');
    expect(scope.engineeringMultiRoot).toBe(resolve('/tmp/inst/projects'));
    expect(scope.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
  });

  it('stays single when process is pinned with repo', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/projects/app/.worktrees',
      engineeringDir: '/tmp/inst/projects/app/.engineering',
      installDir: '/tmp/inst',
      repo: 'acme/app',
      serverName: 't',
      serverVersion: '1',
    });
    expect(scope.mode).toBe('single');
    expect(scope.engineeringDir).toBe(resolve('/tmp/inst/projects/app/.engineering'));
  });

  it('repoCheckoutBasename strips owner/', () => {
    expect(repoCheckoutBasename('m2ux/workflow-server')).toBe('workflow-server');
    expect(repoCheckoutBasename('workflow-server')).toBe('workflow-server');
  });

  it('resolveMultiRootEngineeringDir uses basename checkout (not owner/repo)', () => {
    expect(
      resolveMultiRootEngineeringDir('/var/lib/workflow-server/projects', 'm2ux/workflow-server'),
    ).toBe(resolve('/var/lib/workflow-server/projects/workflow-server/.engineering'));
  });

  it('extractRepoFromPath reads basename checkout under multi-root', () => {
    const multi = '/home/u/projects/dev';
    expect(
      extractRepoFromPath(
        `${multi}/workflow-server/.engineering/artifacts/planning/my-slug`,
        multi,
      ),
    ).toBe('workflow-server');
    expect(extractRepoFromPath('/other/path/slug', multi)).toBeUndefined();
  });

  it('extractRepoFromPath still reads legacy owner/repo paths', () => {
    const multi = '/var/lib/workflow-server/projects';
    expect(
      extractRepoFromPath(
        `${multi}/m2ux/workflow-server/.engineering/artifacts/planning/my-slug`,
        multi,
      ),
    ).toBe('m2ux/workflow-server');
  });

  it('resolveSessionRoot requires repo on multi-root and writes under basename checkout', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/projects',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    expect(() => resolveSessionRoot(scope, {})).toThrow(/repo is required/);
    const root = resolveSessionRoot(scope, { repo: 'acme/app' });
    expect(root.engineeringDir).toBe(resolve('/tmp/inst/projects/app/.engineering'));
    expect(root.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
    expect(root.repo).toBe('acme/app');
  });

  it('resolveSessionRoot rejects basename-only path hint without explicit repo', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/projects',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    // Canonical basename path is not a substitute for owner/repo on session.repo.
    expect(() =>
      resolveSessionRoot(scope, {
        planningFolder: '/tmp/inst/projects/app/.engineering/artifacts/planning/slug-1',
      }),
    ).toThrow(/repo is required/);
  });

  it('resolveSessionRoot accepts owner/repo embedded in legacy planning_folder', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/projects',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    const root = resolveSessionRoot(scope, {
      planningFolder:
        '/tmp/inst/projects/acme/app/.engineering/artifacts/planning/slug-1',
    });
    expect(root.repo).toBe('acme/app');
    // New writes still go to the canonical basename checkout.
    expect(root.engineeringDir).toBe(resolve('/tmp/inst/projects/app/.engineering'));
  });

  it('resolveSessionRoot does not treat basename path alone as owner/repo bind', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/projects',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    expect(() =>
      resolveSessionRoot(scope, {
        planningFolder: '/tmp/inst/projects/app/.engineering/artifacts/planning/slug-1',
      }),
    ).toThrow(/repo is required/);
  });

  it('resolveSessionRoot error text tells agents to pass repo from AGENTS.md', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/projects',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    expect(() => resolveSessionRoot(scope, {})).toThrow(/AGENTS\.md/);
  });
});

describe('session multi-root FS search', () => {
  let install: string;

  beforeEach(() => {
    install = mkdtempSync(join(tmpdir(), 'wf-scope-'));
  });

  afterEach(() => {
    rmSync(install, { recursive: true, force: true });
  });

  it('lists basename .engineering checkouts and finds sessions across them', async () => {
    const projectsMulti = join(install, 'projects');
    const repoA = join(projectsMulti, 'a', '.engineering');
    const repoB = join(projectsMulti, 'b', '.engineering');
    mkdirSync(repoA, { recursive: true });
    mkdirSync(repoB, { recursive: true });

    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: join(install, 'worktrees'),
      engineeringDir: projectsMulti,
      installDir: install,
      serverName: 't',
      serverVersion: '1',
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
    });
    expect(scope.mode).toBe('multi');

    const folderA = await ensurePlanningFolder(repoA, 'slug-a', {
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
    });
    const folderB = await ensurePlanningFolder(repoB, 'slug-b', {
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
    });
    expect(folderA).toBe(join(repoA, 'artifacts/planning', 'slug-a'));
    expect(planningRoot(repoA, REPO_PLANNING_RELATIVE_DIR)).toBe(
      join(repoA, 'artifacts/planning'),
    );

    const idxA = await computeSessionIndex(folderA);
    await writeSessionFile(
      folderA,
      createInitialSessionFile({
        sessionIndex: idxA,
        workflowId: 'work-package',
        workflowVersion: '1.0.0',
        agentId: 'orchestrator',
        planningFolderPath: folderA,
      }),
    );
    const idxB = await computeSessionIndex(folderB);
    await writeSessionFile(
      folderB,
      createInitialSessionFile({
        sessionIndex: idxB,
        workflowId: 'work-package',
        workflowVersion: '1.0.0',
        agentId: 'orchestrator',
        planningFolderPath: folderB,
      }),
    );

    const roots = await listSessionSearchRoots(scope);
    expect(roots.sort()).toEqual([resolve(repoA), resolve(repoB)].sort());

    const foundA = await findPlanningFolderBySlug(projectsMulti, 'slug-a', {
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
      searchRoots: roots,
    });
    expect(foundA).toBe(folderA);

    const locB = await resolveSessionLocation(projectsMulti, idxB, {
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
      searchRoots: roots,
    });
    expect(locB.folder).toBe(folderB);
  });

  it('also discovers legacy owner/repo eng checkouts for resume', async () => {
    const projectsMulti = join(install, 'projects');
    const legacy = join(projectsMulti, 'acme', 'legacy-app', '.engineering');
    mkdirSync(legacy, { recursive: true });
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: join(install, 'worktrees'),
      engineeringDir: projectsMulti,
      installDir: install,
      serverName: 't',
      serverVersion: '1',
    });
    const roots = await listSessionSearchRoots(scope);
    expect(roots).toContain(resolve(legacy));
  });

  it('single-root still uses .engineering/artifacts/planning', async () => {
    const ws = join(install, 'ws');
    mkdirSync(ws, { recursive: true });
    const folder = await ensurePlanningFolder(ws, 'single-slug', {
      planningRelativeDir: PLANNING_RELATIVE_DIR,
    });
    expect(folder).toBe(join(ws, '.engineering/artifacts/planning', 'single-slug'));
    writeFileSync(join(folder, 'session.json'), '{}');
  });
});
