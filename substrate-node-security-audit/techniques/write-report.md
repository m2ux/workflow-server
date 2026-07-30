---
metadata:
  version: 2.0.0
---

## Capability

Produce the final audit report artifact from the scored and elevation-verified merge table

## Inputs

### merge_table

The canonical finding flat table with elevation mapping, with every row severity-scored and assigned a report finding number.

## Outputs

### audit_report

Final audit report. Every finding takes the shape and fill rules of [Finding Entry](../resources/audit-prompt-template.md#finding-entry).

#### artifact

`01-audit-report.md`

#### header_table

The report MUST begin with a markdown table containing: Target, Commit, Date (YYYY-MM-DD HH:MM UTC), Workflow version, Agents (using single-letter designators: R, S, A1-A7, B, D1, D2, V, M), and Ensemble status. This table is separated from the Executive Summary by a horizontal rule (`---`). Example: | Field | Value |\n|-------|-------|\n| Date | 2026-02-11 13:19 UTC |

#### executive_summary

Severity distribution table, top findings summary, methodology overview

#### methodology_notes

Phases executed, agent count, template version, ensemble status

#### crate_inventory

Table of all in-scope crates with classification, priority, and reviewing agent

#### findings

All numbered findings, ordered by severity (Critical, High, Medium, Low, Informational, Undetermined), each rendered per [Finding Entry](../resources/audit-prompt-template.md#finding-entry). Per-finding adversarial-disposition prose belongs to the adversarial-verification artifact rather than the finding block ([adversarial-disposition-is-auxiliary](#adversarial-disposition-is-auxiliary)).

#### severity_distribution

Summary table: Critical/High/Medium/Low/Informational counts

#### coverage_gate

Pass/fail status, list of top files by line count with reviewing agent attribution

#### elevation_summary

Count of table-derived findings auto-elevated, adversarial refutations integrated

#### dependency_scan

`cargo audit` results if available

## Protocol

1. Verify every row in `{merge_table}` has a severity score and a finding number.
2. Derive `{$source_blob_base}` as `https://github.com/{$org}/{$repo}/blob/{target_commit}`, taking `{org}/{repo}` from the target submodule's GitHub remote (`git remote get-url origin` in `{target_submodule}`, normalised from SSH or HTTPS to `github.com/{org}/{repo}`) and `{target_commit}` from the revision recorded at scope-setup. Every `**Affected Files:**` link resolves against this base.
3. Organize findings by severity (Critical first, then High, Medium, Low).
4. Assemble the `{audit_report}` sections — `{audit_report.header_table}`, `{audit_report.executive_summary}`, `{audit_report.methodology_notes}`, `{audit_report.crate_inventory}`, `{audit_report.findings}`, `{audit_report.severity_distribution}`, `{audit_report.coverage_gate}`, `{audit_report.elevation_summary}`, and `{audit_report.dependency_scan}` — into the `{audit_report}` artifact.
5. Verify the finding count in `{audit_report.executive_summary}` matches `{audit_report.findings}`.

## Rules

### reconciliation-table-included

The final report includes the finding-count reconciliation table as an appendix or methodology section, providing auditable evidence that every agent finding is accounted for.

### adversarial-disposition-is-auxiliary

Per-finding adversarial-disposition detail (the confirmed / downgraded / refuted rationale from the adversarial-verification phase) is auxiliary and MUST NOT appear inline in the report's finding blocks — it is noise at the point of the finding. It is recorded in the adversarial-verification artifact (`04-adversarial-verification.md`). The report integrates adversarial outcomes into the final severities and MAY carry a single concise adversarial-summary section, but MUST NOT repeat per-finding disposition prose inside each finding.
