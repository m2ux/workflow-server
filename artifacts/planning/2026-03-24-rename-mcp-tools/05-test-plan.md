# Test Plan: Rename MCP Tools

**Issue:** [#59](https://github.com/m2ux/workflow-server/issues/59)  
**PR:** [#60](https://github.com/m2ux/workflow-server/pull/60)

---

## Overview

This test plan validates the rename of `get_activities` → `match_goal`, replacement of `get_rules` → `start_session` (with session token), and enforcement of `session_token` as a required parameter on 14 tools.

Key changes to validate:
1. `match_goal` — renamed tool returns ActivityIndex with updated `next_action`
2. `start_session` — new tool returns rules + structured session token
3. `sessionTokenParam` — shared Zod schema enforced on 14 tools
4. `generateSessionToken` / `validateSessionToken` — token utility functions

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR60-TC-01 | Verify `match_goal` returns activity index with correct structure | Unit |
| PR60-TC-02 | Verify `match_goal` response has `next_action.tool` = `start_session` | Unit |
| PR60-TC-03 | Verify `start_session` returns rules object | Unit |
| PR60-TC-04 | Verify `start_session` returns session object with token, created_at, server_version | Unit |
| PR60-TC-05 | Verify session token matches format `wfs_<digits>_<8-hex>` | Unit |
| PR60-TC-06 | Verify `generateSessionToken()` produces valid tokens | Unit |
| PR60-TC-07 | Verify `generateSessionToken()` produces unique tokens on successive calls | Unit |
| PR60-TC-08 | Verify `validateSessionToken()` accepts valid tokens | Unit |
| PR60-TC-09 | Verify `validateSessionToken()` rejects malformed tokens (no prefix, wrong prefix, missing parts, too short UUID) | Unit |
| PR60-TC-10 | Verify tools with session_token accept calls with valid token | Integration |
| PR60-TC-11 | Verify tools with session_token reject calls without token (Zod validation error) | Integration |
| PR60-TC-12 | Verify tools with session_token reject calls with malformed token | Integration |
| PR60-TC-13 | Verify `match_goal` works without session_token (exempt) | Integration |
| PR60-TC-14 | Verify `start_session` works without session_token (exempt) | Integration |
| PR60-TC-15 | Verify `health_check` works without session_token (exempt) | Integration |
| PR60-TC-16 | Verify `get_activities` tool name no longer exists | Integration |
| PR60-TC-17 | Verify `get_rules` tool name no longer exists | Integration |
| PR60-TC-18 | Verify `discover_resources` output references `match_goal` not `get_activities` | Integration |
| PR60-TC-19 | Verify session_token appears in audit log output | Integration |
| PR60-TC-20 | Verify zero references to old tool names in source and docs | Manual |

*Detailed steps, expected results, and source links will be added after implementation.*

---

## Test Strategy

### Unit Tests (PR60-TC-01 through PR60-TC-09)
Test the session utilities (`generateSessionToken`, `validateSessionToken`) in isolation and the response shapes of the renamed/replaced tools.

### Integration Tests (PR60-TC-10 through PR60-TC-19)
Test the full MCP tool call flow via the existing test client (`@modelcontextprotocol/sdk` client). These extend the existing `mcp-server.test.ts` pattern.

### Manual Verification (PR60-TC-20)
Post-implementation grep to confirm zero remaining old-name references.

---

## Running Tests

```bash
# Run all tests
nice -n 19 npm test

# Run specific MCP server tests
nice -n 19 npx vitest tests/mcp-server.test.ts

# Typecheck
nice -n 19 npm run typecheck

# Manual verification
grep -rn "get_activities\|get_rules" src/ tests/ docs/ README.md SETUP.md schemas/ .cursor/ --include="*.ts" --include="*.md" --include="*.mdc"
```
