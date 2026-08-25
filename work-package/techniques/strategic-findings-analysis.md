---
metadata:
  version: 1.2.0
---

## Capability

Severity and go/no-go recommendation for strategic-review findings (fix now vs accept and proceed).

## Inputs

### strategic_review_doc

The strategic-review findings and recommendations, categorized by type (investigation artifacts, over-engineering, orphaned infrastructure, scope creep).

### review_findings

*(optional)* The accumulated strategic-review findings, when carried in the bag separately from the artifact document.

### is_review_mode

*(optional)* True when the run audited an external change; false or unset when it produced an implementation. Selects which action the recommendation names, since a run that judges someone else's change has none of its own to alter.

## Outputs

### recommended_strategic_option

The recommended outcome based on the severity assessment: `acceptable` when findings are minor or absent, and with significant findings present, `fix-findings` where the run owns the change or `raise-findings` where it audited someone else's.

### strategic_findings_summary

A concise multi-line summary of the strategic-review findings — one line per finding, each a severity tag plus a one-line description. Empty string when there are no findings.

### review_passed

*(boolean)* Whether the review may proceed without fixes — `true` on the finding-free / minor path; unset when significant findings exist, leaving the outcome to explicit user choice.

## Protocol

### 1. Assess Severity

- Read the findings in `{strategic_review_doc}` (and `{review_findings}` when carried separately).
- Judge each finding by impact: significant scope issues, over-engineering, or investigation artifacts that warrant cleanup before proceeding versus minor observations that can be accepted or deferred.

### 2. Recommend an Outcome

- Set `{recommended_strategic_option}` to `acceptable` when findings are minor or absent.
- With one or more significant findings present, set it to the action the run can take on them.
  > - When `{is_review_mode}` is true, that action is `raise-findings` — the change belongs to its author, and what this run decides is which findings the posted review carries.
  > - Otherwise it is `fix-findings` — the run owns the change and can alter it.

### 3. Summarize Findings

- Build `{strategic_findings_summary}` as a multi-line block — a severity tag and a one-line description per finding.
- Use an empty string when there are no findings.

### 4. Signal the Finding-Free Path

- Set `{review_passed}` to `true` when the review is finding-free or minor — `{strategic_findings_summary}` is empty (`""`) or `{recommended_strategic_option}` is `acceptable`.
- Leave `{review_passed}` unset when significant findings are present, so the outcome rests on explicit user choice rather than this recommendation.


## Rules

### significant-findings-route-to-action

Only significant scope, over-engineering, or investigation-artifact findings recommend an action on the findings. Minor observations recommend `acceptable` and are left for the user to defer at their discretion.

### recommendation-holds-only-its-own-domain

`{recommended_strategic_option}` holds one of the three values its contract declares and nothing else. A decision taken elsewhere is a different fact with a different domain, and each keeps its own record — so a run where the recommendation and the decision diverged still shows both.

### summary-stays-concise

Keep `{strategic_findings_summary}` concise — one severity-tagged line per finding.

### finding-free-path-signals-passed

On the finding-free / minor path, emit `{review_passed}: true`. Never emit `{review_passed}: true` when significant findings are present — that outcome is an explicit user decision, not this technique's to assert.
