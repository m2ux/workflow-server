---
metadata:
  version: 1.1.0
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

### 1. Identify the Assumptions

- Identify all implicit decisions and assumptions across `{assumption_source}` — consult the [probe vocabulary](/work-package/resources/assumptions-review.md#probe-vocabulary) and [classification vocabulary](/work-package/resources/assumptions-review.md#classification-vocabulary) when filling entries
  > Where `{assumption_source}` is absent, take the findings and working context already in hand.

### 2. Classify and Rate Each

- Classify each by a category from `{assumption_categories}`
- Assign a risk letter (**H** / **M** / **L**) from the [classification vocabulary](/work-package/resources/assumptions-review.md#classification-vocabulary)

### 3. Emit the Surface

- Emit `{surfaced_assumptions}` as the list of classified entries.
  > Where none are significant, emit an empty list.
