---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Audit a workflow's adherence to the design principles, classifying each principle as compliant, partially compliant, or violating with file/field/line citations.

## Protocol

### 1. Audit Principle Compliance

- Audit the workflow against each design principle in [design-principles](../resources/design-principles.md) (when auditing an existing workflow in review mode, see [review-mode-guide](../resources/review-mode-guide.md))
- For each principle, classify as compliant, partially compliant, or violating; record file, field, and line references
- Cross-reference against `workflow.schema.json`, `activity.schema.json`, `technique.schema.json`, and `condition.schema.json` to verify field usage
