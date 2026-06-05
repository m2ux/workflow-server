---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.0
  order: 15
  legacy_id: 15
---

## Capability

Produce the final audit report artifact from the scored and elevation-verified merge table

## Protocol

1. Verify all merge table rows have severity scores and finding numbers.
2. Organize findings by severity (Critical first, then High, Medium, Low).
3. Write each section per the structure above, assembling them into the `audit-report` artifact.
4. Verify the finding count in the executive summary matches the findings section of the `audit-report`.

## Outputs

### audit-report

Final [audit report](../resources/audit-prompt-template.md#4-reporting-format). Each finding uses the format below. When persisted, use artifact name.

#### artifact

`01-audit-report.md`

#### header_table

The report MUST begin with a markdown table containing: Target, Commit, Date (YYYY-MM-DD HH:MM UTC), Workflow version, Agents (using single-letter designators: R, S, A1-A7, B, D1, D2, V, M), and Ensemble status. This table is separated from the Executive Summary by a horizontal rule (---). Example: | Field | Value |\n|-------|-------|\n| Date | 2026-02-11 13:19 UTC |

#### executive_summary

Severity distribution table, top findings summary, methodology overview

#### methodology

Phases executed, agent count, template version, ensemble status

#### crate_inventory

Table of all in-scope crates with classification, priority, and reviewing agent

#### findings

All numbered findings. Each: title, severity (I and F with one-sentence justifications), category, affected files with line numbers, description, suggested remediation

#### severity_distribution

Summary table: Critical/High/Medium/Low/Informational counts

#### coverage_gate

Pass/fail status, list of top files by line count with reviewing agent attribution

#### elevation_summary

Count of table-derived findings auto-elevated, adversarial refutations integrated

#### dependency_scan

cargo audit results if available

#### finding_block_format

### Issue {number}: {title}

**Impact:** {impact} — {justification}

**Feasibility:** {feasibility} — {justification}

**Severity:** {level} (I={impact}, F={feasibility}, avg={average})

**Category:** {category}

**Affected Files:** {file}#{lines}

{description}

#### finding_block_note

Each field MUST be separated by a blank line (double newline) so that markdown renders them as distinct paragraphs. Single newlines between fields will collapse into a single paragraph.
