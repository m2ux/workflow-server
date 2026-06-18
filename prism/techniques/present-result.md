---
metadata:
  version: 1.0.0
---

## Capability

Read the clean final report, apply cross-reference hyperlink formatting that links each finding to its most detailed source analysis, and present the report to the caller alongside the underlying artifact paths.

## Inputs

### report_path

Filesystem path to the clean final report.

### all_artifact_paths

The accumulated artifact paths produced across the analysis run, listed for reference.

## Protocol

### 1. Read Report

- Read the report at `{report_path}` — the clean, methodology-free final report.

### 2. Format Cross-References

- Hyperlink every finding ID in a domain summary table — a plain-text finding ID is a formatting violation — to the per-finding heading in whichever source document gives the most detailed explanation, by source: a finding originating from structural analysis links to its `### F-xx` heading in `structural-analysis.md`; an adversarial underclaim links to its `### U-xx`/`### UC-xx` heading in `adversarial-analysis.md`; a finding whose severity, mechanism, or classification was corrected adversarially links to the corrected `### O-xx`/`### WP-xx` heading in `adversarial-analysis.md`; a portfolio-source finding links to its per-finding heading in the portfolio document.  
  > When no per-finding heading exists (findings only in tables), link to the nearest section heading containing the finding table. The synthesis document is only a mapping tool to trace report IDs back to source finding IDs — never the link target.
- Hyperlink every file path in an artifact reference table to the referenced file as `[display-path](relative/path/to/file.md)` — a plain-text or backtick-only path in a reference table is a formatting violation; for a cross-cutting document append a section anchor as `[file.md §N](file.md#section-heading-anchor)`.
- Generate each section anchor by GitHub-flavored markdown rules — lowercase, spaces to hyphens, punctuation removed except hyphens (`## 3. Definitive Finding Table` → `#3-definitive-finding-table`) — and verify it matches an actual heading in the target document.

### 3. Present Result

- Present the report to the caller, including the `{report_path}` and every path in `{all_artifact_paths}` for reference.
