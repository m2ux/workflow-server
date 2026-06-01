---
name: orchestrate-package-execution
description: Trigger and manage work-package workflow instances for each planned package.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Trigger and manage work-package workflow instances for each planned package in priority order

## Inputs

### remaining-packages

Ordered list of packages not yet started, derived from priority order

### planning-folder-path

Path to the planning folder for status updates

### priority-order

Full priority order for reference

## Protocol

### 1. Initialize Iteration

- Derive remaining_packages from priority_order minus completed_packages
- Set overall_progress to '{completed}/{total} complete'

### 2. Select Package

- Take the first package from remaining_packages
- Set current_package to the selected package

### 3. Trigger Workflow

- Use attached [workflow-triggering-protocol](../resources/workflow-triggering-protocol.md) (workflow-triggering-protocol) for the triggering procedure
- Call get_workflow('work-package') to load the work-package workflow
- Pass context: package name, scope from plan document, dependencies, planning folder path

### 4. Update Status

- After work-package workflow completes, update START-HERE.md status table
- Mark completed package as done, add PR link
- Update overall_progress counter
- Update START-HERE.md status after every completed package

### 5. Check Remaining

- Remove completed package from remaining_packages, add to completed_packages
- If remaining_packages is not empty, continue the loop with the next package

## Outputs

### implementation-status

Updated roadmap status reflecting completed packages

- **completed_packages**: List of completed package names
- **remaining_packages**: List of remaining package names
- **overall_progress**: Progress indicator (e.g., '3/7 complete')

## Rules

### one-at-a-time

Execute one work-package workflow at a time — do not parallelize

### context-passing

Pass package context (scope, dependencies, planning path) to each work-package workflow instance

### handle-failures

If a package fails, mark it and continue with the next independent package

## Errors

### workflow_trigger_failure

**Cause:** Unable to load or start the work-package workflow

**Recovery:** Verify work-package workflow exists via list_workflows, then retry

### package_blocked

**Cause:** Next package depends on an incomplete package

**Recovery:** Skip to the next independent package and note the blocked package
