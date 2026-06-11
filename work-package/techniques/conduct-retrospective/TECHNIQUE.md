---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 19
  legacy_id: 19
---

# Conduct Retrospective

## Capability

Conduct workflow retrospective to capture lessons learned and prepare for next work package

## Inputs

### pr_number

The PR number for this work package — its merge gates the status update and the final outcome record

### planning_folder_path

Path to the planning folder where the final outcome and retrospective are recorded

## Outputs

### retrospective_document

Workflow [retrospective](../../resources/workflow-retrospective.md#output-document-template) with lessons learned

#### retrospective_artifact

`workflow-retrospective.md`

## Rules

### retrospective-honest

Retrospective should be honest about what worked and what didn't — avoid generic positive statements

### skip-if-trivial

Skip retrospective if: only checkpoint responses occurred (no clarifications, corrections, or process questions), OR work package was trivial (<30 min, single task).

### history-private

Session history is private and is never committed to the repository.
