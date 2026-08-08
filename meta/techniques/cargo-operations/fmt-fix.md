---
metadata:
  version: 1.0.0
---

## Capability

Apply rustfmt formatting in place.

## Outputs

### formatted_sources

The source files under `{build_scope}` rewritten in place to match the rustfmt configuration. A side-effect op; the reformatted working tree is its product.

## Protocol

1. `nice -n 19 cargo fmt {build_scope}`
