# Requirements Elicitation: Rename MCP Tools

**Date:** 2026-03-24  
**Status:** ✅ Confirmed

---

## Problem Statement

The workflow-server MCP server's two entry-point tools (`get_activities`, `get_rules`) use names that overload core workflow terminology and lack session management. Agents confuse the goal-matching "activities" index with workflow-phase "activities," and every tool call is stateless with no way to correlate a sequence of operations into a coherent session.

## Goal

Rename `get_activities` to `match_goal`, replace `get_rules` with `start_session` (returning rules + session token), and require all subsequent tool calls to include the session token — establishing enforced session management across the entire MCP tool surface.

---

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| AI agent (workflow consumer) | Unambiguous tool names; session-aware interactions | As an AI agent, I want the goal-matching tool named distinctly from workflow phases so that I can navigate the tool surface without confusion |
| AI agent (workflow executor) | Session correlation across tool calls | As an AI agent executing a workflow, I want a session token so that my sequence of tool calls is correlated and auditable |
| Workflow author | Consistent tool references in skill/activity definitions | As a workflow author, I want tool references in .toon files to use current names so that agents can follow instructions correctly |

### Secondary Stakeholders

- **External project maintainers** — Cursor IDE rules in other projects reference `get_rules` and `get_activities`; they need to update after this change
- **Server maintainers** — All ~15 tool handlers gain a new required parameter

---

## Context

### Integration Points
- **MCP clients (Cursor IDE)** — Agents call tools via the MCP protocol; tool names and parameters are configured in `.cursor/rules/` files
- **Workflow data files (.toon)** — Skill and workflow definitions reference tool names in bootstrap instructions
- **Audit logging (`withAuditLog`)** — Currently logs tool name and duration; session token enables per-session log correlation

### Dependencies
- `@modelcontextprotocol/sdk` — MCP server SDK (tool registration API)
- `@toon-format/toon` — TOON file parser (for workflow data updates)
- `crypto.randomUUID()` — Node.js built-in for UUID generation

### Constraints
- **Clean break** — No backward compatibility aliases; all consumers must update simultaneously
- **Stateless vs. stateful** — Session token validation approach must be decided (format-only validation preserves statelessness; registry-based validation introduces state)
- **Workflows worktree** — .toon file updates require separate commit workflow (currently on branch `prism-pipeline-modes-v2`)

---

## Scope

### ✅ In Scope

1. **Rename `get_activities` → `match_goal`** — tool name, description, audit tag, handler
2. **Replace `get_rules` → `start_session`** — new tool returning rules + structured session token
3. **Add required `session_token` parameter to all ~15 remaining tools** — schema, validation, audit correlation
4. **Session token generator** — format: `wfs_<timestamp>_<uuid-short>`, e.g. `wfs_1711296000_a1b2c3d4`
5. **Update activity index builder** — change `next_action.tool` from `get_rules` to `start_session`
6. **Update `discover_resources` output** — change `tool: 'get_activities'` to `tool: 'match_goal'`
7. **Update all 9 .toon workflow data files** in workflows worktree
8. **Update all documentation** — README.md, SETUP.md, docs/api-reference.md, docs/ide-setup.md, schemas/README.md
9. **Update Cursor rules** — `.cursor/rules/workflow-server.mdc`
10. **Update tests** — rename existing `get_activities` test, add `start_session` test, add session token validation tests
11. **Update `src/server.ts`** — tool registration log

### ❌ Out of Scope

1. **Server-side session registry** — No in-memory session store for v1. Token validation is format-based only.
2. **Session expiration/lifecycle management** — Tokens don't expire; no cleanup needed
3. **Updating external project Cursor rules** — Out of scope for this PR; external projects update their own rules after this ships
4. **Workflow data model changes** — Activities, skills, steps, checkpoints schema unchanged
5. **Renaming `get_activity` (singular)** — Different tool, different purpose, not affected

### ⏳ Deferred

1. **Server-side session state** — Track active sessions, reject invalid tokens (future enhancement)
2. **Session-scoped audit reports** — Aggregate audit logs by session token (future enhancement)
3. **Gradual migration support** — If needed later, aliases can be re-added; not needed now

---

## Requirements

### R1: Tool Rename — match_goal

| Attribute | Value |
|-----------|-------|
| Old name | `get_activities` |
| New name | `match_goal` |
| Parameters | None (unchanged) |
| Response shape | `ActivityIndex` (unchanged except `next_action.tool` changes to `start_session`) |
| Breaking change | Yes — old name removed immediately |

### R2: Tool Replace — start_session

| Attribute | Value |
|-----------|-------|
| Old name | `get_rules` |
| New name | `start_session` |
| Parameters | None |
| Response shape | `{ rules: Rules, session: { token: string, created_at: string, server_version: string } }` |
| Token format | `wfs_<unix-timestamp>_<uuid-first-8-chars>` (e.g., `wfs_1711296000_a1b2c3d4`) |
| Breaking change | Yes — old name removed, response shape changes |

### R3: Required Session Token on All Tools

| Attribute | Value |
|-----------|-------|
| Parameter name | `session_token` |
| Type | `z.string()` |
| Required | Yes — all tools except `match_goal`, `start_session`, and `health_check` |
| Validation | Format validation only: must match `wfs_<digits>_<hex>` pattern |
| On invalid token | Return MCP error (do not throw unhandled) |
| Audit integration | Include `session_token` in `withAuditLog` structured log output |

### R4: Workflow Data Updates

| Attribute | Value |
|-----------|-------|
| Files affected | 9 .toon files across `meta/`, `substrate-node-security-audit/`, `cicd-pipeline-security-audit/` |
| Reference count | 17 occurrences of `get_activities` / `get_rules` |
| Git context | Workflows worktree (branch `prism-pipeline-modes-v2`) — requires separate commit |
| Change type | Text replacement in TOON content strings |

### R5: Documentation Updates

| Attribute | Value |
|-----------|-------|
| Files affected | 6 documentation files + 1 Cursor rule file |
| Change type | Replace old tool names with new names; document session_token parameter |

---

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | `match_goal` tool is callable and returns ActivityIndex with `next_action.tool: 'start_session'` | Integration test |
| SC-2 | `start_session` tool returns rules + session object with structured token | Integration test |
| SC-3 | All tools (except match_goal, start_session, health_check) reject calls without valid session_token | Integration test with missing/malformed token |
| SC-4 | Session token matches format `wfs_<digits>_<hex>` | Unit test on token generator + format validator |
| SC-5 | Audit logs include session_token when provided | Inspect structured log output |
| SC-6 | Zero references to `get_activities` or `get_rules` in source, tests, or docs (excluding .engineering/history/) | Grep verification |
| SC-7 | Zero references to `get_activities` or `get_rules` in workflow .toon files | Grep verification |
| SC-8 | `npm test` passes | CI verification |
| SC-9 | `npm run typecheck` passes | CI verification |

---

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Scope | Should .toon files be updated in this WP? | Yes — all .toon files included for atomic consistency |
| Compatibility | Clean break or aliases? | Clean break — no aliases, no transition period |
| Session Token Usage | Should tools require session_token? | Yes — required parameter on all tools (except entry points and health_check) |
| Session Token Format | UUID or structured? | Structured: `wfs_<timestamp>_<uuid-short>` |
| External Consumers | Are there external consumers? | Yes — Cursor IDE rules in other projects (out of scope to update) |

### Clarifications Made

- **health_check exemption**: `health_check` should not require session_token (it's a server health probe, not a workflow operation)
- **match_goal exemption**: `match_goal` is the discovery entry point; agents call it before having a session
- **start_session exemption**: `start_session` is where the token is created; it can't require one

---

## Confirmation

**Confirmed by:** User (via agent-led elicitation)  
**Date:** 2026-03-24  
**Notes:** Stakeholder discussion was skipped. All requirements captured through structured elicitation with multiple-choice responses.
