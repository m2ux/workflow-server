---
metadata:
  version: 1.0.0
---

## Capability

Materialises the audit's output directory, so the artifacts have somewhere to land.

## Protocol

### 1. Create Output Folder

- Run `mkdir -p {audit_output_path}` to create the output directory when it does not already exist.
- Verify the directory exists and is writable before proceeding.
