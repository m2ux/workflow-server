import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  loadConfig,
  normalizeRepoPath,
  resolvePlanningRelativeDir,
  resolveRepoPaths,
  REPO_PLANNING_RELATIVE_DIR,
  WorkspaceConfigError,
} from '../src/config.js';
import {
  PLANNING_RELATIVE_DIR,
  planningRoot,
  setPlanningRelativeDir,
} from '../src/utils/session/store.js';

const REPO_ENV_KEYS = [
  'WORKFLOW_WORKSPACE',
  'WORKTREE_ROOT',
  'WORKFLOW_SERVER_REPO',
  'WORKFLOW_SERVER_INSTALL_DIR',
  'WORKFLOW_SERVER_ENGINEERING_DIR',
  'XDG_DATA_HOME',
  'PLANNING_SLUG',
] as const;

function clearRepoEnv(): Record<string, string | undefined> {
  const before: Record<string, string | undefined> = {};
  for (const k of REPO_ENV_KEYS) {
    before[k] = process.env[k];
    delete process.env[k];
  }
  return before;
}

function restoreRepoEnv(before: Record<string, string | undefined>): void {
  for (const k of REPO_ENV_KEYS) {
    if (before[k] === undefined) delete process.env[k];
    else process.env[k] = before[k];
  }
  setPlanningRelativeDir(PLANNING_RELATIVE_DIR);
}

describe('loadConfig — workspace argument', () => {
  let envBefore: Record<string, string | undefined>;

  beforeEach(() => {
    envBefore = clearRepoEnv();
  });

  afterEach(() => {
    restoreRepoEnv(envBefore);
  });

  describe('--workspace=PATH CLI flag', () => {
    it('exposes workspaceDir resolved to an absolute path from --workspace=PATH', () => {
      const config = loadConfig(['--workspace=/tmp/example-workspace']);
      expect(config.workspaceDir).toBe(resolve('/tmp/example-workspace'));
    });

    it('also accepts the space-separated --workspace PATH form', () => {
      const config = loadConfig(['--workspace', '/tmp/example-workspace']);
      expect(config.workspaceDir).toBe(resolve('/tmp/example-workspace'));
    });

    it('resolves relative paths against the current working directory', () => {
      const config = loadConfig(['--workspace=./relative-ws']);
      expect(config.workspaceDir).toBe(resolve('./relative-ws'));
    });
  });

  describe('WORKFLOW_WORKSPACE env fallback', () => {
    it('uses WORKFLOW_WORKSPACE when no CLI flag is supplied', () => {
      process.env['WORKFLOW_WORKSPACE'] = '/tmp/env-workspace';
      const config = loadConfig([]);
      expect(config.workspaceDir).toBe(resolve('/tmp/env-workspace'));
    });

    it('trims whitespace from the env value', () => {
      process.env['WORKFLOW_WORKSPACE'] = '  /tmp/env-workspace  ';
      const config = loadConfig([]);
      expect(config.workspaceDir).toBe(resolve('/tmp/env-workspace'));
    });
  });

  describe('CLI wins over env', () => {
    it('prefers --workspace=PATH over WORKFLOW_WORKSPACE when both are present', () => {
      process.env['WORKFLOW_WORKSPACE'] = '/tmp/env-workspace';
      const config = loadConfig(['--workspace=/tmp/cli-workspace']);
      expect(config.workspaceDir).toBe(resolve('/tmp/cli-workspace'));
    });

    it('falls through to env when --workspace= is supplied with an empty value', () => {
      process.env['WORKFLOW_WORKSPACE'] = '/tmp/env-workspace';
      const config = loadConfig(['--workspace=']);
      expect(config.workspaceDir).toBe(resolve('/tmp/env-workspace'));
    });
  });

  describe('WORKTREE_ROOT env alias', () => {
    it('uses WORKTREE_ROOT alone when CLI and WORKFLOW_WORKSPACE are absent (PR267-TC-02)', () => {
      process.env['WORKTREE_ROOT'] = '/tmp/worktree-root-alone';
      const config = loadConfig([]);
      expect(config.workspaceDir).toBe(resolve('/tmp/worktree-root-alone'));
    });

    it('trims whitespace from WORKTREE_ROOT', () => {
      process.env['WORKTREE_ROOT'] = '  /tmp/worktree-root-trimmed  ';
      const config = loadConfig([]);
      expect(config.workspaceDir).toBe(resolve('/tmp/worktree-root-trimmed'));
    });
  });

  describe('CLI > WORKFLOW_WORKSPACE > WORKTREE_ROOT precedence (PR267-TC-03)', () => {
    it('prefers --workspace over both env vars', () => {
      process.env['WORKFLOW_WORKSPACE'] = '/tmp/env-workspace';
      process.env['WORKTREE_ROOT'] = '/tmp/worktree-root';
      const config = loadConfig(['--workspace=/tmp/cli-workspace']);
      expect(config.workspaceDir).toBe(resolve('/tmp/cli-workspace'));
    });

    it('prefers WORKFLOW_WORKSPACE over WORKTREE_ROOT when CLI is absent', () => {
      process.env['WORKFLOW_WORKSPACE'] = '/tmp/env-workspace';
      process.env['WORKTREE_ROOT'] = '/tmp/worktree-root';
      const config = loadConfig([]);
      expect(config.workspaceDir).toBe(resolve('/tmp/env-workspace'));
    });

    it('falls through to WORKTREE_ROOT when CLI and WORKFLOW_WORKSPACE are absent', () => {
      process.env['WORKTREE_ROOT'] = '/tmp/worktree-root';
      const config = loadConfig([]);
      expect(config.workspaceDir).toBe(resolve('/tmp/worktree-root'));
    });
  });

  describe('neither source provided', () => {
    it('throws WorkspaceConfigError when no CLI flag and no env var', () => {
      expect(() => loadConfig([])).toThrow(WorkspaceConfigError);
    });

    it('throws an actionable message naming --repo, --workspace, and env vars', () => {
      expect(() => loadConfig([])).toThrow(/--repo/);
      expect(() => loadConfig([])).toThrow(/--workspace/);
      expect(() => loadConfig([])).toThrow(/WORKFLOW_WORKSPACE/);
      expect(() => loadConfig([])).toThrow(/WORKTREE_ROOT/);
      expect(() => loadConfig([])).toThrow(/worktree/i);
    });

    it('treats whitespace-only WORKFLOW_WORKSPACE as absent', () => {
      process.env['WORKFLOW_WORKSPACE'] = '   ';
      expect(() => loadConfig([])).toThrow(WorkspaceConfigError);
    });

    it('treats whitespace-only WORKTREE_ROOT as absent', () => {
      process.env['WORKTREE_ROOT'] = '   ';
      expect(() => loadConfig([])).toThrow(WorkspaceConfigError);
    });
  });

  describe('legacy single-root layout', () => {
    it('sets engineeringDir equal to workspaceDir when no engineering override', () => {
      const config = loadConfig(['--workspace=/tmp/ws']);
      expect(config.engineeringDir).toBe(resolve('/tmp/ws'));
      expect(config.workspaceDir).toBe(resolve('/tmp/ws'));
    });

    it('honours WORKFLOW_SERVER_ENGINEERING_DIR override', () => {
      process.env['WORKFLOW_SERVER_ENGINEERING_DIR'] = '/tmp/eng-only';
      const config = loadConfig(['--workspace=/tmp/ws']);
      expect(config.workspaceDir).toBe(resolve('/tmp/ws'));
      expect(config.engineeringDir).toBe(resolve('/tmp/eng-only'));
      expect(config.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
    });
  });

  describe('non-workspace fields remain stable', () => {
    it('still populates workflowDir, schemasDir, serverName, serverVersion', () => {
      const config = loadConfig(['--workspace=/tmp/ws']);
      expect(config.workflowDir).toMatch(/workflows$/);
      expect(config.schemasDir).toMatch(/schemas$/);
      expect(config.serverName).toBe('workflow-server');
      // 2.0.0: breaking API change (#189 C1c: context_tokens REQUIRED on get_activity).
      // 2.1.0: additive payload-rendering hints (#189 cluster 2 — C4/C5/C7).
      expect(config.serverVersion).toBe('2.1.0');
    });

    it('derives the eager-bundling budget constants (env-overridable) with the policy defaults', () => {
      const config = loadConfig(['--workspace=/tmp/ws']);
      expect(config.bundleHeadroomFraction).toBe(0.8);
      expect(config.bundleCharsPerToken).toBe(4);
    });

    it('derives the batch bound with a headroom fraction of its own, well under the bundling one', () => {
      const config = loadConfig(['--workspace=/tmp/ws']);
      expect(config.batchHeadroomFraction).toBe(0.35);
      expect(config.batchMaxActivities).toBe(3);
      // The two answer different questions, and applying the bundling fraction to a batch would
      // admit thirteen of the main workflow's fifteen activities into one context.
      expect(config.batchHeadroomFraction!).toBeLessThan(config.bundleHeadroomFraction!);
    });

    it('takes the batch bound from the environment when it is set', () => {
      process.env['BATCH_HEADROOM_FRACTION'] = '0.5';
      process.env['BATCH_MAX_ACTIVITIES'] = '2';
      try {
        const config = loadConfig(['--workspace=/tmp/ws']);
        expect(config.batchHeadroomFraction).toBe(0.5);
        expect(config.batchMaxActivities).toBe(2);
      } finally {
        delete process.env['BATCH_HEADROOM_FRACTION'];
        delete process.env['BATCH_MAX_ACTIVITIES'];
      }
    });

    it('clamps an out-of-range batch bound to the nearest end rather than the default', () => {
      // Zero is how an operator says "no batching". Falling back to the default would hand back 3,
      // the LOOSEST setting and the opposite of the request, with nothing said about it.
      process.env['BATCH_MAX_ACTIVITIES'] = '0';
      process.env['BATCH_HEADROOM_FRACTION'] = '5';
      try {
        const config = loadConfig(['--workspace=/tmp/ws']);
        expect(config.batchMaxActivities).toBe(1);
        // A fraction above one would budget a batch more than the window it is measured against.
        expect(config.batchHeadroomFraction).toBe(1);
      } finally {
        delete process.env['BATCH_MAX_ACTIVITIES'];
        delete process.env['BATCH_HEADROOM_FRACTION'];
      }
    });

    it('keeps the default when the batch bound is set to something that is not a number', () => {
      process.env['BATCH_MAX_ACTIVITIES'] = 'lots';
      try {
        expect(loadConfig(['--workspace=/tmp/ws']).batchMaxActivities).toBe(3);
      } finally {
        delete process.env['BATCH_MAX_ACTIVITIES'];
      }
    });
  });
});

describe('normalizeRepoPath / resolveRepoPaths', () => {
  it('accepts owner/repo', () => {
    expect(normalizeRepoPath('m2ux/workflow-server')).toBe('m2ux/workflow-server');
  });

  it('accepts https and ssh URLs', () => {
    expect(normalizeRepoPath('https://github.com/m2ux/workflow-server.git')).toBe(
      'm2ux/workflow-server',
    );
    expect(normalizeRepoPath('git@github.com:acme/app.git')).toBe('acme/app');
  });

  it('rejects bare names and empty input', () => {
    expect(() => normalizeRepoPath('workflow-server')).toThrow(WorkspaceConfigError);
    expect(() => normalizeRepoPath('  ')).toThrow(WorkspaceConfigError);
  });

  it('derives basename checkout, engineering, and nested .worktrees', () => {
    const paths = resolveRepoPaths('m2ux/workflow-server', '/data/workflow-server');
    expect(paths.repo).toBe('m2ux/workflow-server');
    expect(paths.checkoutName).toBe('workflow-server');
    expect(paths.installDir).toBe(resolve('/data/workflow-server'));
    expect(paths.projectsDir).toBe(
      resolve('/data/workflow-server/projects/workflow-server'),
    );
    expect(paths.engineeringDir).toBe(
      resolve('/data/workflow-server/projects/workflow-server/.engineering'),
    );
    expect(paths.workspaceDir).toBe(
      resolve('/data/workflow-server/projects/workflow-server/.worktrees'),
    );
  });
});

describe('loadConfig — --repo binding', () => {
  let envBefore: Record<string, string | undefined>;

  beforeEach(() => {
    envBefore = clearRepoEnv();
  });

  afterEach(() => {
    restoreRepoEnv(envBefore);
  });

  it('resolves nested .worktrees and eng-in-projects from --repo=owner/repo', () => {
    const config = loadConfig([
      '--repo=m2ux/workflow-server',
      '--install-dir=/tmp/wf-install',
    ]);
    expect(config.repo).toBe('m2ux/workflow-server');
    expect(config.installDir).toBe(resolve('/tmp/wf-install'));
    expect(config.workspaceDir).toBe(
      resolve('/tmp/wf-install/projects/workflow-server/.worktrees'),
    );
    expect(config.engineeringDir).toBe(
      resolve('/tmp/wf-install/projects/workflow-server/.engineering'),
    );
    expect(config.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
    expect(planningRoot(config.engineeringDir!)).toBe(
      join(config.engineeringDir!, REPO_PLANNING_RELATIVE_DIR),
    );
  });

  it('accepts space-separated --repo and WORKFLOW_SERVER_REPO env', () => {
    const fromCli = loadConfig([
      '--repo',
      'acme/app',
      '--install-dir=/tmp/inst',
    ]);
    expect(fromCli.repo).toBe('acme/app');
    expect(fromCli.workspaceDir).toBe(
      resolve('/tmp/inst/projects/app/.worktrees'),
    );

    process.env['WORKFLOW_SERVER_REPO'] = 'acme/from-env';
    process.env['WORKFLOW_SERVER_INSTALL_DIR'] = '/tmp/inst-env';
    const fromEnv = loadConfig([]);
    expect(fromEnv.repo).toBe('acme/from-env');
    expect(fromEnv.engineeringDir).toBe(
      resolve('/tmp/inst-env/projects/from-env/.engineering'),
    );
  });

  it('prefers an explicit non-install workspace over --repo', () => {
    const config = loadConfig([
      '--workspace=/tmp/explicit-ws',
      '--repo=m2ux/workflow-server',
      '--install-dir=/tmp/ignored',
    ]);
    expect(config.workspaceDir).toBe(resolve('/tmp/explicit-ws'));
    expect(config.engineeringDir).toBe(resolve('/tmp/explicit-ws'));
    expect(config.repo).toBe('m2ux/workflow-server');
    expect(config.planningRelativeDir).toBe(PLANNING_RELATIVE_DIR);
  });

  it('Docker multi-root WORKTREE_ROOT keeps multi-root (repo is session-time)', () => {
    // Nested model: start.sh binds HOST_PROJECTS_ROOT for both workspace + eng.
    // Legacy separate $INSTALL/worktrees multi-root is still recognised.
    // WORKFLOW_SERVER_REPO must not pin the process — start_session selects repo.
    process.env['WORKTREE_ROOT'] = '/tmp/wf-install/projects';
    process.env['WORKFLOW_WORKSPACE'] = '/tmp/wf-install/projects';
    process.env['WORKFLOW_SERVER_ENGINEERING_DIR'] = '/tmp/wf-install/projects';
    process.env['WORKFLOW_SERVER_INSTALL_DIR'] = '/tmp/wf-install';
    process.env['WORKFLOW_SERVER_REPO'] = 'm2ux/workflow-server';
    const config = loadConfig([]);
    expect(config.installDir).toBe(resolve('/tmp/wf-install'));
    expect(config.repo).toBeUndefined();
    expect(config.workspaceDir).toBe(resolve('/tmp/wf-install/projects'));
    expect(config.engineeringDir).toBe(resolve('/tmp/wf-install/projects'));
    expect(config.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
  });

  it('CLI --workspace at install multi-root with ENGINEERING_DIR stays multi-root', () => {
    process.env['WORKFLOW_SERVER_ENGINEERING_DIR'] = '/tmp/wf-install/projects';
    const config = loadConfig([
      '--workspace=/tmp/wf-install/projects',
      '--repo=acme/app',
      '--install-dir=/tmp/wf-install',
    ]);
    expect(config.workspaceDir).toBe(resolve('/tmp/wf-install/projects'));
    expect(config.engineeringDir).toBe(resolve('/tmp/wf-install/projects'));
    expect(config.installDir).toBe(resolve('/tmp/wf-install'));
    expect(config.repo).toBeUndefined();
    expect(config.planningRelativeDir).toBe(REPO_PLANNING_RELATIVE_DIR);
  });

  it('legacy separate worktrees multi-root still stays multi-root', () => {
    process.env['WORKFLOW_SERVER_ENGINEERING_DIR'] = '/tmp/wf-install/projects';
    const config = loadConfig([
      '--workspace=/tmp/wf-install/worktrees',
      '--repo=acme/app',
      '--install-dir=/tmp/wf-install',
    ]);
    expect(config.workspaceDir).toBe(resolve('/tmp/wf-install/worktrees'));
    expect(config.engineeringDir).toBe(resolve('/tmp/wf-install/projects'));
    expect(config.repo).toBeUndefined();
  });

  it('defaults install dir to ~/.local/share/workflow-server', () => {
    const config = loadConfig(['--repo=m2ux/workflow-server']);
    expect(config.installDir).toBe(
      resolve(homedir(), '.local/share/workflow-server'),
    );
    expect(config.workspaceDir).toBe(
      resolve(
        homedir(),
        '.local/share/workflow-server/projects/workflow-server/.worktrees',
      ),
    );
  });

  it('throws on invalid --repo', () => {
    expect(() => loadConfig(['--repo=not-a-path'])).toThrow(WorkspaceConfigError);
  });
});

describe('loadConfig — transport selection', () => {
  const envKeys = ['TRANSPORT', 'PORT', 'HOST'] as const;
  let envBefore: Record<string, string | undefined>;

  beforeEach(() => {
    envBefore = Object.fromEntries(envKeys.map((k) => [k, process.env[k]]));
    for (const k of envKeys) delete process.env[k];
  });

  afterEach(() => {
    for (const k of envKeys) {
      if (envBefore[k] === undefined) delete process.env[k];
      else process.env[k] = envBefore[k];
    }
  });

  it('defaults transport to stdio when --transport is absent', () => {
    const config = loadConfig(['--workspace=/tmp/ws']);
    expect(config.transport).toBe('stdio');
  });

  it('parses --transport=http', () => {
    const config = loadConfig(['--workspace=/tmp/ws', '--transport=http']);
    expect(config.transport).toBe('http');
  });

  it('parses the space-separated --transport http form', () => {
    const config = loadConfig(['--workspace=/tmp/ws', '--transport', 'http']);
    expect(config.transport).toBe('http');
  });

  it('falls back to the TRANSPORT env var when no CLI flag is supplied', () => {
    process.env['TRANSPORT'] = 'http';
    const config = loadConfig(['--workspace=/tmp/ws']);
    expect(config.transport).toBe('http');
  });

  it('prefers --transport over TRANSPORT when both are present', () => {
    process.env['TRANSPORT'] = 'http';
    const config = loadConfig(['--workspace=/tmp/ws', '--transport=stdio']);
    expect(config.transport).toBe('stdio');
  });

  it('throws WorkspaceConfigError on an unrecognized --transport value', () => {
    expect(() => loadConfig(['--workspace=/tmp/ws', '--transport=websocket'])).toThrow(WorkspaceConfigError);
    expect(() => loadConfig(['--workspace=/tmp/ws', '--transport=websocket'])).toThrow(/Unrecognized --transport/);
  });

  it('defaults port to 3000 and host to localhost', () => {
    const config = loadConfig(['--workspace=/tmp/ws']);
    expect(config.port).toBe(3000);
    expect(config.host).toBe('localhost');
  });

  it('parses --port and --host', () => {
    const config = loadConfig(['--workspace=/tmp/ws', '--port=8080', '--host=0.0.0.0']);
    expect(config.port).toBe(8080);
    expect(config.host).toBe('0.0.0.0');
  });

  it('prefers --port/--host CLI values over PORT/HOST env vars', () => {
    process.env['PORT'] = '9999';
    process.env['HOST'] = '10.0.0.1';
    const config = loadConfig(['--workspace=/tmp/ws', '--port=8080', '--host=0.0.0.0']);
    expect(config.port).toBe(8080);
    expect(config.host).toBe('0.0.0.0');
  });

  it('falls back to the default port on a non-positive-integer PORT value', () => {
    const config = loadConfig(['--workspace=/tmp/ws', '--port=not-a-number']);
    expect(config.port).toBe(3000);
  });
});

describe('loadConfig — PLANNING_SLUG', () => {
  let envBefore: Record<string, string | undefined>;

  beforeEach(() => {
    envBefore = clearRepoEnv();
  });

  afterEach(() => {
    restoreRepoEnv(envBefore);
  });

  it('defaults planningRelativeDir to .engineering/artifacts/planning (PR267-TC-04)', () => {
    const config = loadConfig(['--workspace=/tmp/ws']);
    expect(config.planningRelativeDir).toBe(PLANNING_RELATIVE_DIR);
    expect(planningRoot('/tmp/ws')).toBe(join('/tmp/ws', PLANNING_RELATIVE_DIR));
  });

  it('overrides planning root via PLANNING_SLUG (PR267-TC-05)', () => {
    process.env['PLANNING_SLUG'] = '.engineering/planning';
    const config = loadConfig(['--workspace=/tmp/ws']);
    expect(config.planningRelativeDir).toBe('.engineering/planning');
    expect(planningRoot('/tmp/ws')).toBe(join('/tmp/ws', '.engineering/planning'));
  });

  it('falls back to default when PLANNING_SLUG is empty or whitespace', () => {
    process.env['PLANNING_SLUG'] = '   ';
    expect(resolvePlanningRelativeDir()).toBe(PLANNING_RELATIVE_DIR);
    const config = loadConfig(['--workspace=/tmp/ws']);
    expect(config.planningRelativeDir).toBe(PLANNING_RELATIVE_DIR);
  });
});

describe('loadConfig — workflowDir', () => {
  let workflowDirBefore: string | undefined;
  let envBefore: Record<string, string | undefined>;

  beforeEach(() => {
    workflowDirBefore = process.env['WORKFLOW_DIR'];
    envBefore = clearRepoEnv();
    delete process.env['WORKFLOW_DIR'];
  });

  afterEach(() => {
    if (workflowDirBefore === undefined) delete process.env['WORKFLOW_DIR'];
    else process.env['WORKFLOW_DIR'] = workflowDirBefore;
    restoreRepoEnv(envBefore);
  });

  it('defaults workflowDir to ./workflows under the install root', () => {
    const config = loadConfig(['--workspace=/tmp/ws']);
    expect(config.workflowDir).toBe(resolve(import.meta.dirname, '..', 'workflows'));
  });

  it('accepts --workflow-dir=PATH', () => {
    const config = loadConfig([
      '--workspace=/tmp/ws',
      '--workflow-dir=/tmp/custom-workflows',
    ]);
    expect(config.workflowDir).toBe(resolve('/tmp/custom-workflows'));
  });

  it('accepts space-separated --workflow-dir PATH', () => {
    const config = loadConfig([
      '--workspace=/tmp/ws',
      '--workflow-dir',
      '/tmp/custom-workflows',
    ]);
    expect(config.workflowDir).toBe(resolve('/tmp/custom-workflows'));
  });

  it('prefers --workflow-dir over WORKFLOW_DIR env', () => {
    process.env['WORKFLOW_DIR'] = '/tmp/env-workflows';
    const config = loadConfig([
      '--workspace=/tmp/ws',
      '--workflow-dir=/tmp/cli-workflows',
    ]);
    expect(config.workflowDir).toBe(resolve('/tmp/cli-workflows'));
  });

  it('uses WORKFLOW_DIR when CLI is absent', () => {
    process.env['WORKFLOW_DIR'] = '/tmp/env-workflows';
    const config = loadConfig(['--workspace=/tmp/ws']);
    expect(config.workflowDir).toBe(resolve('/tmp/env-workflows'));
  });
});
