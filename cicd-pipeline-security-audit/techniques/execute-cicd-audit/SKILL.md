---
name: execute-cicd-audit
description: Top-level orchestration skill for the CI/CD pipeline security audit workflow. Defines the phase sequence, agent dispatch model, and coordination responsibilities. The orchestrator loads this skill and uses it to drive activity transitions, dispatch scanner sub-agents, and enforce phase gates. The orchestrator coordinates only — all detection and analysis is delegated to sub-agents.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

# Execute Cicd Audit

## Capability

Orchestrate CI/CD pipeline security audit from scope setup through report generation

## Inputs

### target-submodules

Comma-separated submodule paths or 'all'

### planning-folder

Path to the planning folder for artifacts

## Protocol

### 1. Phase 1 Setup

- Confirm target submodules exist and contain .github/workflows/
- Discover all workflow files (.yml and .yaml) across targets
- Create planning folder with [START-HERE.md](../../resources/start-here/SKILL.md)

### 2. Phase 2 Reconnaissance

- Classify all workflows by trigger type
- Map permission scopes and checkout patterns
- Assign scanner agents (one per submodule)

### 3. Phase 3 Primary Scan

- Dispatch all scanner agents concurrently
- Collect scanner outputs and verify dispatch completeness
- Dispatch verification agent (V) — check coverage
- Dispatch merge agent (M) — deduplicate and reconcile
- Verify all assigned agents were dispatched before proceeding

### 4. Phase 4 Report

- Apply severity scoring using Impact x Exploitability rubric
- Verify coverage gate
- Produce final audit report with remediation guidance

## Outputs

### audit-report

Complete CI/CD security audit report

- **findings**: All findings with pattern ID, severity, source, sink, remediation
- **coverage**: Workflow file coverage verification
- **methodology**: Audit methodology and pattern catalog version

## Rules

### orchestrator-discipline

Coordinate only — never analyze workflow files directly

### phase-gates

Enforce exitAction gates before advancing phases

## Errors

### no_targets

**Cause:** No target submodules specified or found

**Recovery:** Fail with error listing available submodules

### dispatch_incomplete

**Cause:** Not all assigned scanners were dispatched

**Recovery:** HARD STOP — re-dispatch missing agents

### reconciliation_failed

**Cause:** Merge agent reported Unaccounted > 0

**Recovery:** HARD STOP — investigate missing findings
