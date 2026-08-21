---
metadata:
  version: 1.1.0
---

## Capability

Assembles the three security-audit deliverables — a summary report, a detailed-findings document, and a design trade-off analysis — from the analysis runs' contract artifacts, and cross-validates them against each other.

## Inputs

### completed_analyses

Array of completed prism runs, each carrying that scope's `report_path` (REPORT.md), `definitive_findings_path` (DEFINITIVE-FINDINGS.md), and prism-reported completion status. These contract artifacts are the sole source for the deliverables.

## Outputs

### audit_report_path

File path to the summary report.

#### artifact

`AUDIT-REPORT.md`

#### audience

`human`

### detailed_findings_path

File path to the detailed-findings document.

#### artifact

`DETAILED-FINDINGS.md`

#### audience

`human`

### trade_offs_path

File path to the design trade-off analysis.

#### artifact

`DESIGN-TRADE-OFFS.md`

#### audience

`human`

## Rules

### contract-sources

The deliverables are built from each scope's declared contract artifacts, located from `{completed_analyses}`: its report supplies the material the summary report is split from; its definitive findings supply the detailed findings and the trade-off analysis. A run's internal pass artifacts are not a source: what they hold has already been reconciled into the definitive findings, and reading them reintroduces claims the run withdrew.

### multi-scope-consolidation

prism consolidates findings within each run; the audit consolidates across scopes. For a multi-scope audit (multiple triggered prism runs), the per-scope DEFINITIVE-FINDINGS.md sets are merged — findings found in more than one scope are deduplicated, and patterns recurring across scopes are surfaced as systemic findings.
