---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Severity-classify a set of review or validation findings on a single scale (Critical / Major / Minor / Nit / Informational) and set the routing flags that gate downstream fix cycles. Generic over the source of the findings — code-review findings, test-suite-review findings, and validation diagnostics (test/build/lint failures) are all classified the same way, with failures mapped onto the same severity scale.

## Inputs

### findings_to_classify

The findings or diagnostics to classify. Each entry carries enough context to judge severity — a description, the affected file/symbol, and (for validation diagnostics) the failing check id and its output.

### code_review_findings

*(optional)* The code-review findings subset, when present, that drives `needs_code_fixes`.

### test_review_findings

*(optional)* The test-suite-review findings subset, when present, that drives `needs_test_improvements`.

## Outputs

### needs_code_fixes

True when any code-review finding has severity >= Minor (Critical, Major, or Minor); false when all code-review findings are Nit/Informational or there are no findings.

### needs_test_improvements

True when any test-suite finding has severity >= Minor (Critical, Major, or Minor); false when all test-suite findings are Nit/Informational or there are no findings.

## Protocol

### 1. Classify Findings

- Assign every finding in `{findings_to_classify}` a severity on the single scale: Critical, Major, Minor, Nit, or Informational.
- Judge severity by impact, not surface: Critical for security or data-loss risks and failing tests; Major for correctness defects and build failures; Minor for maintainability and lint issues; Nit for style; Informational for observations carrying no required action.
- When the findings are validation diagnostics (test/build/lint failures), map them onto the same scale — test failures are Critical, build failures are Major — and do NOT attempt to fix them here; classification only.

### 2. Route Code Findings

- Inspect the code-review subset (`{code_review_findings}`).
- Set `{needs_code_fixes}`=true when any code-review finding is Minor or above; otherwise false.

### 3. Route Test Findings

- Inspect the test-suite subset (`{test_review_findings}`).
- Set `{needs_test_improvements}`=true when any test-suite finding is Minor or above; otherwise false.

### 4. Record Triage Notes

- Leave Nit and Informational findings unflagged — they are documented in their review reports for the user to triage at their discretion, never auto-fixed.
- A run with only Nit/Informational findings, and a clean run with no findings, both leave the routing flags false so the work proceeds without a fix cycle.

## Rules

### single-severity-scale

Every finding, whatever its source, is classified on the one Critical / Major / Minor / Nit / Informational scale. Validation failures map onto it rather than carrying a parallel scheme.

### minor-and-above-routes

Only findings at Minor severity or above set a routing flag. Nit and Informational findings are documented for user triage and never trigger an automatic fix cycle.

### classify-do-not-fix

This technique classifies and routes only. Applying fixes is the responsibility of the downstream fix technique.
