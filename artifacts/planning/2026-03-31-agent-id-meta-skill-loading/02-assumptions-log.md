# Assumptions Log — Agent-ID Meta-Skill Loading

## Activity: Design Philosophy

### A1 — Workers are the only agents affected by missing meta skills

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** Only worker agents (not orchestrators) are affected by the missing meta skills in `get_skills`, because orchestrators receive meta skills through the workflow-level scope (no activity entered).  
**Evidence:** Verified in `src/tools/resource-tools.ts` lines 128-148. Three branches: (1) `!activityId` → returns universal + workflow-level + workflow-declared skills (orchestrator path), (2) `isNewAgent` → returns universal + activity skills (new worker path, added by this PR), (3) else → returns activity skills only (returning worker or no agent_id). Orchestrators call `get_skills` before `next_activity`, so `token.act` is empty — they always get meta skills via branch 1. Workers call after `next_activity` populates `token.act`, hitting branches 2 or 3.  
**Resolution:** Confirmed — only activity-scope callers (workers) were affected.

### A2 — The `aid` token field has no existing consumers

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** The `aid` field in the session token is unused by any existing code path, so repurposing it for agent-id tracking has no side effects.  
**Evidence:** Verified in `src/utils/session.ts`. The `aid` field is defined in `SessionPayload` (line 14), `SessionAdvance` (line 22), and the Zod schema (line 42). `createSessionToken` initializes it to `''` (line 82). `advanceToken` conditionally spreads it (line 100). Before this PR, no call to `advanceToken` passed an `aid` value — the only `advanceToken` callers passed `{ wf: workflow_id }` or `{ wf, skill }`. No other tool reads `token.aid`.  
**Resolution:** Confirmed — the field was structurally present but semantically unused. No side effects from repurposing.

### A3 — Slash separator resolves the prefix parsing ambiguity

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** Using `/` as the separator for cross-workflow resource references (e.g., `meta/05`) is consistent with how resources are declared in workflow TOON files, and no existing resource indices contain slashes.  
**Evidence:** Verified in TOON files. `orchestrate-workflow.toon` declares `"meta/05"` in its resources array. `build-comprehension.toon` declares `"meta/04"`. All bare resource references use numeric indices (e.g., `"05"`, `"09"`, `"26"`) with no slashes. The `parseResourceRef` function (resource-tools.ts lines 20-26) splits on the first `/` — bare indices fall through to the default case. The issue originally described `meta:NN` colon notation, but actual TOON file declarations already use slash notation.  
**Resolution:** Confirmed — slash notation matches existing TOON conventions and no bare indices contain slashes.

### A4 — Simple complexity is appropriate despite two coordinated changes

**Status:** Validated  
**Resolvability:** Not code-resolvable (judgment)  
**Assumption:** Classifying this as "simple" complexity is appropriate even though it involves two coordinated changes (agent-id detection + cross-workflow resources) plus a structural change (nested resources).  
**Evidence:** Both changes are confined to the same file (`resource-tools.ts`), follow existing patterns, have clear acceptance criteria, and were completed in a single PR. Total implementation was contained.  
**Risk:** Underestimating complexity could lead to missed edge cases.  
**Rationale:** The changes are mechanically straightforward — the risk is in correctness of the parsing and branching logic, not in architectural ambiguity.

## Activity: Plan & Prepare

### A5 — Task ordering is sequential without parallelization opportunities

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** The three implementation tasks (cross-workflow prefix, nested resources, agent-id loading) must be completed in sequence because each builds on the prior change.  
**Evidence:** `bundleSkillWithResources` (Task 2) calls `loadSkillResources` (Task 1's output). The `get_skills` handler refactoring (Task 3) uses `bundleSkillWithResources` (Task 2). Tasks 4-6 (tests) depend on their respective implementation tasks.  
**Resolution:** Confirmed — dependency chain is real. Tasks cannot be parallelized.

### A6 — Per-skill resource duplication is acceptable

**Status:** Validated  
**Resolvability:** Not code-resolvable (judgment)  
**Assumption:** Removing de-duplication of resources (pre-PR flat array with `seenIndices`) in favor of per-skill `_resources` is an acceptable trade-off, even though the same resource may appear in multiple skills' `_resources` arrays.  
**Evidence:** In practice, resource sharing between skills within a single `get_skills` call is rare — most skills reference unique resources. The response size increase is negligible compared to the skill definitions themselves.  
**Rationale:** Simplicity of per-skill bundling outweighs the marginal size cost of occasional duplication.

### A7 — Behavioral test assertions provide sufficient coverage for token.aid

**Status:** Validated  
**Resolvability:** Code-resolvable  
**Assumption:** Testing `token.aid` updates indirectly through behavioral assertions (scope changes on second call) is sufficient; direct token decoding in tests is not needed.  
**Evidence:** The test "same agent_id should return activity skills only" passes the updated token from the first call to the second call. If `aid` were not updated, the second call would still detect `isNewAgent` and return meta skills — the test would fail. This provides a transitive proof that `aid` was correctly persisted.  
**Resolution:** Confirmed — behavioral assertions transitively cover the `aid` update mechanism.
