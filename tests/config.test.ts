import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { loadConfig, WorkspaceConfigError } from '../src/config.js';

describe('loadConfig — workspace argument', () => {
  let envBefore: string | undefined;

  beforeEach(() => {
    envBefore = process.env['WORKFLOW_WORKSPACE'];
    delete process.env['WORKFLOW_WORKSPACE'];
  });

  afterEach(() => {
    if (envBefore === undefined) delete process.env['WORKFLOW_WORKSPACE'];
    else process.env['WORKFLOW_WORKSPACE'] = envBefore;
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

  describe('neither source provided', () => {
    it('throws WorkspaceConfigError when no CLI flag and no env var', () => {
      expect(() => loadConfig([])).toThrow(WorkspaceConfigError);
    });

    it('throws an actionable message naming both --workspace and WORKFLOW_WORKSPACE', () => {
      expect(() => loadConfig([])).toThrow(/--workspace/);
      expect(() => loadConfig([])).toThrow(/WORKFLOW_WORKSPACE/);
    });

    it('treats whitespace-only WORKFLOW_WORKSPACE as absent', () => {
      process.env['WORKFLOW_WORKSPACE'] = '   ';
      expect(() => loadConfig([])).toThrow(WorkspaceConfigError);
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
