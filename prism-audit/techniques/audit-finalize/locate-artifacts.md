---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Locate every analysis artifact produced by the completed prism runs across all audit scopes, and consolidate findings across runs for multi-scope audits so downstream finalization works from a single deduplicated artifact set.

## Protocol

### 1. Locate Artifacts

- Use `{completed_analyses}` and `{all_analysis_artifact_paths}` to locate the files each prism run produced: `REPORT.md`, `structural-analysis.md`, `adversarial-analysis.md`, `synthesis.md` (full-prism runs), `portfolio-*.md` (portfolio runs), and `behavioral-synthesis.md` (behavioral runs).
- For multi-scope audits, consolidate findings across all prism runs: deduplicate findings found in multiple scopes and surface cross-scope patterns as systemic findings.
