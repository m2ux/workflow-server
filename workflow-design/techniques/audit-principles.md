---
metadata:
  version: 1.1.0
---

## Capability

Audit a workflow's adherence to the design principles, classifying each principle as compliant, partially compliant, or violating with file/field/line citations.

## Protocol

### 1. Audit Principle Compliance

- Audit the workflow against each design principle in [design-principles](../resources/design-principles.md) — sole source of principle stance text for this pass
- For each principle, classify as compliant, partially compliant, or violating against that stance; record file, field, and line references
- Do not re-derive prohibited-pattern Detect here — catalog and inventory walks own Detect; score only whether the authored content honors the principle's positive stance

### 2. Cross-Reference Schemas

- Cross-reference schema field usage against `workflow.schema.json`, `activity.schema.json`, `technique.schema.json`, and `condition.schema.json` when the stance requires it

### 3. Present Findings

- Present per-principle Pass / Partial / Violation with citations
