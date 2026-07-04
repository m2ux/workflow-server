---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.3.0
  order: 15
  legacy_id: 15
---

## Capability

Produce the final audit report artifact from the scored and elevation-verified merge table

## Inputs

### merge_table

The canonical finding flat table with elevation mapping, with every row severity-scored and assigned a report finding number.

## Protocol

1. Verify every row in `{merge_table}` has a severity score and a finding number.
2. Organize findings by severity (Critical first, then High, Medium, Low).
3. Assemble the `{audit_report}` sections — `{audit_report.header_table}`, `{audit_report.executive_summary}`, `{audit_report.methodology_notes}`, `{audit_report.crate_inventory}`, `{audit_report.findings}`, `{audit_report.severity_distribution}`, `{audit_report.coverage_gate}`, `{audit_report.elevation_summary}`, and `{audit_report.dependency_scan}` — into the `{audit_report}` artifact.
4. Verify the finding count in `{audit_report.executive_summary}` matches `{audit_report.findings}`.

## Outputs

### audit_report

Final [audit report](../resources/audit-prompt-template.md#4-reporting-format). Each finding uses the format below.

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

All numbered findings, ordered by severity (Critical, High, Medium, Low, Informational, Undetermined). EVERY finding — at every severity — opens with a brief explanatory paragraph (1–3 sentences, plain prose) placed immediately after the header and before `**Impact:**`. The fields then follow in order: severity (I and F with one-sentence justifications), category, affected files as hyperlinks to the audited source (see `affected_files_hyperlink`), and suggested remediation. Per-finding adversarial-disposition prose is NOT included here (see the `adversarial-disposition-is-auxiliary` rule).

#### severity_distribution

Summary table: Critical/High/Medium/Low/Informational counts

#### coverage_gate

Pass/fail status, list of top files by line count with reviewing agent attribution

#### elevation_summary

Count of table-derived findings auto-elevated, adversarial refutations integrated

#### dependency_scan

`cargo audit` results if available

#### finding_block_format

### Issue `{number}`: `{title}`

`{description}`

**Impact:** `{impact}` — `{justification}`

**Feasibility:** `{feasibility}` — `{justification}`

**Severity:** `{level}` (I=`{impact}`, F=`{feasibility}`, avg=`{average}`)

**Category:** `{category}`

**Affected Files:** [`` `{file}`#L{start}-L{end} ``](`{source_blob_base}`/`{file}`#L`{start}`-L`{end}`)

**Suggested Remediation:** `{remediation}`

The explanatory paragraph (`{description}`) is FIRST — immediately after the header, before `**Impact:**`; derive `{$remediation}` as the concrete suggested fix for the finding. When a finding cites multiple files or extra line ranges, hyperlink each `` `{file}`#L… `` reference the same way, deriving `{$start}`/`{$end}` as the cited range's first and last line; trailing bare line numbers after the first range may stay plain text. A single line renders as `#L{n}` (no range).

#### finding_block_note

Each field MUST be separated by a blank line (double newline) so that markdown renders them as distinct paragraphs. Single newlines between fields will collapse into a single paragraph.

#### affected_files_hyperlink

Every source reference in `**Affected Files:**` MUST be a markdown hyperlink to the exact file and line range in the target repository at the audited commit, so a reviewer is one click from the reviewed code. Construct `{$source_blob_base}` as `https://github.com/{$org}/{$repo}/blob/{target_commit}`, where `{org}/{repo}` is the target submodule's GitHub remote (from `git remote get-url origin` in `{target_path}`, normalised from SSH/HTTPS to `github.com/{org}/{repo}`) and `{target_commit}` is the audited revision recorded at scope-setup. Pin the links to `{target_commit}` — never to a mutable branch — so they always resolve to the reviewed source.

## Rules

### reconciliation-table-included

The final report includes the finding-count reconciliation table as an appendix or methodology section, providing auditable evidence that every agent finding is accounted for.

### every-finding-has-explanatory-paragraph

Every finding — at every severity, including Informational and Undetermined — MUST open with a brief explanatory paragraph (1–3 sentences) immediately after the `### Issue` header and before `**Impact:**`. The paragraph states what the issue is; it is never placed after `**Affected Files:**`.

### affected-files-are-hyperlinks

Every `**Affected Files:**` reference MUST hyperlink to the file and line range in the target repository at the audited commit, per `affected_files_hyperlink`. Plain `` `path`#lines `` text (no link) is not acceptable, and the link target must be the audited commit, not a branch.

### adversarial-disposition-is-auxiliary

Per-finding adversarial-disposition detail (the confirmed / downgraded / refuted rationale from the adversarial-verification phase) is auxiliary and MUST NOT appear inline in the report's finding blocks — it is noise at the point of the finding. It is recorded in the adversarial-verification artifact (`04-adversarial-verification.md`). The report integrates adversarial outcomes into the final severities and MAY carry a single concise adversarial-summary section, but MUST NOT repeat per-finding disposition prose inside each finding.
