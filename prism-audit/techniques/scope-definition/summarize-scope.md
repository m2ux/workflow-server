---
metadata:
  version: 1.1.0
---

## Capability

Gathers the settled audit scope into one summary a reader can judge in a single pass.

## Outputs

### scope_summary

Formatted summary of the audit scope covering target, language, size, indexing status, description, and output directory

## Protocol

### 1. Summarize Scope

- Assemble `{scope_summary}` from `{target_path}`, `{target_metadata}`, `{gitnexus_available}`, `{audit_description}`, and `{audit_output_path}`.
