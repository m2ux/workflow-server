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
- When `{dimensions}` is absent, select the dimension set matching `{target_type}` — [proposal / strategy](../../resources/default-dimensions.md#proposal--strategy-document), [codebase](../../resources/default-dimensions.md#codebase), [mixed targets](../../resources/default-dimensions.md#mixed-targets), or [custom targets](../../resources/default-dimensions.md#custom-targets); each entry is `{ name, description, focus_areas }` per the [dimension object structure](../../resources/default-dimensions.md#dimension-object-structure).  
  > For a `{target_type}` not covered by the resource defaults, infer dimensions from `{evaluation_description}` under [custom targets](../../resources/default-dimensions.md#custom-targets), each an independent analytical axis.
- When no meaningful dimensions can be derived from `{evaluation_description}` and `{target_path}`, request explicit dimensions or a refined `{evaluation_description}`.
