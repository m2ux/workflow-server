---
metadata:
  version: 1.0.0
---

## Capability

Assess the severity of the strategic review findings and emit a recommended disposition — fix the findings versus accept the fix as-is.

## Inputs

### strategic_review_doc

The strategic review document whose findings are assessed for severity.

## Outputs

### recommended_strategic_option

Recommended disposition: `fix-findings` when significant scope issues, over-engineering, or investigation artifacts are present; `acceptable` when the findings are minor.

## Protocol

### 1. Analyze Findings

- Read the findings in `{strategic_review_doc}` and assess their severity.
- Set `{recommended_strategic_option}` to `fix-findings` when significant scope issues, over-engineering, or investigation artifacts are present.
- Set `{recommended_strategic_option}` to `acceptable` when the findings are minor.
