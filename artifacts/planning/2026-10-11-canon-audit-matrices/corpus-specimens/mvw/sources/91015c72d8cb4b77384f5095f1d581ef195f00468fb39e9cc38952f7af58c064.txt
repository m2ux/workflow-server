---
metadata:
  version: 1.2.0
---

## Capability

The final report with every finding ID resolved to its full write-up in the definitive-findings document, and every artifact reference resolved to the file it names.

## Inputs

### report_path

Filesystem path to the clean final report.

### definitive_findings_path

Filesystem path to DEFINITIVE-FINDINGS.md — the detailed companion where each finding's full write-up lives.

## Protocol

### 1. Read Report

- Read the report at `{report_path}` — the clean, methodology-free final report.

### 2. Format Cross-References

- Hyperlink every finding ID in a domain summary table — a plain-text finding ID is a formatting violation — to its `### {REPORT-ID}` heading in `DEFINITIVE-FINDINGS.md`, where the finding's full field set (Impact, Recommendation, Adversarial confirmation, and more) lives. REPORT.md and DEFINITIVE-FINDINGS.md share the same report IDs, so the link target always exists.
- Hyperlink every file path in an artifact reference table to the referenced file, the display path as the link text and the file's path relative to the table as the target — a plain-text or backtick-only path in a reference table is a formatting violation; for a cross-cutting document append the section anchor to that target.
- Generate each section anchor by GitHub-flavored markdown rules — lowercase, spaces to hyphens, punctuation removed except hyphens (`### CON-01 — Timeout not enforced` → `#con-01--timeout-not-enforced`) — and verify it matches an actual heading in the target document.
