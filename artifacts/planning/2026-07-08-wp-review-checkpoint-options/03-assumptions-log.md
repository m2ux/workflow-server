# Assumptions Log — work-package `review-findings` checkpoint fix

**Workflow:** work-package (update mode)
**Activity file targeted:** `activities/12-strategic-review.yaml` (v2.6.0), checkpoint `review-findings`
**Mode:** update — narrowly-scoped, precisely-specified fix (4 findings from `08-compliance-review.md`)
**Date:** 2026-07-08

Scope is one checkpoint in one file. Design dimensions that a green-field build would elicit (activity model, variables, techniques, full rule set) are already established for `work-package` and are NOT re-elicited here — see the skipped-dimensions manifest. Only dimensions touched by the four fixes were refined: **checkpoints** (the `review-findings` option set + gating) and **variables** (the finding-free proceed-path variable).

## Reconciliation summary

| Assumption | Category | Status | Settled by |
|------------|----------|--------|-----------|
| A1 — finding-free routing must not fall through to `plan-prepare` re-loop | Variable State / Checkpoint Necessity | RESOLVED — Option B (user-accepted) | audit-consistency (traced `review_passed`) + user decision on mechanism |
| A2 — `selective-fixes` mirrors the corpus `review-disposition` idiom, selection deferred to fix technique via `strategic_findings_summary` | Technique Selection / Schema Construct | RESOLVED | audit-conformance (corpus pattern exists) |
| A3 — findings-present checkpoint is `blocking: true`, no `autoAdvanceMs`/`defaultOption` | Checkpoint Necessity / Schema Construct | RESOLVED | user intent + WP-SR-03 + schema (defaultOption cannot bind a variable) |
| A4 — `defer-findings` differentiated with `strategic_findings_deferred: true` (retain, not remove) | Rule Scope / Variable State | RESOLVED | user intent ("or none") + audit-consistency |
| A5 — review-mode routing (`:83–88`) is left unchanged; restructured options stay inert under review mode by design | Activity Boundaries | RESOLVED | out of scope; existing intended behaviour |

All assumptions are now resolved. A1's mechanism was surfaced as a single checkpoint and ACCEPTED by the user as **Option B**. Nothing is open; nothing is deferred.

---

## RESOLVED (was open) — user decision

### A1 — Finding-free proceed-path mechanism — RESOLVED: Option B (user-accepted)

**Decision:** Adopt **Option B** — `strategic-findings-analysis` emits `review_passed` (`true` on the finding-free path, left unset when findings exist so the checkpoint governs it). The workflow-level `review_passed` default (`false`) is NOT changed.

**Statement:** When WP-SR-01's `condition` dismisses the checkpoint on a finding-free review (`strategic_findings_summary == ""` → `condition_not_met`), the dismissal sets NO variable. `review_passed` defaults to `false` (verified: `workflow.yaml:133–136`). The transitions are: (1) `submit-for-review` when `is_review_mode == true`; (2) `submit-for-review` when `review_passed == true`; (3) default `plan-prepare` (re-loop). So in **non-review update-mode** a finding-free dismissal with `review_passed` still `false` falls through to the `plan-prepare` re-loop — the exact bug flagged. The fix must make the finding-free path set/carry the proceed variable. `review_passed` is entirely local to this activity (declared once, written by two options, read by one transition — verified `grep`), so both candidate mechanisms are contained.

**Why no audit settles it:** audits confirm the fall-through EXISTS (consistency trace) but the choice of mechanism is a design judgement, not a validity/convention question. The user's verbatim intent ("a finding-free review should auto-advance") settles the *behaviour* but not the *mechanism*.

**Candidate mechanisms:**

- **Option B (recommended) — technique emits `review_passed`.** `analyze-strategic-findings` (technique `strategic-findings-analysis`) runs unconditionally immediately before the checkpoint. Add `review_passed` to its outputs: emit `true` on the finding-free path, leave it unset/`false` when findings exist (so the checkpoint governs it). Result: finding-free → `review_passed` already `true` before the dismissal → transition (2) fires → `submit-for-review`. Keeps the "did review pass" semantic co-located with the technique that computes finding state; touches no workflow-level default. Requires editing one technique output signature + the checkpoint condition.
- **Option A — flip the `review_passed` default to `true`.** Change `workflow.yaml:136` `defaultValue: false → true`; have only `fix-findings`/`more-review` clear it to `false`; `acceptable`/`defer-findings` no longer need to set it. Simpler (checkpoint-only + one default), but the default reads oddly ("review passed" before the review runs) and every non-pass path must actively clear it — an omission silently proceeds.

**Recommendation (adopted):** Option B — semantics stay co-located and no confusing workflow-level default. User accepted.

**Design intent for scope-and-draft (A1 / Option B):**

- In `techniques/strategic-findings-analysis.md`, add a new output `review_passed` (boolean): step 2/3 sets it `true` when there are no significant findings (i.e. when `strategic_findings_summary == ""` / `recommended_strategic_option == acceptable`), and leaves it unset when findings are present so the checkpoint's options remain the sole writer in that branch. Declare it in the technique's `## Outputs`.
- In `activities/12-strategic-review.yaml`, add to the `review-findings` checkpoint step (WP-SR-01):
  ```yaml
  condition:
    type: simple
    variable: strategic_findings_summary
    operator: "!="
    value: ""
  ```
- Do NOT change `workflow.yaml:136` (`review_passed` stays `defaultValue: false`). The finding-free proceed signal comes solely from the technique output landing `review_passed: true` before the checkpoint is evaluated.

---

## RESOLVED assumptions (recorded, not re-asked)

### A2 — `selective-fixes` option shape

**Resolved:** The corpus already carries the selective-disposition idiom — `workflow-design/activities/08-quality-review.yaml` `review-disposition` has a `selective-fixes` option ("Choose which findings to fix"), and its later checkpoints reuse a `selective` option throughout. Mirror it. Concrete shape for `review-findings`:

- `selective-fixes` — label "Fix selected findings", description "Choose which findings to fix (by priority)". Effect: `setVariable: { needs_strategic_fixes: true, strategic_fixes_selective: true }`.
- The actual per-finding/per-severity selection is performed downstream by the strategic-fix path reading `strategic_findings_summary` (already one severity-tagged line per finding — verified in `strategic-findings-analysis.md` outputs). This keeps the option set small and avoids a non-scalable one-option-per-finding list (not schema-expressible as a dynamic list).
- New variable required: `strategic_fixes_selective` (boolean, default `false`) declared in `workflow.yaml`.

**Evidence:** audit-conformance — `review-disposition:92–100` is the direct corpus precedent; `strategic_findings_summary` severity-tagging verified in the technique doc.

### A3 — Findings-present checkpoint gating

**Resolved by user intent + WP-SR-03:** The surviving (findings-present) checkpoint becomes `blocking: true` with `autoAdvanceMs` and `defaultOption` REMOVED. Rationale: WP-SR-01's `condition` already dismisses the finding-free case without prompting, so auto-advance is no longer needed to spare the user a trivial decision; and a real findings-present decision must not silently auto-accept after 30s. `defaultOption` cannot bind to `recommended_strategic_option` (it takes a static option id — schema constraint), so the schema-honest choice is an explicit blocking decision. The computed `recommended_strategic_option` stays surfaced in the checkpoint `message` to guide the user.

### A4 — `defer-findings` differentiation

**Resolved by user intent ("or none") + WP-SR-04:** Retain `defer-findings` and differentiate it. Today `acceptable` and `defer-findings` both set only `review_passed: true` (identical). Give `defer-findings` a distinct effect: `setVariable: { review_passed: true, strategic_findings_deferred: true }` so the deferral is recorded structurally (a later step/artifact can read it) rather than being text-only. This preserves the user's "or none / proceed now noting findings" intent while making "defer" behaviourally distinct from "accept". New variable required: `strategic_findings_deferred` (boolean, default `false`) declared in `workflow.yaml`.

`acceptable` keeps `setVariable: { review_passed: true }` only.

### A5 — Review-mode routing unchanged

**Resolved — out of scope, existing intended behaviour:** The first transition (`:83–88`, `to: submit-for-review when is_review_mode == true`) fires unconditionally in review mode, so the restructured options set `needs_strategic_fixes`/`strategic_fixes_selective`/`strategic_findings_deferred` but routing still goes to `submit-for-review`. That is the intended review-mode behaviour: review mode surfaces findings for a reviewer and does not loop to fix them. This session runs `is_review_mode = false`; the fix targets the interactive update/create path. The restructured options do NOT break review mode (they only set variables; routing is unaffected). No change to the review-mode transition. Confirmed the compliance report classifies this as out of primary scope.

---

## Variables introduced by this fix (for scope-and-draft to declare in `workflow.yaml`)

| Variable | Type | Default | Purpose |
|----------|------|---------|---------|
| `strategic_fixes_selective` | boolean | `false` | Set by `selective-fixes` option; downstream fix path selects findings by priority from `strategic_findings_summary` |
| `strategic_findings_deferred` | boolean | `false` | Set by `defer-findings` option; records that findings were deferred (not text-only) |

Per A1 = Option B: `review_passed` (already declared, `defaultValue: false`, unchanged) gains a new producer — a `review_passed` output on the `strategic-findings-analysis` technique, emitted `true` on the finding-free path. No new variable declaration for it.
