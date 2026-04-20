# Design Philosophy

**Work Package:** HTTP/SSE Transport — Session Token Context Bloat  
**Issue:** #101 — feat: switch to HTTP/SSE transport to eliminate session token context bloat  
**Created:** 2026-04-20

---

## Problem Statement

Every tool call made against the workflow-server MCP server returns a signed session token (~500+ characters) embedded directly in the tool call result content. Because the server uses stdio transport, there is no mechanism to pass data outside of message content — the token is visible to the LLM and accumulates in the context window for the entire duration of a workflow session. For workflows with many tool calls (10–30+ calls is common), this results in kilobytes of repeated token content consuming tokens on every turn.

### System Context

The server uses `StdioServerTransport` from the MCP TypeScript SDK (`@modelcontextprotocol/sdk` v1.25.2). The session token is a base64url-encoded HMAC-signed JSON payload encoding workflow state (current activity, checkpoint state, sequence number, session ID). It is returned as the first line of every tool response via `session_token: <token>\n\n<content>` and also as a top-level field in JSON responses. The token is required for every subsequent tool call — it is the sole continuity mechanism for stateless workflow execution.

The MCP 2025-03-26 spec defines the `Mcp-Session-Id` response header as a first-class mechanism for carrying opaque session identifiers in HTTP/SSE transport. The MCP TypeScript SDK implements this: it reads the header value from the `initialize` response and replays it on all subsequent requests automatically. The existing signed JWT format is fully compatible with the `Mcp-Session-Id` header value constraints (visible ASCII 0x21–0x7E).

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — no functional breakage; measurable token waste per session |
| Scope | All workflow sessions; every LLM agent using this server |
| Business Impact | Increased token cost and context pressure on every workflow session; tokens consumed by infrastructure metadata instead of domain content |

### Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Token not in content | Session token absent from tool response content fields | 0 occurrences post-change |
| Header transport | `Mcp-Session-Id` header present on initialize response | Present and populated with signed JWT |
| Client replay | MCP SDK client automatically replays header on subsequent requests | Verified via integration test or manual inspection |
| Server statelessness | No server-side session store added | JWT-only continuity retained |
| stdio retained | Stdio entrypoint still functional for local development | Passes existing test suite |

### Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Technical | MCP TypeScript SDK must support `StreamableHTTPServerTransport` — confirmed present in v1.x |
| Technical | Session token format (base64url + HMAC sig) must remain unchanged — no server-side state store |
| Compatibility | Claude Code connects via Node.js — CORS headers not required |
| Compatibility | stdio entrypoint must be retained for local dev/debugging |
| Dependencies | No new runtime dependencies should be introduced |

---

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [x] Improvement goal — the server is not broken; the goal is to eliminate avoidable token overhead by using the correct transport mechanism

**Complexity:** Simple

**Rationale:** The root cause is well-understood and the solution is prescribed directly by the MCP spec. The token is in content because stdio has no header channel; switching to HTTP/SSE transport provides that channel. No architectural contradictions exist. The SDK already implements the required behavior. The change is bounded: replace `StdioServerTransport` with `StreamableHTTPServerTransport`, configure the HTTP server, move session token to the `Mcp-Session-Id` header on `initialize`, and strip it from response content. No data model changes, no new dependencies, no coordination across services.

---

## Workflow Path Decision

**Selected Path:** Skip optional activities (direct to planning)

**Activities Included:**
- [ ] Requirements Elicitation — not needed; requirements are fully specified in the issue
- [ ] Research — not needed; the MCP spec and SDK behavior are already documented in the issue and confirmed in the codebase
- [x] Codebase Comprehension — mandatory per workflow rules
- [x] Implementation Analysis — part of comprehension
- [x] Plan & Prepare

**Rationale:** The problem is an inventive goal with simple complexity. The cause is known (stdio has no header channel), the solution is prescribed by the MCP spec, and the SDK implementation is confirmed. The issue itself identifies the exact API surface to use (`StreamableHTTPServerTransport`, `Mcp-Session-Id` header) and explicitly rules out the browser-context CORS concern for Claude Code (Node.js client). No stakeholder requirements discovery or external research is needed. Codebase comprehension is mandatory before planning to understand the full entrypoint structure, test suite layout, and configuration model.

---

## Design Decisions

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Transport mechanism | stdio-only (status quo), HTTP/SSE only, dual stdio+HTTP | Dual: HTTP/SSE primary, stdio retained for dev | MCP spec HTTP/SSE carries token in header; stdio retained per issue notes for local dev/debugging |
| Session token removal from content | Partial (keep in `_meta` only), complete (remove from content entirely) | Complete removal from content | The `_meta` field in MCP SDK responses is not sent to the LLM; content is. Full removal is the goal. |
| Server-side state | In-memory store, persistent store, stateless JWT | Stateless JWT (no change) | Issue explicitly requires server to remain stateless; JWT contains all state |
| HTTP port/config | Hardcoded, environment variable, config file | Environment variable with sensible default | Follows existing config pattern in `src/config.ts` |

---

## Notes

- The `session_token` field is currently embedded in content at multiple sites in `src/tools/workflow-tools.ts` — each will need to be updated.
- The `_meta` field on MCP tool responses is not exposed to the LLM and can retain `session_token` for SDK-level tooling if needed, but this is not strictly required.
- After the transport switch, the `start_session` response (which currently returns `session_token` and `session_id` as structured data) will need a decision: the token moves to the header, but `session_id` is a distinct field that agents use for stale-session detection. The `session_id` may remain in content since it is not the secret signing payload — only the full signed token needs to be removed.
- Existing tests use stdio transport directly; the test suite will need an HTTP transport variant or a test adapter.
