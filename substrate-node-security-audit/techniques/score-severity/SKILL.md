---
name: score-severity
description: Use resource 02 (severity rubric) for the two dimensions and required output format. Use resource 08 (severity calibration) for full rubric scales, calibration examples, severity crosscheck procedure, and bias correction. Use resource 06 (target profile) when present for target-specific benchmarks.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.0
  order: 1
  legacy_id: 1
---

# Score Severity

## Capability

Compute finding severity using the Impact x Feasibility rubric with calibrated examples

## Protocol

### 1. Determine Impact

- For each finding, determine the Impact score (1-4) with a one-sentence justification

### 2. Determine Feasibility

- Determine the Feasibility score (1-4) with a one-sentence justification
- Connection pool and infrastructure findings affecting consensus paths through routinely-accessible systems (RPC, p2p): Feasibility >= 3
- Panics triggered only by operator-provided invalid configuration (chain spec, config file): Feasibility = 2
- Conditions occurring under normal operation without attacker action (pruning, routine block production, standard configs): Feasibility = 4

### 3. Map To Severity

- Compute average and map to severity using the scale ([severity-rubric](../../resources/severity-rubric/SKILL.md)/08)

### 4. Compare Calibration

- Compare against calibration examples ([severity-calibration](../../resources/severity-calibration/SKILL.md)) to verify the rating makes sense

### 5. Apply Crosscheck

- For each finding with Impact >= 3, apply the severity crosscheck procedure in [severity-calibration](../../resources/severity-calibration/SKILL.md)

## Rules

### rubric-required

Severity MUST use the Impact x Feasibility rubric. Compare each finding against the calibration examples in [severity-calibration](../../resources/severity-calibration/SKILL.md) (and the [target-profile](../../resources/target-profile/SKILL.md) target-specific benchmarks if present) before finalizing. Do not assign severity intuitively.

### under-rating

Infrastructure and availability findings (pool sharing, SSL, genesis consistency, panics under normal operation) are systematically under-rated. Use calibration examples in [severity-calibration](../../resources/severity-calibration/SKILL.md).

### over-rating

Configuration/toggle findings (mock data source, feature flags, InMemory keystore) are systematically over-rated. Use calibration examples in [severity-calibration](../../resources/severity-calibration/SKILL.md).
