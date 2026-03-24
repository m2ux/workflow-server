# Rename MCP Tools - Implementation Plan

**Date:** 2026-03-24  
**Priority:** HIGH  
**Status:** Ready  
**Estimated Effort:** 2-3h agentic + 1h review

---

## Overview

### Problem Statement
The workflow-server MCP server's two entry-point tools (`get_activities`, `get_rules`) use names that overload core workflow terminology and lack session management. "Activity" is used for both the goal-matching index and workflow phases, and every tool call is stateless with no correlation mechanism.

### Scope
**In Scope:**
- Rename `get_activities` → `match_goal`
- Replace `get_rules` → `start_session` (returns rules + session token)
- Add required `session_token` to 14 tools
- Session token generator and format validator
- Update activity index builder hardcoded references
- Update `discover_resources` output
- Update 9 `.toon` workflow data files
- Update 7 documentation/config files
- Update and expand test coverage

**Out of Scope:**
- Server-side session registry (format-only validation for v1)
- Session expiration/lifecycle management
- Updating external project Cursor rules
- Renaming `get_activity` (singular)

---

## Research & Analysis

### Key Findings Summary

**From Implementation Analysis:**
- **Baseline:** 101 tests passing, 17 tools, ~41 old-name references
- **Gap:** No session concept; no `get_rules` test coverage; hardcoded cross-tool references
- **Opportunity:** Consistent tool registration pattern makes session_token addition mechanical; `withAuditLog` already logs all parameters (automatic audit correlation)

**State Management Finding:**
- `WorkflowState.variables` is `z.record(z.unknown())` — session token can be stored as `variables.session_token`
- Persists automatically through `save_state`/`restore_state`
- No schema changes needed; orchestrator stores token in state after calling `start_session`

---

## Proposed Approach

### Solution Design

Phased implementation in 7 tasks, ordered by dependency:

1. **Foundation first** — Create shared session utilities before any tool changes
2. **Entry points** — Rename/replace the two target tools
3. **Enforcement** — Add `session_token` to remaining tools
4. **Internal references** — Update activity index builder and discover_resources
5. **Tests** — Update existing, add new
6. **Documentation** — Update all docs and Cursor rules
7. **Workflow data** — Update .toon files (separate git context)

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Phased (foundation → tools → docs → workflows) | Clear dependencies, testable incrementally | Multiple commits | **Selected** |
| Big-bang (all changes in one commit) | Atomic | Hard to review, risky | Rejected |
| Aliases first, then remove | No breaking change initially | Doubles the work, delays completion | Rejected (user chose clean break) |

### Design Decisions

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| Token storage | Orchestrator stores in `variables.session_token` via `save_state` | Preserves separation of concerns; `start_session` stays stateless |
| Token validation | Format-only regex (`/^wfs_\d+_[0-9a-f]{8}$/`) | No server-side registry for v1; keeps server stateless |
| Shared param | Spread `sessionTokenParam` object into each tool's Zod schema | DRY; single source of truth for token schema |
| Token exempt tools | `match_goal`, `start_session`, `health_check` | Entry points (no token yet) and health probes (no workflow context) |

---

## Implementation Tasks

### Task 1: Session Token Utilities (15-20 min)
**Goal:** Create shared session token generator, validator, and Zod parameter schema.
**Deliverables:**
- `src/utils/session.ts` — `generateSessionToken()`, `validateSessionToken()`, `SESSION_TOKEN_PATTERN`, `sessionTokenParam`
- Token format: `wfs_<unix-epoch-seconds>_<8-hex-chars>`
**Dependencies:** None

### Task 2: Rename get_activities → match_goal (10-15 min)
**Goal:** Rename the goal-matching tool in source and update its audit tag.
**Deliverables:**
- `src/tools/resource-tools.ts` — rename tool registration (name, description, audit tag)
- `src/server.ts` — update tool list in log
**Dependencies:** None

### Task 3: Replace get_rules → start_session (20-30 min)
**Goal:** Replace the rules tool with a session-establishing tool that returns rules + session token.
**Deliverables:**
- `src/tools/resource-tools.ts` — new `start_session` tool that calls `readRules()` and generates session token
- Response shape: `{ rules: Rules, session: { token, created_at, server_version } }`
- `src/server.ts` — update tool list in log
**Dependencies:** Task 1 (needs `generateSessionToken`)

### Task 4: Add session_token to all tools (30-45 min)
**Goal:** Add required `session_token` parameter with format validation to 14 tools.
**Deliverables:**
- `src/tools/resource-tools.ts` — add `...sessionTokenParam` to 7 tools (get_activity, get_skills, list_skills, get_skill, list_workflow_resources, get_resource, discover_resources)
- `src/tools/workflow-tools.ts` — add `...sessionTokenParam` to 5 tools (list_workflows, get_workflow, validate_transition, get_workflow_activity, get_checkpoint)
- `src/tools/state-tools.ts` — add `...sessionTokenParam` to 2 tools (save_state, restore_state)
- Each tool validates token format via Zod regex; invalid tokens produce MCP error
**Dependencies:** Task 1 (needs `sessionTokenParam`)

### Task 5: Update Internal References (10-15 min)
**Goal:** Update hardcoded tool name references in the activity index builder and discover_resources output.
**Deliverables:**
- `src/loaders/activity-loader.ts` — change `usage` string and `next_action.tool` from `get_rules` to `start_session` (lines 272-275)
- `src/tools/resource-tools.ts` — change `discover_resources` output from `tool: 'get_activities'` to `tool: 'match_goal'` (line 155)
**Dependencies:** Tasks 2, 3

### Task 6: Update Tests (30-45 min)
**Goal:** Update existing tests and add new test coverage for renamed tools and session token validation.
**Deliverables:**
- `tests/mcp-server.test.ts` — rename `get_activities` test to `match_goal`; add `start_session` test (rules + token); add session token validation tests (missing token, malformed token)
- New test cases for token generator and validator
**Dependencies:** Tasks 1-5

### Task 7: Update Documentation (20-30 min)
**Goal:** Replace all old tool name references in documentation and config files.
**Deliverables:**
- `README.md` — update tool references
- `SETUP.md` — update tool references
- `docs/api-reference.md` — update tool table and bootstrap sequence
- `docs/ide-setup.md` — update tool references and instructions
- `schemas/README.md` — update tool references
- `.cursor/rules/workflow-server.mdc` — update `get_rules` → `start_session`
- `AGENTS.md` — update if contains tool references
**Dependencies:** Tasks 2, 3

### Task 8: Update Workflow Data Files (20-30 min)
**Goal:** Replace all old tool name references in .toon workflow data files.
**Deliverables:**
- 9 `.toon` files across `meta/`, `substrate-node-security-audit/`, `cicd-pipeline-security-audit/`
- 17 references: `get_activities` → `match_goal`, `get_rules` → `start_session`
- Committed to workflows worktree (branch `prism-pipeline-modes-v2`)
**Dependencies:** Tasks 2, 3

---

## Task Dependency Graph

```
Task 1 (session utilities)
  ├── Task 2 (rename match_goal)  ──┐
  ├── Task 3 (replace start_session)├── Task 5 (internal refs) ──┐
  └── Task 4 (session_token params) │                            ├── Task 6 (tests)
                                    ├── Task 7 (documentation)   │
                                    └── Task 8 (workflow data)   │
                                                                 └── Final validation
```

Tasks 2, 3, 4 can be done in parallel after Task 1. Tasks 5, 7, 8 depend on 2+3. Task 6 depends on all code changes (1-5).

---

## Success Criteria

### Functional Requirements
- [ ] `match_goal` returns ActivityIndex with `next_action.tool: 'start_session'`
- [ ] `start_session` returns rules + session object with structured token
- [ ] 14 tools reject calls without valid `session_token`
- [ ] 14 tools accept calls with valid `session_token`
- [ ] Token format matches `wfs_\d+_[0-9a-f]{8}`
- [ ] Audit logs include `session_token` in parameters

### Quality Requirements
- [ ] `npm test` — all tests pass
- [ ] `npm run typecheck` — no type errors
- [ ] Zero references to `get_activities` or `get_rules` in source, tests, docs (excluding `.engineering/history/`)
- [ ] Zero references to old names in `.toon` workflow files

### Measurement Strategy
- Run `npm test` and `npm run typecheck` after implementation
- Run `grep -rn "get_activities\|get_rules"` across source, docs, and workflows to verify zero remaining references
- Verify token format with unit tests

---

## Dependencies & Risks

### Requires (Blockers)
- [x] Feature branch `enhancement/59-rename-mcp-tools` exists and is current
- [x] Draft PR #60 exists
- [ ] Access to push to workflows worktree branch

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Workflow .toon files on different branch conflict | MEDIUM | LOW | Commit .toon changes to current worktree branch; coordinate merge |
| External Cursor rules break silently | LOW | MEDIUM | Document breaking change; notify external project maintainers |
| Token format regex too strict/loose | LOW | LOW | Unit test edge cases; easily adjusted post-merge |

---

**Status:** Ready for implementation
