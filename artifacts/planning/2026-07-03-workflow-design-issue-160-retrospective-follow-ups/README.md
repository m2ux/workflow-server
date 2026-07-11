# workflow-design — Design Session

**Created:** 2026-07-03
**Mode:** Update
**Status:** Planning

---

## 🎯 Executive Summary

This session addresses GitHub issue [#160](https://github.com/m2ux/workflow-server/issues/160) — retrospective follow-ups from the `substrate-node-security-audit` remediation ([#159](https://github.com/m2ux/workflow-server/issues/159)). It updates the **`workflow-design`** workflow (and flags one supporting guard-script change) to close four process/tooling gaps observed during that remediation. These are process improvements, not defects in shipped remediation — the post-update review of #159 was CLEAN.

---

## Design Decisions

Key design decisions and their rationale, captured as the session progresses. Populated during requirements refinement.

Intake-established change requests (4 follow-ups):

1. **[High] Worktree-aware guards** — make `scripts/check-all-refs.ts` and `scripts/check-binding-fidelity.ts` accept a `--root`/worktree path (as `scripts/validate-workflow-yaml.ts` already does) or auto-detect the active worktree, so guards validate worktree edits rather than the stale main `../workflows` copy.
   - **⚠️ SCOPE-BOUNDARY FLAG (carry to scope-manifest checkpoint for a routing decision):** These are parent-repo **server-side TypeScript scripts under `scripts/`**, NOT workflow YAML / techniques / resources. They fall **outside** the workflow-design workflow's authoring scope (which produces workflow definitions, not build tooling). The orchestrator should route this to a separate parent-repo tooling change, not through this workflow's drafting activities. Precedent confirmed: `validate-workflow-yaml.ts` already takes a `<path-to-workflow-dir>` CLI arg.
2. **[Medium] `assumption-decision` checkpoint replay** — the `assumption-decision` checkpoint sits inside the `assumption-interview-loop` forEach loop in `activities/03-requirements-refinement.yaml` (lines 84–100), reusing one checkpoint id across N assumptions so iterations 2..N read as replays. Fix with per-assumption checkpoint ids or a batched decision. (In authoring scope: workflow YAML.)
3. **[Medium] First-class High-tier verification** — promote adversarial verification of a review's High findings to a defined `quality-review` step (independently verify High tier before findings drive remediation; extend a lighter pass to surviving Mediums) rather than relying on ad-hoc orchestrator addition. (In authoring scope: activity + technique in `activities/08-quality-review.yaml`.)
4. **[Low] `enforcement-confirmed` option semantics** — the `enforcement-confirmed` checkpoint in `activities/08-quality-review.yaml` (lines 189–206) has `defaultOption: accept-text-only` / options `add-enforcement` | `accept-text-only`, but the #159 session shipped *structural* enforcement while the disposition resolved to `accept-text-only`. Reconcile the option labels/semantics with what actually ships. (In authoring scope: workflow YAML.)

---

### Refined Requirements (elicited 2026-07-03, dimensions confirmed)

Elicited across the five update-mode design dimensions (purpose, activity list, checkpoints, artifacts, rules); each confirmed at `dimension-confirmed`.

**Purpose.** Close three in-scope process/review-integrity gaps in the `workflow-design` definition (#2, #3, #4) so the workflow is self-enforcing on assumption-decision fidelity and High-finding verification rather than depending on an alert orchestrator, and so its checkpoint labels stop diverging from shipped behavior. Carry #1 as an out-of-scope routing flag with no YAML change designed.

**Activity list (touched activities; none added, none removed).**
- `03-requirements-refinement` — restructure the `assumption-interview-loop` to eliminate the `assumption-decision` checkpoint-id replay (#2). Designed abstractly (this is the running activity).
- `08-quality-review` — add first-class High-tier adversarial verification (#3); reconcile `enforcement-confirmed` option semantics (#4).

**Checkpoints.**
- **#2 (crux):** `assumption-decision` reuses one static id across all N loop iterations; the server keys recorded responses by id, so iterations 2..N collide with iteration 1 and read as replays. Candidate fixes — **(A) per-assumption dynamic id** (`assumption-decision-{current_assumption.id}`), preserving per-assumption granularity and the one-question-at-a-time rule (requires engine/schema support for loop-body checkpoint id interpolation); **(B) batched single decision** carrying per-assumption verdicts (collapses granularity, tension with one-question-at-a-time). Design judgement -> assumption candidate. Lean: (A).
- **#4:** `enforcement-confirmed` (L189-206) — reconcile so the recorded disposition reflects the shipped structural action (e.g. default/relabel so `accept-text-only` genuinely means no structural change, and structural enforcement is recorded when it ships).
- **#3:** a High-tier verification step may warrant its own confirmation or fold into the existing `audit-fix-cycle` — settled under artifacts/techniques.

**Artifacts.**
- No new workflow-produced artifacts. Structural edits to `03` and `08` activity YAML; likely one new technique markdown for #3 (`verify-high-findings` or similar) bound to a new `08-quality-review` step, producing per-High-finding independently-verified verdicts before remediation plus a lighter pass over surviving Mediums.
- This activity's own `assumptions-log.md` produced normally.
- Out of scope: no `scripts/*.ts` changes (#1 routed separately).

**Scope routing (user-approved 2026-07-03):** #2/#3/#4 land on a `workflows`-submodule branch + PR from this run. #1 (worktree-aware guards) is an approved **companion deliverable** routed to its own **separate branch + PR in the parent `workflow-server` repo**; no YAML designed for it here; orchestrator coordinates it separately.

**Rules.**
- No new workflow-level rules for #2/#4 (structural corrections to existing constructs).
- #3 may motivate one `08-quality-review` activity rule: High-tier findings must be independently verified before driving remediation — backed structurally (a defined step) per the workflow's own "encode critical constraints as structure" rule. Whether to add the accompanying text rule is a design judgement -> assumption candidate.
- Overarching workflow rules (present approach first; one question at a time; non-destructive updates; corrections persist) unchanged and in force.

---

## Compliance Findings

Severity-rated findings from quality review / post-update review, populated when those activities run.

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Medium | Classifier based on "any of the four passes," not the verified set | `08-quality-review.yaml` `classify-audit-findings` | ✅ Fixed — classify from `verified_findings` |
| Medium | `add-enforcement` re-derived by classifier (single signal, two sources) | `08-quality-review.yaml` `classify-audit-findings` | ✅ Fixed — dropped from trigger enumeration |
| Low | `verify-high-findings` declares no findings input | `techniques/verify-high-findings.md` | No action — matches sibling convention |
| Low | README principle table not updated for verification enforcement | `workflow-design/README.md` | No action — doc nit |

---

## Scope Manifest

Files to create, modify, or remove — confirmed during scope-and-draft. Placeholder until then.

Anticipated (subject to impact analysis and the scope-manifest checkpoint):
- `activities/03-requirements-refinement.yaml` — follow-up #2 (checkpoint replay)
- `activities/08-quality-review.yaml` — follow-ups #3 (High-tier verification) and #4 (`enforcement-confirmed` semantics)
- Possible new/modified technique file(s) for follow-up #3
- **Out of authoring scope (route separately):** `scripts/check-all-refs.ts`, `scripts/check-binding-fidelity.ts` — follow-up #1 (parent-repo tooling).

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 05 | Impact Analysis | Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ✅ Complete |
| 10 | Post-Update Review | Update | ✅ Complete |
| 11 | Retrospective | All | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/workflow-design/` |
| Issue #160 | https://github.com/m2ux/workflow-server/issues/160 |
| PR #162 (workflow-design v1.5.0) | https://github.com/m2ux/workflow-server/pull/162 |
| Prior remediation #159 | https://github.com/m2ux/workflow-server/issues/159 |
| Retrospective (engineering branch) | `artifacts/planning/2026-07-02-workflow-design-review-substrate-node-security-audit/COMPLETE.md` |
| Close-out (this session) | `11-COMPLETE.md` |

---

**Status:** SESSION COMPLETE — terminal `retrospective` activity done; close-out `11-COMPLETE.md` written (summary + design decisions + scope outcome + deferrals + retrospective). Workflow complete; no further transition. All 8 update-path activities ✅. Prior milestone below.

**Status:** Post-update review COMPLETE — verdict MINOR ISSUES (1 Low, now fixed; no blockers), disposition `accept`. Independent audit confirmed RE-2/RE-3/RE-4 are correctly and completely realized; the ordering interaction between `enforcement-confirmed`'s `add-enforcement` effect and `classify-audit-findings` was adversarially verified as NOT a clobber bug (the classify set-message preserves the prior `true`); YAML parses (v1.5.0), new step is bound-step-pure. Sole finding F1 (Low: `verify-high-findings.md` missing from the README ASCII directory tree) fixed by the orchestrator as follow-up commit `9fce1576` on the same branch (updates PR [#162](https://github.com/m2ux/workflow-server/pull/162)). Review snapshot: `10-post-update-review.md`. Next transition `retrospective`.

Impact analysis REVISED after `impact-confirmed` → `revise` (user routing decision). This run's blast radius is now a SINGLE workflow file — `activities/08-quality-review.yaml` (RE-2 new `verify-high-findings` step, RE-3 new activity rule, RE-4 `enforcement-confirmed` relabel/re-default) — plus new `techniques/verify-high-findings.md` and index updates; transition chain intact. RE-5 RESOLVED: templated loop-body checkpoint ids are NOT resolved per iteration (loader matches static `c.id` at `workflow-loader.ts:265`; responses keyed by static `activity-checkpoint` at `workflow-tools.ts:440`; static id at `activity.schema.ts:289-301`), so #2 (RE-1) has no YAML-only fix and is routed OUT to the companion parent-repo track (engine change + coupled `03` edit) alongside #1 (guard scripts). Re-yielding `impact-confirmed` for confirmation of the corrected scope.
