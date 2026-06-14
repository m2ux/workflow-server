---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 7
  legacy_id: 7
---

## Capability

Assemble the `{audit_scopes}` array that downstream prism workflows consume — a single full-codebase scope for most audits, or multiple trust-domain-focused scopes for very large codebases — each with its own focused analysis focus.

## Protocol

### 1. Build Scopes

- Assemble the `{audit_scopes}` array that downstream prism workflows will consume
- For most audits: create a single scope entry covering the entire codebase
- Single scope: `{ target: target_path, output_subdir: 'analysis', pipeline_mode: 'full-prism', analysis_focus: <composed prompt summary> }`
- For very large codebases (>100K LOC) with clearly separable security boundaries: consider multiple scopes, each focused on a distinct trust domain
- If `{total_loc}` exceeds 200K, single-scope analysis becomes impractical — split into multiple scopes by trust domain or module group, giving each scope its own focused prompt.
- Set `analysis_focus` for each scope to a focused description derived from the prompt, NOT the literal string `security audit`
