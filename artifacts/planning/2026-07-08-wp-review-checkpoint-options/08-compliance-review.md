# Compliance Review: work-package (scoped)

**Date:** 2026-07-08
**Workflow:** work-package
**Activity audited:** `strategic-review` (`activities/12-strategic-review.yaml` v2.6.0)
**Scope:** Narrow — the user-reported `review-findings` checkpoint defect and directly-related findings in the same checkpoint area. This is not a full-workflow corpus audit.

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 1 |
| Medium   | 2 |
| Low      | 1 |
| Pass     | 0 |

The `review-findings` checkpoint statically presents four options (`acceptable`, `fix-findings`, `defer-findings`, `more-review`) irrespective of whether the strategic review produced findings. The data needed to gate and shape the checkpoint (`strategic_findings_summary`, `recommended_strategic_option`) is already computed by the immediately-prior `analyze-strategic-findings` step but is consumed only as message text — the exact "behavior is structural, not advisory" gap the review lens targets.

## Principle Compliance Findings

- **"Encode critical constraints as structure, not just text"** — VIOLATION (primary defect, WP-SR-01). The "present fix-only when findings exist / auto-advance when clean" constraint is expressed nowhere structurally; the option set is a fixed literal list. The finding-free case is left to the user to reason about ("all acceptable" being the only sensible pick) rather than being gated away.
- **"Every workflow must express logic in schema constructs the engine can act on, not prose"** — PARTIAL. `strategic_findings_summary`/`recommended_strategic_option` outputs exist and are structural, but they only interpolate into `message`; they drive no `condition`, no `defaultOption` selection, and no option filtering.

## Schema Expressiveness Findings

### WP-SR-01 (High) — Checkpoint does not gate on finding-free state

- **File / lines:** `activities/12-strategic-review.yaml:48–81` (checkpoint `review-findings`); specifically the missing `condition` on the step (`:48–49`) and the static `options[]` block (`:60–81`).
- **Summary:** When the review is finding-free (`strategic_findings_summary == ""`), the checkpoint still presents `fix-findings` / `defer-findings` / `more-review` — options that are logically impossible with zero findings. It also does not auto-advance past a meaningless decision.
- **Why it is structural, not cosmetic:** the schema already supports the fix. Per `schemas/activity.schema.json:243,247`, a checkpoint step carrying a `condition` becomes dismissible via `respond_checkpoint condition_not_met` when the condition is false — i.e. it is skipped/auto-passed. `condition.schema.json` permits `{ type: simple, variable, operator: "!=", value: "" }` (string value, `!=` operator both allowed).
- **Recommended fix (finding-free auto-advance):** add a `condition` to the `review-findings` checkpoint step gating on findings being present:

  ```yaml
  - kind: checkpoint
    id: review-findings
    condition:
      type: simple
      variable: strategic_findings_summary
      operator: "!="
      value: ""
    ...
  ```

  When `strategic_findings_summary` is empty the condition is false → the checkpoint is dismissed via `condition_not_met` and the activity proceeds without prompting. To make the finding-free path land on the "proceed" transition, the dismissal must leave `review_passed` set — see WP-SR-02 (the current default-transition + review-mode transition interplay means review mode already proceeds unconditionally, but non-review mode relies on `review_passed`, so a `condition_not_met` dismissal that sets no variable would fall through to the `plan-prepare` re-loop). Prefer either (a) initialise `review_passed: true` and have only `fix-findings`/`more-review` clear it, or (b) have `analyze-strategic-findings` also emit a `review_passed`-style default. Flag for the fix activity to choose.

### WP-SR-02 (Medium) — When findings exist, options are generic, not selectable by priority

- **File / lines:** `activities/12-strategic-review.yaml:60–81` (`options[]`).
- **Summary:** The user's second requested behavior — "present findings so the user can select which (by priority) should be fixed, or none" — has no representation. The four options are coarse (`fix all` vs `defer all`); there is no per-finding or per-severity selection.
- **Recommended fix:** mirror the existing corpus idiom for selective disposition. The `quality-review` activity's own `review-disposition` checkpoint already offers a `selective-fixes` option ("Choose which findings to fix"), and `09-lean-coding-audit.yaml`'s `audit-findings-confirmed` uses a three-way accept/apply/dispute set. Recommended concrete shape:
  - Keep `acceptable` (→ `review_passed: true`) and a `fix-findings` (fix all, → `needs_strategic_fixes: true`).
  - Add a `selective-fixes` option (`Choose which findings to fix`) that sets `needs_strategic_fixes: true` plus a marker (e.g. `strategic_fixes_selective: true`), with the actual selection performed by the downstream fix technique reading `strategic_findings_summary` (which is already one severity-tagged line per finding). This keeps the option set small while enabling priority-based selection, rather than adding one option per finding (which does not scale and is not a schema-expressible dynamic list).
  - Drop `defer-findings` as a distinct option only if the fix activity confirms it is redundant with `acceptable` (both set `review_passed: true` today — see WP-SR-04); otherwise retain and differentiate by leaving a deferred-findings record.

### WP-SR-03 (Medium) — Auto-advance default is unsafe when findings exist

- **File / lines:** `activities/12-strategic-review.yaml:57–59` (`blocking: false`, `defaultOption: acceptable`, `autoAdvanceMs: 30000`).
- **Summary:** With `defaultOption: acceptable` + `autoAdvanceMs: 30000` on a non-blocking checkpoint, a review that DID surface significant findings auto-accepts them after 30s of inactivity — silently discarding `recommended_strategic_option: fix-findings`. The recommendation is computed but cannot influence the default.
- **Recommended fix:** couple auto-advance to the finding-free path only. Since WP-SR-01 adds a `condition` that already dismisses the finding-free case without prompting, the surviving (findings-present) checkpoint should be `blocking: true` with NO `autoAdvanceMs` (force an explicit decision), OR its `defaultOption` should track `recommended_strategic_option`. Note `defaultOption` takes a static option id, so it cannot bind to `recommended_strategic_option` directly; the schema-honest choice is `blocking: true` with no auto-advance for the findings-present checkpoint.

## Rule Enforcement Findings

### WP-SR-04 (Low) — `acceptable` and `defer-findings` are behaviorally identical

- **File / lines:** `activities/12-strategic-review.yaml:61–66` vs `73–78`.
- **Summary:** Both `acceptable` and `defer-findings` set only `review_passed: true` with no other effect, so "defer" records nothing distinguishing it from "accept" — the deferral is text-only, not structural. A user picking "defer" reasonably expects the findings to be recorded for later; nothing captures that.
- **Recommended fix:** either (a) give `defer-findings` a distinct `setVariable` (e.g. `strategic_findings_deferred: true`) that a later step/artifact reads, or (b) remove it as a redundant option (folding into `acceptable`). Decide in the fix activity.

## Related observation (not a checkpoint-options defect)

- In review mode the first transition (`:83–88`, `to: submit-for-review when is_review_mode == true`) fires unconditionally, so the `fix-findings` / `more-review` options have NO routing effect during a review-mode run — they set `needs_strategic_fixes` / nothing but the run proceeds to `submit-for-review` regardless. This compounds WP-SR-01: in review mode the entire option set is nearly inert. Out of primary scope (it is a transition-routing issue, not an option-set issue), but the fix activity should confirm the intended review-mode behavior when restructuring options.

## Recommended Fixes (prioritized)

1. **WP-SR-01 (High)** — add a `condition` on `review-findings` gating on `strategic_findings_summary != ""` so the finding-free case auto-dismisses via `condition_not_met`; ensure the dismissal lands on the proceed path (`review_passed`).
2. **WP-SR-03 (Medium)** — for the findings-present checkpoint, set `blocking: true` and remove `autoAdvanceMs`/`defaultOption: acceptable` so significant findings are not silently auto-accepted.
3. **WP-SR-02 (Medium)** — add a `selective-fixes` option (mirroring `quality-review`'s `review-disposition`) enabling priority-based selection via the already-computed `strategic_findings_summary`.
4. **WP-SR-04 (Low)** — differentiate or remove `defer-findings`.

All fixes are schema-valid against the current `activity.schema.json` / `condition.schema.json`; none require schema changes.
