# Test Plan

**Work Package:** Rule-to-Skill Migration (#88)  
**Created:** 2026-03-31  
**Activity:** Plan & Prepare (06)

---

## Test Strategy

The migration changes workflow data (TOON files) and one server code path (`listWorkflows`). The primary risk is behavioral regression — agents losing access to constraints they previously had. Testing focuses on structural integrity, discoverability, and response shape validation.

---

## Test Categories

### 1. Rules Loader Tests (update existing)

**File**: `tests/rules-loader.test.ts`

| # | Test Case | Type | Action |
|---|-----------|------|--------|
| T-01 | Slimmed rules.toon loads successfully | Update | Adjust section count expectation (currently >0, update to match new count) |
| T-02 | Session-protocol section is present | New | Assert `sections.find(s => s.id === 'session-protocol')` exists |
| T-03 | Bootstrap section is present | New | Assert a section with bootstrap instruction exists |
| T-04 | Migrated sections are absent | New | Assert workflow-fidelity, implementation-workflow, version-control, engineering-artifacts, github-cli, orchestration sections are NOT present |
| T-05 | Guardrail sections are retained | New | Assert code-modification, communication, documentation, etc. sections are present |

### 2. Skill Loader Tests (update existing)

**File**: `tests/skill-loader.test.ts`

| # | Test Case | Type | Action |
|---|-----------|------|--------|
| T-06 | New skills are discoverable via universal path | New | Load version-control-protocol, engineering-artifacts-management, github-cli-protocol via `readSkill` |
| T-07 | workflow-execution is removed from meta | New | Verify `readSkill('workflow-execution', ...)` returns not-found |
| T-08 | execute-activity loads with merged rules | Update | Verify execute-activity has the expected rule count after merge |
| T-08b | orchestrate-workflow NOT in meta/skills | New | Verify `readSkill('orchestrate-workflow', workflowDir)` without workflow context returns not-found (removed from meta) |
| T-08c | orchestrate-workflow IS in work-package/skills | New | Verify `readSkill('orchestrate-workflow', workflowDir, 'work-package')` succeeds (moved to workflow-specific) |

### 3. Workflow Loader Tests (new/update)

**File**: `tests/mcp-server.test.ts` or new `tests/workflow-loader.test.ts`

| # | Test Case | Type | Action |
|---|-----------|------|--------|
| T-09 | list_workflows excludes meta | New | Call `listWorkflows(workflowDir)` and assert no entry with `id: 'meta'` |
| T-10 | list_workflows still lists all other workflows | New | Assert work-package, prism, prism-audit, etc. are present |
| T-11 | start_session still works with slimmed rules | Update | Verify `start_session({ workflow_id: 'work-package' })` returns valid response with rules, workflow, session_token |

### 4. Integration / Structural Tests

| # | Test Case | Type | Action |
|---|-----------|------|--------|
| T-12 | Workflow TOON files pass schema validation | Existing | Run `npm run typecheck` — any invalid TOON would fail loading |
| T-13 | All skill TOON files pass schema validation | Existing | Covered by skill-loader tests |
| T-14 | Full test suite passes | Existing | `npm test` — all existing tests pass with the changes |

### 5. Behavioral Equivalence Verification (manual)

| # | Verification | Method |
|---|-------------|--------|
| V-01 | Traceability matrix | Every removed rule maps to a skill rule or was identified as a duplicate |
| V-02 | Rule count reconciliation | Count rules before and after: migrated + retained + duplicates removed = original total |
| V-03 | start_session → get_skills flow | Run the bootstrap flow and verify all behavioral constraints are accessible |

---

## Test Execution

```bash
# Run all tests
npm test

# Type check
npm run typecheck

# Verify specific test file
npx vitest run tests/rules-loader.test.ts
npx vitest run tests/skill-loader.test.ts
npx vitest run tests/mcp-server.test.ts
```

---

## Coverage Targets

| Area | Current Coverage | Target |
|------|-----------------|--------|
| rules-loader | 7 tests | 11 tests (+4 new) |
| skill-loader | Existing | +3 new tests |
| workflow-loader / list_workflows | Via mcp-server.test.ts | +2 new tests |
| Overall | All passing | All passing + new tests |

---

## Risk Areas

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removed rule not covered by any skill | Agent misses constraint | Traceability matrix (V-01) |
| Skill file fails schema validation | Skill not loadable | T-13 (schema validation) |
| list_workflows over-filters | Legitimate workflow hidden | T-10 (all-others-present check) |
| start_session response breaks consumers | Bootstrap failure | T-11 (start_session still works) |
