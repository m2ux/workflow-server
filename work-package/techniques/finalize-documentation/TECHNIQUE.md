---
metadata:
  version: 1.2.1
---

## Capability

The documentation a closing work package leaves behind, and the planning-folder context every operation here writes into.

## Inputs

### adr

*(optional)* The [Architecture Decision Record](../../resources/architecture-review.md#adr-template) created for this work package, if one exists

### test_plan

The [test plan](../../resources/test-plan.md#test-plan-structure) artifact for this work package

### planning_folder_path

Path to the planning folder holding the test plan and where the completion document is created

### pr_number

The merged PR number, cross-referenced when recording the ADR implementation outcome

## Outputs

### completion_document

[Close-out summary](../../resources/complete-wp-guide.md#template) of delivered work, test coverage, and deferred items


## Rules

### completion-record-is-final-state

`COMPLETE.md` records the delivered state — what was built, tested, and deferred — and any post-merge change is carried into it rather than left beside it.
