---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Create the detailed-findings document: an expanded write-up for every finding in the domain tables, organised by severity and grouped within each severity under domain sub-headings, with each finding's fields extracted from its source analysis artifact.

## Protocol

### 1. Create Detailed Findings

- Write an expanded write-up for every finding that appears in the domain tables — not just Critical and High — to `{detailed_findings_path}`.
- Organise findings by severity: Critical, High, Medium, Low.
- For each finding, extract from its source analysis artifact: Description, Impact, Location, Recommendation, and Adversarial confirmation (when the run was full-prism). Source priority for extraction: structural analysis for original findings, adversarial analysis for underclaims and significant corrections, portfolio documents for portfolio-source findings.
- Group findings within each severity section under domain sub-headings.
- Format each finding heading as a level-3 markdown heading carrying the finding's ID followed by its title: `### ID: Title`.
- Where `{graph_evidence}` is available for a finding, include it as that finding's Graph Evidence subsection (blast-radius metrics and execution-flow participation).
