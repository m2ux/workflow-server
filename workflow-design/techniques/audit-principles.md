---
metadata:
  version: 1.1.0
---

## Capability

Audit a workflow's adherence to the design principles, classifying each principle as compliant, partially compliant, or violating with file/field/line citations.

## Protocol

### 1. Audit Principle Compliance

- Audit the workflow against each design principle in [design-principles](../resources/design-principles.md) — sole source of principle Rule / Enforcement text for this pass
- For each principle, classify as compliant, partially compliant, or violating; record file, field, and line references
- When a principle cites anti-patterns or the construct inventory, treat those as the detailed Detect home — do not re-derive criteria here; cite the named entries and score the principle from that evidence
- Cross-reference schema field usage against `workflow.schema.json`, `activity.schema.json`, `technique.schema.json`, and `condition.schema.json` when the principle requires it

### 2. Present Findings

- Present per-principle Pass / Partial / Violation with citations
