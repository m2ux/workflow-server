---
metadata:
  version: 1.0.0
---

## Capability

Assemble a comprehensive summary of the audit scope — target codebase, detected language and framework, estimated size, GitNexus indexing status, the user's audit description and focus areas, and the output directory — for user confirmation.

## Outputs

### scope_summary

Formatted summary of the audit scope covering target, language, size, indexing status, description, and output directory

## Protocol

### 1. Summarize Scope

- Assemble the scope summary from the target codebase path, `{target_metadata}` (detected language/framework, estimated size, top-level structure), `{gitnexus_available}` indexing status, the user's `{audit_description}` and focus areas, and the `{output_path}`.
- Format the assembled `{scope_summary}` for user review.
