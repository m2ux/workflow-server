# Assumptions Log

> workflow-design self-review fix pass · session RPKOLJ · updated 2026-07-11

## Log

One row per assumption, updated in place. IDs: RR = Requirements Refinement.

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RR-1 | Requirements Refinement | Activity Boundaries | M | The fix pass stays within the existing 9-activity structure (no activity added, removed, or renamed) — every recommended fix in the report is an in-place edit; H1's loop rebuild is intra-activity | Code: `08-compliance-review.md` Recommended Fixes — all P1–P4 items are in-place edits to existing activities/techniques/resources | Validated |
| RR-2 | Requirements Refinement | Schema Construct Choice | H | M13 will be fixed by gating the update-mode chain on drafted-content state (e.g. `scope_manifest_confirmed == true`) rather than relocating the mode-flip `setVariable` into the transition target activity — the report offers both mechanisms without choosing | Code: audit-principles — H2's fix already introduces the `scope_manifest_confirmed` gate; content-state gating reuses it and is robust to flip timing (P10 constraints-as-structure: gate on the true precondition); relocation only treats ordering | Validated |
| RR-3 | Requirements Refinement | Technique Selection | M | H7 is remediated by re-homing the three loader techniques onto the existing wrapped `workflow-engine::list-workflows`-style ops rather than reframing as worktree/orchestrator-context sourcing — the report notes a wrapped op already exists | Code: `workflows/meta/techniques/workflow-engine/list-workflows.md` exists (audit-consistency) | Validated |
| RR-4 | Requirements Refinement | Rule Scope | M | H6's end state is ZERO activity `rules:` blocks (delete/migrate/mechanize leaves nothing at activity level), and `fragments` reuse is adopted only where content duplicates a work-package fragment near-verbatim — matching the report's stated end state and the baseline | Code: grep — zero `rules:` blocks across `workflows/work-package/activities/*.yaml`; `fragments` block present in work-package `workflow.yaml` (audit-conformance) | Validated |
| RR-5 | Requirements Refinement | Variable State | M | M1 disposition defaults to wire-the-gate where the claimed gate has a natural structural consumer (e.g. `has_open_assumptions` on the interview loop) and delete-variable-plus-prose otherwise — the report allows either per variable | Code: corpus rule `outputs-by-name-and-path` forbids redundant flattened flags (audit-conformance); per-variable application is scope-and-draft execution detail | Validated |
| RR-6 | Requirements Refinement | Checkpoint Necessity | L | No checkpoint is added or removed anywhere in the fix pass; M11's templated id becomes a static explicit id following work-package's `assumption-interview` shape — placement/id fixes only | Code: grep — no templated checkpoint ids in corpus outside workflow-design; all `#{` hits are message interpolations (audit-conformance) | Validated |
| RR-7 | Requirements Refinement | Schema Construct Choice | L | The remediated workflow ships as a MINOR version bump (1.6.0 → 1.7.0) — behavior-changing but schema-compatible and contract-preserving, consistent with library bump conventions | Code: work-package behavior-changing updates shipped as minor bumps (3.19.0, 3.21.0, 3.26.0) (audit-conformance) | Validated |

## Wrap-Up

7 assumptions — all validated through audit reconciliation; none required user interview.
