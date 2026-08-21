---
metadata:
  version: 2.0.0
---

## Capability

Settles the evaluation dimensions — validating the ones supplied, or deriving a set from the target's kind and the evaluation's goals.

## Outputs

### dimensions

The evaluation dimensions the analysis is framed by, each `{ name, description, focus_areas }`.

## Protocol

### 1. Settle the Dimension Set

- Resolve `{dimensions}` to a set whose entries each carry a name and a description, in the shape [Dimension Object Structure](../../resources/default-dimensions.md#dimension-object-structure) defines.  
  > Where the request supplied dimensions, validation is the whole of the work — each entry needs a name and a description.  
  > Where it supplied none, take the set matching `{evaluation_target_type}` from [Proposal / Strategy Document](../../resources/default-dimensions.md#proposal--strategy-document), [Codebase](../../resources/default-dimensions.md#codebase), or [Mixed Targets](../../resources/default-dimensions.md#mixed-targets).  
  > For a `{evaluation_target_type}` those sets do not cover, infer each dimension from `{evaluation_description}` per [Custom Targets](../../resources/default-dimensions.md#custom-targets), one independent analytical axis apiece.  
  > When neither `{evaluation_description}` nor `{target_path}` yields an independent axis, record `{dimensions}` as unresolved, so the scope summary carries the gap.
