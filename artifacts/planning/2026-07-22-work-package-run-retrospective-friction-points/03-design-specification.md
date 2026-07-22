# Design Specification — Work-Package Run Retrospective Friction Points

**Workflow:** `work-package` v3.34.0 (primary) · `meta` / `harness-compat` (coupled)
**Mode:** Update
**Date:** 2026-07-22
**Change categories:** Activity, Technique, Resource, Structural refactor
**Change request:** Address nine workflow-server-owned friction points from [issue #272](https://github.com/m2ux/workflow-server/issues/272) so real work-package runs finish without improvisation on tool bans, next-activity routing, external validation, build artifacts, single-option gates, async dispatch, comment trim, artifact minting, or PR tense.
**Baseline:** [01-structural-inventory.md](01-structural-inventory.md)

---

## Purpose

`work-package` (with coupled `meta` / harness-compat surfaces) remains the end-to-end implementation path. This session closes nine gaps observed in a live run so workers and orchestrators have supported paths instead of ad-hoc envelopes, guessed transitions, or hand reconciliation.

| Goal | Meaning |
|------|---------|
| Reconcile discover vs worker tools | `discover-session` can obtain a workflow catalog without contradicting activity-worker tool rules. |
| Deterministic next activity | Orchestrator learns the resolved next activity (and evaluated condition) without calling `get_activity`. |
| Externalize validation | When the agent cannot compile/run the suite, a first-class user-run / `validation_skipped_by_user` path exists. |
| Flag build-only artifacts | Changes that need agent-unproducible regen (e.g. `.scale` metadata) are flagged and routed to the user before CI is the first signal. |
| Presentable checkpoints | Every presentable checkpoint has ≥2 options, or single-option presentation is handled. |
| Async = blocking-equivalent | Harness-compat treats async dispatch + completion notification as valid foreground/blocking. |
| Comment proportionality | Lean-coding audit trims comment over-verbosity relative to surrounding code. |
| One logical artifact | `write-artifact` cannot mint a second numbered instance of an existing bare filename; duplicates are logged. |
| PR tense refresh | After implementation lands, PR body leaves future-tense / “coming next” placeholder state. |

**Out of scope:**
- Environment/harness bugs listed as non-workflow-server in #272 (OOM cargo, permission-stream loss, bash guard false-positive, index staleness, cross-repo linkage, MCP auth flapping) except where they inform the design of items 3–4 and 6.
- Filing or fixing Cursor/Claude host bugs as the primary remedy.
- MCP server source (`src/`, `schemas/`) unless impact analysis proves an `activity_complete` envelope field cannot be carried by workflow/technique convention alone — prefer workflow/technique first.

**Also see:** [assumptions log](03-assumptions-log.md) (A-1–A-5, A-9 open → Gate 2) · [structural inventory](01-structural-inventory.md)

---

## Activity list

No activities added, removed, or reordered. Step/technique/resource edits inside existing activities (plus meta lifecycle / harness-compat).

| Activity / surface | Role in this change |
|--------------------|---------------------|
| `meta` `discover-session` | Reconcile `list-available-workflows` / `list_workflows` with worker tool rules (move off worker, or explicit bound-step permit + prompt/rule alignment). |
| `meta` `resolve-target` | Fix `submodule-selection` single-option presentation (≥2 options or single-option present path). |
| `meta` orchestration (`finalize-activity` / `evaluate-transition` / dispatch) | Carry resolved `next_activity_id` (+ evaluated condition) in `activity_complete` so orchestrator need not infer from prose. |
| `meta` harness-compat | Acknowledge async spawn + notification as blocking-equivalent under `foreground-always`. |
| WP `validate` | Add externalized / user-run validation path and `validation_skipped_by_user` (or equivalent) state. |
| WP `validate` / `submit-for-review` | Flag build-dependent artifacts the agent cannot produce; route hand-off to user. |
| WP `lean-coding-audit` (+ ponytail / comment heuristics) | Hard trim bar: comment bulk proportional to surrounding code. |
| WP `manage-artifacts::write-artifact` (+ implement / assumption writers) | Enforce find-or-update at write time; mint-attempt or existing duplicate → assumptions-log row. |
| WP `update-pr` / PR templates / post-impl refresh bind | Refresh tense/checklist when implementation lands (not only at late `submit-for-review` final render). |

---

## Checkpoints

| Gate family | Change |
|-------------|--------|
| `submodule-selection` (`resolve-target`) | Guarantee ≥2 presentable options (e.g. chosen + cancel/re-list) **or** present-checkpoint / AskQuestion path that accepts a single confirmation option. |
| Validate — externalized run (new or extended) | When agent cannot run the suite: hand command set to user; record reported results or `validation_skipped_by_user`; no non-standard “blocked” envelope. Soft vs blocking TBD (A-3). |
| Validate / submit — build-artifact hand-off (new) | When regen requires a full node/build the agent cannot run: pause or soft-gate with user ownership; do not wait for red CI. |
| Soft mid-flow gates | Unchanged headless policy; new gates follow existing soft/blocking conventions unless safety requires interactive. |

---

## Artifacts

| Artifact / surface | Target shape |
|--------------------|--------------|
| `activity_complete` envelope (finalize-activity + worker prompt) | Include resolved `next_activity_id` and evaluated condition summary (or equivalent fields). Prefer technique/convention; schema only if required. |
| `activity-worker-prompt` / agent-conduct | Aligned wording for which control-plane tools workers may call when a step binds them. |
| harness-compat `TECHNIQUE.md` (`foreground-always`) | Document async dispatch + completion notification as blocking-equivalent. |
| WP validate techniques / variables | First-class externalized validation outputs (`validation_skipped_by_user` or structured user-reported suite results). |
| Build-dependent artifact checklist / step output | Named flag + user-routed command list (e.g. `.scale` / metadata regen). |
| `write-artifact` + assumptions log | Write-time find-or-update; on mint conflict or discovered duplicate, append assumptions-log row (do not create a second `<NN>-bare`). |
| Lean-coding / comment guidance | Proportionality-to-surrounding-code as a hard trim criterion (implement-time + audit). |
| `pr-description` + `update-pr::render` bind sites | Post-implementation refresh so “Implementation (coming next)” / future-tense checklist does not persist after code lands. |

---

## Rules

| Rule / principle | Application |
|------------------|---------------|
| Step ↔ rule consistency | No activity step may bind a tool that worker rules forbid; reconcile by relocating the step or updating the permit. |
| Orchestrator stays definition-blind | Keep `no-get-activity-from-orchestrator`; supply next-activity via worker-evaluated transition report in `activity_complete`. |
| Supported states over improvisation | External validation and build-artifact hand-offs are declared variables/checkpoints, not ad-hoc result types. |
| Presentable gates | Present-checkpoint contract: ≥2 options or an explicit single-option presentation path. |
| Blocking-equivalent dispatch | Foreground intent is “orchestrator sees yields/completion”; async+notify satisfies when the host cannot true-block. |
| Comment proportionality | Why-rationale does not excuse doc blocks larger than the code they annotate; trim is a lean-coding pass criterion. |
| Single logical artifact | Bare filename → one numbered instance; updates in place; duplicates logged, never minted. |
| PR body tracks lifecycle | Template variant / re-render follows implementation phase, not only submit-for-review. |

---

## Confirmation ask

Approving this specification means: proceed to pattern → impact → scope-and-draft to implement the nine #272 items across `work-package` and coupled `meta` / harness-compat, settling open design judgements (catalog ownership, envelope vs schema, gate blocking level) at Gate 2.
