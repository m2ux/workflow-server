# Workflow Design: work-package / meta — Complete

> Update · 2026-07-22

## Summary

Update-mode design for [issue #272](https://github.com/m2ux/workflow-server/issues/272) landed nine work-package-run friction fixes across `meta`, `work-package`, `workflow-design`, harness-compat, and related surfaces. Changes are on PR [#273](https://github.com/m2ux/workflow-server/pull/273) (`0195a44d`).

## What Was Delivered

- **Activities:** `meta` discover/dispatch/resolve-target; `work-package` validate / strategic-review / submit-for-review; `workflow-design` intake/validate README binds
- **Techniques:** Apply-model `activity-worker` / `workflow-orchestrator`; `sync-progress-status`; hoist `create-readme` / `verify-readme-conforms`; harness-compat host split + `resolve-harness-operation`; manage-git `commit-paths` / `restore-paths-from-ref`; finalize/dispatch/commit-and-persist Progress wiring
- **Resources:** Universal `planning-readme` Template; WP/WD `readme-seed`; deleted prompt / design-context-readme duplicates
- **Variables / rules:** Hand-off / Progress N/A vars; duplicate README-progress activity rules removed; quality-review hygiene (Protocol-owned rules, git-tree validate)

## Design Decisions

- Assumptions / open judgements → [03-assumptions-log.md](03-assumptions-log.md)
- README Design Decisions → [README.md](README.md)
- Drafting-only: Gate 2 accepted A-1/A-2/A-5/A-9 agent positions with the committed tip (no separate COMPLETE essay)

## Scope Outcome

All confirmed [06-scope-manifest.md](06-scope-manifest.md) items delivered on tip `0195a44d` (35-file manifest paths present; listed deletes applied).

## Known Limitations & Deferrals

- **[F-2](follow-ups.md)** — `corrections must persist` still text-only in `workflow-design` (no `corrections_log` structure)
- **[F-3](follow-ups.md)** — `plan-prepare` task/command rules lack post-plan validate
- **[F-4](follow-ups.md)** — binding-fidelity NEW drifts on tip (dead-output / verify-readme component reads / `entity_context` producer)

## Lessons Learned

- Soft mid-flow gates + headless default still left a long `batch-review-attested` revise loop (41 post-revise cycles) before attest — Gate 2 batching helped close, but draft review ceremony remains the dominant cost.

## Workflow Retrospective

[messages: ~8 substantive non-checkpoint (resume / proceed / Gate 2 `1` / proceed with retro) · ~46 checkpoint responses · session quality: Significant issues]
[trace: 254 events · 5 errors · 26 validation warnings · no separate session-trace.md]

### Observations

- [checkpoint anomaly] `batch-review-attested` answered `revise-block` **41** times then `attested` — scope-and-draft — soft-gate / revise loop dominated wall time (AP-81/82 demote or batch candidates)
- [process] "resume" / "proceed" used as primary control plane between activities — intake/dispatch — incomplete bag mirroring (`variables` mostly empty in inspect) forced path reconstruction from planning folder
- [trace-warning] Repeated `step_manifest` gaps/order and paraphrased `transition_condition` on `next_activity` — intake → quality-review — worker/orchestrator fidelity vs advisory validation
- [trace-warning] UNRESOLVED inputs (`drafted_files`, `selected_findings`, `schema_type`) — scope-and-draft / quality-review — binding signatures vs ambient context
- [trace-retry] Checkpoint present/yield/respond races around `batch-review-attested#post-revise-17` — scope-and-draft — active-checkpoint discipline under long revise loops
- [trace-retry] `get_resource` miss `planning-readme` under `workflow-design` (needed cross-workflow id) — impact-analysis — resource id qualification guidance

### Recommendations

1. **High:** Cap or auto-batch soft `revise-block` loops (max iterations / coalesce feedback) so design sessions cannot spend dozens of cycles on one attestation gate (`workflow-design` `scope-and-draft` / soft-gate policy)
2. **High:** Require session bag path vars (`target_path`, `workflow_branch`, planning artifact paths) to land via `variables_changed` so resume does not rely on tribal path memory (`finalize-activity` / write-artifact outputs)
3. **Medium:** Document cross-workflow `get_resource` ids (`meta/planning-readme`) at call sites that previously used bare slugs (`impact-analysis` / planning README consumers)
4. **Medium:** Close [F-4](follow-ups.md) binding-fidelity NEW drifts before merge or explicitly `--update-baseline` intentional dead-outputs

**Key takeaway:** The #272 content landed, but this design session recreated soft-gate revise-loop cost — soft attestation needs a hard iteration budget as much as the friction fixes need shipping.
**Action required:** yes — track High items against #273 review / follow-up issue if not absorbed in PR comments
