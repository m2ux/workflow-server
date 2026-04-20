# Assumptions Log

**Work Package:** HTTP/SSE Transport — Session Token Context Bloat  
**Issue:** #101  
**Created:** 2026-04-20  
**Last Updated:** 2026-04-20 (plan-prepare)

---

## Summary

| Metric | Count |
|--------|-------|
| Total assumptions | 17 |
| Validated | 8 |
| Invalidated | 3 |
| Partially Validated | 2 |
| Open — code-resolvable | 0 |
| Open — stakeholder-dependent | 4 |
| Open — pending reconciliation | 0 |

Convergence iterations: 3 (reconciled in plan-prepare)

---

## Assumptions

---

### A-01: SDK supports StreamableHTTPServerTransport

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** The installed version of `@modelcontextprotocol/sdk` (v1.25.2) exports `StreamableHTTPServerTransport` and the required HTTP session handling API.  
**Evidence:** `node_modules/@modelcontextprotocol/sdk/dist/cjs/server/streamableHttp.d.ts` exists and exports `StreamableHTTPServerTransport implements Transport`. The class accepts `StreamableHTTPServerTransportOptions` (alias for `WebStandardStreamableHTTPServerTransportOptions`) and exposes `handleRequest(req: IncomingMessage, res: ServerResponse, parsedBody?)`. The `sessionIdGenerator` option controls whether session IDs are emitted in the `Mcp-Session-Id` header. The Node.js-compatible transport wraps `WebStandardStreamableHTTPServerTransport` via `@hono/node-server` for `IncomingMessage`/`ServerResponse` compatibility.  
**Risk:** None — API is present and fully typed.  
**Category:** Complexity Assessment

---

### A-02: Session token removal from content is safe

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** No tool call result content field is parsed by the server itself; the `session_token` in content is consumed only by the LLM agent, making removal from content non-breaking for server internals.  
**Evidence:** The server is stateless. Tool handlers in `src/tools/workflow-tools.ts` decode tokens from the `session_token` *input parameter*, not from their own response content. The `session_token` in content is a pass-through for the LLM agent. No code path reads tool result content to reconstruct state. Confirmed by inspection of `workflow-tools.ts`, `session.ts`, and all loader files.  
**Risk:** None.  
**Category:** Problem Interpretation

---

### A-03: `session_id` can remain in content after token removal

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** The `session_id` field (a plain UUID) is distinct from the signed session token and is acceptable to leave in content.  
**Evidence:** `src/utils/session.ts` confirms `sid` is a UUID generated once at session creation (`randomUUID()`). The `start_session` tool response currently returns both `session_token` and `session_id` as separate fields. The `session_id` carries no signing material — it is a non-secret correlation identifier. After transport switch, the signed JWT moves to the `Mcp-Session-Id` header; `session_id` can remain in the `start_session` response body for stale-session detection without undermining the token-bloat goal.  
**Risk:** None for security. Minimal content overhead (UUID is 36 chars vs 500+ for JWT).  
**Category:** Problem Interpretation

---

### A-04: Existing tests use stdio transport directly

**Status:** Invalidated  
**Resolvability:** Code-resolvable  
**Assumption:** The existing test suite connects to the server via the stdio transport interface; switching the primary transport to HTTP/SSE will require test adapter changes.  
**Evidence:** `tests/mcp-server.test.ts` uses `InMemoryTransport` from `@modelcontextprotocol/sdk/inMemory.js` — it connects directly to the `McpServer` instance via in-process memory transport, entirely bypassing the transport layer. The test harness is transport-agnostic: `createServer()` returns an `McpServer`, and tests connect to it via `InMemoryTransport`. Switching `src/index.ts` to use `StreamableHTTPServerTransport` does not require any test changes. All existing tests will continue to pass without modification.  
**Risk:** None — tests are already transport-agnostic.  
**Category:** Complexity Assessment

---

### A-05: HTTP port configuration follows existing config pattern

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** The existing `src/config.ts` configuration model can be extended to include HTTP port and optional host configuration without structural changes.  
**Evidence:** `src/config.ts` uses a simple `envOrDefault(key, fallback)` helper and a plain `ServerConfig` interface. Adding `httpPort?: number` and `httpHost?: string` fields requires only adding properties to the interface and reading them from `process.env.HTTP_PORT` / `process.env.HTTP_HOST` in `loadConfig()`. No structural changes needed. The `createServer()` function signature accepts `ServerConfig` and would not need to change — the HTTP server setup belongs in `src/index.ts`.  
**Risk:** None.  
**Category:** Complexity Assessment

---

### A-06: Claude Code client stores and replays Mcp-Session-Id automatically

**Status:** Partially Validated  
**Resolvability:** Stakeholder-dependent  
**Assumption:** The MCP TypeScript SDK client used by Claude Code reads `Mcp-Session-Id` from the `initialize` response and automatically includes it in all subsequent requests.  
**Evidence:** The issue asserts this is the case and the referenced SDK issue (#852) is confirmed to be browser-context CORS only. The `WebStandardStreamableHTTPServerTransport` `sessionIdGenerator` option controls emission of the header. Code inspection cannot confirm the Claude Code client SDK version or runtime behavior — this requires a running integration test against a deployed HTTP/SSE server. The assertion from the issue author (who has already analyzed the SDK) is strong evidence.  
**Risk:** Medium — if incorrect, the entire approach falls back to retaining `session_token` in content. Recommend verifying with a smoke test after implementation.  
**Category:** Problem Interpretation

---

### A-07: MCP configuration update is needed in client config

**Status:** Open  
**Resolvability:** Stakeholder-dependent  
**Assumption:** Switching from stdio to HTTP/SSE requires users to update their MCP client configuration from a `command`-based entry to a `url`-based entry.  
**Evidence:** Standard MCP HTTP/SSE client configuration uses `url` field. Not confirmed whether existing docs will be updated as part of this work package.  
**Risk:** Low — documentation update is separable from implementation.  
**Category:** Workflow Path

---

### A-08: stdio and HTTP/SSE entrypoints are selected via a flag or separate entrypoint

**Status:** Open  
**Resolvability:** Stakeholder-dependent  
**Assumption:** The stdio and HTTP/SSE entrypoints will not run simultaneously; a transport-selection mechanism (CLI flag, env var, or separate entrypoint file) will determine which transport is used.  
**Evidence:** Issue states "stdio entrypoint can be retained for local development/debugging" without specifying the mechanism.  
**Risk:** Low — both a `TRANSPORT=http` env var approach and a separate `src/index-http.ts` entrypoint are straightforward; decision affects only `src/index.ts` structure.  
**Category:** Workflow Path

---

## Resolution History

| Assumption | Status Change | Date | Method |
|-----------|--------------|------|--------|
| A-01 | Open → Validated | 2026-04-20 | SDK type definition inspection |
| A-02 | Open → Validated | 2026-04-20 | workflow-tools.ts code inspection |
| A-03 | Open → Validated | 2026-04-20 | session.ts + start_session response inspection |
| A-04 | Open → Invalidated | 2026-04-20 | tests/mcp-server.test.ts inspection (InMemoryTransport) |
| A-05 | Open → Validated | 2026-04-20 | src/config.ts inspection |
| A-06 | Open → Partially Validated | 2026-04-20 | Issue analysis + SDK inspection (runtime unverified) |
| A-09 | Open → Partially Validated | 2026-04-20 | sessionTokenParam + _meta inspection; LLM content extraction dependency unverified |
| A-09 | Partially Validated → Partially Validated (reconciled) | 2026-04-20 | Re-verified: sessionTokenParam at session.ts:188-192, _meta auto-threading works at SDK level (test helpers confirm), remaining risk is MCP client auto-threading for stdio agents (stakeholder-dependent, same as A-06) |
| A-10 | Open → Validated | 2026-04-20 | _meta.session_token populated in all 16 relevant tool responses |
| A-10 | Validated → Validated (reconciled) | 2026-04-20 | Re-verified: all 15 _meta.session_token sites confirmed at exact line numbers; present_checkpoint correctly omits it |
| A-11 | Open → Validated | 2026-04-20 | Separate files, no shared state between content and transport changes |
| A-11 | Validated → Validated (reconciled) | 2026-04-20 | Re-verified: config.ts:14-18 already has transport fields, loadConfig():34-44 reads env vars, index.ts:22 only uses StdioServerTransport, content removal targets are independent |
| A-12 | Open → Invalidated | 2026-04-20 | tests/mcp-server.test.ts line 238-275 asserts session_token in content body |
| A-12 | Invalidated → Invalidated (reconciled) | 2026-04-20 | Re-verified: expanded evidence — 5 content-body assertions (lines 243,246,253,261,274) + 3 more (297,397,604) + 11 content-body token reads (145,151,283,695,1562,1621,1631,1642,1673,1683,1713) will all break |
| A-13 | Open → Validated | 2026-04-20 | SDK type definitions confirm API surface matches plan |
| A-13 | Validated → Validated (reconciled) | 2026-04-20 | Re-verified: streamableHttp.d.ts confirms full API including handleRequest signature, sessionIdGenerator option, stateful/stateless mode documentation |
| A-14 | Open → Validated | 2026-04-20 | SDK source confirms sessionIdGenerator:undefined disables header emission and validation |
| A-14 | Validated → Validated (reconciled) | 2026-04-20 | Re-verified: type definition docs at lines 54-56 explicitly document stateless mode behavior; usage example at lines 37-39 shows sessionIdGenerator:undefined |
| A-17 | Open → Invalidated | 2026-04-20 | Tests read both _meta and content; content-body assertions will break |

---

## Planning-Phase Assumptions (plan-prepare)

---

### A-09: Unconditional token removal is safe for stdio agents

**Status:** Partially Validated  
**Resolvability:** Code-resolvable (partially — remaining dependency is stakeholder-dependent)  
**Assumption:** Removing `session_token` from content for both stdio and HTTP modes is safe because agents already pass `session_token` as an explicit tool parameter on every call — they do not rely on extracting it from content.  
**Evidence:** Code analysis confirms `session_token` is a required parameter on all tools that need it (via `sessionTokenParam` in `src/utils/session.ts:188-192`). The `_meta.session_token` field is populated in 16 of 17 tool responses (all except `present_checkpoint`, which uses `checkpoint_handle` instead). Test helper functions `transitionToActivity` (`tests/mcp-server.test.ts:100-101`) and `resolveCheckpoints` (`tests/mcp-server.test.ts:86`) already read from `_meta`, confirming the SDK-level mechanism works. However, the claim that agents "do not rely on extracting it from content" is not fully correct — LLM agents currently extract the advanced token from content to pass on the next call. The `_meta` field is accessible to SDK-level clients but NOT visible to the LLM in the content array. For stdio mode, the LLM cannot see `_meta`, so the MCP client (e.g., Claude Code) must auto-thread from `_meta` to pass the token as a parameter on the next call. This is the same stakeholder-dependent question as A-06. The code mechanism exists; client adoption is unverified at code level.  
**Risk:** Medium — depends on MCP client auto-threading from `_meta` for stdio agents. If the client does not auto-thread, stdio agents will break (they won't know the advanced token to pass). HTTP/SSE agents are unaffected since the transport handles token threading.  
**Category:** Design Approach

---

### A-10: _meta.session_token is sufficient for SDK clients

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** The `_meta.session_token` field in MCP tool results is accessible to SDK-level client tooling and provides a sufficient mechanism for auto-threading the token without content-level visibility.  
**Evidence:** Code inspection confirms `_meta.session_token` is populated in all tool responses that require session threading: `get_workflow` summary (`workflow-tools.ts:94`), `get_workflow` raw (`workflow-tools.ts:102`), `next_activity` (`workflow-tools.ts:167`), `get_activity` (`workflow-tools.ts:226`), `yield_checkpoint` (`workflow-tools.ts:263`), `resume_checkpoint` (`workflow-tools.ts:288`), `respond_checkpoint` (`workflow-tools.ts:419`), `get_trace` tokens (`workflow-tools.ts:448`), `get_trace` no-store (`workflow-tools.ts:455`), `get_trace` with-store (`workflow-tools.ts:462`), `get_workflow_status` (`workflow-tools.ts:548`), `start_session` (`resource-tools.ts:231`), `get_skills` (`resource-tools.ts:290`), `get_skill` (`resource-tools.ts:371`), `get_resource` (`resource-tools.ts:412`). The one exception is `present_checkpoint` (`workflow-tools.ts:318`) which uses `checkpoint_handle` instead — correct because `present_checkpoint` takes `checkpoint_handle` as input, not `session_token`. The MCP SDK `CallToolResult` type includes `_meta: Record<string, unknown>`, making it accessible to all SDK clients. Test helpers `transitionToActivity` and `resolveCheckpoints` already read from `_meta`, confirming the mechanism works at SDK level.  
**Risk:** None — `_meta` is a standard MCP field accessible to all SDK clients.  
**Category:** Design Approach

---

### A-11: Content removal and transport changes are independent

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** The 17 content removal sites (Tasks 3-4) can be changed independently of the transport configuration changes (Tasks 1-2) — no ordering dependency between them.  
**Evidence:** Content removal targets `workflow-tools.ts` (13 sites) and `resource-tools.ts` (4 sites). Transport configuration targets `config.ts` (already has transport fields at `config.ts:14-18` and `loadConfig()` reads `TRANSPORT`, `HTTP_PORT`, `HTTP_HOST` at `config.ts:34-44`) and `index.ts` (transport selection logic — currently only `StdioServerTransport` at `index.ts:22`). These are completely separate files with no shared state, no shared types beyond `ServerConfig`, and no ordering dependencies. The content removal changes do not reference transport configuration, and the transport changes do not affect tool response content.  
**Risk:** None — changes are fully independent.  
**Category:** Task Breakdown

---

### A-12: No new test cases needed

**Status:** Invalidated  
**Resolvability:** Code-resolvable  
**Assumption:** Existing `InMemoryTransport`-based tests adequately cover tool handler logic after content changes, since tests read structured results rather than raw content text.  
**Evidence:** The test suite at `tests/mcp-server.test.ts` contains explicit assertions that `session_token` appears in content body. Line 238-275: `it('tools should return session_token in content body', ...)` asserts `session_token` in parsed content for `get_workflow` (line 243), `next_activity` (line 246), `get_skills` (line 253), `get_skill` (line 261), and `checkpoint_handle` in `present_checkpoint` (line 274). Additional content-body assertions: line 297 (`stepResponse.session_token`), line 397 (`activity.session_token`), line 604 (`response.session_token`). Content-body token reads (not just assertions): line 145 (`parseToolResponse(result).session_token`), line 151, line 283, line 695, line 1562, line 1621, line 1631, line 1642, line 1673, line 1683, line 1713. These all use `parseToolResponse()` which parses content text, NOT `_meta`. After removing `session_token` and `checkpoint_handle` from content, these assertions and reads will fail. The tests must be updated to read from `_meta` instead.  
**Risk:** Medium — existing tests will break; test updates are required (not optional). The `transitionToActivity` and `resolveCheckpoints` helpers already read from `_meta`, so the core test infrastructure is compatible — only the content-body assertions and token reads need updating.  
**Category:** Test Strategy

---

### A-13: StreamableHTTPServerTransport API is stable

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** The `StreamableHTTPServerTransport` API surface documented in the comprehension artifact (DD-3) matches the installed SDK version and will work as described.  
**Evidence:** SDK type definitions at `node_modules/@modelcontextprotocol/sdk/dist/esm/server/streamableHttp.d.ts` confirm the full API surface: `StreamableHTTPServerTransport` implements `Transport`; constructor accepts `StreamableHTTPServerTransportOptions` (alias for `WebStandardStreamableHTTPServerTransportOptions`); `handleRequest(req: IncomingMessage & { auth?: AuthInfo }, res: ServerResponse, parsedBody?: unknown)` matches the plan's usage; `sessionIdGenerator?: () => string` option controls session ID emission; `start()`, `close()`, `send()` methods present; `closeSSEStream()` and `closeStandaloneSSEStream()` for stream management. Node.js wrapper uses `@hono/node-server` for `IncomingMessage`/`ServerResponse` compatibility. Documentation comments in the type definition explicitly describe stateful vs stateless modes (lines 31-56). The API matches exactly what's described in the comprehension artifact and the plan's code example.  
**Risk:** None — API is fully typed and matches documentation.  
**Category:** Dependency

---

### A-14: sessionIdGenerator:undefined disables Mcp-Session-Id

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** Setting `sessionIdGenerator: undefined` in `StreamableHTTPServerTransportOptions` correctly disables `Mcp-Session-Id` header emission and validation, as documented in DD-1.  
**Evidence:** SDK source at `webStandardStreamableHttp.js` confirms three behaviors: (1) Line 412: `this.sessionId = this.sessionIdGenerator?.();` — optional chaining returns `undefined` when `sessionIdGenerator` is `undefined`, so no session ID is generated. (2) Lines 224-226: `if (this.sessionId !== undefined) { headers['mcp-session-id'] = this.sessionId; }` — `Mcp-Session-Id` header is NOT included when `sessionId` is `undefined`. (3) Lines 564-567: `if (this.sessionIdGenerator === undefined) { return undefined; }` — session validation is entirely skipped when `sessionIdGenerator` is `undefined`. The SDK type definition documentation comments at `streamableHttp.d.ts:54-56` explicitly document this: "In stateless mode: No Session ID is included in any responses. No session validation is performed." The usage example at lines 37-39 shows: `const statelessTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });`  
**Risk:** None — behavior is confirmed in SDK source and documented in type definitions.  
**Category:** Dependency

---

### A-15: client_session_token retention in dispatch_workflow is acceptable

**Status:** Open  
**Resolvability:** Stakeholder-dependent  
**Assumption:** Retaining `client_session_token` in `dispatch_workflow` response content is acceptable because it is a one-time dispatch value, not per-call bloat.  
**Evidence:** `dispatch_workflow` is called once per sub-workflow dispatch. The `client_session_token` appears in a single TOON metadata object, not repeated across calls.  
**Risk:** Low — minimal content overhead for a one-time operation.  
**Category:** Scope Decisions

---

### A-16: session_id retention in start_session is acceptable

**Status:** Open  
**Resolvability:** Stakeholder-dependent  
**Assumption:** Retaining `session_id` (UUID, 36 chars) in `start_session` response content is acceptable because it serves stale-session detection and is not the signed token payload.  
**Evidence:** `session_id` is a non-secret correlation identifier (UUID). It does not contain signing material and is 36 chars vs 500+ for the JWT.  
**Risk:** None — `session_id` does not contribute to token bloat.  
**Category:** Scope Decisions

---

### A-17: Existing tests read _meta, not content text

**Status:** Invalidated  
**Resolvability:** Code-resolvable  
**Assumption:** The existing test suite reads tool results via structured access patterns (e.g., `result._meta.session_token`) rather than by parsing raw content text, so removing `session_token` from content will not break any test assertions.  
**Evidence:** The test suite reads from BOTH `_meta` and content. The helper functions `transitionToActivity` (line 100-101) and `resolveCheckpoints` (line 86) correctly read from `_meta`. However, the test at line 238-275 (`it('tools should return session_token in content body', ...)`) explicitly asserts `session_token` in parsed content for `get_workflow`, `next_activity`, `get_skills`, `get_skill`, and `checkpoint_handle` in `present_checkpoint`. Additional content-body assertions at lines 302, 402, and 609 also check `session_token` in parsed content. These use `parseToolResponse()` which parses content text. After removing `session_token` from content, these assertions will fail.  
**Risk:** Medium — content-body test assertions will break and must be updated. The test infrastructure (helpers) already reads from `_meta`, so the fix is straightforward: update assertions to read from `_meta` instead of parsed content.  
**Category:** Test Strategy

---

## Implementation TODO List

Derived from 05-work-package-plan.md. Ordered by dependency. Reconciled with assumption analysis.

- [x] **T1: Extend ServerConfig with transport fields** — Already complete in `src/config.ts:14-18` (interface) and `config.ts:34-44` (loadConfig). Transport fields `transport`, `httpPort`, `httpHost` are present with env var reading. Uncommitted in working tree.
- [ ] **T2: Add StreamableHTTPServerTransport to entrypoint** — Refactor `src/index.ts` to conditionally create `StdioServerTransport` or `StreamableHTTPServerTransport` based on `config.transport`. Configure with `sessionIdGenerator: undefined`. Add `http.createServer` for `TRANSPORT=http`. Current `index.ts:22` only uses `StdioServerTransport`.
- [ ] **T3: Remove session_token from workflow-tools.ts content** — Remove `session_token` from JSON response objects (6 sites: lines 89, 192, 444, 454, 461, 544), TOON header prefixes (3 sites: lines 101, 225, 284), `checkpoint_handle` from JSON (3 sites: lines 260, 411) and TOON object (1 site: line 317). Keep `client_session_token` in `dispatch_workflow`.
- [ ] **T4: Remove session_token from resource-tools.ts content** — Remove `session_token` from `start_session` JSON (1 site: line 215), TOON header prefixes (3 sites: lines 284, 370, 405).
- [ ] **T5: Update test assertions** — Update `tests/mcp-server.test.ts` content-body assertions and token reads to use `_meta` instead of parsed content. Content-body assertions: lines 243, 246, 253, 261, 274, 297, 397, 604. Content-body token reads: lines 145, 151, 283, 695, 1562, 1621, 1631, 1642, 1673, 1683, 1713. (Required per A-12/A-17 invalidation — 19 total sites to update.)
- [ ] **T6: Verify tests and typecheck pass** — Run `npm test` and `npm run typecheck`. All must pass.
