---
metadata:
  version: 2.0.0
---

## Capability

Draws each dimension's findings out of its analysis run and into the report's per-dimension sections, under the identities the run gave them.

## Protocol

### 1. Read Each Run's Findings

- For each run in `{completed_analyses}`, read the findings at its `definitive_findings_path`, taking each finding's ID, severity, title, description, and remaining fields as they stand (`findings-carry-their-source-identity`).

### 2. Attribute Findings to Dimensions

- Label each finding with the dimension it belongs to, from the group's `dimensions` — a group covering more than one dimension shares a pipeline mode across them.

### 3. Record the Per-Dimension Sections

- Record `{evaluation_report.dimension_findings}`: per dimension, its name, finding count, count by severity, and the findings with their IDs.  
  > - A run whose status is `partial` or `error` keeps its dimension in the report, noted as incomplete coverage.
  > - A dimension whose run found nothing keeps its section, noted as no significant findings.
