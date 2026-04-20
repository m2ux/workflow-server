# Test Plan: HTTP/SSE Transport — Session Token Context Bloat

**Ticket:** [#101](https://github.com/m2ux/workflow-server/issues/101)  
**PR:** [#103](https://github.com/m2ux/workflow-server/pull/103)

---

## Overview

This test plan validates the switch from stdio to HTTP/SSE transport and the removal of session tokens from tool response content bodies. The key changes are: (1) the server entrypoint supports dual transport via `TRANSPORT` env var, (2) `session_token` and `checkpoint_handle` are removed from all content body locations, and (3) `_meta.session_token` remains as the authoritative token source.

Key changes validated:
1. `ServerConfig` — Extended with `transport`, `httpPort`, `httpHost` fields
2. `src/index.ts` — Conditional transport creation (stdio vs HTTP/SSE)
3. `workflow-tools.ts` — 13 content body token removals
4. `resource-tools.ts` — 4 content body token removals

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR103-TC-01 | Verify `loadConfig()` returns `transport: 'stdio'` by default | Unit |
| PR103-TC-02 | Verify `loadConfig()` reads `TRANSPORT=http` from env | Unit |
| PR103-TC-03 | Verify `loadConfig()` reads `HTTP_PORT` and `HTTP_HOST` from env | Unit |
| PR103-TC-04 | Verify `loadConfig()` uses sensible defaults for `httpPort` (3000) and `httpHost` ('localhost') | Unit |
| PR103-TC-05 | Verify `get_workflow` (summary) response content does not contain `session_token` field | Unit |
| PR103-TC-06 | Verify `get_workflow` (raw) response content does not contain `session_token:` prefix | Unit |
| PR103-TC-07 | Verify `next_activity` response content does not contain `session_token` field | Unit |
| PR103-TC-08 | Verify `get_activity` response content does not contain `session_token:` prefix | Unit |
| PR103-TC-09 | Verify `yield_checkpoint` response content does not contain `checkpoint_handle` field | Unit |
| PR103-TC-10 | Verify `present_checkpoint` response content does not contain `checkpoint_handle` field | Unit |
| PR103-TC-11 | Verify `respond_checkpoint` response content does not contain `checkpoint_handle` field | Unit |
| PR103-TC-12 | Verify `get_trace` response content does not contain `session_token` field | Unit |
| PR103-TC-13 | Verify `start_session` response content does not contain `session_token` field | Unit |
| PR103-TC-14 | Verify `get_skills` response content does not contain `session_token:` prefix | Unit |
| PR103-TC-15 | Verify `get_skill` response content does not contain `session_token:` prefix | Unit |
| PR103-TC-16 | Verify `get_resource` response content does not contain `session_token:` line | Unit |
| PR103-TC-17 | Verify `get_workflow_status` response content does not contain `session_token` field | Unit |
| PR103-TC-18 | Verify `_meta.session_token` is populated in all tool responses (except `present_checkpoint`) | Unit |
| PR103-TC-19 | Verify `start_session` response content retains `session_id` (UUID) | Unit |
| PR103-TC-20 | Verify `dispatch_workflow` response content retains `client_session_token` | Unit |
| PR103-TC-21 | Verify existing test suite passes without modification | Integration |
| PR103-TC-22 | Verify server starts with HTTP transport when `TRANSPORT=http` | Integration |
| PR103-TC-23 | Verify server starts with stdio transport when `TRANSPORT=stdio` (default) | Integration |
| PR103-TC-24 | Verify `StreamableHTTPServerTransport` is configured with `sessionIdGenerator: undefined` | Unit |
| PR103-TC-25 | Verify HTTP server listens on configured port and host | Integration |

*Detailed steps, expected results, and source links will be added after implementation.*

---

## Running Tests

```bash
# Run all tests
npm test

# Run type checking
npm run typecheck

# Run specific test file
npm test -- tests/mcp-server.test.ts

# Verify no session_token in content bodies (post-implementation grep)
grep -n "session_token:" src/tools/workflow-tools.ts src/tools/resource-tools.ts
grep -n "checkpoint_handle:" src/tools/workflow-tools.ts
```
