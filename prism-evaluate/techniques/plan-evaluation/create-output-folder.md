---
metadata:
  version: 2.0.0
---

## Capability

Materialises the evaluation's output directory, so the artifacts have somewhere to land.

## Protocol

### 1. Create the Directory

- Run `mkdir -p {output_path}`.

### 2. Confirm It Is Writable

- Confirm `{output_path}` exists and accepts writes.  
  > When it does not, report the path and the reason rather than continuing against a directory the artifacts cannot reach.
