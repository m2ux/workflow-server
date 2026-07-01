# Strategic Review — Review-Mode Hardening (#145)

**Activity:** `strategic-review` (work-package) · **Session:** `CF5LX4` · **Date:** 2026-07-01
**Run mode:** IMPLEMENTATION (`is_review_mode` = false)
**Change under review:** `workflows` worktree branch `feat/145-review-mode-harden-config-defects`,
commits `c6e10666` (feat) + `2c2b9e94` (dedup); 9 files, +188/−3.
**Lens:** scope-vs-issue fit — does the change close the review-gap issue #145 describes, without scope
drift or material gaps? Complementary to the lean-coding-audit (over-engineering) and post-impl-review
(defect/quality), not a re-run of either.

---

## Verdict

**All acceptable.** The change is a faithful, minimal, and complete realization of issue #145's intent.
Each of the five augmentations meets its stated Acceptance criterion; the composite change closes the
motivating defect class along two independent paths; there is no scope drift and no material gap. The one
deferred item (E2E baseline regeneration / cross-repo coordination) is explicitly captured in the
validation report, the classification dispositions, and the README footer — it is a tracked follow-up,
not a silent gap.

`review_passed = true` · `needs_strategic_fixes = false` · `needs_cleanup = false`

---

## Scope-vs-issue fit (per augmentation)

The issue names five augmentations, each with an Acceptance criterion. Verified against the implemented
files (not merely the review artifacts):

| Aug | Issue Acceptance criterion | Implemented in | Meets? |
|-----|----------------------------|----------------|--------|
| 1 — review-existing-feedback | A review of a PR with prior comments produces a triage section addressing each; an unaddressed external blocker caps the rating (cannot be Comment Only). | NEW `review-existing-feedback.md` (ingest ALL comments+reviews, human+bot, top-level+inline, BEFORE analysis; Confirmed/Refuted/Superseded disposition; `rating_cap` → request-changes tier on unaddressed blocker). Bound in `01-start-work-package.yaml` after PR capture, gated review-mode. Rendered via `review-summary.md` + `review-mode.md` Prior Feedback Triage section + rating-cap rule. | **Yes** |
| 2 — config-change blast-radius | A `Config`/associated-type swap triggers an upstream-lifecycle trace over unchanged callers. | `review-code.md` "Associated-type / trait-impl swap" sub-check under Bound-Review-Scope: extends blast radius to every read/write site keyed on the swapped binding *including unchanged upstream code*, seeds from `impact upstream`, delegates the walk to the prism ledger. | **Yes** |
| 3 — conservation ledger | The structural pass produces a written producer/clearer ledger; an unmatched producer surfaces as a classifiable finding. | `prism/techniques/structural-analysis.md` "Producer/clearer ledger" — set-wide enumeration of producers vs clearers per termination path (normal/early-return/error/panic/teardown); unmatched producer → Bug-Table entry → reaches classification. Purely additive to protocol + output (no signature break). | **Yes** |
| 4 — correct-but-harmful axis | A correct-but-harmful change classifies Major+, sets `needs_code_fixes`, and renders above "safe". | `findings-classification.md` impact axes (unbounded-state-growth / economic-spam / liveness-halt / migration-upgrade); correct-but-harmful ⇒ Major min, Critical when unrecoverable; ≥ Minor so sets `needs_code_fixes` via the existing routing rule. `review-mode.md` render map (Major→High, Minor→Medium, Nit→Low) preserves severity end-to-end so it is NOT downgraded at the render boundary. | **Yes** |
| 5 — reported-failure triage + multi-instance gate | Every reported failure traced to a code path + state precondition; untested multi-instance variants auto-flag; a mock-masked branch escalates the harness as a finding. | `review-test-suite.md` "Reported-failure triage" (traces each aug-1-tagged failure to path + precondition; reproduce-or-static-trace) + "Multi-instance coverage gate" (each instance exercised; mock-masked branch escalates the HARNESS ≥ Minor, not a default nit). Bound as `triage-reported-failures` in `11-validate.yaml`, gated review-mode. | **Yes** |

---

## Motivating-defect trace (midnight-node#1428)

The issue's real test: would the composite change have caught the config swap that leaked unbounded
orphan storage on every routine governance close? Traced end-to-end against the implemented files, along
two independent paths — both must have failed silently before, both now fire:

**Path A — structural / severity chain (augs 2 → 3 → 4).**
1. `review-code.md` sees a `Config` associated-type swap → the "Associated-type / trait-impl swap"
   sub-check triggers, extends the blast radius to unchanged upstream sites keyed on the swapped
   binding, and delegates to the prism ledger.
2. `structural-analysis.md` producer/clearer ledger enumerates the storage producer (the create on the
   close path) against its clearers across every termination path → the governance-close path has a
   producer with **no matching clear** → **unmatched producer** → Bug-Table entry → reaches
   `findings-classification`.
3. `findings-classification.md` scores it on the **unbounded-state-growth** impact axis →
   correct-but-harmful ⇒ **Major** at minimum → ≥ Minor sets `needs_code_fixes`.
4. `review-mode.md` render map carries **Major → High** → the finding renders at High and reaches
   Action Items as a blocking item; the Overall Rating cannot be "Comment Only".
   *(This is exactly the two boundaries that silently downgraded the original: no high-scoring axis for
   a locally-correct change, and a render vocabulary that mapped "Major" to nothing. Both are closed.)*

**Path B — prior-feedback chain (aug 1), independent of Path A.**
The codex bot had already reported the exact defect on the PR 19 days earlier. `review-existing-feedback`
ingests ALL comments (human + bot) BEFORE analysis, dispositions the bot's blocker-class comment as
Confirmed (valid + unaddressed) → sets `rating_cap` to request-changes → `review-summary` holds the
Overall Rating ≤ Request Changes regardless of how light the review's own findings are. The issue calls
this the "highest leverage; alone would have prevented the miss" augmentation, and the implementation
realizes exactly that: a single unaddressed external blocker caps the rating on its own.

Both paths independently prevent the miss. The change is robust to any single augmentation being weak.

---

## Scope drift

**None.** All 9 changed files map 1:1 to the plan's Tasks 1–7 (Task 8 is the deferred baseline regen).
The two out-of-scope temptations the plan flagged were correctly avoided:
- No server `src/` or `schemas/` change — the mode is state-driven; the augmentations are definition-layer
  only (confirmed by typecheck clean, no `src/` in the diff).
- No project-wide severity-vocabulary rename — DD-1 formalizes a documented render map in the authoritative
  resource instead, containing the blast radius (the broader unification is a named follow-up, not done here).

The shared `prism/structural-analysis.md` edit is the only cross-workflow touch, and it is purely additive
to protocol/output (no signature change) — the 6-policy walk stays green, confirming no other workflow's
binding broke. This is a justified, generic extension (DD-2), not drift: it benefits every lens consumer
and aug 2 delegates to it rather than forking, keeping a single owner for the lifecycle method.

## Material gaps

**None against #145's acceptance criteria.** Every functional and quality success-criterion in the plan
is satisfied and independently verified above. Two observations, neither a gap:
- **SA-1 (Informational, from structural analysis):** the runtime ordering dependency
  (`review_pr_url`/`pr_number` populated before `ingest-prior-feedback`) is enforced by step placement
  (after `capture-pr-reference`), not by a schema constraint — a future reorder would not be caught by
  lint or snapshot. Current placement is correct; this is a latent fragility of the boolean-gated scattered
  path, inherent to the architecture, not introduced by this change. Recorded for triage; not a blocker.
- **CR-1 (Informational):** `review-code.md` "now resolves to the swapped type" — descriptive of runtime
  resolution, not evolution narration; borderline documentation voice. Left as-is by the authors' call;
  optional tightening only.

## Deferred item — adequately captured?

**Yes, not a silent gap.** E2E baseline regeneration (`[review-mode]` snapshot + robot manifest, Task 8)
is deferred to completion / cross-repo coordination and is captured in three places:
- `11-validation.md` — the 6 snapshot diffs are analyzed and attributed (2 intended step additions +
  pre-existing AP-43 condition-agnostic artifact-declaration spill), explicitly labelled "a coordinated
  follow-up handled at completion, NOT a validate-time fix."
- `10-findings-classification.md` / `10-test-suite-review.md` — TR-1 dispositioned as expected regeneration,
  does not drive `needs_test_improvements`.
- `README.md` footer — records the deferred baseline regen and its rationale.

The deferral reason is sound: the harness resolves definitions from the main-checkout working tree, so
regenerating and committing the baseline requires the merged definitions to be in place — a completion-time
cross-repo step, not an in-branch fix. Definition-lint (`BASELINE_UNRESOLVED = []`) and the 6-policy walk
are green, which are the meaningful in-branch gates.

---

## Recommended strategic option

**All acceptable (`acceptable`).** The implementation is minimal, focused, complete against #145, closes
the motivating defect along two independent paths, carries no scope drift, and has no material gap. The
deferred baseline regen is a properly tracked cross-repo follow-up. No strategic fixes and no cleanup are
warranted.
