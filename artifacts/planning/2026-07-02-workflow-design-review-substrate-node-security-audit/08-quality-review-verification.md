# High-Finding Verification Addendum — substrate-node-security-audit review

**Date:** 2026-07-02
**Scope:** Adversarial re-verification of the 7 High-severity findings in `08-quality-review.md`.
**Method:** One independent skeptic per finding, instructed to default to REFUTE, reading the actual target files and grounding each cited anti-pattern/principle in the `workflow-design` resource definitions. All seven verifiers reported high confidence.

## Why this addendum exists

The initial `quality-review` audit surfaced 23 findings, 7 tagged High. A High tag drives remediation, so each was re-checked against ground truth before any fix decision. The re-check materially recalibrated the set: **one High is a false positive, one is confirmed, and five are real-but-overstated** (three land at Medium, two at Low).

## Verdicts

### F-01 — REFUTED (drop)
Claim: worker rules mis-filed under `rules.workflow` (orchestrator-only) → AP-71 silent no-op.
Reality: the four quoted rules (MANDATORY WEIGHTS.RS READ, ENSEMBLE TARGETED BLIND-SPOTS, CONFIGURATION-VARIANT PANIC TRIAGE, GENESIS PARSING PATH COVERAGE) sit under `rules.activity` (workflow.yaml lines 37-40), which **is** the worker-facing bucket. The finding read `rules.activity` content and mislabeled the bucket + line range. No AP-71 violation exists; the placement is already correct. **Remove F-01 from the report.**

### F-05 — CONFIRMED (remains High)
Claim: the three self-declared HARD STOP gates (COVERAGE GATE l.23, DISPATCH COMPLETENESS GATE l.25, FINDING COUNT RECONCILIATION l.31) are text-only, not structurally enforced (AP-19 / design principle 10).
Reality: verified. `write-report` and `finalize-activity` in 05-report-generation.yaml carry no `when`/`condition`/`validate`; the only conditions in that file are exit transitions. Verification steps exist in 03-primary-audit.yaml but their results are never wired into a blocking condition. In a FULLY-AUTOMATED workflow with no checkpoint backstop, a non-compliant orchestrator can emit a report with uncovered crates / skipped agents / dropped findings and nothing stops it. **High is warranted.** Minor: the candidate variable names `coverage_gate_passed` and `unaccounted_zero` are illustrative and do not exist; only `dispatch_complete` is declared (and unread).

### F-02 — PARTIALLY CONFIRMED → Medium
Real, near-verbatim duplication confirmed for DEFENSE-IN-DEPTH VALIDATION (workflow.yaml:36 ↔ apply-checklist.md:39,54) and MANDATORY WEIGHTS.RS READ (workflow.yaml:37 ↔ apply-checklist.md:40); the severity-rubric constraint (workflow.yaml:33 ↔ score-severity.md:53) and OBSERVATION ELEVATION (workflow.yaml:41 ↔ merge-findings.md:44) are weaker constraint-vs-protocol overlaps. **Drop** the severity-rubric.md / severity-calibration.md cites — those hold rubric *tables* (reference content), not duplicated rules (category slip). AP-27 is a maintenance-drift/rule-hygiene concern, not runtime correctness → **Medium**. The report should also acknowledge the AP-27 worker-visibility carve-out and explain why activity-rule-vs-its-own-loaded-technique-protocol is not exempt.

### F-20 — PARTIALLY CONFIRMED → Medium
AP-85 (procedure/rules/decision-criteria living in a resource) is verified and load-bearing: `audit-prompt-template.md` (1017 lines / ~117KB) contains executable grep/cargo procedures (§2), PASS/FAIL decision criteria (§3), and behavioral protocol/rules (§5), and is dual-homed into static-analysis-patterns.md, apply-checklist.md, execute-ensemble-pass.md, and dispatch-sub-agents.md. **AP-83 (output-economy/guide-wrapper) is over-cited** — the file is predominantly operative content, not wrapper ceremony, which AP-83's own caveat says to keep. Narrow the relocation target to §2/§3/§5; §4 Reporting Format and the §1-§5 taxonomy legitimately stay as reference/template. Core AP-85 claim stands → **Medium**.

### F-10 — PARTIALLY CONFIRMED → Medium
`dispatch-sub-agents` is bound **13×** (not 12): 6 in 02-reconnaissance.yaml, 7 in 03-primary-audit.yaml. Mislabeled as AP-73(c) monolith-masking / AP-64: 10 of 13 bindings carry no input and none carry a `description`, so neither literal predicate (sub-mode input / differing descriptions) holds. The real phenomenon is AP-73 primary — one technique's 6-phase protocol unrolled across many activity steps (assign/route = phase 1; collect = phase 4; verify-*-files = phase 6). The AP-73 sub-agent-roster **exception** plausibly shields the two distinct `dispatch-*-agent` bindings. Genuine structural smell, mischaracterized mechanism, wrong count → **Medium**, reclassify as phase-unroll/collapse review.

### F-07 — PARTIALLY CONFIRMED → Low
Factual half correct: the four `finalize-activity` `set` actions express `flag=true` in the free-text `message` with no `target`/`value`. But the causal claim ("engine cannot evaluate the phase gates") is wrong on two counts: (1) AP-67 exclusion (c) **exempts** value-bearing `set`s on pure control (kind:action) steps that record the activity's own flow-state; (2) the engine never evaluates any action-step `set` at all — variable mutation flows only through checkpoint `effects.setVariable` — and these `*_complete` flags are read by no condition. So there is no broken gate. The only real issue is schema hygiene (prefer `target`+`value` over a `message` string) → **Low**.

### F-11 — PARTIALLY CONFIRMED → Low
Counts wrong: `verify-sub-agent-output` is bound **7×** (missed verify-completeness in 10-sub-crate-review.yaml), `merge-findings` **6×** (missed 15-sub-structured-merge.yaml). AP-73 is a **within-activity** anti-pattern; the three `merge_strategy` modes (structured / integrate / union-merge) live in three different activities at distinct pipeline points — the documented distinct-purpose exception, not monolith-masking. The one genuine signal is same-activity undistinguished repeat bindings in 03-primary-audit (extract-table-derived-findings + preserve-merge-output, both bare) and 05-report-generation (integrate + verify-elevation-completeness) — an AP-73(a) collapse/verify-distinct-outputs review → **Low**.

## Recalibrated severity roll-up (High tier only)

| Finding | Original | Verified | Action |
|---|---|---|---|
| F-01 | High | — | **Remove** (false positive) |
| F-05 | High | **High** | Keep as the top remediation item |
| F-02 | High | Medium | Keep, narrow scope, drop severity-resource cites |
| F-20 | High | Medium | Keep AP-85, drop AP-83 angle, narrow to §2/§3/§5 |
| F-10 | High | Medium | Keep, fix count (13), reclassify as phase-unroll |
| F-07 | High | Low | Reframe as schema-hygiene nit (AP-67(c) exempt) |
| F-11 | High | Low | Fix counts (7×/6×), narrow to same-activity repeats |

**Net:** confirmed High findings drop from 7 → **1** (F-05). Total remains 23; the Medium/Low tiers below the High set were not independently re-verified in this pass and should be read as first-pass audit judgements.

## Implication for remediation

If the user elects to fix, the change specification is the recalibrated set above, **not** the raw `08-quality-review.md` severities: skip F-01 entirely, lead with F-05, treat F-02/F-10/F-20 as the substantive Mediums, and treat F-07/F-11 as optional cleanups.
