# Agent-ID Meta-Skill Loading — Implementation Plan

**Date:** 2026-03-31  
**Priority:** HIGH  
**Status:** Complete  
**Estimated Effort:** ~1.5h agentic + ~30m review

---

## Overview

### Problem Statement

The `get_skills` tool excludes meta/universal skills when a worker agent calls it in activity scope, and cross-workflow resource references (`meta/05`) silently fail because the resource loader does not parse the workflow prefix. Workers bootstrap without foundational behavioral protocols, and skills referencing cross-workflow resources receive empty responses.

### Scope

**In Scope:**
- Agent-id parameter for `get_skills` with new-agent detection via `token.aid`
- Cross-workflow resource prefix parsing in `loadSkillResources`
- Per-skill resource nesting (`_resources` field replacing flat root-level array)
- Test coverage for all new behaviors
- Tool description update

**Out of Scope:**
- Changes to the session token schema (the `aid` field already exists)
- Modifications to any other MCP tools
- Workflow TOON file changes (TOON files already use `meta/05` notation)
- Resource validation (existing gap from BF-16, tracked separately)

---

## Proposed Approach

### Solution Design

Three coordinated changes to `src/tools/resource-tools.ts`:

1. **`parseResourceRef` function**: Splits resource reference strings on the first `/` to extract optional `workflowId` and `index`. Bare indices pass through unchanged.

2. **Three-branch `get_skills` handler**: Extend the existing two-branch model (workflow scope vs activity scope) to three branches:
   - Branch 1: No activity → workflow scope (unchanged)
   - Branch 2: Activity + new agent → `activity+meta` scope (universal + activity skills)
   - Branch 3: Activity + same/no agent → `activity` scope (activity skills only)

3. **`bundleSkillWithResources` function**: Strip raw `resources` array from each skill, resolve referenced resources, and nest them under `_resources`. Remove the flat root-level `resources` array and de-duplication logic.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Always include meta skills | Simplest implementation | Wastes context window on returning agents | Rejected |
| Separate `get_meta_skills` tool | Clear separation of concerns | Adds API surface; agents must call two tools | Rejected |
| `agent_id` parameter on `get_skills` | Minimal API change; leverages existing `aid` token field | Requires agent to declare identity | **Selected** |

---

## Implementation Tasks

### Task 1: Cross-workflow resource prefix parsing (15m)

**Goal:** Enable skills to reference resources from other workflows using `workflow/index` notation.

**Deliverables:**
- `src/tools/resource-tools.ts` — Add `parseResourceRef()` function; update `loadSkillResources()` to use parsed `workflowId` for resolution target

**Dependencies:** None (standalone)

### Task 2: Per-skill resource nesting (10m)

**Goal:** Bundle resolved resources under each skill's `_resources` field instead of a flat response-level array.

**Deliverables:**
- `src/tools/resource-tools.ts` — Add `bundleSkillWithResources()` function; refactor `get_skills` and `get_skill` handlers to use it; remove flat `resources` array, `seenIndices` tracking, and `duplicate_resource_indices` field

**Dependencies:** Task 1 (resource loading must work before bundling)

### Task 3: Agent-id meta-skill loading (20m)

**Goal:** Include universal meta skills for new worker agents on their first `get_skills` call.

**Deliverables:**
- `src/tools/resource-tools.ts` — Add `agent_id` optional parameter to `get_skills`; implement `isNewAgent` detection; add `activity+meta` branch calling `listUniversalSkillIds`; pass `aid` update to `advanceToken`
- `src/tools/resource-tools.ts` — Update tool description string

**Dependencies:** Task 2 (skill bundling must be in place)

### Task 4: Tests for agent-id meta-skill loading (20m)

**Goal:** Verify agent-id detection, meta skill inclusion/exclusion, and backward compatibility.

**Deliverables:**
- `tests/mcp-server.test.ts` — 4 test cases: new agent, same agent, different agent, omitted agent_id

**Dependencies:** Task 3

### Task 5: Tests for cross-workflow resource resolution (15m)

**Goal:** Verify cross-workflow prefix resolution and bare index backward compatibility.

**Deliverables:**
- `tests/mcp-server.test.ts` — 2 test cases: `meta/NN` prefix resolves from meta workflow, bare index resolves from current workflow

**Dependencies:** Task 1, Task 2

### Task 6: Tests for nested resource structure (10m)

**Goal:** Verify `_resources` nesting on both `get_skill` and `get_skills`, raw `resources` stripped, frontmatter parsed.

**Deliverables:**
- `tests/mcp-server.test.ts` — Tests for `_resources` presence, structure, frontmatter stripping, and absence of legacy flat array

**Dependencies:** Task 2

---

## Success Criteria

### Functional Requirements
- [ ] `get_skills` accepts optional `agent_id` parameter
- [ ] New `agent_id` → scope `activity+meta` with universal skills included
- [ ] Same `agent_id` → scope `activity` with universal skills excluded
- [ ] Different `agent_id` → universal skills re-included
- [ ] Omitted `agent_id` → backward-compatible behavior (activity skills only)
- [ ] `token.aid` updated when `isNewAgent` is true
- [ ] Cross-workflow `workflow/index` references resolve correctly
- [ ] Bare index references maintain backward compatibility
- [ ] Resources nested under `_resources` per skill
- [ ] Raw `resources` array stripped from skill responses
- [ ] Tool description updated

### Quality Requirements
- [ ] All existing tests pass
- [ ] New tests cover all branches of agent-id logic
- [ ] Cross-workflow resource resolution covered by integration tests

---

## Dependencies & Risks

### Requires
- [x] `aid` field exists in `SessionPayload` and `SessionAdvance` (verified)
- [x] `listUniversalSkillIds` helper exists (verified)
- [x] `readResourceStructured` accepts arbitrary `workflowId` (verified)

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking backward compatibility for callers not passing `agent_id` | HIGH | LOW | Explicit else branch preserves existing behavior |
| Silent resource drop for malformed cross-workflow refs | LOW | LOW | `parseResourceRef` handles edge cases; no slash → bare index |
| Response size increase from duplicated resources across skills | LOW | MEDIUM | Acceptable trade-off vs flat array complexity |

---

**Status:** Complete (PR #93 merged 2026-03-31)
