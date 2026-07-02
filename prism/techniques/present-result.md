---
metadata:
  version: 1.1.0
---

## Capability

Read the clean final report, hyperlink each finding to its full write-up in the definitive-findings document, and present the report to the caller alongside the definitive-findings path, the run manifest, and the underlying artifact paths.

## Inputs

### report_path

Filesystem path to the clean final report.

### definitive_findings_path

Filesystem path to DEFINITIVE-FINDINGS.md — the detailed companion where each finding's full write-up lives.

### run_manifest_path

Filesystem path to RUN-MANIFEST.md — the manifest recording the run's artifacts and completion status.

### all_artifact_paths

The accumulated artifact paths produced across the analysis run, listed for reference.

## Protocol

### 1. Read Report

- Read the report at `{report_path}` — the clean, methodology-free final report.

### 2. Format Cross-References

- Hyperlink every finding ID in a domain summary table — a plain-text finding ID is a formatting violation — to its `### {REPORT-ID}` heading in `DEFINITIVE-FINDINGS.md`, where the finding's full field set (Impact, Recommendation, Adversarial confirmation, and more) lives. REPORT.md and DEFINITIVE-FINDINGS.md share the same report IDs, so the link target always exists.
- Hyperlink every file path in an artifact reference table to the referenced file as `[display-path](relative/path/to/file.md)` — a plain-text or backtick-only path in a reference table is a formatting violation; for a cross-cutting document append a section anchor as `[file.md §N](file.md#section-heading-anchor)`.
- Generate each section anchor by GitHub-flavored markdown rules — lowercase, spaces to hyphens, punctuation removed except hyphens (`### CON-01 — Timeout not enforced` → `#con-01--timeout-not-enforced`) — and verify it matches an actual heading in the target document.

### 3. Present Result

- Present the report to the caller, including the `{report_path}`, the `{definitive_findings_path}`, the `{run_manifest_path}`, and every path in `{all_artifact_paths}` for reference.
