---
metadata:
  version: 1.0.0
---

## Capability

Assumptions surfaced from the bound source and categories, as a value the join can write into the assumptions log once.

## Inputs

### assumption_categories

Comma-separated categories that classify each assumption this pass surfaces.

### assumption_source

*(optional)* The artifact or bag value the assumptions are drawn from. When absent, the activity's own working context is the source.

## Outputs

### surfaced_assumptions

One entry per assumption surfaced this pass: category, risk, statement with rationale, and alternatives where an architectural assumption needs them. Empty when none are significant.

## Protocol

### 1. Identify the Assumptions

- Identify all implicit decisions and assumptions across `{assumption_source}` — consult the [probe vocabulary](/work-package/resources/assumptions-review.md#probe-vocabulary) and [classification vocabulary](/work-package/resources/assumptions-review.md#classification-vocabulary) when filling entries
  > Where `{assumption_source}` is absent, take the activity's own findings and working context as the source.

### 2. Classify and Rate Each

- Classify each by a category from `{assumption_categories}`
- Assign a risk letter (**H** / **M** / **L**) from the [classification vocabulary](/work-package/resources/assumptions-review.md#classification-vocabulary)

### 3. Emit the Surface

- Emit `{surfaced_assumptions}` as the list of classified entries. Do not write `assumptions-log.md` — the activity the fan converges on is the one writer of that log.
  > Where none are significant, emit an empty list.
