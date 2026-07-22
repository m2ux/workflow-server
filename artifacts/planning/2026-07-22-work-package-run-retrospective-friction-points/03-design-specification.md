# Design Specification — Work-Package Run Retrospective Friction Points

**Workflow:** `work-package` v3.34.0 (primary) · `meta` / `harness-compat` (coupled)
**Mode:** Update
**Date:** 2026-07-22
**Change categories:** Activity, Technique, Resource, Structural refactor
**Change request:** Address nine workflow-server-owned friction points from [issue #272](https://github.com/m2ux/workflow-server/issues/272), plus planning-artifact progress write+push discipline, so real work-package runs finish without improvisation on tool bans, next-activity routing, external validation, build artifacts, single-option gates, async dispatch, comment trim, artifact minting, PR tense, or stale remote READMEs.
**Baseline:** [01-structural-inventory.md](01-structural-inventory.md)

---

## Purpose

`work-package` (with coupled `meta` / harness-compat surfaces) remains the end-to-end implementation path. This session closes nine gaps observed in a live run — plus planning-folder README progress that must be both updated and pushed — so workers and orchestrators have supported paths instead of ad-hoc envelopes, guessed transitions, or hand reconciliation.

| Goal | Meaning |
|------|---------|
| Reconcile discover vs worker tools | `discover-session` can obtain a workflow catalog without contradicting activity-worker tool rules. |
| Deterministic next activity | Orchestrator learns the resolved next activity (and evaluated condition) without calling `get_activity`. |
| Externalize validation | When the agent cannot run the suite locally, Progress Validation is marked cancelled/N/A (`⊘`); no user-reported pass/fail/skip hand-off. |
| Flag build-only artifacts | Changes that need agent-unproducible regen (e.g. `.scale` metadata) are flagged and routed to the user before CI is the first signal. |
| Presentable checkpoints | Every presentable checkpoint has ≥2 options, or single-option presentation is handled. |
| Async = blocking-equivalent | Harness-compat treats async dispatch + completion notification as valid foreground/blocking. |
| Comment proportionality | Lean-coding audit trims comment over-verbosity relative to surrounding code. |
| One logical artifact | `write-artifact` cannot mint a second numbered instance of an existing bare filename; duplicates are logged. |
| PR tense refresh | After implementation lands, PR body leaves future-tense / “coming next” placeholder state. |
| README progress write + push | After each activity, planning-folder README Progress/Status is updated and pushed via orchestrator `commit-and-persist` — not rule-only or per-activity steps. |

**Out of scope:**
- Environment/harness bugs listed as non-workflow-server in #272 (OOM cargo, permission-stream loss, bash guard false-positive, index staleness, cross-repo linkage, MCP auth flapping) except where they inform the design of items 3–4 and 6.
- Filing or fixing Cursor/Claude host bugs as the primary remedy.
- MCP server source (`src/`, `schemas/`) unless impact analysis proves an `activity_complete` envelope field cannot be carried by workflow/technique convention alone — prefer workflow/technique first.

**Also see:** [assumptions log](03-assumptions-log.md) (A-1–A-2, A-4–A-5, A-9 open → Gate 2; A-3 corrected Progress N/A; A-11–A-12 audit for item 10) · [follow-ups](follow-ups.md) · [structural inventory](01-structural-inventory.md)

---

## Activity list

No activities added, removed, or reordered. Step/technique/resource edits inside existing activities (plus meta lifecycle / harness-compat).

| Activity / surface | Role in this change |
|--------------------|---------------------|
| `meta` `discover-session` | Reconcile `list-available-workflows` / `list_workflows` with worker tool rules (move off worker, or explicit bound-step permit + prompt/rule alignment). |
| `meta` `resolve-target` | Fix `submodule-selection` single-option presentation (≥2 options or single-option present path). |
| `meta` orchestration (`finalize-activity` / `evaluate-transition` / dispatch) | Carry resolved `next_activity_id` (+ evaluated condition) in `activity_complete` so orchestrator need not infer from prose. |
| `meta` harness-compat | Acknowledge async spawn + notification as blocking-equivalent under `foreground-always`. |
| `meta` `commit-and-persist` / orchestrator prompt / dispatch loop | After each `activity_complete`: sync planning README Progress/Status, commit and **push** engineering artifacts (item 10). |
| WP `validate` | Simple local-run gate; when unavailable, `{mark_progress_na}` → Progress cancelled/N/A via commit-and-persist (no externalized suite reporting). |
| WP `validate` / `submit-for-review` | Flag build-dependent artifacts the agent cannot produce; route hand-off to user. |
| WP `lean-coding-audit` (+ ponytail / comment heuristics) | Hard trim bar: comment bulk proportional to surrounding code. |
| WP `manage-artifacts::write-artifact` (+ implement / assumption writers) | Enforce find-or-update at write time; mint-attempt or existing duplicate → assumptions-log row. |
| WP `update-pr` / PR templates / post-impl refresh bind | Refresh tense/checklist when implementation lands (not only at late `submit-for-review` final render). |

---

## Checkpoints

| Gate family | Change |
|-------------|--------|
| `submodule-selection` (`resolve-target`) | Guarantee ≥2 presentable options (e.g. chosen + cancel/re-list) **or** present-checkpoint / AskQuestion path that accepts a single confirmation option. |
| Validate — local availability (simplified) | Blocking question: may validation run locally? Yes → run suite. No → set `{mark_progress_na}`; skip suite; commit-and-persist marks Progress cancelled/N/A. No user-reported pass/fail/skip. Suite-only. |
| Submit — build-artifact hand-off (migrated) | Before mark-ready (create / non-stealth): ask whether regen is owed; if yes, pause with commands / ownership. Replaces prior validate hand-off + thin submit recheck. Do not wait for red CI. |
| Soft mid-flow gates | Unchanged headless policy; new gates follow existing soft/blocking conventions unless safety requires interactive. |

---

## Artifacts

| Artifact / surface | Target shape |
|--------------------|--------------|
| `activity_complete` envelope (finalize-activity + worker prompt) | Include resolved `next_activity_id` and evaluated condition summary (or equivalent fields). Prefer technique/convention; schema only if required. |
| `activity-worker-prompt` / agent-conduct | Aligned wording for which control-plane tools workers may call when a step binds them. |
| harness-compat `TECHNIQUE.md` (`foreground-always`) | Document async dispatch + completion notification as blocking-equivalent. |
| WP validate techniques / variables | `run_local_validation` + `{mark_progress_na}` for Progress N/A when suite unavailable; drop `validation_skipped_by_user` / user-reported suite results. |
| Build-dependent artifact checklist / step output | Named flag + user-routed command list (e.g. `.scale` / metadata regen). |
| `write-artifact` + assumptions log | Write-time find-or-update; on mint conflict or discovered duplicate, append assumptions-log row (do not create a second `<NN>-bare`). |
| Lean-coding / comment guidance | Proportionality-to-surrounding-code as a hard trim criterion (implement-time + audit). |
| `pr-description` + `update-pr::render` bind sites | Post-implementation refresh so “Implementation (coming next)” / future-tense checklist does not persist after code lands. |
| `commit-and-persist` + orchestrator prompt | Post-activity README Progress/Status sync + mandatory engineering push (covers all client activities without per-activity binds). |

---

## Rules

| Rule / principle | Application |
|------------------|---------------|
| Step ↔ rule consistency | No activity step may bind a tool that worker rules forbid; reconcile by relocating the step or updating the permit. |
| Orchestrator stays definition-blind | Keep `no-get-activity-from-orchestrator`; supply next-activity via worker-evaluated transition report in `activity_complete`. |
| Supported states over improvisation | Build-artifact hand-offs and Progress N/A (`mark_progress_na`) are declared variables/checkpoints, not ad-hoc result types or user-reported suite envelopes. |
| Presentable gates | Present-checkpoint contract: ≥2 options or an explicit single-option presentation path. |
| Blocking-equivalent dispatch | Foreground intent is “orchestrator sees yields/completion”; async+notify satisfies when the host cannot true-block. |
| Comment proportionality | Why-rationale does not excuse doc blocks larger than the code they annotate; trim is a lean-coding pass criterion. |
| Single logical artifact | Bare filename → one numbered instance; updates in place; duplicates logged, never minted. |
| PR body tracks lifecycle | Template variant / re-render follows implementation phase, not only submit-for-review. |
| Artifact progress is orchestrator-enforced | README Progress Status writes go through `sync-progress-status` (all icons); `commit-and-persist` Applies it for complete then pushes. Client workflows and workers do not restate that duty. Progress Status column is icon-only (`⊘` = cancelled/N/A); `#`/`@` columns; header lifecycle Status remains text. |

---

## Confirmation ask

Approving this specification means: proceed to pattern → impact → scope-and-draft to implement the nine #272 items across `work-package` and coupled `meta` / harness-compat, settling open design judgements (catalog ownership, envelope vs schema, gate blocking level) at Gate 2.
