---
metadata:
  version: 1.0.0
---

## Capability

Create the detailed-findings document from prism's DEFINITIVE-FINDINGS.md contract: an expanded write-up for every finding, organised by severity and grouped within each severity under audit-domain sub-headings. For multi-scope audits, consolidate the per-scope definitive findings before writing.

## Inputs

### completed_analyses

The triggered prism runs, each carrying its scope's `definitive_findings_path` (the DEFINITIVE-FINDINGS.md the run produced). The findings source for every scope.

## Outputs

### detailed_findings_path

Filesystem path to the written DETAILED-FINDINGS.md (the detailed-findings document).

#### artifact

`DETAILED-FINDINGS.md`

## Protocol

### 1. Consolidate Definitive Findings

- Read each scope's DEFINITIVE-FINDINGS.md at the `definitive_findings_path` in `{completed_analyses}`. This is the findings source — the raw pass artifacts are never read here.
- For a single-scope audit, its findings are the working set as-is.
- For a multi-scope audit, merge the per-scope findings: deduplicate findings reported in more than one scope (keeping the highest severity and citing every scope it appeared in) and surface patterns recurring across scopes as systemic findings.

### 2. Create Detailed Findings

- Write an expanded write-up for every finding in the consolidated set — not just Critical and High — to `{detailed_findings_path}`.
- Organise findings by severity: Critical, High, Medium, Low.
- Take each finding's fields directly from DEFINITIVE-FINDINGS.md: Description, Impact, Location, Recommendation, and Adversarial confirmation (present for full-prism findings). These are not re-derived.
- Group findings within each severity section under audit-domain sub-headings.
- Format each finding heading as a level-3 markdown heading carrying the finding's ID followed by its title: `### ID: Title`. IDs are prism's report IDs, unchanged.
- Where DEFINITIVE-FINDINGS.md records a finding's Blast radius, carry it through as that finding's Graph Evidence subsection (blast-radius metrics and execution-flow participation) — prism computed it, the audit does not recompute it.

## Rules

### detailed-finding-fields

Every finding in DETAILED-FINDINGS.md carries exactly five fields — Description, Impact, Location, Recommendation, Adversarial confirmation — plus an optional sixth, Graph Evidence, present when DEFINITIVE-FINDINGS.md recorded a blast radius. Every field is taken from DEFINITIVE-FINDINGS.md; none is recomputed or re-derived.

### severities-inherited

Severities are inherited verbatim from DEFINITIVE-FINDINGS.md — prism's post-reconciliation Impact × Feasibility assignments. The audit never re-grades a finding; an intuitive or recomputed severity is a formatting violation.
