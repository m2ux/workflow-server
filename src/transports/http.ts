import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import type { Server as HttpServer } from 'node:http';
import type { Express, NextFunction, Request, Response } from 'express';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Transport as McpTransport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createServer } from '../server.js';
import type { ServerConfig } from '../config.js';
import { logInfo, logWarn } from '../logging.js';
import { requestId } from '../middleware/request-id.js';
import { requestLogging } from '../middleware/logging.js';
import { errorHandler } from '../middleware/error-handler.js';
import { probeSessionKeyWritable } from '../utils/session/crypto.js';

/**
 * How long to wait for in-flight requests to drain on SIGTERM/SIGINT before
 * forcing exit. Keeps shutdown bounded even if a client connection hangs.
 */
export const SHUTDOWN_TIMEOUT_MS = 10_000;

/**
 * Build the HTTP/SSE transport's express app: `/mcp` (via
 * `StreamableHTTPServerTransport`), plus `/health` and `/ready`. Built from
 * the same `createServer(config)` used by the stdio transport — no change to
 * tool/resource registration. Split out from `startHttpServer` so tests can
 * exercise routes (e.g. via supertest) without binding a real socket.
 */
export function createHttpApp(config: ServerConfig): Express {
  const host = config.host ?? 'localhost';
  const app = createMcpExpressApp({ host });
  app.use(requestId);
  app.use(requestLogging);

  registerHealthRoutes(app, config);
  registerMcpRoute(app, config);

  // Catch-all: any request that reached here matched no route — funnel it
  // through the shared error handler so 404s get the same JSON error shape.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(Object.assign(new Error(`Not found: ${req.method} ${req.path}`), { name: 'NotFoundError', status: 404 }));
  });
  app.use(errorHandler);

  return app;
}

/**
 * Start the HTTP transport: build the app, bind it to `config.host`/`.port`,
 * and install the graceful-shutdown signal handlers. Returns the underlying
 * `http.Server` (mainly useful to tests that need to close it explicitly).
 */
export async function startHttpServer(config: ServerConfig): Promise<HttpServer> {
  const host = config.host ?? 'localhost';
  const port = config.port ?? 3000;
  const app = createHttpApp(config);

  const httpServer: HttpServer = await new Promise((resolvePromise, reject) => {
    const server = app.listen(port, host, () => resolvePromise(server));
    server.on('error', reject);
  });

  logInfo('Server connected and ready', { transport: 'http', host, port });
  installGracefulShutdown(httpServer);
  return httpServer;
}

function registerHealthRoutes(app: Express, config: ServerConfig): void {
  // Liveness: the process is up and serving requests. No dependency checks —
  // a liveness probe should only fail when the process itself is wedged.
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Readiness: directories every tool call depends on resolve, and the session
  // HMAC key directory is writable (start_session fails hard otherwise).
  // `checks.workspaceDir` is the configured worktree / workspace root
  // (`--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT`); the JSON key
  // stays `workspaceDir` for existing HTTP consumers.
  app.get('/ready', async (_req, res) => {
    const sessionKeyWritable = await probeSessionKeyWritable();
    const checks = {
      workflowDir: existsSync(config.workflowDir),
      schemasDir: existsSync(config.schemasDir),
      workspaceDir: existsSync(config.workspaceDir),
      sessionKeyWritable,
    };
    const ready = Object.values(checks).every(Boolean);
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready', checks });
  });
}

function registerMcpRoute(app: Express, config: ServerConfig): void {
  // One McpServer + StreamableHTTPServerTransport pair per client session,
  // keyed by the SDK-generated `mcp-session-id`. Sessions are in-memory only
  // (no resumability event store) — acceptable for this work package's
  // trusted-network deployment model; see the deferred-items register for
  // follow-ups (auth, multi-process session sharing).
  const transports = new Map<string, StreamableHTTPServerTransport>();

  const mcpHandler = async (req: Request, res: Response): Promise<void> => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport) {
      if (sessionId) {
        res.status(404).json({
          error: 'SessionNotFound',
          message: `Unknown or expired mcp-session-id: ${sessionId}`,
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      if (!isInitializeRequest(req.body)) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'No valid session ID provided and request is not an initialize request',
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const server = createServer(config);
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport!);
          logInfo('HTTP MCP session initialized', { sessionId: newSessionId, requestId: req.requestId });
        },
        onsessionclosed: (closedSessionId) => {
          transports.delete(closedSessionId);
          logInfo('HTTP MCP session closed', { sessionId: closedSessionId });
        },
      });
      transport.onclose = () => {
        if (transport?.sessionId) transports.delete(transport.sessionId);
      };
      // Cast: StreamableHTTPServerTransport's onclose accessor is typed
      // `(() => void) | undefined` while the shared Transport interface
      // declares the plain optional `onclose?: () => void` — an SDK-internal
      // typing mismatch that only surfaces under `exactOptionalPropertyTypes`.
      await server.connect(transport as unknown as McpTransport);
    }

    await transport.handleRequest(req, res, req.body);
  };

  app.post('/mcp', mcpHandler);
  app.get('/mcp', mcpHandler);
  app.delete('/mcp', mcpHandler);
}

/**
 * Close `httpServer` and invoke `exit` once drained (or immediately on a
 * close error, or after `SHUTDOWN_TIMEOUT_MS` if draining never completes).
 * Exported standalone — and taking an injectable `exit` — so tests can drive
 * the real close path without a signal actually terminating the process.
 */
export function shutdownHandler(
  httpServer: HttpServer,
  signal: string,
  exit: (code: number) => void = process.exit.bind(process),
): Promise<void> {
  return new Promise((resolveShutdown) => {
    logInfo('Shutdown signal received, closing HTTP listener', { signal });
    const forceExit = setTimeout(() => {
      logWarn('Graceful shutdown timed out, forcing exit', { timeoutMs: SHUTDOWN_TIMEOUT_MS });
      exit(1);
      resolveShutdown();
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    httpServer.close((err) => {
      clearTimeout(forceExit);
      if (err) {
        logWarn('Error while closing HTTP listener', { error: err.message });
        exit(1);
        resolveShutdown();
        return;
      }
      logInfo('HTTP listener closed, shutdown complete');
      exit(0);
      resolveShutdown();
    });
  });
}

/**
 * Wire SIGTERM/SIGINT to `shutdownHandler` so the HTTP listener closes
 * cleanly instead of the process dying mid-request.
 */
function installGracefulShutdown(httpServer: HttpServer): void {
  process.on('SIGTERM', () => void shutdownHandler(httpServer, 'SIGTERM'));
  process.on('SIGINT', () => void shutdownHandler(httpServer, 'SIGINT'));
}
