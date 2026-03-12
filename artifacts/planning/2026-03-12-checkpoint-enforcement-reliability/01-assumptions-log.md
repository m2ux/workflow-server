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

---

## Resolution Summary

| Metric | Count |
|--------|-------|
| Total assumptions | 8 |
| Validated | 4 (A2, A3, A4, A5) |
| Partially Validated | 2 (A1, A6) |
| Open (stakeholder-dependent) | 1 (A7) |
| Newly surfaced during reconciliation | 1 (A8) |
| Convergence iterations | 1 |

---

## Resolution Log

### Iteration 1 (2026-03-12)

**Files examined:**
- `workflows/meta/skills/04-orchestrate-workflow.toon` — orchestration skill with validation instructions
- `src/schema/activity.schema.ts` — CheckpointSchema with required/blocking flags
- `src/schema/state.schema.ts` — CheckpointResponseSchema and state tracking
- `src/tools/workflow-tools.ts` — get_checkpoint tool (read-only)
- `workflows/work-package/workflow.toon` — workflow rules and execution model

**Key finding:** The validation logic described in the orchestrate-workflow skill (process-result step 4) is comprehensive in theory but exists only as a prompt instruction. The schema infrastructure (required/blocking flags, checkpointResponses tracking) is in place to support enforcement, but no runtime code enforces it. The gap is between what the skill describes and what the system guarantees.

**Convergence:** No code-resolvable assumptions remain. A7 is stakeholder-dependent.
