# Issue #248: Context-cost profile: precompute a workflow's context load to decide when solo runs are allowed

Captured verbatim on 2026-08-02 when the issue was consolidated into the session-presets epic.

---

## Summary

There are two ways to walk a workflow: dispatch each activity to a fresh worker agent, or run "solo" — one agent holding the entire walk in a single context. PR #247 removed the solo path (meta's preferred-solo `execute-activity` route) after a `work-package` review walk overflowed a single agent's context — roughly 93 `deliveredContent` entries piled up under one orchestrator's ledger — and dragged meta, the shared orchestration workflow, into doing the client workflow's domain work itself.

Solo remains a valid shape for short walks. What has to go is choosing it by default, or letting an agent improvise the choice. For workflows such as `work-package`, the context cost of a walk is broadly knowable from the definition alone, before anything executes — so the choice can rest on a precomputed estimate instead.

## Goal

Precompute a per-workflow (and optionally per-path) context-cost estimate, store it with the workflow, and let the client orchestrator — never meta — choose solo only when the estimate fits under the harness's context budget.

## Non-goals (v1)

- Meta never runs client activity logic.
- No "try solo and fall back" heuristic.
- No agent-invented topology thresholds.

## Proposal

### Stage 1 — Static cost model

Estimate the cost from the workflow YAML plus its resolved techniques and resources, with no execution, from signals like these:

| Signal | Why |
|--------|-----|
| Activity count (required + likely optional paths) | Primary walk length |
| Steps / techniques per activity | Ops + rule payload |
| Resource bytes (bare + `#section` usage) | Eager-bundle size |
| Peak concurrent `deliveredContent` under solo+persistent | Ledger growth |
| Branching / review-mode path multipliers | e.g. `work-package` review vs impl |

Example stored profile:

```yaml
# e.g. work-package/cost-profile.yaml (or field on workflow.yaml)
context_cost:
  schema_version: 1
  unit: tokens_estimate
  paths:
    default: { activities: 14, peak_context: 180000, solo_eligible: false }
    review_mode: { activities: 10, peak_context: 160000, solo_eligible: false }
  computed_at: ...
  method: static-v1
```

Calibrate the model against real sessions, using token-use tracking and observed `deliveredContent` sizes.

### Stage 2 — Selection policy

- **Meta:** creates the child session and drives it via `dispatch-activity` (or hands off to a client orchestrator). It never executes client activity steps.
- **Client orchestrator:** reads the stored `context_cost` for the active path. Only when that path is marked solo-eligible and its peak estimate sits below the harness budget may it run solo with a persistent context; otherwise it dispatches.
- **When the profile is missing or stale:** the default is dispatch.

### Stage 3 — Tooling

- A CI script regenerates profiles whenever a workflow changes.
- Validation refuses solo in the protocol when the profile says ineligible, or when no profile exists.
- Optionally, surface the profile on `get_workflow` so agents never invent thresholds of their own.

### Stage 4 — Reintroduce solo, narrowly

1. Restore `execute-activity` as an optional client-orchestrator operation.
2. Gate it on the stored profile plus the budget.
3. Pilot on a small workflow first; keep `work-package` dispatch-only until the estimates prove there is headroom.

## Acceptance criteria

- [ ] `work-package` (both implementation and review paths) never selects solo under the static-v1 model.
- [ ] A deliberately tiny workflow can select solo when its profile allows it.
- [ ] A meta session never accumulates client `deliveredContent`.
- [ ] The context-overflow class of failure seen in the PR #1807 re-review session does not recur under solo-eligible paths.

## Related

- Revert PR: https://github.com/m2ux/workflow-server/pull/247
- Prior solo adoption: #244
- Suggested planning-folder slug: `2026-07-16-static-workflow-context-cost`

