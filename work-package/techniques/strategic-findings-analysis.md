---
metadata:
  version: 1.1.0
---

## Capability

Severity and go/no-go recommendation for strategic-review findings (fix now vs accept and proceed).

## Inputs

### strategic_review_doc

The strategic-review findings and recommendations, categorized by type (investigation artifacts, over-engineering, orphaned infrastructure, scope creep).

### review_findings

*(optional)* The accumulated strategic-review findings, when carried in the bag separately from the artifact document.

## Outputs

### recommended_strategic_option

The recommended outcome based on the severity assessment: `fix-findings` when significant findings are present, otherwise `acceptable`.

### strategic_findings_summary

A concise multi-line summary of the strategic-review findings — one line per finding, each a severity tag plus a one-line description. Empty string when there are no findings.

### review_passed

*(boolean)* Whether the review may proceed without fixes — `true` on the finding-free / minor path; unset when significant findings exist, leaving the outcome to explicit user choice.

## Protocol

### 1. Assess Severity

- Read the findings in `{strategic_review_doc}` (and `{review_findings}` when carried separately).
- Judge each finding by impact: significant scope issues, over-engineering, or investigation artifacts that warrant cleanup before proceeding versus minor observations that can be accepted or deferred.

### 2. Recommend an Outcome

- Set `{recommended_strategic_option}` to `fix-findings` when one or more significant findings are present.
- Set `{recommended_strategic_option}` to `acceptable` when findings are minor or absent.

### 3. Summarize Findings

- Build `{strategic_findings_summary}` as a multi-line block — a severity tag and a one-line description per finding.
- Use an empty string when there are no findings.

### 4. Signal the Finding-Free Path

- Set `{review_passed}` to `true` when the review is finding-free or minor — `{strategic_findings_summary}` is empty (`""`) or `{recommended_strategic_option}` is `acceptable`.
- Leave `{review_passed}` unset when significant findings are present, so the outcome rests on explicit user choice rather than this recommendation.


## Rules

### significant-findings-route-to-fix

Only significant scope, over-engineering, or investigation-artifact findings recommend `fix-findings`. Minor observations recommend `acceptable` and are left for the user to defer at their discretion.

### summary-stays-concise

Keep `{strategic_findings_summary}` concise — one severity-tagged line per finding.

### finding-free-path-signals-passed

On the finding-free / minor path, emit `{review_passed}: true`. Never emit `{review_passed}: true` when significant findings are present — that outcome is an explicit user decision, not this technique's to assert.
