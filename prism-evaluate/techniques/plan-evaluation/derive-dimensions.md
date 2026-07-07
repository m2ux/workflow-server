---
metadata:
  version: 1.0.0
---

## Capability

Validate user-supplied evaluation dimensions or derive them from the target type and evaluation description, producing the dimension set that frames the analysis.

## Outputs

### dimensions

The validated or derived evaluation dimensions, each `{ name, description, focus_areas }`.

## Protocol

- When `{dimensions}` is supplied, validate that each entry has a `name` and a `description`.
- When `{dimensions}` is absent, select the dimension set matching `{target_type}` from [default-dimensions](../../resources/default-dimensions.md); each entry is `{ name, description, focus_areas }`.  
  > For a `{target_type}` not covered by the resource defaults, infer dimensions from `{evaluation_description}`, each an independent analytical axis.
- When no meaningful dimensions can be derived from `{evaluation_description}` and `{target_path}`, request explicit dimensions or a refined `{evaluation_description}`.
