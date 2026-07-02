---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
  legacy_id: 6
---

## Capability

Compose the full, self-contained audit prompt document from the surveyed structure, mapped domains, trust-boundary map, and cross-cutting concerns — a five-section document readable and actionable from only the prompt and the codebase path.

## Protocol

### 1. Compose Prompt

- Structure the prompt document with clear sections
- Section 1: Codebase Overview — architecture summary, language, total LOC, module layout table (name, path, lines, purpose)
- Section 2: Audit Domains — one subsection per domain with: Domain Name, Risk Level, Scope (which modules/files), Focus Areas (specific patterns to examine), Key Questions (what the audit should answer)
- Section 3: Trust Boundary Map (if GitNexus data available; omit section if unavailable) — the cross-community call edges from `{trust_boundaries}` (from/to community labels and crossing symbols) and the blast radii from `{security_blast_radii}` (direct caller counts and affected process counts)
- Section 4: Cross-Cutting Concerns — error handling, feature flags, trust boundaries, dependencies
- Section 5: Output Requirements — 'Produce findings with: ID, severity (using Impact x Feasibility rubric), description, location (file:line), impact, recommendation. Organise by domain and severity.'
- The prompt must be self-contained: readable and actionable without additional context beyond the codebase path
- Write the completed audit prompt as its declared `audit-prompt.md` artifact into `{output_path}`; record the written path as `{audit_prompt_path}`

## Outputs

### audit_prompt_path

File path to the written audit prompt artifact
