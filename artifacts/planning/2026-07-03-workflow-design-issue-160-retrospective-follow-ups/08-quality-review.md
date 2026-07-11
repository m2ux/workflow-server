# 08 — Quality Review (update mode)

Audit of the freshly-drafted content for issue-160 retrospective follow-ups. Files audited (worktree `workflow/workflow-design-issue-160`):

- `workflow-design/activities/08-quality-review.yaml` (1.4.0 → 1.5.0)
- `workflow-design/techniques/verify-high-findings.md` (new)
- `workflow-design/techniques/README.md`, `workflow-design/README.md` (index rows)

Mode: update (`is_review_mode != true`). Passes run: expressiveness, conformance, rule-hygiene, rule-enforcement, plus reference-integrity and RE-4 semantics checks.

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

No Critical or High findings. The drafted edits are schema-valid, reference-clean, and correctly realize the settled design decisions (#3 verify-high-findings step+technique+rule; #4 enforcement-confirmed relabel/re-default). Two Medium findings concern consistency between the new checkpoint effect and the downstream classifier; two Low findings are documentation nits.

## Findings

### M1 (Medium) — `classify-audit-findings` does not reference `verified_findings`; classification basis is ambiguous vs the verification pass

- **File:** `activities/08-quality-review.yaml` lines 219–232 (`classify-audit-findings`), against `techniques/verify-high-findings.md` (`verified_findings` output).
- **Issue:** `verify-high-findings` declares output `verified_findings` = "the finding set that drives classification and remediation," and the new rule (line 10) plus `verify-before-remediation` state verification precedes classification. But `classify-audit-findings`'s `set` messages still say "any of the four audit passes surfaced findings" — they never name `verified_findings`. Nothing in the file consumes `verified_findings`. So it is unclear whether classification derives `needs_audit_fixes`/`has_critical_finding` from the raw pass findings or the recalibrated (verified) set — the whole point of the new step.
- **Recommendation:** Point `classify-audit-findings`'s `set` message basis at the verified finding set (e.g. "…from the verified findings (`verified_findings`) after recalibration…"), so the output the verification pass produces is the input classification reads. This closes the loop without new structure.

### M2 (Medium) — `add-enforcement` effect (`needs_audit_fixes: true`) is redundantly re-derived by `classify-audit-findings`

- **File:** `activities/08-quality-review.yaml` lines 202–207 (`add-enforcement` effect) and 227–229 (`classify-audit-findings` `needs_audit_fixes` set).
- **Issue:** `add-enforcement` now sets `needs_audit_fixes: true` via `setVariable`. `classify-audit-findings` then unconditionally re-derives `needs_audit_fixes`, and its message still lists `add-enforcement` as a trigger option. The same signal is expressed both structurally (checkpoint effect) and narratively (classifier message) — a mild duplication (AP-24-family restatement). The other three audit checkpoints carry NO effect, so the classifier is still genuinely required for them; the redundancy is isolated to the `add-enforcement` case.
- **Recommendation:** Drop `add-enforcement` from the enumerated trigger list in the `needs_audit_fixes` set message (keep fix-all / selective / revise for the effect-less checkpoints), since the checkpoint effect already commits it. Low-risk either way — both writes agree on `true` and classify runs last — but removing the restatement keeps the signal single-sourced.

### L1 (Low) — `verify-high-findings` declares no `## Inputs` for the finding set it verifies

- **File:** `techniques/verify-high-findings.md`.
- **Issue:** Protocol reads "each High-tier finding" / "surviving Medium findings" but the technique declares no input carrying the prior-pass findings. Per `signature-is-the-contract` every `{name}` read should be a declared input. In practice the sibling audit techniques (`audit-expressiveness`, etc.) also declare no findings input — findings are handled narratively across the activity, not as a typed variable — so this is CONSISTENT with siblings, not a regression. Flagged for completeness only.
- **Recommendation:** Optional. If the finding set is ever promoted to a typed variable, declare it as an input here and on the sibling passes together; do not overfit this one technique.

### L2 (Low) — Workflow README design-principle table not updated for the new verification enforcement

- **File:** `workflow-design/README.md` (Design Principles table, lines 101–116; Review Mode list, lines 85–93).
- **Issue:** The techniques table (line 139) and technique-area README were updated with `verify-high-findings`, and the workflow version bumped to 1.5.0 — all correct. But principle #10 "Encode constraints as structure" still cites only `enforcement-confirmed`; the new "High findings must be independently verified before they drive remediation" invariant + its `verify-high-findings` structural backing is not surfaced in the README's principle/enforcement narrative. Documentation-completeness nit, not a defect.
- **Recommendation:** Optional. Add a line noting High-finding verification is structurally enforced by the `verify-high-findings` step, if the team wants the README principle table to stay exhaustive.

## Correctly-realized design decisions (verified, no action)

- **#3 verify-high-findings step** placed after `enforcement-confirmed`, before `classify-audit-findings`, gated `is_review_mode != true` — matches settled placement. Technique `.md` format matches siblings (frontmatter `ontology/kind/version`; `## Capability` / `## Outputs` / `## Protocol` / `## Rules`). New activity rule present (line 10). Index rows added in both READMEs; reference `technique: verify-high-findings` resolves to the new `.md`. RE-2/RE-3 realized.
- **#4 enforcement-confirmed relabel/re-default:** `defaultOption: add-enforcement` ✓; `add-enforcement` effect `setVariable {needs_audit_fixes: true}` ✓; `accept-text-only` = "no structural change" ✓; both option ids preserved ✓; message reworded for the new default ✓. RE-4 realized.
- **Reference integrity:** `verify-high-findings` technique ref resolves; step id/kind/condition conventions match sibling technique steps; version bumps consistent (activity 1.5.0, README v1.5.0).
- **#2/RE-1** correctly absent (routed to companion parent-repo engine change) — not flagged as a gap.

## Disposition

All four audit-pass checkpoints and the new verification step were reviewed. No Critical/High findings → `has_critical_finding = false`. The `enforcement-confirmed` checkpoint (RE-4) is the gate whose default now adds enforcement.

Checkpoint dispositions: `expressiveness-confirmed` → confirmed; `conformance-confirmed` → accept-as-is; `rule-hygiene-confirmed` → fix-all (no-op); `enforcement-confirmed` → accept-text-only.

## Fixes applied (audit-fix-cycle, iteration 1)

Both Medium findings were fixed in the worktree `activities/08-quality-review.yaml` (`classify-audit-findings` step). L1/L2 = no action (per convention / doc nit).

- **M1 — classification now based on `verified_findings`.** The `needs_audit_fixes` and `has_critical_finding` `set` action messages now derive from `verified_findings` (the recalibrated set produced by `verify-high-findings`) instead of "any of the four audit passes" / "any audit finding." Closes the RE-2 wiring gap so the verification pass's output actually drives classification.
- **M2 — `add-enforcement` dropped from the `needs_audit_fixes` trigger list.** The classifier's `needs_audit_fixes` message now enumerates only fix-all / selective / revise, with a note that `enforcement-confirmed`'s `add-enforcement` option sets the variable via its own `setVariable` effect. Removes the single-signal / two-sources restatement.

Edit scope: `message` string content only, within the two existing `set` actions — no structural change. Post-edit YAML re-parsed clean (version 1.5.0, 19 steps, all step ids intact). Re-audit surfaced no new findings; fix cycle exits after one iteration with `needs_audit_fixes = false`, `has_critical_finding = false`. Critical-blocker gate → `no-blocker` (default) → `validate-and-commit`.
