---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Audit drafted content for schema expressiveness: cross-check every prose passage against the schema construct inventory, flagging prose that substitutes for a formal construct and rewriting it as the construct or moving it to a field that fits.

## Protocol

### 1. Audit Expressiveness

- Walk every prose passage in `workflow.yaml`, activity files, and technique files against the construct inventory in [schema-construct-inventory](../resources/schema-construct-inventory.md)
- Flag every instance where prose substitutes for: steps, checkpoints, decisions, loops, transitions, conditions, triggers, actions, artifacts, variables, modes, inputs, outputs, or protocol phases
- For each flagged instance, rewrite the prose as the formal construct or move it to a field that fits

### 2. Present Findings

- Present the expressiveness-pass results to the user: counts, affected files, replacement constructs, and a before/after for each flagged instance
