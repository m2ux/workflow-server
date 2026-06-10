---
metadata:
  version: 1.0.0
---

## Capability

Evaluate the rendered PR body against `rules.pr-body-conformance` and report the verdict as `{body_conforms}` with per-rule `{body_findings}`.

## Protocol

1. Render the Final-template body to `/tmp/pr-body.md`.
2. Evaluate each rule in [pr-body-conformance](./TECHNIQUE.md) against the rendered text. For each failure append `{ rule_id, detail }` to `{body_findings}`.
3. Set `{body_conforms}` = true when `{body_findings}` is empty after all rules are evaluated; false otherwise.
