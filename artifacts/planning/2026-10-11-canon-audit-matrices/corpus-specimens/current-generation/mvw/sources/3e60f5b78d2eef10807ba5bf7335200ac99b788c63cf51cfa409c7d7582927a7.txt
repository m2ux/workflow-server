---
metadata:
  version: 1.4.0
---

## Capability

Single-scale severity classification for review or validation findings, tiered for delivery against the reachability each finding states, with routing flags for downstream fix cycles.

## Inputs

### findings_to_classify

The findings or diagnostics to classify. Each entry carries enough context to judge severity — a description, the affected file/symbol, and (for validation diagnostics) the failing check id and its output. An entry stated as a finding block also carries its `Reachability` value and the evidence for it.

### code_review_findings

*(optional)* The code-review findings subset, when present, that drives `code_findings_actionable`.

### test_review_findings

*(optional)* The test-suite-review findings subset, when present, that drives `test_findings_actionable`.

### structural_findings

*(optional)* The structural-analysis findings subset, when present, whatever pipeline produced it.

### ticket_disposition

*(optional)* What the reviewer decided about the ticket's completeness gaps. Where it is present, the consolidated findings carry that judgement to the author alongside the code findings; where it is absent, the ticket was not assessed.

## Outputs

### code_findings_actionable

True when any code-review finding has severity >= Minor (Critical, Major, or Minor); false when all code-review findings are Nit/Informational or there are no findings.

### test_findings_actionable

True when any test-suite finding has severity >= Minor (Critical, Major, or Minor); false when all test-suite findings are Nit/Informational or there are no findings.

### classified_findings

The input findings, each carrying its assigned severity, its `action_tier` (the Action Items tier the finding is delivered under), and — where one applies — its `impact_axis` (the dimension on which a behaviourally correct change is nonetheless harmful: unbounded-state-growth, economic-spam, liveness-halt, or migration-upgrade). Downstream rendering reads the severity to place each finding on the render scale, the tier to place it in the Action Items, and the impact axis to justify a correct-but-harmful classification.

## Protocol

### 1. Classify Findings

- Assign every finding in `{findings_to_classify}` and in each declared subset a severity on the single scale: Critical, Major, Minor, Nit, or Informational.
- Judge severity by impact, not surface: Critical for security or data-loss risks and failing tests; Major for correctness defects and build failures; Minor for maintainability and lint issues; Nit for style; Informational for observations carrying no required action.
- When the findings are validation diagnostics (test/build/lint failures), map them onto the same scale — test failures are Critical, build failures are Major — and do NOT attempt to fix them here; classification only.
- Findings arrive here from several passes, which is where one defect stated twice becomes visible. Two entries naming the same defect are one finding: keep the designator of the pass that owns it and drop the restatement, per [Report and Methodology](../resources/findings-report.md#report-and-methodology).

- Judge each finding against the [Impact Axes](../resources/findings-report.md#impact-axes) in addition to correctness, and record the axis that applies as that finding's `impact_axis`. A correct-but-harmful finding classifies Major or above, so it is ≥ Minor and sets `{code_findings_actionable}` through the routing rule below — the impact axes add severity without changing the routing threshold.

#### Facts only an operator can settle

Some findings turn on a fact a read-only review cannot reach — whether a continuous-integration secret is set, whether a deployment target holds the value the change assumes, whether an external account has the access a step needs. The reviewer can see that the change depends on it and cannot see whether it holds.

Record such a finding as a recommended operator confirmation, naming the fact and where it is confirmed, at Informational. Rating it a blocker asserts the fact is false, which the review has no more basis for than asserting it is true, and either assertion makes the verdict rest on something nobody checked.

### 2. Tier for Delivery

- Assign every classified finding the Action Items tier that [Action Items](../resources/review-mode.md#action-items) admits for its severity and its stated reachability, and record it as that entry's `action_tier`.
- A finding whose reachability keeps it out of the blocking tier holds that ceiling at every severity the impact axes raise it to.
- An entry with no reachability value — a validation diagnostic, a reviewer-reported issue — takes the tier its severity assigns.

### 3. Route Code Findings

- Inspect the code-review subset (`{code_review_findings}`).
- Set `{code_findings_actionable}`=true when any code-review finding is Minor or above; otherwise false.

### 4. Route Test Findings

- Inspect the test-suite subset (`{test_review_findings}`).
- Set `{test_findings_actionable}`=true when any test-suite finding is Minor or above; otherwise false.

### 5. Record Triage Notes

- Leave Nit and Informational findings unflagged — they are documented in their review reports for the user to triage at their discretion, never auto-fixed.
- A run with only Nit/Informational findings, and a clean run with no findings, both leave the routing flags false so the work proceeds without a fix cycle.


## Rules

### single-severity-scale

Every finding, whatever its source, is classified on the one Critical / Major / Minor / Nit / Informational scale. Validation failures map onto it rather than carrying a parallel scheme.

### minor-and-above-routes

Only findings at Minor severity or above set a routing flag. Nit and Informational findings are documented for user triage and never trigger an automatic fix cycle.

### classify-do-not-fix

This technique classifies and routes only. Applying fixes is the responsibility of the downstream fix technique.
