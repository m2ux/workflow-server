import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import type { Server as HttpServer } from 'node:http';
import { resolve, join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import type { ServerConfig } from '../src/config.js';
import { createHttpApp, shutdownHandler } from '../src/transports/http.js';

function buildConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    workflowDir: resolve(import.meta.dirname, '../workflows'),
    schemasDir: resolve(import.meta.dirname, '../schemas'),
    workspaceDir: mkdtempSync(join(tmpdir(), 'wf-http-test-')),
    serverName: 'test-http-workflow-server',
    serverVersion: '1.0.0',
    minCheckpointResponseSeconds: 0,
    ...overrides,
  };
}

describe('HTTP transport — health and readiness', () => {
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

  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /ready returns 200 with status ready when all directories exist', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.checks).toEqual({ workflowDir: true, schemasDir: true, workspaceDir: true });
  });

  it('GET /ready returns 503 with status not-ready when workspaceDir is missing', async () => {
    const config = buildConfig({ workspaceDir: '/nonexistent/workspace/path' });
    const readyApp = createHttpApp(config);
    const res = await request(readyApp).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('not-ready');
    expect(res.body.checks.workspaceDir).toBe(false);
  });
});

describe('HTTP transport — request-id propagation', () => {
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

  it('echoes an inbound x-request-id header back on the response', async () => {
    const res = await request(app).get('/health').set('x-request-id', 'test-request-id-123');
    expect(res.headers['x-request-id']).toBe('test-request-id-123');
  });

  it('generates a fresh request id when none is supplied', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });
});

describe('HTTP transport — error shape', () => {
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

  it('returns a { error, message, requestId, timestamp } JSON body for an unknown route', async () => {
    const res = await request(app).get('/no-such-route');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'NotFoundError' });
    expect(typeof res.body.message).toBe('string');
    expect(typeof res.body.requestId).toBe('string');
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('POST /mcp without a session id or initialize request returns 400 with the shared error shape', async () => {
    const res = await request(app).post('/mcp').send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BadRequest');
    expect(typeof res.body.requestId).toBe('string');
  });

  it('POST /mcp with an unknown mcp-session-id returns 404 with the shared error shape', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('mcp-session-id', 'unknown-session')
      .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('SessionNotFound');
  });
});

describe('HTTP transport — MCP session lifecycle', () => {
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

  it('establishes a session on initialize and accepts a follow-up request under it', async () => {
    const initRes = await request(app)
      .post('/mcp')
      .set('Accept', 'application/json, text/event-stream')
      .send({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'http-transport-test', version: '1.0.0' },
        },
        id: 1,
      });

    expect(initRes.status).toBe(200);
    const sessionId = initRes.headers['mcp-session-id'];
    expect(typeof sessionId).toBe('string');

    const listRes = await request(app)
      .post('/mcp')
      .set('Accept', 'application/json, text/event-stream')
      .set('mcp-session-id', sessionId)
      .send({ jsonrpc: '2.0', method: 'tools/list', params: {}, id: 2 });

    expect(listRes.status).toBe(200);
  });
});

describe('HTTP transport — graceful shutdown', () => {
  let app: Express;
  let httpServer: HttpServer;
  let workspaceDir: string;

  beforeEach(async () => {
    const config = buildConfig();
    workspaceDir = config.workspaceDir;
    app = createHttpApp(config);
    httpServer = await new Promise((resolveListen) => {
      const server = app.listen(0, '127.0.0.1', () => resolveListen(server));
    });
  });

  afterEach(() => {
    rmSync(workspaceDir, { recursive: true, force: true });
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
