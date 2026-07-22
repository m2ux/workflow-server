# Impact Analysis — Work-Package Run Retrospective Friction Points

**Workflow:** `work-package` v3.34.0 (primary) · `meta` / `harness-compat` (coupled) · `ponytail` (lean-coding path)
**Mode:** Update
**Date:** 2026-07-22
**Change source:** [design specification](03-design-specification.md)
**Baseline:** [structural inventory](01-structural-inventory.md)

---

## Summary

Nine #272 friction fixes land as in-place activity/technique/resource edits across `work-package`, coupled `meta` / harness-compat, and the shared `ponytail` lean-coding path — no activity add/remove/reorder. Topology stays intact. Material removals are limited to softening the absolute `foreground-always` / `run_in_background` ban (A-6); everything else is additive or same-shape update. Schema change for `next_activity_id` is not required for integrity if the worker envelope convention lands first (A-2).

**removal_count:** 3

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `meta/activities/00-discover-session.yaml` | Item 1 — keep or relocate `list-available-workflows` bind (A-1); activity itself is the ownership surface |
| `meta/resources/activity-worker-prompt.md` | Item 1 — make bound-step `list_workflows` permit unmistakable |
| `meta/techniques/agent-conduct.md` | Item 1 — align bundled-tools / control-plane wording with discover-session bind |
| `meta/techniques/workflow-engine/finalize-activity.md` | Item 2 — fold resolved `next_activity_id` (+ evaluated condition) into `activity_complete` |
| `meta/techniques/workflow-engine/evaluate-transition.md` | Item 2 — producer of `next_activity_id`; wire into worker finalize path / envelope |
| `meta/techniques/workflow-engine/dispatch-activity.md` | Item 2 — orchestrator reads next id from worker envelope under `no-get-activity-from-orchestrator` |
| `meta/resources/workflow-orchestrator-prompt.md` | Item 2 — stop implying transition-table / definition access for routing |
| `meta/activities/03-dispatch-client-workflow.yaml` | Item 2 — loop may consume envelope `next_activity_id` instead of opaque `completed_activity` definition |
| `meta/activities/02-resolve-target.yaml` | Item 5 — `submodule-selection` currently one option; add cancel/re-list (A-5) |
| `meta/techniques/workflow-engine/present-checkpoint-to-user.md` | Item 5 — only if Gate 2 also wants single-option present tolerance |
| `meta/techniques/harness-compat/TECHNIQUE.md` | Item 6 — `foreground-always` → blocking-equivalent via async+notify |
| `meta/techniques/harness-compat/spawn-agent.md` | Item 6 — align “Never set `run_in_background`” / block-until with notify path |
| `meta/techniques/harness-compat/continue-agent.md` | Item 6 — same absolute-ban soften |
| `work-package/workflow.yaml` | Items 3–4 — declare `validation_skipped_by_user` / build-artifact hand-off variables; version bump |
| `work-package/activities/11-validate.yaml` | Items 3–4 — externalized validation gate + build-dependent artifact flag/hand-off (A-3, A-4) |
| `work-package/activities/13-submit-for-review.yaml` | Item 4 safety-net re-check; Item 9 late render remains but mid-flow refresh may precede it |
| `work-package/activities/12-strategic-review.yaml` and/or `08-implement.yaml` | Item 9 — bind post-impl `update-pr::render` refresh (A-9) |
| `work-package/techniques/manage-artifacts/write-artifact.md` | Item 8 — write-time find-or-update enforcement + mint-conflict → assumptions-log row |
| `work-package/resources/pr-description.md` | Item 9 — tense/checklist guidance so Initial “coming next” does not linger after impl |
| `work-package/techniques/update-pr/render.md` / `update-pr/TECHNIQUE.md` | Item 9 — refresh bind / variant selection after implementation lands |
| `ponytail/techniques/review-over-engineering.md` | Item 7 — hard trim: comment bulk proportional to surrounding code |
| `ponytail/resources/review-taxonomy.md` | Item 7 — taxonomy/heuristic for comment over-verbosity (beyond restating-line delete) |

### Possibly touched (draft-time)

| File | Why |
|------|-----|
| `meta/techniques/workflow-engine/list-workflows.md` | Only if discover-session permit needs op-local restatement |
| `meta/techniques/version-control/select-target-component.md` | Option labels / recommended-submodule messaging for ≥2-option gate |
| `meta/techniques/harness-compat/spawn-concurrent.md` | Parallelism wording if foreground-equivalent expands |
| `work-package/techniques/validate-build/*` | Externalized / skip path may share failure envelope shape |
| `work-package/activities/09-lean-coding-audit.yaml` | Only if bind inputs need a comment-pass flag |
| `work-package/activities/06-plan-prepare.yaml` | Initial `update-pr::render` stays; may note mid-flow refresh elsewhere |
| `work-package/README.md` / `activities/README.md` | Orient validate hand-off, PR refresh, write-artifact conflict logging |
| `meta/README.md` / `activities/README.md` | Discover permit + next-activity envelope + submodule options |
| `ponytail/README.md` / techniques README | Comment-proportionality mention |
| MCP `schemas/` / server envelope | Only if A-2 escalates after convention proves insufficient |

### Unaffected (summary)

WP activities outside validate / submit / strategic-review / implement / lean-coding-audit (and their unlisted techniques); meta initialize / end-workflow and atlassian / cargo / github / gitnexus technique trees; remaining ~100 WP technique leaves and most resources. Activity counts stay 15 (WP) + 5 (meta lifecycle). `initialActivity` unchanged on both.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | Pass — no activity add/remove/reorder; all existing `transitions[].to` targets remain valid; `initialActivity` (`start-work-package` / `discover-session`) untouched. New gates are step-internal. |
| Technique / resource references | Pass — edits reuse existing `::` paths (`workflow-engine::*`, `update-pr::render`, `manage-artifacts::write-artifact`, `ponytail/*`, `cargo-operations::*`). New steps must bind existing ops or declare new technique files before bind. |
| Variables / `setVariable` / step conditions | Pass with draft duty — add declared vars for externalized validation / build-artifact hand-off (`validation_skipped_by_user` etc.); submodule cancel option must `setVariable` consistently; envelope fields are report keys, not bag orphans. `completed_activity` today is consumed but never produced in meta YAML — item 2 closes that integrity gap. |

**A-2 (schema):** `evaluate-transition` already emits `next_activity_id`, but needs the completed activity’s `transitions[]`. Under `no-get-activity-from-orchestrator`, the worker (who has the definition) should report the resolved next id in `activity_complete`. Technique/convention is sufficient for integrity; formal schema only if validators reject unknown envelope keys (still Gate 2).

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `meta/techniques/harness-compat/TECHNIQUE.md` · `foreground-always` | Absolute “MUST be foreground (blocking)” / “Never set `run_in_background`” with no notify exception | Intent that the orchestrator must see yields/completion; index-in-prompt; harness-independence |
| 2 | `meta/techniques/harness-compat/spawn-agent.md` · Protocol | Unconditional “Omit `run_in_background` or set false” + block-until as the only legal completion path | Depth-1-only; spawn vocabulary; capture of `{agent_result}` including `<checkpoint_yield>` |
| 3 | `meta/techniques/harness-compat/continue-agent.md` · Protocol | Unconditional “Never set `run_in_background`” + block-until-only wording | Resume-is-optimisation; session_index-in-prompt; result capture |

**Contingent (not counted — Gate 2):** If A-1 chooses relocate, remove step `list-available-workflows` from `00-discover-session.yaml` (preserve match-target / resume path). Assumed design keeps the step and tightens the permit — no removal.

---

## Decision ask

Confirm impact scope and intentional removals (harness-compat absolute-ban soften) — or revise / preserve. Open A-1–A-5, A-9 still shape draft details at Gate 2; they do not add further counted removals under the assumed positions.
