---
metadata:
  version: 1.2.2
---

## Capability

The documentation a closing work package leaves behind, and the planning-folder context every technique here writes into.

## Inputs

### adr

*(optional)* The [Architecture Decision Record](../../resources/adr-guide.md#template) created for this work package, if one exists

### test_plan

*(optional)* The [test plan](../../resources/test-plan-guide.md#test-plan-structure) artifact for this work package. Absent when the run has not written one.

### planning_folder_path

Path to the planning folder holding the test plan and where the completion document is created

### pr_number

The merged PR number, cross-referenced when recording the ADR implementation outcome

## Outputs

### completion_document

[Close-out summary](../../resources/close-out-guide.md#template) of delivered work, test coverage, and deferred items


## Rules

### completion-record-is-final-state

`COMPLETE.md` records the delivered state — what was built, tested, and deferred — and any post-merge change is carried into it rather than left beside it.
