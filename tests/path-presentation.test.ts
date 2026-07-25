import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import {
  buildPathPresentationMap,
  collapseOwnerRepoUnderRoot,
  isPathUnderRoot,
  loadConfig,
  presentPathToAgent,
} from '../src/config.js';
import {
  PLANNING_RELATIVE_DIR,
  setPlanningRelativeDir,
} from '../src/utils/session/store.js';

const ENV_KEYS = [
  'WORKFLOW_WORKSPACE',
  'WORKTREE_ROOT',
  'WORKFLOW_SERVER_REPO',
  'WORKFLOW_SERVER_INSTALL_DIR',
  'WORKFLOW_SERVER_ENGINEERING_DIR',
  'HOST_PROJECTS_ROOT',
  'HOST_WORKTREE_ROOT',
  'HOST_PROJECTS_DIR',
  'HOST_WORKTREE_DIR',
  'PLANNING_SLUG',
] as const;

function clearEnv(): Record<string, string | undefined> {
  const before: Record<string, string | undefined> = {};
  for (const k of ENV_KEYS) {
    before[k] = process.env[k];
    delete process.env[k];
  }
  return before;
}

function restoreEnv(before: Record<string, string | undefined>): void {
  for (const k of ENV_KEYS) {
    if (before[k] === undefined) delete process.env[k];
    else process.env[k] = before[k];
  }
  setPlanningRelativeDir(PLANNING_RELATIVE_DIR);
}

describe('path presentation helpers', () => {
  it('isPathUnderRoot matches root and descendants only', () => {
    expect(isPathUnderRoot('/var/lib/ws/projects', '/var/lib/ws/projects')).toBe(true);
    expect(
      isPathUnderRoot('/var/lib/ws/projects/m2ux/app', '/var/lib/ws/projects'),
    ).toBe(true);
    expect(
      isPathUnderRoot('/var/lib/ws/projects-extra', '/var/lib/ws/projects'),
    ).toBe(false);
    expect(isPathUnderRoot('/other', '/var/lib/ws/projects')).toBe(false);
  });

  it('collapseOwnerRepoUnderRoot maps owner/repo → basename', () => {
    const root = '/home/mike1/projects/dev';
    expect(
      collapseOwnerRepoUnderRoot(
        `${root}/m2ux/workflow-server/.engineering/artifacts/planning/slug`,
        root,
      ),
    ).toBe(resolve(`${root}/workflow-server/.engineering/artifacts/planning/slug`));
    // Already basename — unchanged
    expect(
      collapseOwnerRepoUnderRoot(
        `${root}/workflow-server/.engineering/artifacts/planning/slug`,
        root,
      ),
    ).toBe(resolve(`${root}/workflow-server/.engineering/artifacts/planning/slug`));
  });

  it('presentPathToAgent rewrites container path to host basename layout', () => {
    const map = buildPathPresentationMap({
      serverProjectsRoot: '/var/lib/workflow-server/projects',
      hostProjectsRoot: '/home/mike1/projects/dev',
    });
    expect(map).toBeDefined();
    // Server still holding deprecated owner/repo → agent gets basename checkout
    expect(
      presentPathToAgent(
        '/var/lib/workflow-server/projects/m2ux/workflow-server/.engineering/artifacts/planning/slug',
        map,
      ),
    ).toBe(
      resolve(
        '/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/slug',
      ),
    );
    // Server already on basename layout
    expect(
      presentPathToAgent(
        '/var/lib/workflow-server/projects/workflow-server/.engineering/artifacts/planning/slug',
        map,
      ),
    ).toBe(
      resolve(
        '/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/slug',
      ),
    );
  });

  it('presentPathToAgent is identity without a map', () => {
    const p = '/tmp/workspace/.engineering/artifacts/planning/slug';
    expect(presentPathToAgent(p, undefined)).toBe(resolve(p));
  });

  it('presentPathToAgent prefers longer worktree prefix over projects', () => {
    const map = buildPathPresentationMap({
      serverProjectsRoot: '/var/lib/workflow-server/projects',
      hostProjectsRoot: '/home/u/projects',
      serverWorktreeRoot: '/var/lib/workflow-server/worktrees',
      hostWorktreeRoot: '/home/u/worktrees',
      collapseOwnerRepo: false,
    });
    expect(
      presentPathToAgent(
        '/var/lib/workflow-server/worktrees/m2ux/app/feature',
        map,
      ),
    ).toBe(resolve('/home/u/worktrees/m2ux/app/feature'));
    expect(
      presentPathToAgent(
        '/var/lib/workflow-server/projects/m2ux/app/.engineering/artifacts/planning/s',
        map,
      ),
    ).toBe(resolve('/home/u/projects/m2ux/app/.engineering/artifacts/planning/s'));
  });

  it('buildPathPresentationMap returns undefined without host root', () => {
    expect(
      buildPathPresentationMap({
        serverProjectsRoot: '/var/lib/workflow-server/projects',
      }),
    ).toBeUndefined();
  });
});

describe('loadConfig path presentation', () => {
  let envBefore: Record<string, string | undefined>;

  beforeEach(() => {
    envBefore = clearEnv();
  });

  afterEach(() => {
    restoreEnv(envBefore);
  });

  it('loads HOST_PROJECTS_ROOT and presents canonical host basename paths', () => {
    process.env['WORKTREE_ROOT'] = '/var/lib/workflow-server/projects';
    process.env['WORKFLOW_WORKSPACE'] = '/var/lib/workflow-server/projects';
    process.env['WORKFLOW_SERVER_ENGINEERING_DIR'] =
      '/var/lib/workflow-server/projects';
    process.env['WORKFLOW_SERVER_INSTALL_DIR'] = '/var/lib/workflow-server';
    process.env['HOST_PROJECTS_ROOT'] = '/home/mike1/projects/dev';

    const config = loadConfig([]);
    expect(config.hostProjectsRoot).toBe(resolve('/home/mike1/projects/dev'));
    expect(config.pathPresentation?.hostProjectsRoot).toBe(
      resolve('/home/mike1/projects/dev'),
    );
    expect(config.pathPresentation?.serverProjectsRoot).toBe(
      resolve('/var/lib/workflow-server/projects'),
    );

    const presented = presentPathToAgent(
      '/var/lib/workflow-server/projects/m2ux/workflow-server/.engineering/artifacts/planning/2026-07-25-gate-resume-lookup-on-keyword',
      config.pathPresentation,
    );
    expect(presented).toBe(
      resolve(
        '/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-07-25-gate-resume-lookup-on-keyword',
      ),
    );
  });

  it('omits pathPresentation when HOST_PROJECTS_ROOT is unset', () => {
    process.env['WORKTREE_ROOT'] = '/tmp/ws';
    process.env['WORKFLOW_WORKSPACE'] = '/tmp/ws';
    const config = loadConfig([]);
    expect(config.pathPresentation).toBeUndefined();
    expect(config.hostProjectsRoot).toBeUndefined();
  });
});
