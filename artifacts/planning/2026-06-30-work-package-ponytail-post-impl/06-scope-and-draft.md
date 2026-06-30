# work-package — Scope and Draft

**Mode:** Update
**Target workflow:** `work-package` (v3.13.0 → **v3.14.0**)
**Change:** Insert new `lean-coding-audit` activity at slot 09 (after `implement` 08, before `post-impl-review`), binding the standalone `ponytail` workflow's techniques cross-workflow; renumber the downstream activities 09–14 → 10–15.

This document records what `scope-and-draft` authored against the approved scope manifest. The settled design is in [03-requirements.md](03-requirements.md) + [03-assumptions-log.md](03-assumptions-log.md); the precedents and exact syntax are in [04-pattern-analysis.md](04-pattern-analysis.md). The scope/structure was confirmed at the `scope-and-structure-confirmed` checkpoint (resolution: `confirmed`); this pass authored the manifest verbatim.

---

## 1. Scope manifest (as authored)

12 files in the approved manifest + 2 follow-on files surfaced during validation (§7) — non-destructive: one new activity + renumber + additive rules/variables/doc rows. No existing content removed.

| # | File | Action | What changed |
|---|------|--------|--------------|
| 1 | `workflows/work-package/workflow.yaml` | modify | Version 3.13.0 → 3.14.0; appended 5 rules to `rules.workflow[]` (3 structural + 2 guidance); added 3 boolean variables (`audit_confirmed`, `needs_simplification`, `has_debt_markers`, all default `false`). Existing rules/variables untouched. No `activities[]` index exists in this workflow — the activity set is derived from the `activities/` directory, so no index edit was needed. |
| 2 | `workflows/work-package/activities/09-lean-coding-audit.yaml` | create | NEW activity, `id: lean-coding-audit` (bare), `required: true`. |
| 3 | `workflows/work-package/activities/08-implement.yaml` | modify | Sole outbound transition `to: post-impl-review` → `to: lean-coding-audit`. Nothing else. |
| 4 | `workflows/work-package/activities/09-post-impl-review.yaml` | rename (git mv) | → `10-post-impl-review.yaml`. Content untouched. |
| 5 | `workflows/work-package/activities/10-validate.yaml` | rename (git mv) | → `11-validate.yaml`. Content untouched. |
| 6 | `workflows/work-package/activities/11-strategic-review.yaml` | rename (git mv) | → `12-strategic-review.yaml`. Content untouched. |
| 7 | `workflows/work-package/activities/12-submit-for-review.yaml` | rename (git mv) | → `13-submit-for-review.yaml`. Content untouched. |
| 8 | `workflows/work-package/activities/13-complete.yaml` | rename (git mv) | → `14-complete.yaml`. Content untouched. |
| 9 | `workflows/work-package/activities/14-codebase-comprehension.yaml` | rename (git mv) | → `15-codebase-comprehension.yaml`. Content untouched. |
| 10 | `workflows/work-package/README.md` | modify | Version note; activity count 14→15; activity tables (added lean-coding-audit row, renumbered 09–14 → 10–15, fixed anchors); mermaid workflow graph (IMP→LCA→PIR insert + renumber); Activities Summary table (row + prefix `09`); Artifact Prefixing examples; Feedback Loops table + mermaid; Review-Mode override table. |
| 11 | `workflows/work-package/activities/README.md` | modify | Added `### 09. Lean-Coding Audit` orientation section + internal mermaid; renumbered existing headings/definition links/anchors 09→10 … 14→15; fixed implement "Leads to" prose + exit node. |
| 12 | `workflows/work-package/resources/review-mode.md` | modify | Renumbered the two activity-file refs: `10-validate.yaml` → `11-validate.yaml`, `11-strategic-review.yaml` → `12-strategic-review.yaml` (agent-role table + PR-summary template). |

---

## 2. The new activity — structure as authored (`09-lean-coding-audit.yaml`)

Modelled on `09-post-impl-review.yaml` (blocking gate + bounded `doWhile` fix loop) and `14-codebase-comprehension.yaml` (cross-workflow standalone-technique binding). Steps are id + technique + structural only (no `name`/`description` on bound steps), per AP-64 / `check:steps`.

| Step | kind | Binding / structure | Notes |
|------|------|---------------------|-------|
| `review-over-engineering` | technique | `ponytail/review-over-engineering` (bare-string slash form) | Produces `review_findings` → `review-findings.md`. |
| `harvest-debt` | technique | `ponytail/harvest-debt` (bare string) | Produces `debt_ledger` → `debt-ledger.md` + sets `has_debt_markers`. |
| `report-gain` | technique | `ponytail/report-gain` (bare string), `when: has_debt_markers == true` | Reads `debt_ledger` by implicit same-name binding; appends gain scoreboard to the ledger foot. |
| `audit-findings-confirmed` | checkpoint | `blocking: true`; 3 options | `audit-accepted` → `audit_confirmed: true`; `apply-simplifications` → `audit_confirmed: true` + `needs_simplification: true`; `audit-findings-disputed` → `audit_confirmed: true` + `needs_simplification: false`. |
| `simplification-apply-cycle` | loop | `loopType: doWhile`, `maxIterations: 3`, `condition: needs_simplification == true` | Body: `apply-simplifications` (`ponytail/apply-ladder`) → `re-review-over-engineering` (`ponytail/review-over-engineering`, re-scores in place) → `validate-safety-floor` (pure `action: validate`, `target: safety_floor`) → `reset-simplification-flag` (`action: set needs_simplification = false`). |

**Transition:** single default `transitions: [{ to: post-impl-review, isDefault: true }]`. No return-to-implement `decisions` branch (linear default, per 03-requirements §3 / 04 §9 item 2).

**Binding notes (clean, no per-call rename):**
- Cross-workflow refs use the **slash form** `ponytail/<technique-id>` (corrected from the `::` prose; standalone ungrouped techniques bind exactly like `prism/structural-analysis`). Confirmed by `check-all-refs.ts` (0 unresolved).
- The loop's apply→re-review edge composes by same-name binding: `apply-ladder` emits `lean_change`; `review-over-engineering` declares optional input `lean_change` — so the re-review reads the freshly-applied diff with no `step.technique.inputs` deviation (honours `generic-not-overfit` / `binding-carries-only-deviations`).
- `apply-ladder` (not `audit-repo`) is the apply operation chosen for the loop body — its protocol applies the ladder while holding the safety floor and marks ceilings. `audit-repo` is deliberately NOT bound (change-scoped stage, per 03-requirements §4.3).
- Safety-floor guard is a structural `validate` action inside the loop (`target: safety_floor`), backing the `safety-floor-never-simplified` rule (no undeclared variable introduced — `target` is a free-string label, matching `08-implement.yaml`'s `validate target: branch`).

---

## 3. workflow.yaml changes (as authored)

**Version:** `3.13.0` → `3.14.0`.

**Rules appended to `rules.workflow[]`** (existing rules unchanged):
- `safety-floor-never-simplified` (structural — backed by the `validate-safety-floor` action in the loop)
- `report-before-apply` (structural — backed by the blocking `audit-findings-confirmed` gate preceding the loop)
- `audit-after-implement-before-review` (structural — backed by the 08 → 09 → 10 transition ordering)
- `leanness-reported-honestly` (guidance — honesty norm from ponytail's `report-gain`)
- `complementary-not-duplicative-with-strategic-review` (guidance — boundary norm)

**Variables added to `variables[]`** (each `type: boolean`, `defaultValue: false`):
- `audit_confirmed` — set by the `audit-findings-confirmed` gate.
- `needs_simplification` — drives the `simplification-apply-cycle` loop; reset each iteration.
- `has_debt_markers` — set by the `harvest-debt` step (ponytail output); gates `report-gain`.

---

## 4. Renumber + transition rewiring

- Six downstream activity files renamed via `git mv` (content untouched; git tracked all six as renames). Renamed highest-first (14→15, 13→14, …, 09→10) to avoid collisions.
- Activity `id:`s are bare and transitions reference ids — so the renames do NOT break any `transitions[].to` or `decisions[].branches[].transitionTo` refs. The only transition edit was `08-implement.yaml`'s outbound edge (`post-impl-review` → `lean-coding-audit`); `lean-coding-audit`'s outbound is `post-impl-review`; all downstream edges are unchanged.

---

## 5. Validation results (all green)

| Check | Result |
|-------|--------|
| `validate-workflow-yaml.ts workflows/work-package` | PASS — workflow.yaml valid (v3.14.0, 15 activities); all 15 activity files valid; no unanchored protocol refs. |
| `check:steps` (bound-step purity) | OK — every step is id + technique + structural only. |
| `check:binding` (binding fidelity) | OK — 40 total, 40 baselined, 0 NEW, 0 fixed (no new drift). |
| `check:identifiers` | OK — 0 flagged, 0 NEW bare-word ids. |
| `check:artifacts` | OK — no activity declares `artifacts[]` (synthesized from technique outputs). |
| `check:self-input` | OK — no self-provisioned input. |
| `check:activity-tech` | OK — no activity-level technique duplicates a step binding. |
| `check-all-refs.ts` | OK — work-package: 2 refs resolve; **0 unresolved across all workflows** (the `ponytail/*` cross-workflow refs resolve). |

Stale-reference sweep across `workflows/work-package/` for old numbered filenames and the old `to: post-impl-review` implement transition: clean (0 hits).

---

## 7. Follow-on edits surfaced during validation (beyond the approved 12-file manifest)

The full test suite (`vitest run`) surfaced a cross-workflow dependency the pattern-analysis did not anticipate: **`remediate-vuln` composes its pipeline by importing work-package activities by numbered filename** (`work-package/09-post-impl-review.yaml`, etc.) in its `workflow.yaml activities[]`. The pattern-analysis assumed renames are safe because "transitions reference ids" — true for transitions, but `remediate-vuln`'s *imports* reference the numbered filenames directly. The renumber therefore broke `remediate-vuln`'s load (11 test failures, all one root cause: 4 mcp-server dispatch_child tests that use `remediate-vuln` as the child + 1 all-workflows walk + 6 work-package snapshot drifts).

Two follow-on files were edited to keep the repo loading (the only schema-supported fix — imported activities are consumed verbatim, transitions included, and there is no per-workflow transition-override mechanism in the loader):

| # | File | Action | What changed |
|---|------|--------|--------------|
| 13 | `workflows/remediate-vuln/workflow.yaml` | modify | Repointed 4 stale numbered imports (`09-post-impl-review`→`10-`, `10-validate`→`11-`, `13-complete`→`14-`, `14-codebase-comprehension`→`15-`); **inserted `work-package/09-lean-coding-audit.yaml`** into the activity list between `08-implement` and `10-post-impl-review` (forced: the shared `08-implement.yaml` now transitions `to: lean-coding-audit`, so `remediate-vuln` must include that activity or its implement step dangles — "Activity not found: lean-coding-audit"); added the 3 new boolean variables (`audit_confirmed`, `needs_simplification`, `has_debt_markers`, default `false`) the imported activity reads/sets. |
| 14 | `tests/e2e/__snapshots__/snapshot.test.ts.snap` | regenerate (`vitest -u`) | The 6 committed work-package walk-snapshot baselines (default / skip-optional / full-workflow / research-only / elicitation-only / review-mode) updated to reflect the new structure. The walk path now reads `… implement → lean-coding-audit → post-impl-review → …`. This is the deliberate baseline-regeneration that records the new known-good structure, not an auto-update. |

**Material side effect to flag:** `remediate-vuln` now runs the lean-coding audit as part of its post-implementation band (between implement and post-impl-review), inheriting the same leanness gate work-package gained. This is consistent with `remediate-vuln`'s existing reuse of work-package's post-impl band (it already imports post-impl-review, validate, complete, comprehension), and is the minimal correct fix given the shared-file architecture — but it is a behavioral addition to a workflow outside the original feature scope, recorded here for the orchestrator/user's awareness.

`remediate-vuln`'s READMEs carry only a generic prose mention ("reuses several activities from `work-package`") with no enumerated pipeline list or mermaid graph, so they remain accurate without edits.

**Post-fix suite:** `vitest run` → **363 passed, 0 failed, 14 skipped**; `tsc --noEmit` clean; all 7 fidelity guards green.

---

## 6. Divergences from raw established-design prose (settled in 04 §9, applied)

1. **Ref form** — authored the **slash** form `ponytail/<op>`, not the `::` form the earlier prose used. `::` is reserved for grouped operations; ponytail's ops are root-level standalone files.
2. **No return-to-implement branch** — linear default transition only, per 03-requirements §3.
3. **Two native artifacts** — reused ponytail's `review-findings.md` + `debt-ledger.md` (gain appended) rather than folding into one `lean-coding-audit.md`; the technique owns its artifact name (generic-not-overfit).
