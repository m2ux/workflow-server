---
metadata:
  version: 1.0.0
---

## Capability

Assemble the three security-audit deliverables — a summary report, a detailed-findings document, and a design trade-off analysis — from prism's contract artifacts (REPORT.md and DEFINITIVE-FINDINGS.md), and cross-validate them. prism has already extracted findings, enriched blast radius, stripped methodology, and unified IDs, so this set only splits, expands, distils, formats, and verifies — it never re-reads the raw pass artifacts. The operations decompose that into the report-splitting, detailed-findings, trade-off, formatting, and verification phases.

## Inputs

### completed_analyses

Array of completed prism runs, each carrying that scope's `report_path` (REPORT.md), `definitive_findings_path` (DEFINITIVE-FINDINGS.md), and prism-reported completion status. These contract artifacts are the sole source for the deliverables.

## Outputs

### audit_report_path

File path to the summary report.

#### artifact

`AUDIT-REPORT.md`

### detailed_findings_path

File path to the detailed-findings document.

#### artifact

`DETAILED-FINDINGS.md`

### trade_offs_path

File path to the design trade-off analysis.

#### artifact

`DESIGN-TRADE-OFFS.md`

## Rules

### contract-sources

The deliverables are built solely from prism's contract artifacts, located per scope from `{completed_analyses}`: REPORT.md is the input to report-splitting; DEFINITIVE-FINDINGS.md is the input to detailed-findings and trade-off analysis. Finalization NEVER re-reads the raw pass artifacts (structural-analysis.md, adversarial-analysis.md, synthesis.md, portfolio-*.md) — prism has already extracted, blast-radius-enriched, methodology-stripped, and ID-unified those into its contract artifacts.

### multi-scope-consolidation

prism consolidates findings within each run; the audit consolidates across scopes. For a multi-scope audit (multiple triggered prism runs), the per-scope DEFINITIVE-FINDINGS.md sets are merged — findings found in more than one scope are deduplicated, and patterns recurring across scopes are surfaced as systemic findings.
