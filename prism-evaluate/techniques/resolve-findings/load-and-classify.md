---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Extract the findings from the evaluation report, locate the target text each references, and classify every finding into its mitigation tier ordered by severity.

## Protocol

- Read `{evaluation_report}` and extract `{evaluation_findings}` with IDs, severities, titles, descriptions, and referenced target sections.
- Read the target document at `{target_path}` and identify the specific text, sections, and claims each finding references.  
  > When a finding references target text that cannot be located in the current target, report it as unlocatable with a note that the referenced text could not be found — the target may have changed since the evaluation.
- Classify each finding into a mitigation tier: `T1` (direct correction — wrong numbers or terminology), `T2` (reframing — claims needing qualification), `T3` (novel mitigation — new mechanisms or content), `T4` (structural / immovable — external constraints requiring acknowledgement).
- Order findings within each tier by severity (Critical, then High, Medium, Low) and present the tier-classification summary.
