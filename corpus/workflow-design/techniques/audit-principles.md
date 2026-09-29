---
metadata:
  version: 1.5.0
---

## Capability

Design-principles adherence audit of a workflow with compliance classification and citations.

## Outputs

### principle_findings

Per-principle Pass / Partial / Violation classifications with file, field, and line citations.

#### artifact

`principle-findings.md`

#### audience

`human`

### principle_finding_count

Count of partially compliant and violating entries in `{principle_findings}`.

### has_critical_principle_finding

Whether any entry in `{principle_findings}` is Critical severity: a schema-invalid or structurally broken construct.

## Protocol

### 1. Audit Principle Compliance

- Audit the workflow against each design principle in [design-principles](/canon/resources/design-principles.md) — sole source of principle stance text for this pass
- For each principle, classify as compliant, partially compliant, or violating against that stance; record file, field, and line references into `{principle_findings}`
- Do not re-derive prohibited-pattern Detect here — catalog and inventory walks own Detect; score only whether the authored content honors the principle's positive stance

### 2. Cross-Reference Schemas

- Cross-reference schema field usage against `workflow.schema.json`, `activity.schema.json`, `technique.schema.json`, and `condition.schema.json` when the stance requires it

### 3. Assemble Findings

- Assemble `{principle_findings}` at the shape [Template](../resources/findings-satellite.md#template) declares
- Set `{principle_finding_count}` to the number of partially compliant and violating entries, and `{has_critical_principle_finding}` to whether any of them is Critical
