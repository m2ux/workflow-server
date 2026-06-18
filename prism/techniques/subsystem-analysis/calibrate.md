---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
---

## Capability

Assign an optimal, diversity-maximizing prism to each subsystem via a calibration worker

## Protocol

### 1. Calibrate

- Load subsystem calibration resource (63) ([subsystem-calibration](../../resources/subsystem-calibration.md))
- Send prism catalog + subsystem summaries to calibration worker
- Parse JSON assignments into the subsystem-to-prism map — fallback to L12 for unassigned subsystems
- Prism assignments MUST maximize diversity — the calibration prompt enforces this

## Outputs

### subsystem_assignments

Map of subsystem to assigned prism.
