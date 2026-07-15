---
metadata:
  version: 1.0.0
---

## Capability

Render the work package's token-use and cost-estimate artifact from the rolled-up session usage record, and add a one-line README summary with a link.

## Inputs

### planning_folder_path

Path to the planning folder where the token-usage artifact is written and the README lives.

## Outputs

### token_usage_document

Per-activity token table, per-workflow totals, and cost estimate (labelled an estimate).

#### artifact

`token-usage.md`

## Protocol

1. Read rolled-up usage from session state via `inspect_session { view: "usage" }` (or `get_workflow_status` for the same session). When `usage` is absent, skip artifact creation and README update — do not fabricate figures.
2. Create `{token_usage_document}` at `{planning_folder_path}` (with the server-provided `artifactPrefix` on the filename) containing:
   - A title identifying this as a token-use and cost **estimate** for the work package.
   - A per-activity table: activity id, input/output/total tokens, cache-read and cache-write columns when present, model, `priceTableVersion`, and per-activity cost (or `unknown` when `cost_usd` is null).
   - A per-workflow totals section with input/output/total tokens and total cost (or `unknown` when unpriced activities contributed).
   - A caveat that cost is an **estimate** meaningful for API-key per-token billing; on Pro/Max subscriptions the figure is not a bill.
3. Add one line to the planning folder `README.md` summarizing total tokens and estimated cost with a markdown link to the token-usage artifact. When usage was absent, omit the line.

## Rules

### estimate-not-bill

Always label cost as an estimate. Carry the API-key-vs-subscription caveat in the artifact body.

### no-fabrication

When session state has no `usage` field, produce no artifact and no README line.
