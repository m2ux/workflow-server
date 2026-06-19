---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Run the workflow-design audit across its five passes — expressiveness, conformance, rule-to-structure, anti-pattern, and schema validation — over a committed workflow.

## Protocol

### 1. Run Audit Passes

- Apply [audit-expressiveness](audit-expressiveness.md) over the committed content
- Apply [audit-conformance](audit-conformance.md) against the reference workflows
- Apply [audit-rule-enforcement](audit-rule-enforcement.md) over `rules[]`
- Apply [audit-anti-patterns](audit-anti-patterns.md) over all content
- Apply [audit-schema-validation](audit-schema-validation.md) over every YAML file
