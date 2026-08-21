---
metadata:
  version: 2.0.0
---

## Capability

Gathers the settled audit scope into one summary a reader can judge in a single pass.

## Inputs

### target_metadata

The validated target's structural metadata: its primary language and build system, its top-level layout, and its estimated size.

## Outputs

### scope_summary

Formatted summary of the audit scope covering target, language, size, indexing status, description, and output directory

## Protocol

### 1. Summarize Scope

- Assemble `{scope_summary}` from `{target_path}`, `{target_metadata}`, `{gitnexus_available}`, `{audit_description}`, and `{audit_output_path}`.
