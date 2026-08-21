---
metadata:
  version: 2.0.0
---

## Capability

Create the detailed-findings document from prism's DEFINITIVE-FINDINGS.md contract: an expanded write-up for every finding, organised by severity and grouped within each severity under audit-domain sub-headings. For multi-scope audits, consolidate the per-scope definitive findings before writing.

## Outputs

### detailed_findings_path

Filesystem path to the written DETAILED-FINDINGS.md (the detailed-findings document).

#### artifact

`DETAILED-FINDINGS.md`

#### audience

`human`

## Protocol

### 1. Consolidate Definitive Findings

- Read each scope's DEFINITIVE-FINDINGS.md at the `definitive_findings_path` in `{completed_analyses}` into the working set.  
  > For a single-scope audit, that scope's findings are the working set as they stand.  
  > For a multi-scope audit, merge them: deduplicate findings reported in more than one scope, keeping the highest severity and citing every scope it appeared in, and surface patterns recurring across scopes as systemic findings.

### 2. Create Detailed Findings

- Write an expanded write-up for every finding in the consolidated set — not just Critical and High — to `{detailed_findings_path}` per [detailed-findings](../../resources/detailed-findings.md#template) and its [Rules](../../resources/detailed-findings.md#rules)
- Take each finding's fields from DEFINITIVE-FINDINGS.md, carrying a Blast radius recorded there through as that finding's Graph Evidence
