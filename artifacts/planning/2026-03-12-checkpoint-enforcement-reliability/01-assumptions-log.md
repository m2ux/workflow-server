# Assumptions Log

**Work Package:** Checkpoint Enforcement Reliability  
**Issue:** #51  
**Created:** 2026-03-12

---

## Assumptions

| # | Category | Assumption | Resolvability | Status | Evidence |
|---|----------|-----------|---------------|--------|----------|
| A1 | Problem Interpretation | The orchestrate-workflow skill does not currently validate `checkpoints_responded` against required blocking checkpoints before accepting `activity_complete` | Code-analyzable | Partially Validated | The skill TOON (line 34) describes validation in prose, but this is a prompt instruction — not server-enforced. The orchestrator LLM may or may not follow through. |
| A2 | Problem Interpretation | Activity TOON definitions include `required` and `blocking` flags on checkpoints that can be used for validation | Code-analyzable | Validated | `activity.schema.ts` lines 54-55: `required: z.boolean().default(true)`, `blocking: z.boolean().default(true)` on CheckpointSchema. |
| A3 | Problem Interpretation | The worker prompt template in the orchestrate-workflow skill does not explicitly enumerate blocking checkpoints per activity | Code-analyzable | Validated | `04-orchestrate-workflow.toon` lines 24-29: dispatch-activity includes bootstrap instructions and structured result format but does not enumerate which checkpoints are blocking. |
| A4 | Complexity Assessment | Checkpoint prerequisite evaluation is currently handled by the worker, not the orchestrator | Code-analyzable | Validated | CheckpointSchema `prerequisite` field (line 52) is an unstructured string (e.g., "Only present when on_feature_branch is true"), not a machine-evaluable condition. The orchestrator cannot parse it. |
| A5 | Complexity Assessment | The workflow server does not have stateful server-side checkpoint gates | Code-analyzable | Validated | `workflow-tools.ts` exposes `get_checkpoint` as read-only. `state.schema.ts` tracks `checkpointResponses` as data but has no enforcement middleware. No server-side gate blocks activity completion based on checkpoint status. |
| A6 | Workflow Path | The existing skill and TOON file structure supports adding checkpoint-aware guardrails without schema changes | Code-analyzable | Partially Validated | Prompt-level and skill-level guardrails can be added without schema changes (CheckpointSchema already has required/blocking flags; state schema already tracks checkpointResponses). Server-side gates would require code changes to `src/` but no schema changes. |
| A7 | Workflow Path | Codebase comprehension alone provides sufficient context to plan all three fix levels | Stakeholder-dependent | Open | Cannot be resolved through code analysis — depends on whether the user considers the issue description sufficient or wants additional discovery. |
| A8 | Complexity Assessment | The `prerequisite` field on checkpoints is an unstructured string; orchestrator-side prerequisite evaluation would require either parsing these strings or converting them to structured conditions | Code-analyzable | Validated | Surfaced during A4 analysis. `prerequisite: z.string().optional()` in CheckpointSchema — no ConditionSchema reference. Converting to structured conditions would require a schema migration of existing TOON files. |
| A9 | Design Approach | The `validate_activity_completion` tool can be added to `workflow-tools.ts` using the existing `server.tool()` registration pattern without architectural changes | Code-analyzable | Validated | `server.tool()` accepts any tool name and callback. `workflow-tools.ts` registers 6 tools using this pattern. No limit on registered tools in `McpServer._registeredTools`. |
| A10 | Design Approach | The `getBlockingCheckpoints` helper can be implemented using existing `getActivity()` and `Checkpoint` types without new type definitions | Code-analyzable | Validated | `getActivity()` returns `Activity \| undefined`. `Activity.checkpoints` is `Checkpoint[]`. `Checkpoint` includes `required: boolean`, `blocking: boolean`, `prerequisite: string?`. All necessary fields exist. |
| A11 | Task Breakdown | Modifying skill TOON files in `workflows/` does not affect the server build or test suite | Code-analyzable | Validated | `workflows/` is a git worktree (orphan branch). `tsconfig.json` includes only `src/**/*`. `npm test` and `npm run build` do not process TOON files. |
| A12 | Test Strategy | The existing test setup (`InMemoryTransport` + `Client`) supports calling the new `validate_activity_completion` tool without test infrastructure changes | Code-analyzable | Validated | `tests/mcp-server.test.ts` uses `InMemoryTransport.createLinkedPair()` and `client.callTool()`. Any tool registered via `server.tool()` is callable through this setup. |
| A13 | Scope Decisions | Prerequisite evaluation is deferred — the validation tool reports prerequisite metadata but does not evaluate string prerequisites | Stakeholder-dependent | Open | Whether this trade-off is acceptable depends on user judgment. The tool provides the information; the orchestrator applies prerequisite knowledge from context. |
| A14 | Scope Decisions | Architecture evaluation (stateful gates, activity decomposition, prerequisite migration) is documented but not implemented in this work package | Stakeholder-dependent | Open | Whether evaluation-only satisfies US-3 acceptance criteria depends on user judgment. The issue scope says "evaluation" not "implementation" for system architecture. |

---

## Resolution Summary

| Metric | Count |
|--------|-------|
| Total assumptions | 14 |
| Validated | 9 (A2, A3, A4, A5, A8, A9, A10, A11, A12) |
| Partially Validated | 2 (A1, A6) |
| Open (stakeholder-dependent) | 3 (A7, A13, A14) |
| Newly surfaced during planning | 6 (A9, A10, A11, A12, A13, A14) |
| Convergence iterations | 2 (design-philosophy: 1, plan-prepare: 1) |

---

## Resolution Log

### Iteration 1 (2026-03-12) — Design Philosophy

**Files examined:**
- `workflows/meta/skills/04-orchestrate-workflow.toon` — orchestration skill with validation instructions
- `src/schema/activity.schema.ts` — CheckpointSchema with required/blocking flags
- `src/schema/state.schema.ts` — CheckpointResponseSchema and state tracking
- `src/tools/workflow-tools.ts` — get_checkpoint tool (read-only)
- `workflows/work-package/workflow.toon` — workflow rules and execution model

**Key finding:** The validation logic described in the orchestrate-workflow skill (process-result step 4) is comprehensive in theory but exists only as a prompt instruction. The schema infrastructure (required/blocking flags, checkpointResponses tracking) is in place to support enforcement, but no runtime code enforces it. The gap is between what the skill describes and what the system guarantees.

**Convergence:** No code-resolvable assumptions remained after this iteration. A7 was stakeholder-dependent.

### Iteration 2 (2026-03-12) — Plan & Prepare

**Files examined:**
- `src/tools/workflow-tools.ts` — tool registration patterns (6 tools, `server.tool()`)
- `src/loaders/workflow-loader.ts` — `getActivity()`, `getCheckpoint()` exports
- `src/schema/activity.schema.ts` — `Checkpoint` type fields
- `node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts` — McpServer API
- `tsconfig.json` — build includes `src/**/*` only
- `tests/mcp-server.test.ts` — test setup with InMemoryTransport

**Key finding:** All planning assumptions about the ability to add a new validation tool (A9), use existing types (A10), test infrastructure compatibility (A12), and TOON file independence from build (A11) are validated by examining the codebase. The implementation path is clear and does not require schema changes or new dependencies.

**Convergence:** No code-resolvable assumptions remain. A7, A13, A14 are stakeholder-dependent.
