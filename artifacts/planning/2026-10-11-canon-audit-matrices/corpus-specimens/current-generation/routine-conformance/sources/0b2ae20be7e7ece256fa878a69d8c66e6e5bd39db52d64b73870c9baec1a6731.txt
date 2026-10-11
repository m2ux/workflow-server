---
metadata:
  version: 2.0.0
---

## Capability

Orchestrator contract for a CI/CD pipeline security audit: drive the scanner branches the graph opens, dispatch the verification and merge sub-agents, and enforce the phase, dispatch-completeness, coverage, and reconciliation gates that govern the audit.

## Rules

### orchestration-only

Coordinate dispatch and gate enforcement only; never analyze workflow files or produce findings directly. All detection is delegated to the scanner branches.

### verification-not-self-certified

A verification sub-agent (V) produces the gap report; the orchestrator never self-certifies completeness.

### merge-not-inline

A merge sub-agent (M) performs deduplication, cross-pattern correlation, and reconciliation; the orchestrator never performs the merge inline.

### reconciliation-gate

The merge sub-agent's reconciliation table MUST show zero unaccounted findings for every scanner; a non-zero count is a hard stop.

### coverage-gate

Every `.github/workflows/*.yml` and `.github/workflows/*.yaml` file in scope MUST be scanned; report generation blocks while any file is uncovered.
