---
metadata:
  version: 1.2.0
---

## Capability

Audit every `rules[]` entry for structural backing by applying `structure-backed-constraints`, and present text-only critical rules with recommended enforcement mechanisms.

## Outputs

### enforcement_findings

Text-only rules found — each with its file, rule content, whether it is critical, and the recommended structural mechanism (checkpoint, condition, validate action, or decision).

### enforcement_finding_count

Count of entries in `{enforcement_findings}`.

## Protocol

### 1. Load Criterion

- Load [anti-patterns](../resources/anti-patterns.md) entry `structure-backed-constraints` — sole Detect / Do not flag / Fix source for this pass
- [Encode Constraints as Structure](../resources/design-principles.md#8-encode-constraints-as-structure) is the framing principle; the anti-pattern is the operative criterion

### 2. Apply structure-backed-constraints

- Walk every `rules[]` entry in `workflow.yaml` and activity files (and technique `## Rules` when the entry's scope implies)
- Apply Detect / Do not flag / Fix from `structure-backed-constraints`
- For each finding record into `{enforcement_findings}`: file, rule content, criticality, recommended structural mechanism

### 3. Present Findings

- Present `{enforcement_findings}`: text-only rules, structurally-enforced rules, and recommendations for adding enforcement where needed

### 4. Set Findings Count

- Set `{enforcement_finding_count}` to the number of findings
