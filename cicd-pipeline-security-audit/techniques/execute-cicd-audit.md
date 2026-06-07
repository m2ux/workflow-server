---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Orchestrate a CI/CD pipeline security audit from scope setup through report generation, driving the phase sequence and activity transitions, dispatching scanner sub-agents, and enforcing phase gates while coordinating only — all detection and analysis is delegated to sub-agents.

## Inputs

### target_submodules

Comma-separated submodule paths or 'all'

### planning_folder_path

Path to the planning folder for artifacts

## Protocol

### 1. Phase 1 Setup

- Confirm each path in `{target_submodules}` exists and contains .github/workflows/
  - If no target submodules were specified or none are found, fail with an error listing the available submodules.
- Discover all workflow files (.yml and .yaml) across targets
- Initialize the `{planning_folder_path}` with [START-HERE.md](../resources/start-here.md)

### 2. Phase 2 Reconnaissance

- Classify all workflows by trigger type
- Map permission scopes and checkout patterns
- Assign scanner agents (one per submodule)

### 3. Phase 3 Primary Scan

- Dispatch all scanner agents concurrently
- Collect scanner outputs and verify dispatch completeness
- Dispatch verification agent (V) — check coverage
- Dispatch merge agent (M) — deduplicate and reconcile
  - If the merge agent reports Unaccounted > 0, HARD STOP and investigate the missing findings.
- Verify all assigned agents were dispatched before proceeding
  - If not all assigned scanners were dispatched, HARD STOP and re-dispatch the missing agents.

### 4. Phase 4 Report

- Apply severity scoring using the Impact x Exploitability [severity rubric](../resources/cicd-severity-rubric.md#severity-matrix)
- Verify coverage gate
- Produce the final `{audit_report}` with remediation guidance

## Outputs

### audit_report

Complete CI/CD security [audit report](../resources/cicd-audit-report-template.md#cicd-audit-report-template)

#### findings

All findings with pattern ID, severity, source, sink, remediation

#### coverage

Workflow file coverage verification

#### methodology

Audit methodology and pattern catalog version

## Rules

### orchestrator-discipline

Coordinate only — never analyze workflow files directly

### phase-gates

Enforce exitAction gates before advancing phases
