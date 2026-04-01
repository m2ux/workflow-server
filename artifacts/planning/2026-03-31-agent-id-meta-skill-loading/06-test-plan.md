# Agent-ID Meta-Skill Loading — Test Plan

**Date:** 2026-03-31  
**Status:** Complete  
**Test Framework:** Vitest  
**Test File:** `tests/mcp-server.test.ts`

---

## Test Strategy

### Approach

Integration tests against the live MCP server using the MCP SDK client transport. All tests operate against the actual `workflows/` worktree data (real TOON files), not mocks. This validates end-to-end behavior including TOON decoding, skill resolution, resource loading, and token management.

### Test Infrastructure

- **Transport:** `InMemoryTransport` (MCP SDK) — no network, in-process
- **Session management:** Each test starts from a fresh `start_session` token
- **Assertion style:** Behavioral — tests verify returned data shapes and presence/absence of specific skills, not internal implementation details

---

## Test Cases

### Suite 1: Agent-ID Meta-Skill Loading

| # | Test Case | Requirement | Expected Behavior |
|---|-----------|-------------|-------------------|
| 1.1 | New `agent_id` includes meta skills | SC-1, SC-2 | `get_skills` with `agent_id: 'worker-001'` returns `scope: 'activity+meta'` and includes `agent-conduct` in skills |
| 1.2 | Same `agent_id` returns activity skills only | SC-3 | Second `get_skills` with same `agent_id` returns `scope: 'activity'` and excludes `session-protocol` |
| 1.3 | Different `agent_id` re-includes meta skills | SC-4 | `get_skills` with `agent_id: 'worker-002'` after `worker-001` returns meta skills again |
| 1.4 | Omitted `agent_id` preserves backward compat | SC-5 | `get_skills` without `agent_id` returns `scope: 'activity'` (no meta skills) |

**Boundary conditions:**
- Token must be advanced via `next_activity` before calling `get_skills` (activity scope)
- The updated token from the first call must be used for the second call (tests `aid` persistence)

### Suite 2: Cross-Workflow Resource Resolution

| # | Test Case | Requirement | Expected Behavior |
|---|-----------|-------------|-------------------|
| 2.1 | `meta/NN` prefix resolves from meta workflow | SC-7 | `get_skill('orchestrate-workflow')` returns `_resources` containing `worker-prompt-template` with `index: 'meta/05'` |
| 2.2 | Bare index resolves from current workflow | SC-8 | `get_skill('elicit-requirements')` returns `_resources` with `index: '05'` (local resource) |

### Suite 3: Nested Resource Structure

| # | Test Case | Requirement | Expected Behavior |
|---|-----------|-------------|-------------------|
| 3.1 | `get_skill` nests `_resources` with structured fields | SC-9 | `_resources` array contains objects with `index`, `id`, `version`, `content` fields; `content.length > 0` |
| 3.2 | Raw `resources` array stripped from skill response | SC-10 | `response.skill.resources` is `undefined`; `response.resources` is `undefined` |
| 3.3 | `get_skills` nests `_resources` under each skill | SC-9 | Skills with resource declarations have `_resources` with structured entries |
| 3.4 | Frontmatter stripped from resource content | SC-9 | `resource.content` does not start with `---` (YAML frontmatter removed) |
| 3.5 | Workflow-scope `get_skills` uses nested structure | SC-9 | Workflow-level call returns skills with `_resources`, no root-level `resources` |
| 3.6 | Updated token returned in `_meta` | — | `_meta.session_token` is defined after `get_skills` call |

---

## Acceptance Matrix

| Success Criterion | Test Case(s) | Coverage |
|-------------------|-------------|----------|
| SC-1: `get_skills` accepts `agent_id` | 1.1, 1.4 | Parameter acceptance + omission |
| SC-2: New agent → meta skills included | 1.1 | Direct verification |
| SC-3: Same agent → meta skills excluded | 1.2 | Behavioral assertion |
| SC-4: Different agent → meta skills re-included | 1.3 | Agent switch detection |
| SC-5: Omitted → backward compatible | 1.4 | Legacy behavior preserved |
| SC-6: `token.aid` updated | 1.2 (indirect) | Inferred from scope change on second call |
| SC-7: Cross-workflow prefix resolves | 2.1 | End-to-end resolution from meta workflow |
| SC-8: Bare index backward compatible | 2.2 | Local resource resolution unchanged |
| SC-9: Resources nested under `_resources` | 3.1, 3.3, 3.4, 3.5 | Structure, content, frontmatter |
| SC-10: Raw arrays stripped | 3.2 | Absence verified |
| SC-11: Tool description updated | — | Not tested (documentation) |

---

## Coverage Gaps

| Gap | Risk | Rationale for Accepting |
|-----|------|------------------------|
| No direct `token.aid` verification (only behavioral) | LOW | The behavioral assertion (scope changes on second call) is sufficient proof; decoding the opaque token would test implementation, not contract |
| No test for malformed cross-workflow refs (e.g., `/05`, `meta/`) | LOW | `parseResourceRef` handles edge cases naturally — `slashIdx > 0` guards against leading slash; trailing slash produces empty index which won't match any file |
| SC-11 (tool description) not tested | NONE | Description is a string literal; testing it would be brittle and low-value |

---

**Status:** Complete (all test cases implemented and passing in PR #93)
