---
metadata:
  version: 1.3.1
---

## Capability

Audit drafted content for schema expressiveness: walk prose against the schema construct inventory, flag substitutions for formal constructs, and persist before/after rewrites when findings exist.

## Outputs

### expressiveness_findings

Expressiveness findings — each a flagged instance with its file, the prose passage, the substituting construct, and the before/after rewrite.

#### artifact

`expressiveness-findings.md`

### expressiveness_finding_count

Count of entries in `{expressiveness_findings}`.

### expressiveness_findings_path

Absolute path to the persisted findings artifact when `{expressiveness_finding_count}` is greater than zero; empty otherwise.

## Protocol

### 1. Load Inventory

- Load [schema-construct-inventory](../resources/schema-construct-inventory.md) — sole source of informal→formal construct mappings for this pass
- Do not restate the inventory tables or construct lists here; apply each mapping as written

### 2. Audit Expressiveness

- Walk every prose passage in `workflow.yaml`, activity files, and technique files against the inventory
- For each match where prose substitutes for a formal construct: record file, passage, target construct, and a before/after rewrite (construct in place, or move to the fitting field) into `{expressiveness_findings}`

### 3. Persist Findings

- Set `{expressiveness_finding_count}` to the number of findings
- When `{expressiveness_finding_count}` is greater than zero: persist `{expressiveness_findings}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `expressiveness-findings.md`, following the [Findings Satellite Guide](../resources/findings-satellite.md#template); capture `{expressiveness_findings_path}`
- When `{expressiveness_finding_count}` is zero: leave `{expressiveness_findings_path}` empty
