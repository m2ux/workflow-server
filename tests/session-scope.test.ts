import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  buildSessionScope,
  extractRepoFromPath,
  listSessionSearchRoots,
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
  it('detects multi-root when engineeringDir is $INSTALL/source and no process repo', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/source',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    expect(scope.mode).toBe('multi');
    expect(scope.engineeringMultiRoot).toBe(resolve('/tmp/inst/source'));
    expect(scope.multiRootLayout).toBe('source');
    expect(scope.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
  });

  it('detects legacy multi-root when engineeringDir is $INSTALL/engineering', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/workspace',
      engineeringDir: '/tmp/inst/engineering',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    expect(scope.mode).toBe('multi');
    expect(scope.multiRootLayout).toBe('legacy');
    expect(scope.engineeringMultiRoot).toBe(resolve('/tmp/inst/engineering'));
  });

  it('stays single when process is pinned with repo', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees/acme/app',
      engineeringDir: '/tmp/inst/source/acme/app/.engineering',
      installDir: '/tmp/inst',
      repo: 'acme/app',
      serverName: 't',
      serverVersion: '1',
    });
    expect(scope.mode).toBe('single');
    expect(scope.engineeringDir).toBe(resolve('/tmp/inst/source/acme/app/.engineering'));
  });

  it('extractRepoFromPath reads owner/repo under source multi-root', () => {
    const multi = '/var/lib/workflow-server/source';
    expect(
      extractRepoFromPath(
        `${multi}/m2ux/workflow-server/.engineering/artifacts/planning/my-slug`,
        multi,
        'source',
      ),
    ).toBe('m2ux/workflow-server');
    expect(extractRepoFromPath('/other/path/slug', multi, 'source')).toBeUndefined();
  });

  it('resolveSessionRoot requires repo on multi-root', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/source',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    expect(() => resolveSessionRoot(scope, {})).toThrow(/repo is required/);
    const root = resolveSessionRoot(scope, { repo: 'acme/app' });
    expect(root.engineeringDir).toBe(resolve('/tmp/inst/source/acme/app/.engineering'));
    expect(root.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
    expect(root.repo).toBe('acme/app');
  });

  it('resolveSessionRoot accepts repo embedded in planning_folder', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/source',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    const root = resolveSessionRoot(scope, {
      planningFolder: '/tmp/inst/source/acme/app/.engineering/artifacts/planning/slug-1',
    });
    expect(root.repo).toBe('acme/app');
    expect(root.engineeringDir).toBe(resolve('/tmp/inst/source/acme/app/.engineering'));
  });

  it('resolveSessionRoot error text tells agents to pass repo from AGENTS.md', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/worktrees',
      engineeringDir: '/tmp/inst/source',
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

  it('lists owner/repo .engineering checkouts and finds sessions across them', async () => {
    const sourceMulti = join(install, 'source');
    const repoA = join(sourceMulti, 'acme', 'a', '.engineering');
    const repoB = join(sourceMulti, 'acme', 'b', '.engineering');
    mkdirSync(repoA, { recursive: true });
    mkdirSync(repoB, { recursive: true });

    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: join(install, 'worktrees'),
      engineeringDir: sourceMulti,
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

    const foundA = await findPlanningFolderBySlug(sourceMulti, 'slug-a', {
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
      searchRoots: roots,
    });
    expect(foundA).toBe(folderA);

    const locB = await resolveSessionLocation(sourceMulti, idxB, {
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
      searchRoots: roots,
    });
    expect(locB.folder).toBe(folderB);
  });

  it('legacy single-root still uses .engineering/artifacts/planning', async () => {
    const ws = join(install, 'ws');
    mkdirSync(ws, { recursive: true });
    const folder = await ensurePlanningFolder(ws, 'legacy-slug', {
      planningRelativeDir: PLANNING_RELATIVE_DIR,
    });
    expect(folder).toBe(join(ws, '.engineering/artifacts/planning', 'legacy-slug'));
    writeFileSync(join(folder, 'session.json'), '{}');
  });
});
