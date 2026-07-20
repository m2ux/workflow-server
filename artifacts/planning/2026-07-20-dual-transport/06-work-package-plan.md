# Dual Transport Support - Implementation Plan

> plan · LOW · Ready · 4-6h agentic + 1-2h review · 2026-07-20

## Overview

### Problem & Scope

Problem, scope, and success criteria: [design philosophy](02-design-philosophy.md#problem-statement) (requirements elicitation was skipped for this simple, plan-driven work package; design-philosophy carries the criteria table).

## Inputs

- [Design Philosophy](02-design-philosophy.md#success-criteria) — problem classification (inventive-improvement/simple) and the success-criteria table this plan implements against.
- [Assumptions Log](02-assumptions-log.md) — resolved that tool registration and the config/logging modules already exist in a transport-agnostic shape, and that the current MCP SDK's recommended HTTP transport class differs from the source plan's sample.
- [Comprehension: workflow-server.md § Dual-Transport Extension Points](../../comprehension/workflow-server.md#dual-transport-extension-points--2026-07-20) — confirmed `createServer(config)` and `config.ts`/`logging.ts` conventions to extend rather than replace.

## Proposed Approach

### Solution Design

Add an HTTP transport as a second way to run the existing `McpServer` built by `createServer(config)` (`server.ts`), leaving stdio (`StdioServerTransport`) as the unchanged default. `index.ts` becomes a thin CLI router: it resolves `config.transport` and calls either `startStdioServer(config)` or `startHttpServer(config)`, each in its own `src/transports/*.ts` module, both built from the one shared `createServer(config)` — no change to tool/resource registration. `config.ts` gains `--transport` / `--port` / `--host` parsing via the same manual CLI/env-precedence helpers already used for `--workspace` (`parseWorkspaceFlag` → `parseTransportFlag`, `parsePortFlag`), not a new `zod` schema. The HTTP transport uses `express` with `StreamableHTTPServerTransport` from `@modelcontextprotocol/sdk` mounted at `/mcp`, plus `/health` and `/ready` JSON endpoints, a request-id + structured-logging middleware pair that reuses the existing `logInfo`/`logError` (stderr JSON — never `console.log`, which would collide with stdio's stdout wire protocol if the module were ever shared), a JSON error-handler middleware, and a `SIGTERM`/`SIGINT` graceful-shutdown handler that closes the HTTP listener before exit.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| `StreamableHTTPServerTransport` (single `/mcp` endpoint) | Current SDK-recommended HTTP transport (v1.25.2); supports stateful and stateless session modes; the SSE-only transport's DNS-rebinding options are already `@deprecated` in this SDK version | Newer API surface, less prior art in the source plan | **Selected** |
| `SSEServerTransport` (`GET /mcp` + `POST /mcp/message`, per the source implementation plan) | Matches the plan's sample code verbatim | Built-in DNS-rebinding-protection options are `@deprecated` in favor of separate middleware; SDK positions it as a backwards-compatibility transport, not the current one | Rejected |
| `zod`-schema config validation for the new flags (per the source plan) | Declarative, and `zod` is already a dependency | Every other `ServerConfig` field uses hand-rolled parsing (`parseWorkspaceFlag`, `envOrDefault`); mixing two config-construction styles in one file | Rejected |
| Dedicated HTTP request-logging middleware with its own log shape (per the source plan) | Matches the plan's sample exactly | Reusing `logInfo`/`logError` keeps one structured-logging convention across both transports instead of two | Rejected |

### Assumptions

Assumptions underlying this approach: [assumptions log](02-assumptions-log.md).

## Implementation Tasks

### Task 1: Extend config for transport selection (20-30 min)
**Goal:** Add `--transport`/`--port`/`--host` CLI/env parsing to `config.ts`, following the existing `parseWorkspaceFlag`/`resolveWorkspaceDir` convention.
**Deliverables:**
- `src/config.ts` - `ServerConfig.transport` (`'stdio' | 'http'`, default `'stdio'`), `.port` (default `3000`), `.host` (default `'localhost'`); `parseTransportFlag`/`parsePortFlag`/`parseHostFlag` helpers mirroring `parseWorkspaceFlag`
- `tests/config.test.ts` - extend the existing suite with cases for default transport, explicit `--transport=http`, invalid transport value, port/host precedence (CLI over env)

### Task 2: Split stdio/HTTP into transport modules; router entry point (30-45 min)
**Goal:** Move the existing stdio connect call into its own module and add the HTTP module skeleton, so `index.ts` only dispatches on `config.transport`.
**Deliverables:**
- `src/transports/stdio.ts` - `startStdioServer(config: ServerConfig)`: calls `createServer(config)` and connects `StdioServerTransport` (the current `index.ts` body, moved verbatim)
- `src/transports/http.ts` - `startHttpServer(config: ServerConfig)`: builds an `express` app, mounts `StreamableHTTPServerTransport` at `/mcp` against `createServer(config)`, starts listening on `config.host`/`config.port`
- `src/index.ts` - reduced to `loadConfig` + a `switch (config.transport)` dispatch to the two modules; barrel exports unchanged

### Task 3: HTTP middleware and health/readiness endpoints (45-60 min)
**Goal:** Give the HTTP transport request correlation, structured logs, JSON error responses, and liveness/readiness signals.
**Deliverables:**
- `src/middleware/request-id.ts` - generates/propagates `x-request-id`, attaches it to `req` for downstream use
- `src/middleware/logging.ts` - logs one `logInfo` JSON line per request (method, path, status, durationMs, requestId)
- `src/middleware/error-handler.ts` - express error handler emitting `{ error, message, requestId, timestamp }`, logged via `logError`
- `src/transports/http.ts` - `/health` (liveness) and `/ready` (readiness; reports workspace/config resolution) routes
- `tests/http-transport.test.ts` - cases for `/health`, `/ready`, request-id propagation, unknown-route error shape (flat under `tests/`, matching the existing suite's layout)

### Task 4: Graceful shutdown for the HTTP transport (20-30 min)
**Goal:** Ensure `SIGTERM`/`SIGINT` close the HTTP listener cleanly instead of the process dying mid-request.
**Deliverables:**
- `src/transports/http.ts` - signal handlers that log shutdown start, call `server.close()`, and `process.exit(0)` once drained (with a bounded fallback timeout)
- `tests/http-transport.test.ts` - shutdown-handler test asserting the listener closes and the process exit path is reached

### Task 5: Dependencies and npm scripts (10-15 min)
**Goal:** Wire `express` into the project and add HTTP-mode run scripts alongside the existing stdio ones.
**Deliverables:**
- `package.json` - add `express@^5.x` (runtime, current major, matches `engines.node >= 18`) and `@types/express` (dev); add `dev:http` (`tsx src/index.ts --transport=http`) and `start:http` (`node dist/index.js --transport=http`) scripts; existing `dev`/`start` unchanged

## Success Criteria

Success criteria: [design philosophy](02-design-philosophy.md#success-criteria). No task-level criteria beyond that table.

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md).

## Dependencies & Risks

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| HTTP transport has no authentication/authorization | Medium — anyone reaching the port can call every MCP tool | Low — HTTP is opt-in, off by default, and this work package's scope is a trusted-network/reverse-proxy deployment model | Document (README/docs) that the HTTP transport is intended to sit behind network-level access control or a reverse proxy; auth is explicitly out of scope for this work package (see [deferred items](06-deferred-items.md)) |
| Adding `express` grows the dependency/attack surface | Low | Low | Pin `express`/`@types/express` to current major versions; no transitive change to the stdio-only path |
| Hidden per-connection state in `createServer`/registered tools under concurrent HTTP requests | Medium if present | Low — already checked in comprehension | [Comprehension deep-dive](../../comprehension/workflow-server.md#dual-transport-extension-points--2026-07-20) confirmed no per-connection state; `setAuditWorkspaceDir` is set once at startup and is safe as long as one process serves one `workspaceDir` (true for both transports today) |

**Status:** Ready for implementation
