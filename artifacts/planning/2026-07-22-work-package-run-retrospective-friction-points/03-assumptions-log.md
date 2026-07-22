# Design Assumptions Log

**Workflow:** work-package (primary) · meta / harness-compat (coupled)
**Mode:** Update
**Created:** 2026-07-22
**Last Updated:** 2026-07-22 (revise-block×20: validate Progress N/A; drop externalized suite reporting)

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Activity Boundaries | 3 | 0 | 0 | 0 | 0 |
| Checkpoint Necessity | 1 | 0 | 0 | 1 | 0 |
| Technique Selection | 4 | 3 | 0 | 0 | 0 |
| Rule Scope | 3 | 3 | 0 | 0 | 0 |
| Variable State | 1 | 1 | 0 | 0 | 0 |
| Schema Construct Choice | 1 | 0 | 0 | 0 | 0 |
| **Total** | **13** | **7** | **0** | **1** | **0** |

Five open judgements (A-1–A-2, A-5, A-9) batch into Gate 2. A-3 corrected (Progress N/A). A-4 corrected (submit-only build-artifact). Seven audit-settled (A-6–A-8, A-10–A-13).

---

## Log

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | Activity Boundaries | H | open | Catalog acquisition for `discover-session` stays on the activity worker via the existing bound `list-available-workflows` step, with worker prompt/rules explicitly permitting `list_workflows` only when that step binds it — not relocated to the meta-orchestrator. | #272 item 1; current `activity-worker-prompt` already permits bound-step `list_workflows`, but the run still treated the call as forbidden — reconciliation must make the permit unmistakable or relocate the step. Alternatives: (1) worker bound-step (assumed); (2) orchestrator pre-fetches catalog before dispatch. | Open — batched to Gate 2 | — |
| A-2 | Schema Construct Choice | H | open | Resolved `next_activity_id` (+ evaluated condition summary) is carried in the worker `activity_complete` envelope via `finalize-activity` / technique convention; MCP schema changes are out of scope unless impact proves the field cannot land otherwise. | #272 item 2; `evaluate-transition` already emits `next_activity_id`; gap is wiring into the envelope the orchestrator reads under `no-get-activity-from-orchestrator`. | Open — batched to Gate 2 | — |
| A-3 | Checkpoint Necessity | M | corrected | When local validation is unavailable: simple blocking gate only; set `{mark_progress_na}` and skip the suite — Progress Validation marked cancelled/N/A via commit-and-persist / sync-progress-status. No user-reported pass/fail/skip hand-off. | #272 item 3; stakeholder revise-block×20 — reject externalized suite reporting complexity. | 🔄 Corrected — Progress N/A instead of externalized-validation | Spec Checkpoints / Variables |
| A-4 | Activity Boundaries | M | corrected | Build-dependent artifact check + hand-off live in `submit-for-review` only (create / non-stealth, before mark-ready). Validate stays suite-only. | #272 item 4; stakeholder revise-block×21 — migrate out of validate; avoid duplicate recheck. | 🔄 Corrected — submit-only primary gate | Spec Checkpoints |
| A-5 | Technique Selection | M | open | Prefer guaranteeing ≥2 YAML options on presentable checkpoints (e.g. `submodule-selection` adds cancel/re-list) over teaching AskQuestion / present-checkpoint a single-option special case — unless harness-compat must still accept one-option for other hosts. | #272 item 5; `submodule-selection` currently has one option (`submodule-chosen`). Dual path (YAML ≥2 + present tolerates 1) is the fallback if Gate 2 wants belt-and-suspenders. | Open — batched to Gate 2 | — |
| A-6 | Rule Scope | M | audit | `foreground-always` is satisfied by async dispatch + completion notification when the host cannot true-block; change is harness-compat rule/guidance text, not a new spawn primitive. | #272 item 6; intent is “orchestrator sees yields/completion,” not a specific sync syscall. | ✅ Validated — `harness-compat/TECHNIQUE.md` `foreground-always` currently forbids `run_in_background` without acknowledging notify-as-block; additive rule text matches inventory coupled scope. | Spec Rules / Artifacts |
| A-7 | Technique Selection | M | audit | Comment proportionality is a hard trim criterion on the existing lean-coding / ponytail audit path (and implement-time guidance), not a new activity. | #272 item 7; audit already owns leanness; missed comment bulk is a heuristic gap inside that path. | ✅ Validated — `09-lean-coding-audit.yaml` binds ponytail over-engineering review; no separate comment-audit activity exists or is needed. | Spec Activity list / Rules |
| A-8 | Technique Selection | H | audit | `manage-artifacts::write-artifact` already defines find-or-update by bare filename; the fix is write-time enforcement plus an assumptions-log row on mint conflict / discovered duplicate — not a second writer technique. | #272 item 8; run minted `08-assumptions-log.md` beside `01-assumptions-log.md`. | ✅ Validated — `write-artifact.md` Protocol steps 1–3 already require update-in-place; gap is compliance + conflict logging called out in #272. | Spec Artifacts / Rules |
| A-9 | Activity Boundaries | M | open | PR tense/checklist refresh runs once implementation has landed (bind after `implement` or at `strategic-review`), not only the `submit-for-review` `final` render — so “Implementation (coming next)” does not linger through mid-flow reviews. | #272 item 9; `plan-prepare` renders `initial`; `submit-for-review` renders `final` late; strategic-review already noticed stale tense. | Open — batched to Gate 2 | — |
| A-10 | Variable State | H | audit | Build-artifact hand-offs and Progress N/A use declared workflow variables / checkpoint effects (`mark_progress_na`, build-artifact flags), never ad-hoc result_type values outside `activity_complete` / `checkpoint_pending`. | Spec Rules “Supported states over improvisation”; engine `variable-mutation-source`. | ✅ Validated — finalize-activity envelopes unchanged; `validation_skipped_by_user` removed. | Spec Artifacts / Rules |
| A-11 | Technique Selection | H | audit | Planning README Progress write + push is enforced at the **orchestrator** via `sync-progress-status` + `commit-and-persist` (and orchestrator prompt / dispatch-activity), not via per-activity manage-artifacts binds. Progress tracks **activities** (`#` row index, `@` artifactPrefix); Status icon-only (`⬚`/`◐`/`✅`/`❌`/`⊘`); `⊘` = cancelled/N/A. sync-progress-status owns all Status transitions; commit-and-persist Applies it for `✅` then pushes. | #272-adjacent item 10; Progress schema evolved across revises. | ✅ Validated — post-revise-11: dedicated sync-progress-status technique; dispatch ◐; persist ✅; blocked/skip documented. | Spec Activity list / Artifacts / Rules |
| A-13 | Rule Scope | L | audit | Optional-path Progress rows (elicitation/research/analysis) stay `⬚` at seed until path selection; path-skipped → `⊘`. Seed-time mode exclusion also uses `⊘` (same icon — cancelled / N/A). Do not invent a separate N/A glyph. | Stakeholder revise-block×10; share `⊘` for exclusion and post-path skip. | ✅ Validated — planning-readme + readme-seed profiles + create-readme use `⊘` only. | Spec / Progress |
| A-12 | Activity Boundaries | L | audit | Client workflows must not carry worker-duty README Progress/Status rules; meta `commit-and-persist` is the sole enforcement. Align by **deleting** the duplicated activity rules on `workflow-design` and `requirements-refinement` (same sentence class as WP). | Same gap as WP; prefer delete over pointer prose. | ✅ Validated — rules removed in post-revise-4; see [follow-ups](follow-ups.md) F-1 done. | Spec / follow-ups |

---

## Open Assumptions

### A-1: Discover-session catalog ownership
**Assumption:** Keep `list_workflows` on the discover-session worker via the bound step, with explicit permit in worker **prompt / agent-conduct** (not an activity `rules:` entry that names the step).  
**Decision space:** (1) worker bound-step + prompt/conduct permit (assumed); (2) meta-orchestrator fetches catalog before/without worker calling `list_workflows`.  
**Why not code-resolvable:** Role split preference — both can be made consistent with rules.  
**Technical context:** `00-discover-session.yaml` step `list-available-workflows` → `workflow-engine::list-workflows`; activity-level step-referencing rules are an anti-pattern (revise-block).  
**Agent's position:** Prefer (1) via `activity-worker-prompt` + `agent-conduct` bundled-tools-only — no discover-session activity rule modulating mechanics.  
**Reversibility:** reversible  
**Draft note (revise-block):** Removed the activity rule that referenced `list-available-workflows` / `list_workflows`. 

### A-2: next_activity envelope vs schema
**Assumption:** Technique/convention fields on `activity_complete` are enough; schema change only if impact proves otherwise.  
**Decision space:** (1) finalize-activity + worker reporting convention (assumed); (2) formal schema/envelope field in server.  
**Why not code-resolvable:** Depends on whether orchestrators already accept unknown envelope keys vs require schema.  
**Technical context:** `evaluate-transition` already outputs `next_activity_id`; finalize-activity does not yet fold it into the envelope.  
**Agent's position:** Prefer (1); escalate to (2) only after impact analysis.  
**Reversibility:** path-committing if schema lands  

### A-3: Validation unavailable → Progress N/A
**Assumption (corrected):** Ask a simple blocking question whether the agent may run validation locally (`run_local_validation`). When no, set `{mark_progress_na}` true, skip suite steps, and let commit-and-persist mark Progress cancelled/N/A — do **not** collect user-reported pass/fail/skip.  
**Decision space:** (1) Progress N/A via `{mark_progress_na}` (assumed / stakeholder); (2) externalized suite reporting (rejected); (3) soft auto-skip without Progress update (rejected).  
**Why not code-resolvable:** Product preference on how “cannot validate” is recorded.  
**Technical context:** `local-validation-permission` only; `externalized-validation` removed; `validation_skipped_by_user` dropped.  
**Agent's position:** (1) per stakeholder revise-block×20.  
**Reversibility:** reversible  
**Outcome:** 🔄 Corrected — Progress N/A instead of externalized validation reporting.

### A-4: Build-artifact hand-off sites
**Assumption:** Primary build-artifact check + hand-off at `submit-for-review` before mark-ready (create / non-stealth); validate remains suite-only.  
**Decision space:** (1) both validate + submit; (2) validate only; (3) submit only (chosen).  
**Why not code-resolvable:** Coverage vs step churn; which activity owns “before CI is first signal.”  
**Technical context:** Simple checkpoint questions — not prose assess-and-set action logs.  
**Agent's position:** (3) per stakeholder revise-block×21.  
**Reversibility:** reversible  
**Outcome:** 🔄 Corrected — submit-only; thin `build-artifact-recheck-submit` folded into primary check + hand-off.

### A-5: Single-option presentation strategy
**Assumption:** Author ≥2 options on presentable checkpoints as the primary fix.  
**Decision space:** (1) YAML ≥2 options (assumed); (2) present-checkpoint accepts 1 option; (3) both.  
**Why not code-resolvable:** Whether harness AskQuestion constraint is treated as authoring rule or present-layer duty.  
**Technical context:** `submodule-selection` options: only `submodule-chosen`.  
**Agent's position:** Prefer (1), add (2) only if other one-option gates must remain.  
**Reversibility:** reversible  

### A-9: PR tense refresh bind site
**Assumption:** Refresh after implementation lands (post-`implement` or `strategic-review`), not only at submit-for-review final render.  
**Decision space:** (1) after implement; (2) at strategic-review; (3) submit-for-review only but earlier verify-body fail-closed on future-tense (weaker).  
**Why not code-resolvable:** Where in the lifecycle the PR should stop looking “planned.”  
**Technical context:** `update-pr::render` `initial` at plan-prepare; `final` at submit-for-review.  
**Agent's position:** Prefer (2) strategic-review — after code+audit exist, before submit; or (1) if stale tense confuses post-impl review.  
**Reversibility:** reversible  
