---
metadata:
  version: 1.1.0
---

## Capability

Audit drafted content for schema expressiveness: walk prose against the schema construct inventory, flag substitutions for formal constructs, and present before/after rewrites.

## Outputs

### expressiveness_finding_count

Count of expressiveness findings — each a flagged instance with its file, the prose passage, the substituting construct, and the before/after rewrite. Interpolated into the expressiveness-confirmed checkpoint message.

## Protocol

### 1. Load Inventory

- Load [schema-construct-inventory](../resources/schema-construct-inventory.md) — sole source of informal→formal construct mappings for this pass
- Do not restate the inventory tables or construct lists here; apply each mapping as written
- Schema Expressiveness anti-patterns in [anti-patterns](../resources/anti-patterns.md) sharpen the same concern for the full-catalog pass; this pass uses the inventory as its operative checklist

### 2. Audit Expressiveness

- Walk every prose passage in `workflow.yaml`, activity files, and technique files against the inventory
- For each match where prose substitutes for a formal construct: record file, passage, target construct, and a before/after rewrite (construct in place, or move to the fitting field)

### 3. Present Findings

- Present findings: counts, affected files, replacement constructs, and before/after for each instance
- Set `{expressiveness_finding_count}` to the number of findings
