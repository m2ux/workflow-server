---
metadata:
  version: 1.2.1
---

## Capability

Assumptions surfaced from the bound source and categories.

## Inputs

### assumption_categories

Comma-separated categories that classify each assumption this pass surfaces.

### assumption_source

*(optional)* The artifact or bag value the assumptions are drawn from.

## Outputs

### surfaced_assumptions

One entry per assumption surfaced this pass: category, risk, statement with rationale, and alternatives where an architectural assumption needs them. Empty when none are significant.

## Protocol

### 1. Surface From the Source

- Surface the assumptions `{assumption_source}` carries. Classify each by `{assumption_categories}` and rate it from the [classification vocabulary](../resources/assumptions-review.md#classification-vocabulary). The [probe vocabulary](../resources/assumptions-review.md#probe-vocabulary) is what counts as an assumption.
  > Where `{assumption_source}` is absent, emit an empty `{surfaced_assumptions}`.

### 2. Emit the Surface

- Emit `{surfaced_assumptions}` as the list of classified entries.
  > Where none are significant, emit an empty list.
