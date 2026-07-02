---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.0
  order: 1
  legacy_id: 1
---

## Capability

Compute finding severity using the Impact x Feasibility rubric with calibrated examples

## Inputs

### merge_table

The canonical finding table to score, each finding carrying its title, evidence, and affected code location.

## Outputs

### scored_findings

The finding set annotated with per-finding Impact score, Feasibility score, computed severity level, and calibration crosscheck result.

## Protocol

### 1. Determine Impact

- For each finding in `{merge_table}`, determine the Impact score (1-4) with a one-sentence justification

### 2. Determine Feasibility

- Determine the Feasibility score (1-4) with a one-sentence justification
- Connection pool and infrastructure findings affecting consensus paths through routinely-accessible systems (RPC, p2p): Feasibility >= 3
- Panics triggered only by operator-provided invalid configuration (chain spec, config file): Feasibility = 2
- Conditions occurring under normal operation without attacker action (pruning, routine block production, standard configs): Feasibility = 4

### 3. Map To Severity

- Compute the average and map it to a severity level using the [severity-rubric](../resources/severity-rubric.md) scale, recording the result on each finding in `{scored_findings}`

### 4. Compare Calibration

- Compare against the calibration benchmark table in the [severity-rubric](../resources/severity-rubric.md) to verify the rating makes sense

### 5. Apply Crosscheck

- For each finding in `{scored_findings}` with Impact >= 3, apply the severity crosscheck procedure in the [severity-rubric](../resources/severity-rubric.md)

## Rules

### rubric-required

Severity MUST use the Impact x Feasibility rubric. Compare each finding against the calibration benchmark table in the [severity-rubric](../resources/severity-rubric.md) (and the [target-profile](../resources/target-profile.md) target-specific benchmarks if present) before finalizing. Do not assign severity intuitively.

### under-rating

Infrastructure and availability findings (pool sharing, SSL, genesis consistency, panics under normal operation) are systematically under-rated. Use the calibration benchmark table in the [severity-rubric](../resources/severity-rubric.md).

### over-rating

Configuration/toggle findings (mock data source, feature flags, InMemory keystore) are systematically over-rated. Use the calibration benchmark table in the [severity-rubric](../resources/severity-rubric.md).
