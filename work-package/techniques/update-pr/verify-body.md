---
metadata:
  version: 1.1.1
---

## Capability

PR-body-conformance verdict for the rendered PR description (conforms flag and findings).

## Inputs

### rendered_pr_body

Final-template PR body markdown ([Template (Final)](../../resources/pr-description.md#template-final)).

## Outputs

### body_conforms

True when the rendered body passes every rule in `pr-body-conformance` against the [Final template](../../resources/pr-description.md#template-final) mandated sections and link row; false otherwise.

### body_findings

List of `{ rule_id, detail }` entries, one per failed conformance rule, in rule-evaluation order; empty when the body conforms.


## Protocol

1. Render the Final-template body to `/tmp/pr-body.md`.
2. Evaluate `all-mandated-sections-present` first: check that each mandated section heading for the selected template variant appears literally in the rendered text, per the mandates of [Template (Initial)](../../resources/pr-description.md#template-initial) or [Template (Final)](../../resources/pr-description.md#template-final) (e.g. `grep -F` each `## <heading>` the template variant requires, plus the Issue/Engineering link row). Append a `{ rule_id: all-mandated-sections-present, detail }` finding naming every mandated section that is absent. Do not treat a matching `## Summary` as evidence the remaining sections exist.
3. Evaluate each remaining rule in `pr-body-conformance` against the rendered text. For each failure append `{ rule_id, detail }` to `{body_findings}`.
4. Set `{body_conforms}` = true when `{body_findings}` is empty after all rules are evaluated; false otherwise.
