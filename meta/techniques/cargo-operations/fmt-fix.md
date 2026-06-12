---
metadata:
  version: 1.0.0
---

## Capability

Apply rustfmt formatting in place.

## Inputs

### scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate. `{features}` does not apply — fmt does not compile.

## Output

### formatted_sources

The source files under `{scope}` rewritten in place to match the rustfmt configuration. A side-effect op; the reformatted working tree is its product.

## Protocol

1. `nice -n 19 cargo fmt {scope}`
