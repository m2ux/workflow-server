---
metadata:
  version: 1.2.0
---

## Capability

PR-body-conformance verdict for the rendered PR description (conforms flag and findings).

## Inputs

### rendered_pr_body

Final-template PR body markdown ([Template (Final)](../../resources/pr-description.md#template-final)).

## Outputs

### body_conforms

True when the rendered body satisfies every criterion in [Rules](../../resources/pr-description.md#rules); false otherwise.

### body_findings

List of `{ rule_id, detail }` entries, one per failed conformance rule, in rule-evaluation order; empty when the body conforms.


## Protocol

1. Render the Final-template body to `/tmp/pr-body.md`.
2. Evaluate [Mandated sections present](../../resources/pr-description.md#mandated-sections-present) first, against the variant's own template — [Template (Initial)](../../resources/pr-description.md#template-initial) or [Template (Final)](../../resources/pr-description.md#template-final). Append one finding naming every mandated section that is absent.
3. Evaluate each remaining criterion in [Rules](../../resources/pr-description.md#rules) against the rendered text. For each failure append `{ rule_id, detail }` to `{body_findings}`.
4. Set `{body_conforms}` = true when `{body_findings}` is empty after all rules are evaluated; false otherwise.
