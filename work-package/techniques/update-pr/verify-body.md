---
metadata:
  version: 1.0.0
---

## Capability

Evaluate the rendered PR body against `rules.pr-body-conformance` and report the verdict as `{body_conforms}` with per-rule `{body_findings}`.

## Inputs

### rendered_pr_body

The Final-template PR body to evaluate, produced by [render](./render.md) and re-rendered to `/tmp/pr-body.md` for evaluation. This op reads that rendered text; it does not re-render the body itself.

## Outputs

### body_conforms

True when the rendered body passes every rule in [pr-body-conformance](./TECHNIQUE.md); false otherwise. Surfaced as the group root's `body_conforms` output (declared in the [update-pr](./TECHNIQUE.md) group root).

### body_findings

List of `{ rule_id, detail }` entries, one per failed conformance rule, in rule-evaluation order; empty when the body conforms. Surfaced as the group root's `body_findings` output (declared in the [update-pr](./TECHNIQUE.md) group root).

## Protocol

1. Render the Final-template body to `/tmp/pr-body.md`.
2. Evaluate each rule in [pr-body-conformance](./TECHNIQUE.md) against the rendered text. For each failure append `{ rule_id, detail }` to `{body_findings}`.
3. Set `{body_conforms}` = true when `{body_findings}` is empty after all rules are evaluated; false otherwise.
