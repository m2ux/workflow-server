# Portfolio Lens: Pedagogy — Dual-Transport Extension Points

> Applied to [workflow-server.md § Dual-Transport Extension Points](workflow-server.md#dual-transport-extension-points--2026-07-20) · 2026-07-20

## Explicit Choices and Their Rejected Alternatives

| Choice made | Alternative it invisibly rejects |
|---|---|
| Use `StreamableHTTPServerTransport` on one `/mcp` endpoint | The plan's literal SSE-pair pattern (`GET /mcp` + `POST /mcp/message` via `SSEServerTransport`) |
| Extend `config.ts`'s manual CLI/env parsing for `--transport`/`--port`/`--host` | A `zod`-schema-validated config module (the plan's sample) |
| Reuse `logInfo`/`logError` (stderr JSON) for HTTP request/response logging | A dedicated request-logging middleware with its own log shape (the plan's sample) |
| Reuse `createServer(config)` unchanged for both transports | Rewriting tool registration inline per transport |
| Add only `express` (+ `@types/express`); skip re-adding `zod` | Treating the plan's dependency list as authoritative without checking `package.json` |

## Transferred-Pattern Simulation

A future engineer who internalizes "reuse the transport-agnostic factory, extend config manually, log via the existing helpers" and later adds a third transport (WebSocket, or a second HTTP variant with TLS) will keep reaching for the same recipe: one more `parseXFlag` next to `parseTransportFlag`. That recipe scales fine for 2 flags; it stops being the obviously-superior choice once a transport needs 4-5 related flags (port, host, tls-cert, tls-key, path) — at that point the engineer, having internalized "manual parsing is our convention" without the boundary condition "...while the flag surface stays small," is equally likely to reach for a partial `zod` schema for just the new flags, recreating the exact two-styles-in-one-file problem this deep-dive avoided by choosing manual parsing over `zod` for the *first* HTTP transport.

## Silent vs. Visible Failure Modes

- **Silent**: Reusing `logInfo`/`logError` for HTTP logs means `type: 'info'` entries now carry two different field shapes (MCP audit fields vs. HTTP request fields) under one tag. No error, no test failure — just log entries a consumer built against the audit shape won't expect.
- **Visible failure risk**: `setAuditWorkspaceDir`'s module-level mutable variable assumes one `workspaceDir` per process. This deep-dive's own concurrency note ("safe as long as only one `workspaceDir` is served per process") states the precondition but doesn't flag it as an out-of-scope constraint for HTTP specifically — HTTP is the transport most likely to eventually serve multiple workspaces from one long-running process (a shared team deployment is the plan's own stated motivation).

## Pedagogy Law

The constraint that gets transferred as an unstated assumption: **one process serves exactly one `workspaceDir`, forever.** Every choice in the deep-dive (config extension, logging reuse, factory reuse) is safe because that constraint holds; none of them restate it as a boundary condition, so a future reader carries forward "state lives in `session.json`, not in the server" as the transferable lesson while dropping the precondition it silently depends on.

## Prediction

The invisible transferred decision most likely to fail first, and slowest to be discovered: the one-workspace-per-process assumption in `setAuditWorkspaceDir`. It fails once a process is asked to serve two workspaces over HTTP to save resources; it produces no error, only trace/audit events mis-attributed to the wrong session — discovered only when someone notices a session's trace history contains entries belonging to an unrelated planning folder.
