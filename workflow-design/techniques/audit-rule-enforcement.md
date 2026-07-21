---
metadata:
  version: 1.3.1
---

## Capability

Audit every `rules[]` entry for structural backing by applying `structure-backed-constraints`, and persist text-only critical rules with recommended enforcement mechanisms when any exist.

## Outputs

### enforcement_findings

Text-only rules found — each with its file, rule content, whether it is critical, and the recommended structural mechanism (checkpoint, condition, validate action, or decision).

#### artifact

`enforcement-findings.md`

### enforcement_finding_count

Count of entries in `{enforcement_findings}`.

### enforcement_findings_path

Absolute path to the persisted findings artifact when `{enforcement_finding_count}` is greater than zero; empty otherwise.

## Protocol

### 1. Load Criterion

- Load [anti-patterns](../resources/anti-patterns.md) entry `structure-backed-constraints` — sole Detect / Do not flag / Fix source for this pass
- [Encode Constraints as Structure](../resources/design-principles.md#9-encode-constraints-as-structure) is the framing principle; the anti-pattern is the operative criterion

### 2. Apply structure-backed-constraints

- Walk every `rules[]` entry in `workflow.yaml` and activity files (and technique `## Rules` when the entry's scope implies)
- Apply Detect / Do not flag / Fix from `structure-backed-constraints`
- For each finding record into `{enforcement_findings}`: file, rule content, criticality, recommended structural mechanism

### 3. Persist Findings

- Set `{enforcement_finding_count}` to the number of findings
- When `{enforcement_finding_count}` is greater than zero: persist `{enforcement_findings}` via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `enforcement-findings.md`, following the [Findings Satellite Guide](../resources/findings-satellite.md#template); capture `{enforcement_findings_path}`
- When `{enforcement_finding_count}` is zero: leave `{enforcement_findings_path}` empty
