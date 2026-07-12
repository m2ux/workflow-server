---
metadata:
  version: 1.0.0
---

## Capability

Audit every `rules[]` entry for structural backing: distinguish text-only enforcement from rules backed by a checkpoint, condition, validate action, or decision, and flag any critical rule that relies solely on text.

## Outputs

### enforcement_finding_count

Count of text-only rules found — each with its file, rule content, whether it is critical, and the recommended structural mechanism (checkpoint, condition, validate action, or decision). Interpolated into the enforcement-confirmed checkpoint message.

## Protocol

### 1. Audit Rule To Structure

- For every `rules[]` entry in `workflow.yaml` and activity files, ask: can this rule be violated by ignoring it? If yes, verify a structural mechanism (checkpoint, condition, validate action) backs it
- Flag any critical rule that relies solely on text

### 2. Present Findings

- Present the rule-to-structure-pass results to the user: text-only rules, structurally-enforced rules, and recommendations for adding enforcement where needed
