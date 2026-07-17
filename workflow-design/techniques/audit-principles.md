---
metadata:
  version: 1.3.1
---

## Capability

Audit a workflow's adherence to the design principles, classifying each principle as compliant, partially compliant, or violating with file/field/line citations, and persist the findings.

## Outputs

### principle_findings

Per-principle Pass / Partial / Violation classifications with file, field, and line citations.

#### artifact

`principle-findings.md`

### principle_findings_path

Absolute path to the persisted principle-findings artifact.

## Protocol

### 1. Audit Principle Compliance

- Audit the workflow against each design principle in [design-principles](../resources/design-principles.md) — sole source of principle stance text for this pass
- For each principle, classify as compliant, partially compliant, or violating against that stance; record file, field, and line references into `{principle_findings}`
- Do not re-derive prohibited-pattern Detect here — catalog and inventory walks own Detect; score only whether the authored content honors the principle's positive stance

### 2. Cross-Reference Schemas

- Cross-reference schema field usage against `workflow.schema.json`, `activity.schema.json`, `technique.schema.json`, and `condition.schema.json` when the stance requires it

### 3. Persist Findings

- Persist `{principle_findings}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `principle-findings.md`, following the [Findings Satellite Guide](../resources/findings-satellite.md#template); capture `{principle_findings_path}`
