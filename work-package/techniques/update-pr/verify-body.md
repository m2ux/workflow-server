---
metadata:
  version: 1.1.0
---

## Capability

Evaluate the rendered PR body against `pr-body-conformance` and report the verdict as `{body_conforms}` with per-rule `{body_findings}`.

## Inputs

### rendered_pr_body

The Final-template PR body to evaluate, read from the rendered output at `/tmp/pr-body.md`.

## Outputs

### body_conforms

True when the rendered body passes every rule in `pr-body-conformance`; false otherwise (declared in the [update-pr](./TECHNIQUE.md) group root).

### body_findings

List of `{ rule_id, detail }` entries, one per failed conformance rule, in rule-evaluation order; empty when the body conforms (declared in the [update-pr](./TECHNIQUE.md) group root).

## Protocol

1. Render the Final-template body to `/tmp/pr-body.md`.
2. Evaluate `all-mandated-sections-present` first: check that each mandated section heading for the selected template variant appears literally in the rendered text (e.g. `grep -F` each of `## Changes`, `## 🤖 AI Assistance`, `## 📌 Submission Checklist`, `## 🔱 Fork Strategy`, `## 🗹 TODO before merging`, plus the Issue/Engineering link row). Append a `{ rule_id: all-mandated-sections-present, detail }` finding naming every mandated section that is absent. Do not treat a matching `## Summary` as evidence the remaining sections exist.
3. Evaluate each remaining rule in `pr-body-conformance` against the rendered text. For each failure append `{ rule_id, detail }` to `{body_findings}`.
4. Set `{body_conforms}` = true when `{body_findings}` is empty after all rules are evaluated; false otherwise.
