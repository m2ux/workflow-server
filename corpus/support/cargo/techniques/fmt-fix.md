---
metadata:
  version: 1.1.0
---

## Capability

Apply rustfmt formatting in place.

## Outputs

### formatted_sources

The source files under `{build_scope}` rewritten in place to match the rustfmt configuration. A side-effect op; the reformatted working tree is its product.

## Protocol

### 1. Apply Formatting

- Take `{$fmt_scope}` as `{build_scope}`, with `--workspace` written as `--all`.
  > `cargo fmt` names the whole workspace `--all` and refuses `--workspace`; `-p <crate>` passes through unchanged.
- `nice -n 19 cargo fmt {fmt_scope}`