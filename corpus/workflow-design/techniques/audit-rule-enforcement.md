---
metadata:
  version: 1.6.0
---

## Capability

Structure-backed-constraint audit of every `rules[]` entry for text-only critical rules.

## Outputs

### enforcement_findings

Text-only rules found — each with its file, rule content, whether it is critical, and the structural mechanism `structure-backed-constraints` prescribes for it.

#### artifact

`enforcement-findings.md`

#### audience

`human`

### enforcement_finding_count

Count of entries in `{enforcement_findings}`.

## Protocol

### 1. Load Criterion

- Load [Execution](/canon/resources/anti-patterns.md#execution), the section holding `structure-backed-constraints` — sole Detect / Do not flag / Fix source for this pass
- [Encode Constraints as Structure](/canon/resources/design-principles.md#9-encode-constraints-as-structure) is the framing principle; the anti-pattern is the operative criterion

### 2. Apply structure-backed-constraints

- Walk every `rules[]` entry in `workflow.yaml` and activity files
  > Walk technique `## Rules` too when the entry's scope implies it.
- Apply Detect / Do not flag / Fix from `structure-backed-constraints`
- For each finding record into `{enforcement_findings}`: file, rule content, criticality, recommended structural mechanism

### 3. Assemble Findings

- Set `{enforcement_finding_count}` to the number of findings
- Assemble `{enforcement_findings}` at the shape [Template](../resources/findings-satellite.md#template) declares
