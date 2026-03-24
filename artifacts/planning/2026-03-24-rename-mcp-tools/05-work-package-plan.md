# Rename MCP Tools - Implementation Plan

**Date:** 2026-03-24  
**Priority:** HIGH  
**Status:** Ready  
**Estimated Effort:** 3-5h agentic + 1-2h review

---

## Overview

### Problem Statement
The workflow-server MCP server's two entry-point tools (`get_activities`, `get_rules`) use names that overload core workflow terminology and lack session management. "Activity" is used for both the goal-matching index and workflow phases, and every tool call is stateless with no correlation mechanism.

### Scope
**In Scope:**
- Rename `get_activities` → `match_goal`
- Replace `get_rules` → `start_session` (returns rules + session token)
- Add required `session_token` to 14 tools
- Session token generator and format validator (token format: `<workflow-version>_<epoch>_<8-hex>`)
- Encrypted token storage in state files using AES-256-GCM
- Server key management at `~/.workflow-server/secret` (auto-generated on first run)
- `save_state` encrypts `session_token` variable before writing; `restore_state` decrypts on read
- Update activity index builder hardcoded references
- Update `discover_resources` output
- Update 9 `.toon` workflow data files
- Update 7 documentation/config files
- Update and expand test coverage

**Out of Scope:**
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
- `WorkflowState.variables` is `z.record(z.unknown())` — session token stored as `variables.session_token`
- Orchestrator stores token in state after calling `start_session`, then calls `save_state`
- `save_state` encrypts the `session_token` variable using AES-256-GCM before writing to disk
- `restore_state` decrypts the token on read, returning plaintext to the orchestrator
- Encryption key persists at `~/.workflow-server/secret` (auto-generated on first server run)

---

## Proposed Approach

### Solution Design

Phased implementation in 10 tasks, ordered by dependency:

1. **Foundation** — Create session token utilities (generator, validator, shared Zod param)
2. **Server key management** — Key generation and loading at `~/.workflow-server/secret`
3. **Entry-point rename** — Rename get_activities → match_goal
4. **Entry-point replace** — Replace get_rules → start_session (returns rules + token)
5. **Session enforcement** — Add session_token to 14 tools
6. **Encrypted token storage** — Modify save_state/restore_state for AES-256-GCM encryption/decryption of session_token
7. **Internal references** — Update activity index builder and discover_resources
8. **Tests** — Update existing, add new (including encryption round-trip tests)
9. **Documentation** — Update all docs and Cursor rules
10. **Workflow data** — Update .toon files (separate git context)

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
| Token at rest | AES-256-GCM encrypted in state file | Prevents token leakage from saved state files |
| Server key | `~/.workflow-server/secret` (auto-generated, persists) | Simple key management; key survives server restarts |
| Token validation | Format regex + orchestrator-held plaintext comparison | Tools check format; orchestrator validates authenticity by comparing against its known token |
| Token format | `<workflow-version>_<epoch>_<8-hex>` (e.g., `3.4.0_1711300000_a3b2c1d4`) | Embeds workflow version for protocol evolution; epoch for session age; UUID for uniqueness |
| Shared param | Spread `sessionTokenParam` object into each tool's Zod schema | DRY; single source of truth for token schema |
| Token exempt tools | `match_goal`, `start_session`, `health_check` | Entry points (no token yet) and health probes (no workflow context) |

---

## Implementation Tasks

### Task 1: Session Token Utilities (15-20 min)
**Goal:** Create shared session token generator, validator, and Zod parameter schema.
**Deliverables:**
- `src/utils/session.ts` — `generateSessionToken(workflowVersion)`, `validateSessionToken()`, `SESSION_TOKEN_PATTERN`, `sessionTokenParam`
- Token format: `<workflow-version>_<unix-epoch-seconds>_<8-hex-chars>` (e.g., `3.4.0_1711300000_a3b2c1d4`)
- Regex pattern accommodates dots in version prefix
**Dependencies:** None

### Task 2: Server Key Management (20-30 min)
**Goal:** Implement server-side encryption key generation and loading.
**Deliverables:**
- `src/utils/crypto.ts` — `getOrCreateServerKey()`, `encryptToken()`, `decryptToken()`
- Key storage: `~/.workflow-server/secret` (256-bit key, auto-generated on first call via `crypto.randomBytes(32)`)
- AES-256-GCM encryption with random IV per encryption
- Key file created with restricted permissions (`0o600`)
**Dependencies:** None

### Task 3: Rename get_activities → match_goal (10-15 min)
**Goal:** Rename the goal-matching tool in source and update its audit tag.
**Deliverables:**
- `src/tools/resource-tools.ts` — rename tool registration (name, description, audit tag)
- `src/server.ts` — update tool list in log
**Dependencies:** None

### Task 4: Replace get_rules → start_session (20-30 min)
**Goal:** Replace the rules tool with a session-establishing tool that returns rules + session token.
**Deliverables:**
- `src/tools/resource-tools.ts` — new `start_session` tool that calls `readRules()` and generates session token
- Response shape: `{ rules: Rules, session: { token, created_at, server_version } }`
- `src/server.ts` — update tool list in log
**Dependencies:** Task 1 (needs `generateSessionToken`)

### Task 5: Add session_token to all tools (30-45 min)
**Goal:** Add required `session_token` parameter with format validation to 14 tools.
**Deliverables:**
- `src/tools/resource-tools.ts` — add `...sessionTokenParam` to 7 tools (get_activity, get_skills, list_skills, get_skill, list_workflow_resources, get_resource, discover_resources)
- `src/tools/workflow-tools.ts` — add `...sessionTokenParam` to 5 tools (list_workflows, get_workflow, validate_transition, get_workflow_activity, get_checkpoint)
- `src/tools/state-tools.ts` — add `...sessionTokenParam` to 2 tools (save_state, restore_state)
- Each tool validates token format via Zod regex; invalid tokens produce MCP error
**Dependencies:** Task 1 (needs `sessionTokenParam`)

### Task 6: Encrypted Token Storage in State (25-35 min)
**Goal:** Modify `save_state` to encrypt the `session_token` variable before writing, and `restore_state` to decrypt it on read.
**Deliverables:**
- `src/tools/state-tools.ts` — intercept `variables.session_token` in save_state handler: encrypt before writing to TOON file
- `src/tools/state-tools.ts` — intercept restored state in restore_state handler: decrypt `variables.session_token` before returning
- Import and use `encryptToken()` / `decryptToken()` from `src/utils/crypto.ts`
- Handle missing key gracefully (generate on first use)
**Dependencies:** Task 2 (needs crypto utilities)

### Task 7: Update Internal References (10-15 min)
**Goal:** Update hardcoded tool name references in the activity index builder and discover_resources output.
**Deliverables:**
- `src/loaders/activity-loader.ts` — change `usage` string and `next_action.tool` from `get_rules` to `start_session` (lines 272-275)
- `src/tools/resource-tools.ts` — change `discover_resources` output from `tool: 'get_activities'` to `tool: 'match_goal'` (line 155)
**Dependencies:** Tasks 3, 4

### Task 8: Update Tests (45-60 min)
**Goal:** Update existing tests and add new test coverage for renamed tools, session token validation, and encryption round-trip.
**Deliverables:**
- `tests/mcp-server.test.ts` — rename `get_activities` test to `match_goal`; add `start_session` test (rules + token); add session token validation tests (missing token, malformed token)
- New test cases for token generator and validator (format, uniqueness)
- New test cases for encryption round-trip (encrypt → decrypt produces original token)
- New test cases for key generation (creates file, correct permissions)
- Update state-persistence tests for encrypted session_token
**Dependencies:** Tasks 1-7

### Task 9: Update Documentation (20-30 min)
**Goal:** Replace all old tool name references in documentation and config files.
**Deliverables:**
- `README.md` — update tool references, document session management
- `SETUP.md` — update tool references
- `docs/api-reference.md` — update tool table, add session_token parameter docs, add start_session docs
- `docs/ide-setup.md` — update tool references and instructions
- `schemas/README.md` — update tool references
- `.cursor/rules/workflow-server.mdc` — update `get_rules` → `start_session`
**Dependencies:** Tasks 3, 4

### Task 10: Update Workflow Data Files (20-30 min)
**Goal:** Replace all old tool name references in .toon workflow data files.
**Deliverables:**
- 9 `.toon` files across `meta/`, `substrate-node-security-audit/`, `cicd-pipeline-security-audit/`
- 17 references: `get_activities` → `match_goal`, `get_rules` → `start_session`
- Committed to workflows worktree (branch `prism-pipeline-modes-v2`)
**Dependencies:** Tasks 3, 4

---

## Task Dependency Graph

```
Task 1 (session utilities)  ──┬── Task 4 (start_session) ──┐
                               ├── Task 5 (session params)   │
Task 2 (crypto/key mgmt)  ──── Task 6 (encrypted storage)  │
                                                             ├── Task 7 (internal refs) ──┐
Task 3 (rename match_goal) ────────────────────────────────┘                              │
                               ┌── Task 9 (documentation)                                 │
                               ├── Task 10 (workflow data)                                │
                               └──────────────────────────────── Task 8 (tests) ──── Final validation
```

Tasks 1, 2, 3 have no dependencies and can start immediately. Tasks 4, 5 depend on 1. Task 6 depends on 2. Tasks 7, 9, 10 depend on 3+4. Task 8 depends on all code changes (1-7).

---

## Success Criteria

### Functional Requirements
- [ ] `match_goal` returns ActivityIndex with `next_action.tool: 'start_session'`
- [ ] `start_session` returns rules + session object with structured token
- [ ] 14 tools reject calls without valid `session_token`
- [ ] 14 tools accept calls with valid `session_token`
- [ ] Token format matches `<version>_<epoch>_<8-hex>` (e.g., `3.4.0_1711300000_a3b2c1d4`)
- [ ] Audit logs include `session_token` in parameters
- [ ] `save_state` encrypts `session_token` variable using AES-256-GCM before writing
- [ ] `restore_state` decrypts `session_token` variable when reading
- [ ] Server key auto-generated at `~/.workflow-server/secret` on first use
- [ ] Server key file has restricted permissions (0o600)

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
| Key file permissions not enforced on all platforms | LOW | LOW | Test on target platform; document requirement |
| Encrypted token in state file not readable after key rotation | MEDIUM | LOW | Key file is write-once; document manual rotation procedure |

---

**Status:** Ready for implementation
