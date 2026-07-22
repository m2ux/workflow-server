# Structural Inventory — work-package

**Workflow:** Work Package Implementation Workflow
**ID:** `work-package`
**Version:** 3.35.0
**Initial activity:** `start-work-package`
**Catalog source:** committed workflow catalog (`list_workflows`)
**Mode:** update

## File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 15 |
| Technique leaf files (`.md`, excl. containers/README) | 91 |
| Technique container `TECHNIQUE.md` files | 17 |
| Resource files (excl. README) | 30 |
| Total files under workflow tree | 160 |

## Entity counts

| Entity | Count |
|--------|------:|
| Activities | 15 |
| Techniques (leaf) | 91 |
| Resources | 30 |
| Checkpoints (incl. nested in loops) | 44 |
| Transitions | 27 |
| Decisions | 2 |
| Workflow variables | 118 |
| Workflow rules (activity partition) | 0 |

## Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 163 |
| checkpoint | 44 |
| action | 27 |
| loop | 15 |

## Activities

| # | Activity ID |
|---|-------------|
| 01 | `start-work-package` |
| 02 | `design-philosophy` |
| 03 | `requirements-elicitation` |
| 04 | `research` |
| 05 | `implementation-analysis` |
| 06 | `plan-prepare` |
| 07 | `assumptions-review` |
| 08 | `implement` |
| 09 | `lean-coding-audit` |
| 10 | `post-impl-review` |
| 11 | `validate` |
| 12 | `strategic-review` |
| 13 | `submit-for-review` |
| 14 | `complete` |
| 15 | `codebase-comprehension` |

## Baseline delta vs the #272 pass

This planning folder previously carried a completed #272 pass ([COMPLETE.md](COMPLETE.md), PR [#273](https://github.com/m2ux/workflow-server/pull/273)). The counts above are a fresh read of the current committed tip, not a copy of the #272-era baseline (`v3.34.0`). Observed deltas confirm several #272 deliverables are live on `work-package`:

| Metric | #272 baseline | Current | Note |
|---|---:|---:|---|
| Version | 3.34.0 | 3.35.0 | Post-#272 bump |
| Checkpoints | 41 | 44 | `submodule-selection` ≥2-option fix and related additions landed |
| Workflow variables | 113 | 118 | Hand-off / Progress N/A vars landed |
| Workflow rules (activity partition) | 1 | 0 | Duplicate worker-side README-progress rule removed ([F-1](follow-ups.md)) |

## Update scope

Address the still-open, workflow-server-owned friction points from [issue #271](https://github.com/m2ux/workflow-server/issues/271) — a retrospective on a **review-mode** run of `work-package` against midnight-node PR #1900. Scope boundaries for this pass:

- **Excluded — companion #270**: template / links / commit-ordering friction is tracked and addressed under [issue #270](https://github.com/m2ux/workflow-server/issues/270); not restated here.
- **Excluded — already-delivered #272 items**: the nine friction points from [issue #272](https://github.com/m2ux/workflow-server/issues/272) landed on PR #273 (see delta table above and [COMPLETE.md](COMPLETE.md)); any #271 finding that duplicates a #272 item is remediated, not redrafted.
- **In scope**: the remaining #271 surface — friction specific to the **review-mode** path through `work-package` (as opposed to the create/implement path #272 centered on) — once confirmed against current tip in [design-specification.md](03-design-specification.md).

Per [operational-discipline-bundled-tools-only](../../../../workflows/meta/techniques/agent-conduct.md), the issue #271 text itself is not fetched from this activity — retrieval and per-finding categorization (already-remediated vs. still-open) is a bundled-tool step in a later activity (requirements-refinement / design-specification), grounded against the current-state baseline captured here.

**Primary target:** `work-package` (review-mode path: `strategic-review`, `submit-for-review`, and any shared checkpoint/orchestrator surfaces exercised during a review-mode run).

**Coupled targets (same change request, pending confirmation once #271 detail is retrieved):**

- `meta` — orchestrator/dispatch and checkpoint-presentation surfaces shared with the #272 coupling.
- Possibly `workflow-design` — this session's own workflow, if a review-mode-specific finding traces back to workflow-design conventions rather than work-package itself.

**Change categories:** Technique, Resource, Activity (exact per-finding mix confirmed once issue #271 content is retrieved; likely a subset of these three, based on the #272 precedent).
