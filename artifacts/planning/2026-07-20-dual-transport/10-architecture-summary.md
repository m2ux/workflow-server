# Architecture Summary

> Dual Transport Support · issue skipped · updated 2026-07-20

## What changed

The workflow server previously spoke only stdio. It now supports two transports, selected by a `--transport`/`TRANSPORT` flag (default `stdio`, so existing stdio-based clients are unaffected):

```
                        ┌─────────────────┐
   CLI args / env  ───▶ │   config.ts      │  ServerConfig { transport, port, host, ... }
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐
                        │   index.ts       │  switch (config.transport)
                        │   (CLI router)   │
                        └───┬──────────┬───┘
                            │          │
                  ┌─────────▼──┐   ┌───▼──────────┐
                  │ stdio.ts   │   │ http.ts       │
                  │ (default)  │   │ (opt-in)      │
                  └─────┬──────┘   └───┬───────────┘
                        │              │  Express app: /health, /ready,
                        │              │  /mcp (StreamableHTTPServerTransport,
                        │              │  one per session), graceful shutdown
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │  server.ts   │  createServer(config) — tool/resource
                        │              │  registration, UNCHANGED by this work
                        └──────────────┘
```

Both transports are built from the same `createServer(config)` — the `McpServer` instance and every tool/resource it registers are identical regardless of transport. This is the load-bearing design decision: adding HTTP required zero changes to what the server *does*, only how a client connects to it.

## New pieces

- **`transports/stdio.ts` / `transports/http.ts`** — one module per transport, each owning that transport's connect/listen/shutdown lifecycle.
- **`middleware/{request-id,logging,error-handler}.ts`** — HTTP-only cross-cutting concerns (correlation ids, structured request logging reusing the existing stderr-JSON `logging.ts`, and a consistent JSON error body), with zero footprint on the stdio path.
- **`/health` and `/ready`** — standard liveness/readiness endpoints for the HTTP transport, so it can be run behind an orchestrator (e.g., Kubernetes) that expects them.
- **Graceful shutdown** for HTTP — `SIGTERM`/`SIGINT` close the listener before exit, bounded by a 10s timeout.

## Deliberately out of scope (see `06-deferred-items.md`)

- **Authentication/authorization (D-1)** — the HTTP transport is opt-in and assumed to sit behind network-level access control (e.g., a reverse proxy) in this phase.
- **Session resumability, multi-process session sharing, and idle-session eviction (D-2)** — MCP sessions live in an in-memory `Map` inside a single process; acceptable for the targeted single-process, trusted-network deployment model.

## Why this is low-risk

- The stdio path is untouched behaviorally — `startStdioServer` is the original `main()` body moved verbatim, and `transport` defaults to `'stdio'`.
- The new HTTP path is entirely additive: no existing file's public behavior changed except `index.ts` (which became a router) and `config.ts` (which gained optional fields, not required ones — see `IT-1` in `02-assumptions-log.md`).
- Both paths share the single most important line of code in this feature — `createServer(config)` — so there is exactly one place tool/resource behavior could regress, and it wasn't touched.
