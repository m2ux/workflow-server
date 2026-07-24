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
  it('detects multi-root when engineeringDir is $INSTALL/engineering and no process repo', () => {
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
    expect(scope.engineeringMultiRoot).toBe(resolve('/tmp/inst/engineering'));
    expect(scope.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
  });

  it('stays single when process is pinned with repo', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/workspace/acme/app',
      engineeringDir: '/tmp/inst/engineering/acme/app',
      installDir: '/tmp/inst',
      repo: 'acme/app',
      serverName: 't',
      serverVersion: '1',
    });
    expect(scope.mode).toBe('single');
    expect(scope.engineeringDir).toBe(resolve('/tmp/inst/engineering/acme/app'));
  });

  it('extractRepoFromPath reads owner/repo under multi-root', () => {
    const multi = '/var/lib/workflow-server/engineering';
    expect(
      extractRepoFromPath(
        `${multi}/m2ux/workflow-server/artifacts/planning/my-slug`,
        multi,
      ),
    ).toBe('m2ux/workflow-server');
    expect(extractRepoFromPath('/other/path/slug', multi)).toBeUndefined();
  });

  it('resolveSessionRoot requires repo on multi-root', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/workspace',
      engineeringDir: '/tmp/inst/engineering',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    expect(() => resolveSessionRoot(scope, {})).toThrow(/repo is required/);
    const root = resolveSessionRoot(scope, { repo: 'acme/app' });
    expect(root.engineeringDir).toBe(resolve('/tmp/inst/engineering/acme/app'));
    expect(root.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
    expect(root.repo).toBe('acme/app');
  });

  it('resolveSessionRoot accepts repo embedded in planning_folder', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/workspace',
      engineeringDir: '/tmp/inst/engineering',
      installDir: '/tmp/inst',
      serverName: 't',
      serverVersion: '1',
    });
    const root = resolveSessionRoot(scope, {
      planningFolder: '/tmp/inst/engineering/acme/app/artifacts/planning/slug-1',
    });
    expect(root.repo).toBe('acme/app');
    expect(root.engineeringDir).toBe(resolve('/tmp/inst/engineering/acme/app'));
  });

  it('resolveSessionRoot error text tells agents to pass repo from AGENTS.md', () => {
    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: '/tmp/inst/workspace',
      engineeringDir: '/tmp/inst/engineering',
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

  it('lists owner/repo checkouts and finds sessions across them', async () => {
    const engMulti = join(install, 'engineering');
    const repoA = join(engMulti, 'acme', 'a');
    const repoB = join(engMulti, 'acme', 'b');
    mkdirSync(repoA, { recursive: true });
    mkdirSync(repoB, { recursive: true });

    const scope = buildSessionScope({
      workflowDir: '/w',
      schemasDir: '/s',
      workspaceDir: join(install, 'workspace'),
      engineeringDir: engMulti,
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

    const foundA = await findPlanningFolderBySlug(engMulti, 'slug-a', {
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
      searchRoots: roots,
    });
    expect(foundA).toBe(folderA);

    const locB = await resolveSessionLocation(engMulti, idxB, {
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
    // touch a marker so find can see it
    writeFileSync(join(folder, 'session.json'), '{}');
  });
});
