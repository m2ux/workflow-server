import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Express } from 'express';
import type { Server as HttpServer, AddressInfo } from 'node:net';
import { resolve, join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import type { ServerConfig } from '../src/config.js';
import { loadConfig } from '../src/config.js';
import { createHttpApp, shutdownHandler, startHttpServer } from '../src/transports/http.js';
import { PLANNING_RELATIVE_DIR, setPlanningRelativeDir } from '../src/utils/session/store.js';
import { corpusRoot } from './corpus-root.js';

function buildConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    workflowDir: corpusRoot(),
    schemasDir: resolve(import.meta.dirname, '../schemas'),
    workspaceDir: mkdtempSync(join(tmpdir(), 'wf-http-test-')),
    serverName: 'test-http-workflow-server',
    serverVersion: '1.0.0',
    minCheckpointResponseSeconds: 0,
    ...overrides,
  };
}

interface Response {
  status: number;
  headers: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}

/**
 * Issue one request against `app` over a real socket on an ephemeral port.
 *
 * Session state lives on the app rather than the listener, so successive calls share it. A body
 * that is not JSON is discarded unread — an open event stream would otherwise keep the listener
 * from closing.
 */
async function call(app: Express, path: string, init: RequestInit = {}): Promise<Response> {
  const server: HttpServer = await new Promise((ready) => {
    const s = app.listen(0, '127.0.0.1', () => ready(s));
  });
  try {
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}${path}`, init);
    // ponytail: no test reads an event-stream body, read the stream instead of cancelling when one does
    const isJson = res.headers.get('content-type')?.includes('application/json') ?? false;
    const body = isJson ? await res.json().catch(() => ({})) : (await res.body?.cancel(), {});
    return { status: res.status, headers: Object.fromEntries(res.headers), body };
  } finally {
    server.closeAllConnections();
    await new Promise((closed) => server.close(closed));
  }
}

const get = (app: Express, path: string, headers: Record<string, string> = {}): Promise<Response> =>
  call(app, path, { headers });

const postJson = (app: Express, path: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> =>
  call(app, path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

describe('HTTP transport', () => {
  let app: Express;
  let workspaceDir: string;

  beforeEach(() => {
    const config = buildConfig();
    workspaceDir = config.workspaceDir;
    app = createHttpApp(config);
  });

  afterEach(() => {
    rmSync(workspaceDir, { recursive: true, force: true });
  });

  describe('health and readiness', () => {
    it('GET /health returns 200 with status ok', async () => {
      const res = await get(app, '/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });

    it('GET /ready returns 200 with status ready when all directories exist', async () => {
      const res = await get(app, '/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.checks).toEqual({
        workflowDir: true,
        schemasDir: true,
        workspaceDir: true,
        sessionKeyWritable: true,
      });
    });

    it('GET /ready returns 503 with status not-ready when workspaceDir is missing', async () => {
      const config = buildConfig({ workspaceDir: '/nonexistent/workspace/path' });
      const readyApp = createHttpApp(config);
      const res = await get(readyApp, '/ready');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe('not-ready');
      expect(res.body.checks.workspaceDir).toBe(false);
    });

    it('GET /ready returns 503 when session key directory is not writable', async () => {
      const prev = process.env['WORKFLOW_SERVER_KEY_DIR'];
      // Root-owned path non-root tests cannot create (typical Docker HOME=/ failure mode).
      process.env['WORKFLOW_SERVER_KEY_DIR'] = '/.workflow-server-unwritable-probe';
      try {
        const res = await get(app, '/ready');
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('not-ready');
        expect(res.body.checks.sessionKeyWritable).toBe(false);
      } finally {
        if (prev === undefined) delete process.env['WORKFLOW_SERVER_KEY_DIR'];
        else process.env['WORKFLOW_SERVER_KEY_DIR'] = prev;
      }
    });

    it('GET /ready returns 200 when root was resolved from WORKTREE_ROOT alone (PR267-TC-11)', async () => {
      const prevWorkspace = process.env['WORKFLOW_WORKSPACE'];
      const prevWorktree = process.env['WORKTREE_ROOT'];
      delete process.env['WORKFLOW_WORKSPACE'];
      const root = mkdtempSync(join(tmpdir(), 'wf-worktree-root-'));
      process.env['WORKTREE_ROOT'] = root;
      try {
        const loaded = loadConfig([]);
        const config = buildConfig({
          workspaceDir: loaded.workspaceDir,
          planningRelativeDir: loaded.planningRelativeDir,
        });
        const readyApp = createHttpApp(config);
        const res = await get(readyApp, '/ready');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ready');
        expect(res.body.checks.workspaceDir).toBe(true);
        // JSON key remains workspaceDir for existing consumers (worktree root).
        expect(res.body.checks).toHaveProperty('workspaceDir');
      } finally {
        rmSync(root, { recursive: true, force: true });
        if (prevWorkspace === undefined) delete process.env['WORKFLOW_WORKSPACE'];
        else process.env['WORKFLOW_WORKSPACE'] = prevWorkspace;
        if (prevWorktree === undefined) delete process.env['WORKTREE_ROOT'];
        else process.env['WORKTREE_ROOT'] = prevWorktree;
        setPlanningRelativeDir(PLANNING_RELATIVE_DIR);
      }
    });
  });

  describe('request-id propagation', () => {
    it('echoes an inbound x-request-id header back on the response', async () => {
      const res = await get(app, '/health', { 'x-request-id': 'test-request-id-123' });
      expect(res.headers['x-request-id']).toBe('test-request-id-123');
    });

    it('generates a fresh request id when none is supplied', async () => {
      const res = await get(app, '/health');
      expect(res.headers['x-request-id']).toBeTruthy();
      expect(typeof res.headers['x-request-id']).toBe('string');
    });
  });

  describe('error shape', () => {
    it('returns a { error, message, requestId, timestamp } JSON body for an unknown route', async () => {
      const res = await get(app, '/no-such-route');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'NotFoundError' });
      expect(typeof res.body.message).toBe('string');
      expect(typeof res.body.requestId).toBe('string');
      expect(typeof res.body.timestamp).toBe('string');
    });

    it('OAuth discovery probes return 404 without logging type:error (mcp-remote noise)', async () => {
      const lines: string[] = [];
      const spy = vi.spyOn(console, 'error').mockImplementation((line: unknown) => {
        lines.push(String(line));
      });
      try {
        for (const path of [
          '/.well-known/oauth-authorization-server',
          '/.well-known/oauth-protected-resource',
          '/.well-known/oauth-protected-resource/mcp',
        ]) {
          const res = await get(app, path);
          expect(res.status).toBe(404);
          expect(res.body.error).toBe('NotFoundError');
        }
      } finally {
        spy.mockRestore();
      }
      const parsed = lines.map((line) => {
        try {
          return JSON.parse(line) as { type?: string; path?: string; message?: string };
        } catch {
          return {};
        }
      });
      expect(parsed.some((e) => e.type === 'error')).toBe(false);
      expect(parsed.some((e) => e.type === 'info' && e.message === 'HTTP request' && e.path?.includes('oauth'))).toBe(true);
    });

    it('POST /mcp without a session id or initialize request returns 400 with the shared error shape', async () => {
      const res = await postJson(app, '/mcp', { jsonrpc: '2.0', method: 'tools/list', id: 1 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('BadRequest');
      expect(typeof res.body.requestId).toBe('string');
    });

    it('POST /mcp with an unknown mcp-session-id returns 404 with the shared error shape', async () => {
      const res = await postJson(app, '/mcp', { jsonrpc: '2.0', method: 'tools/list', id: 1 }, { 'mcp-session-id': 'unknown-session' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('SessionNotFound');
    });
  });

  describe('MCP session lifecycle', () => {
    it('establishes a session on initialize and accepts a follow-up request under it', async () => {
      const initRes = await postJson(app, '/mcp', {
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'http-transport-test', version: '1.0.0' },
        },
        id: 1,
      }, { Accept: 'application/json, text/event-stream' });

      expect(initRes.status).toBe(200);
      const sessionId = initRes.headers['mcp-session-id'];
      expect(typeof sessionId).toBe('string');

      const listRes = await postJson(app, '/mcp', { jsonrpc: '2.0', method: 'tools/list', params: {}, id: 2 }, {
        Accept: 'application/json, text/event-stream',
        'mcp-session-id': sessionId,
      });

      expect(listRes.status).toBe(200);
    });
  });

  describe('startHttpServer binding', () => {
    it('binds to config.host/config.port rather than a hardcoded address', async () => {
      const config = buildConfig({ host: '127.0.0.1', port: 0 });
      const httpServer = await startHttpServer(config);
      try {
        const address = httpServer.address();
        expect(address).not.toBeNull();
        expect(typeof address === 'object' && address?.address).toBe('127.0.0.1');
      } finally {
        await new Promise((resolveClose) => httpServer.close(resolveClose));
      }
    });
  });

  describe('graceful shutdown', () => {
    let httpServer: HttpServer;

    beforeEach(async () => {
      httpServer = await new Promise((resolveListen) => {
        const server = app.listen(0, '127.0.0.1', () => resolveListen(server));
      });
    });

    it('closes the listener and reaches the process-exit path on shutdown', async () => {
      expect(httpServer.listening).toBe(true);
      const exit = vi.fn();

      await shutdownHandler(httpServer, 'SIGTERM', exit);

      expect(httpServer.listening).toBe(false);
      expect(exit).toHaveBeenCalledWith(0);
    });

    it('is idempotent-safe to await twice from a caller perspective (second close errors, still exits)', async () => {
      const exit = vi.fn();
      await shutdownHandler(httpServer, 'SIGTERM', exit);
      // Server is already closed; closing again surfaces an error to the callback,
      // which shutdownHandler still resolves and exits (non-zero) for rather than hanging.
      const exit2 = vi.fn();
      await shutdownHandler(httpServer, 'SIGTERM', exit2);
      expect(exit2).toHaveBeenCalledWith(1);
    });
  });
});
