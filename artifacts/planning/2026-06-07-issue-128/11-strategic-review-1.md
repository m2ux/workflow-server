# Strategic Review

**Work Package:** Canonical Naming Convention for Technique Inputs/Outputs and Rules
**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128) - Adopt a canonical naming convention for technique inputs/outputs and rules
**PR:** [#129](https://github.com/m2ux/workflow-server/pull/129)
**Date:** 2026-06-08
**Reviewer:** strategic-review (worker, session VPOXEX)

---

## Review Scope

**Base Branch:** `main`
**Feature Branch:** `chore/128-canonical-naming-convention`
**Files Changed:** 14 (1 in parent repo `docs/`, 13 in the `workflows` submodule) + the submodule pointer bump
**Lines Changed:** +40 / -1 (parent spec) · +32 / -19 (submodule)

This is a holistic review against the design intent ([02-design-philosophy.md](02-design-philosophy.md)), the success criteria ([05-implementation-analysis.md](05-implementation-analysis.md#success-criteria-with-measurement-methodology)), and the plan ([06-work-package-plan.md](06-work-package-plan.md)). It is not a re-run of the code-review / structural / test-suite reviews (all clean, 0 findings ≥ Minor) or validation (passed). The focus is *strategic*: scope discipline, design-intent fidelity, and whether the held-back decisions are sound.

---

## Findings Summary

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Investigation Artifacts | 0 | None |
| Over-Engineering | 0 | None |
| Orphaned Infrastructure | 0 | None |
| Scope Creep | 0 | None |
| PR body conformance | 1 (Minor) | Update PR body |
| Informational (design tensions) | 2 | Note only |
| **Total** | **3** | |

---

## Investigation Artifacts

None. The change is composed entirely of intentional convention prose (AP-60, spec §3.2/§3.4/§8, one audit-heuristic bullet) and targeted identifier renames. No debug logging, temporary workarounds, or exploratory code — none is even possible in a definition/doc-only change.

| File | Description | Action | Rationale |
|------|-------------|--------|-----------|
| — | No investigation artifacts found | Keep | Pure convention + rename change |

---

## Over-Engineering

None. The convention deliberately *codifies the dominant existing shape* rather than inventing new machinery: AP-60 is one catalog entry composing with the existing AP-42/52/55/57 family (no new abstraction), the audit heuristic is one step-8 bullet of the same shape as the existing per-AP bullets (no new walker), and the migration touches only the genuinely-deviating identifiers. The plan explicitly rejected the over-scoped alternatives (full 275-heading census, mechanical re-prefixing of all 58 unprefixed booleans, renaming `planning_folder_path`) — and the implementation honoured those rejections.

---

## Orphaned Infrastructure

None. No CI jobs, build steps, env vars, or utilities were added. The one surviving occurrence of the old name `squash_merge_available` (in `anti-patterns.md`) is the **deliberate didactic defect example** AP-60 uses to name the anti-pattern — correctly framed as the "before" of the rename, attested in the code review (INFO-1). Not an orphan.

---

## Scope Assessment

The diff maps exactly onto the plan's six tasks (T1–T6) and stays inside the declared boundary (definition-corpus + docs only; no `src/`/`schemas/`/runtime).

| File / Change | In Scope? | Notes |
|---------------|-----------|-------|
| `anti-patterns.md` (AP-60) | Yes | T1 — convention home |
| `docs/technique-protocol-specification.md` (§3.2/§3.4/§8) | Yes | T2 — spec mirror |
| `workflow-design.md` (step-8 bullet) | Yes | T3 — sole mechanical enforcement |
| `prism/activities/01-structural-pass.toon` (`{lens-name}`→`{lens_name}`) | Yes | T4 — binding defect fix |
| `squash_merge_supported` rename (workflow.toon, 01-start, 12-submit, detect-merge-strategy, READMEs) | Yes | T5 — boolean I/O migration, all surfaces |
| 5 rule-slug renames (write-cicd-report, full-prism, generate-report, orchestrate-prism, research-knowledge-base) | Yes | T6 — positive-assertion subset |

**Overall:** Minimal and focused. `gitnexus_detect_changes` (per code review) reports 0 affected processes / risk: low — no call-graph blast radius, as expected for a string-match-resolved definition change. No scope creep. No orphan symbols (orphan-scan is not meaningfully applicable: the changed files are TOON/markdown definitions, not the code-symbol graph GitNexus indexes; the binding-integrity equivalent — every renamed designator swept to all sites — was verified by grep-parity in validation).

---

## PR Body Conformance

**MINOR — PR body "Changes" section is stale: frames the implementation as future work.**

The live PR #129 body's "## Changes" section is headed **"Implementation (coming next):"** and describes AP-60, the spec section, the audit heuristic, and the corpus migration in the future tense — as if not yet done. The implementation is in fact **complete and committed** on the feature branch (parent `1757e019`, submodule `3512c65`) and validated. A reviewer opening the PR would be told the substantive change is still pending, which is now inaccurate.

| Finding | Detail |
|---------|--------|
| Stale "(coming next)" framing | "## Changes → Implementation (coming next):" should be re-cast in the past/completed tense, reflecting that T1–T6 landed (and noting the 5-of-22 rule-slug subset that was actually converted vs. held back). |
| Submission checklist unchecked | "Self-reviewed the diff", "Changes are backward-compatible", etc. are unchecked — expected for a draft, will be settled at submit-for-review; noted, not actioned here. |

*Recommended action: update the PR body's Changes section to completed tense before submit-for-review. Low-risk prose edit; does not affect the diff.*

---

## Minimality Assessment

| Question | Answer | Notes |
|----------|--------|-------|
| Is every changed file necessary? | Yes | Each maps to a plan task (T1–T6) |
| Is every added line necessary? | Yes | Convention prose + targeted renames; no speculative additions |
| Are all new dependencies required? | N/A | No dependencies added |
| Are all config changes required? | N/A | No config/CI/build changes |
| Is the solution as simple as possible? | Yes | Codifies the dominant shape; one catalog entry, one audit bullet; over-scoped alternatives explicitly rejected and honoured |

---

## Strategic / Design-Intent Findings

### INFO-1 — Rule-slug migration converted 5 of 22 candidates; 17 held back (intentional, well-justified)

The success criteria call for "the agreed rule-slug subset converted; held-back slugs explicitly listed." The implementation converted **5** negation-shaped slugs (`no-reassignment`→`severities-inherited`, `no-context-leakage`→`isolated-context`, `no-narration`→`synthesize-directly`, `no-analysis`→`dispatch-only`, `no-false-positives`→`confirmed-flow-only`) and held back **17** (`no-cargo-here`, `do-not-mask-flaky`, `never-resume`, `no-auto-resolution`, `no-destructive-ops`, `no-duplicate-review`, `no-get-activity-from-orchestrator`, `no-graphql-mutations`, `no-hook-skipping`, `no-implementation-details`, `no-json-syntax`, `no-methodology-leak`, `no-option-hallucination`, `no-pre-load-techniques`, `no-raw-commands-in-plan`, `no-user-interaction`, `no-yaml-nesting`).

A 5-of-22 conversion rate looks low against a naive reading of "migrate the corpus," but it is **the correct outcome under the design intent**, not a gap:

- The convention itself (AP-60 sub-rule 4) explicitly says a positive form is preferred **"ONLY where it reads at least as clearly"** and that negations carrying irreplaceable clarity stay. The plan (T6) framed the pass as judgement-bounded, *not* a mechanical 22-for-22 rewrite, and the over-scoped "convert all" alternative was explicitly rejected.
- The held-back set is enumerated with per-slug rationale in [assumptions-log.md IMPL-2](assumptions-log.md): three are named in AP-60 as irreplaceable-clarity negations; the remainder read at least as clearly in negation/prohibition form (each names a prohibited operation where the negation *is* the clearest expression of the invariant).
- Blast radius is near-zero either way: IMPL-2 confirms none of the negation slugs is cited by dotted address or group expansion beyond its own heading, so the held-back ones carry no binding risk.

**Assessment:** Conformant with design intent. The residual is intentional, listed, and defensible. *No fix required.* Surfaced so the low conversion ratio is understood as a deliberate clarity-preserving call, not an incomplete migration. (Severity: Informational.)

### INFO-2 — Audit heuristic is the sole, non-blocking, manual enforcement (known accepted risk)

The convention's only mechanical guard is the `workflow-design` step-8 audit bullet, which fires **only when an agent/human runs the audit walk** — there is no load-time or CI guard (the loader validates structure, never naming grammar). This was identified and accepted up front (analysis G3/IA-4, design-philosophy success criteria) and is intrinsic to a string-match-resolved definition corpus; the success criterion was "heuristic documented and mechanically applicable," which is met. The heuristic is carefully written to test for *affirmative* (not *prefixed*) booleans and to enumerate what NOT to flag, minimising false positives. **Assessment:** Acknowledged design constraint, not a defect introduced by this work. The convention will decay only if the audit is never run — a process risk owned outside this PR. (Severity: Informational.)

---

## Success-Criteria Verdict

| Criterion (from design philosophy / analysis) | Met? | Evidence |
|-----------------------------------------------|------|----------|
| Convention defined (AP-60, four sub-rules, composes with AP family) | ✅ | AP-60 present; cross-refs AP-42/52/55/57/59 and spec; self-consistent |
| Spec captures convention (§3.2/§3.4/§8, cross-referenced) | ✅ | Spec subsection added; bidirectional cross-refs with AP-60 (validation §4) |
| Audit heuristic exists (step-8 bullet, affirmative-not-prefixed) | ✅ | Step-8 bullet added; entry count bumped 59→60 |
| Corpus conforms (deviating ids migrated; refs/inheritance intact) | ✅ | `{lens-name}`, `squash_merge_supported`, 5 slugs migrated; grep-parity old→0 / new==old (validation §2) |
| Rule-slug subset converted; held-back listed | ✅ | 5 converted, 17 held back with rationale (IMPL-2); AP-60 sanctions the held-back set |
| No regressions | ✅ | typecheck clean; vitest 371 passed / 2 skipped / 0 failed (advisory, `src/` unchanged) |

All success criteria met. The one held-back item (rule slugs) is explicitly within the convention's "only where clearer" allowance.

---

## Cleanup Actions Taken

None applied. This activity ran in review mode for a documentation/definition change with no investigation artifacts, over-engineering, or orphans to remove. The single actionable finding (stale PR body) is a prose edit deferred to submit-for-review, not a code/definition cleanup.

| Action | Files Affected | Commit |
|--------|----------------|--------|
| (none) | — | — |

---

## Change Fragment

No `changes/` directory exists at the target repository root (`/home/mike1/projects/work/workflow-server/2026-06-07-issue-128`). The `ensure-changes-folder-entry` and `verify-change-fragment` steps are skipped; `fragment_references_issue = null`. The PR already records the issue link in its body and via the "📌 Submission Checklist" change-file line ("skipped for this reason: definition-corpus/docs-only change").

---

## README Conformance

`01-README.md` conforms to the planning-folder template: Executive Summary, Problem/Solution Overview, Progress table (one row per artifact with status), and Links. The strategic-review row is currently `⬚ Pending` and will be marked ✅ Complete on activity exit (exitAction). No missing sections, extra top-level headings, or header-block drift to flag.

---

## Review Result

**Outcome:** Passed — minimal and focused; all success criteria met.

**Rationale:** The change is tightly scoped to the plan's six tasks, introduces no investigation artifacts / over-engineering / orphans, and stays inside the declared definition-corpus + docs boundary. All five functional/corpus success criteria are met and validated by grep-parity. The two design tensions (5-of-22 rule-slug conversion; audit-only enforcement) are *intentional, documented decisions* that conform to the convention's own "only where clearer" allowance and the up-front accepted enforcement model — not gaps. The sole actionable finding is a **Minor** stale-PR-body prose issue (the "Changes" section still reads "Implementation (coming next):"), to be fixed at submit-for-review.

**Recommended strategic option:** `acceptable` — no findings rise to the threshold that warrants returning to implementation. The one Minor finding is a PR-prose update that naturally belongs to submit-for-review, and the informational items require no action.

**Next Step:** Proceed to submit-for-review (review_passed = true). Update the PR body Changes section to completed tense there.
