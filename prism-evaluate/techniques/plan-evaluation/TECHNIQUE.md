---
metadata:
  version: 2.0.0
---

## Capability

Turns an evaluation request into a runnable plan: what the target is, which dimensions judge it, and the prism configuration each dimension takes.

## Inputs

### target_type

The target's kind: `document`, `document-set`, `codebase`, or `mixed`.

### dimensions

*(optional)* The evaluation dimensions, each `{ name, description, focus_areas }`.

### lens_overrides

*(optional)* Lens overrides keyed by dimension name, each `{ pipeline_mode, lenses }`, taking precedence over a derived mapping.
