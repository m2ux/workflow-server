# HTTP/SSE Transport — Session Token Context Bloat - Implementation Plan

**Date:** 2026-04-20  
**Priority:** MEDIUM  
**Status:** Ready  
**Estimated Effort:** 2-4h agentic + 1h review

---

## Overview

### Problem Statement
Every tool call made against the workflow-server MCP server returns a signed session token (~500+ characters) embedded directly in the tool call result content. Because the server uses stdio transport, there is no mechanism to pass data outside of message content — the token is visible to the LLM and accumulates in the context window for the entire duration of a workflow session. For workflows with many tool calls (10–30+ calls is common), this results in kilobytes of repeated token content consuming tokens on every turn.

### Scope
**In Scope:**
- Add `StreamableHTTPServerTransport` support to the server entrypoint
- Add transport selection config (`TRANSPORT`, `HTTP_PORT`, `HTTP_HOST` env vars)
- Remove `session_token` and `checkpoint_handle` from all tool response content bodies (17 sites across 2 files)
- Remove `session_token` from TOON header prefixes (6 sites)
- Retain `_meta.session_token` as the authoritative token source for SDK clients
- Retain `session_id` (UUID) in `start_session` response content
- Retain `client_session_token` in `dispatch_workflow` response content (one-time dispatch, not per-call bloat)
- Ensure existing tests continue to pass without modification

**Out of Scope:**
- Adding `Mcp-Session-Id` header support (incompatible with mutating tokens — see DD-1)
- Server-side session store (explicitly rejected — see RP-1)
- Transport-aware conditional token embedding (rejected — see RP-5)
- CORS headers (Claude Code connects via Node.js, not browser)
- SSE resumability / event store
- TLS configuration
- Documentation updates for MCP client configuration (separable from implementation)
- Changes to `session_token` as a tool parameter (it remains required)

---

## Research & Analysis

*See companion planning artifacts for full details:*
- **Design Philosophy:** [design-philosophy.md](design-philosophy.md)
- **Assumptions Log:** [assumptions-log.md](assumptions-log.md)
- **Comprehension Artifact:** [http-sse-transport.md](../../comprehension/http-sse-transport.md)

### Key Findings Summary

**From Comprehension:**
- `StreamableHTTPServerTransport` is confirmed present in SDK v1.25.2 with full Node.js `IncomingMessage`/`ServerResponse` support
- `Mcp-Session-Id` header is incompatible with mutating tokens — strict validation rejects changed values (DD-1)
- `_meta.session_token` is already populated in 16 of 17 tool responses; only `present_checkpoint` omits it
- Session token appears in content in 3 formats: JSON object field, TOON header prefix, TOON object field
- Existing tests use `InMemoryTransport` — transport-agnostic, no changes needed

**From Design Philosophy:**
- Problem classified as Inventive Goal (improvement), Simple complexity
- Dual transport: HTTP/SSE primary, stdio retained for dev
- Complete removal of token from content (not partial)
- Stateless JWT retained — no server-side session store

---

## Proposed Approach

### Solution Design
1. Extend `ServerConfig` with `transport`, `httpPort`, and `httpHost` fields
2. Add `TRANSPORT`, `HTTP_PORT`, `HTTP_HOST` env var reading in `loadConfig()`
3. Refactor `src/index.ts` to conditionally create `StdioServerTransport` or `StreamableHTTPServerTransport` based on `config.transport`
4. Configure `StreamableHTTPServerTransport` with `sessionIdGenerator: undefined` (disable `Mcp-Session-Id`)
5. Remove `session_token` and `checkpoint_handle` from all content body locations in `workflow-tools.ts` and `resource-tools.ts`
6. Remove `session_token:` TOON header prefixes from all 6 locations
7. Retain `_meta.session_token` unchanged (already the authoritative source)
8. Verify all existing tests pass without modification

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Mcp-Session-Id header carries token | Auto-threaded by SDK, cleanest UX | Strict validation rejects mutating tokens (DD-1) | Rejected |
| Partial content removal (keep in critical responses) | Gradual migration | Inconsistent agent behavior, two code paths | Rejected |
| Transport-aware conditional embedding | stdio keeps token in content | Two code paths to test, breaks transport-agnostic design | Rejected |
| Separate entrypoint file for HTTP | Clean separation | Two files to maintain, drift risk | Rejected |
| Server-side session store | Eliminates token entirely | State management complexity, breaks statelessness | Rejected |
| Unconditional removal + env var transport | Single code path, clean, simple | stdio agents must read `_meta` or pass token as param | **Selected** |

---

## Implementation Tasks

### Task 1: Extend ServerConfig with transport fields (10-15 min)
**Goal:** Add `transport`, `httpPort`, and `httpHost` to the configuration model
**Dependencies:** None
**Deliverables:**
- `src/config.ts` — Add `transport?: 'stdio' | 'http'`, `httpPort?: number`, `httpHost?: string` to `ServerConfig`
- `src/config.ts` — Add `TRANSPORT`, `HTTP_PORT`, `HTTP_HOST` env var reading in `loadConfig()`

**Details:**
- `transport` defaults to `'stdio'` (backward-compatible)
- `httpPort` defaults to `3000`
- `httpHost` defaults to `'localhost'`
- Follow existing `envOrDefault()` pattern

### Task 2: Add StreamableHTTPServerTransport to entrypoint (15-25 min)
**Goal:** Refactor `src/index.ts` to support dual transport
**Dependencies:** Task 1
**Deliverables:**
- `src/index.ts` — Import `StreamableHTTPServerTransport` and `http` from Node.js
- `src/index.ts` — Conditional transport creation based on `config.transport`
- `src/index.ts` — HTTP server setup with `http.createServer` for `TRANSPORT=http`

**Details:**
```typescript
if (config.transport === 'http') {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,  // Disable Mcp-Session-Id
  });
  const httpServer = http.createServer(async (req, res) => {
    await transport.handleRequest(req, res);
  });
  await server.connect(transport);
  httpServer.listen(config.httpPort, config.httpHost, () => {
    logInfo(`HTTP server listening on ${config.httpHost}:${config.httpPort}`);
  });
} else {
  await server.connect(new StdioServerTransport());
}
```

### Task 3: Remove session_token from workflow-tools.ts content (20-30 min)
**Goal:** Remove `session_token` and `checkpoint_handle` from all content body locations in workflow-tools.ts (13 sites)
**Dependencies:** None (independent of transport changes)
**Deliverables:**
- `src/tools/workflow-tools.ts` — Remove `session_token` from JSON response objects (6 sites)
- `src/tools/workflow-tools.ts` — Remove `session_token:` TOON header prefixes (3 sites)
- `src/tools/workflow-tools.ts` — Remove `checkpoint_handle` from JSON response objects (3 sites)
- `src/tools/workflow-tools.ts` — Remove `checkpoint_handle` from TOON object field (1 site)

**Specific changes by tool:**

| Tool | Line(s) | Current | Change |
|------|---------|---------|--------|
| `get_workflow` (summary) | 89 | `session_token: advancedToken` in summaryData | Remove field from summaryData |
| `get_workflow` (raw) | 101 | `` `session_token: ${advancedToken}\n\n` `` prefix | Remove prefix |
| `next_activity` | 192 | `session_token: advancedToken` in responseData | Remove field from responseData |
| `get_activity` | 225 | `` `session_token: ${advancedToken}\n\n` `` prefix | Remove prefix |
| `yield_checkpoint` | 260 | `checkpoint_handle: advancedToken` in JSON | Remove field from JSON |
| `present_checkpoint` | 317 | `checkpoint_handle` in encodeToon object | Remove field from TOON object |
| `respond_checkpoint` | 411 | `checkpoint_handle: advancedToken` in responseData | Remove field from responseData |
| `get_trace` (tokens) | 444 | `session_token: advancedToken` in result | Remove field from result |
| `get_trace` (no store) | 454 | `session_token: advancedToken` in result | Remove field from result |
| `get_trace` (with store) | 461 | `session_token: advancedToken` in result | Remove field from result |
| `dispatch_workflow` | 544 | `client_session_token` in metadata | **Keep** — one-time dispatch, not per-call bloat |
| `get_workflow_status` | 623 | `session_token: advancedToken` in response | Remove field from response |

### Task 4: Remove session_token from resource-tools.ts content (15-20 min)
**Goal:** Remove `session_token` from all content body locations in resource-tools.ts (4 sites)
**Dependencies:** None (independent of transport changes)
**Deliverables:**
- `src/tools/resource-tools.ts` — Remove `session_token` from `start_session` JSON response (1 site)
- `src/tools/resource-tools.ts` — Remove `session_token:` TOON header prefixes (3 sites)

**Specific changes by tool:**

| Tool | Line(s) | Current | Change |
|------|---------|---------|--------|
| `start_session` | 165 | `session_token: token` in response object | Remove field; keep `session_id` if present |
| `get_skills` | 234 | `session_token: ${advancedToken}` in header | Remove from header array |
| `get_skill` | 320 | `` `session_token: ${advancedToken}\n\n` `` prefix | Remove prefix |
| `get_resource` | 355 | `session_token: ${advancedToken}` in lines array | Remove from lines array |

### Task 5: Verify existing tests pass (10-15 min)
**Goal:** Run the existing test suite and verify all tests pass with the content changes
**Dependencies:** Tasks 3, 4
**Deliverables:**
- Confirmation that `npm test` passes
- Confirmation that `npm run typecheck` passes
- Any test adjustments needed (expected: none, since tests use `InMemoryTransport` and read from `_meta`)

---

## Success Criteria

### Functional Requirements
- [ ] `TRANSPORT=http` starts server with `StreamableHTTPServerTransport` on configured port
- [ ] `TRANSPORT=stdio` (default) starts server with `StdioServerTransport` (backward-compatible)
- [ ] `session_token` and `checkpoint_handle` absent from all tool response content bodies
- [ ] `_meta.session_token` remains populated in all tool responses (except `present_checkpoint`)
- [ ] `session_id` (UUID) remains in `start_session` response content
- [ ] `client_session_token` remains in `dispatch_workflow` response content
- [ ] Existing test suite passes without modification

### Quality Requirements
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] No new runtime dependencies introduced
- [ ] Server remains stateless — no server-side session store

### Measurement Strategy
**How will we validate improvements?**
- Run `npm test` — all 1620+ lines of existing tests must pass
- Run `npm run typecheck` — zero type errors
- Manual smoke test: start server with `TRANSPORT=http` and verify HTTP endpoint responds
- Grep for `session_token` in content bodies — zero occurrences (except `client_session_token` in `dispatch_workflow`)

---

## Dependencies & Risks

### Requires (Blockers)
- None — all dependencies are within the codebase

### Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LLM agents break without token in content | HIGH | LOW | `_meta.session_token` is already populated; SDK clients can access it. stdio agents pass token as parameter (which they already do). |
| `StreamableHTTPServerTransport` API differs from expectations | MEDIUM | LOW | API surface confirmed in comprehension artifact (DD-1, DD-3). |
| Test suite has hidden content assertions | LOW | LOW | Tests use `InMemoryTransport` and read structured results, not raw content text. |
| `present_checkpoint` _meta omission causes issues | LOW | LOW | Already documented — orchestrator already holds the handle from `yield_checkpoint`. |

---

**Status:** Ready for implementation
