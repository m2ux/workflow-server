---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 19
  legacy_id: 19
---

## Capability

Conduct workflow retrospective to capture lessons learned and prepare for next work package

## Inputs

### planning-folder-path

Path to planning folder for context

### pr-number

PR number for status checking

## Protocol

### 1. Capture History

- If metadata repository exists, capture session history

### 2. Conduct Retrospective

- Count total user messages; separate checkpoint responses from non-checkpoint interactions (clarifications, corrections, process questions, frustration signals, feature requests, skip requests)
- Categorize non-checkpoint messages by signal type and map to specific workflow sections
- Identify root causes and determine pattern frequency across categories
- Formulate prioritized recommendations: high (repeated corrections, frustration), medium (single clarifications), low (edge cases)
- Create the retrospective-document using the [workflow-retrospective](../resources/workflow-retrospective.md) template

### 3. Update Status

- Once the PR identified by `pr-number` has merged, update the work package plan status
  - If the PR has not merged yet, wait for merge or check whether review feedback needs addressing first before updating status
- Record the final outcome in the planning artifacts under `planning-folder-path`

### 4. Select Next

- Identify next work package if applicable
- Prepare context for transition

## Outputs

### retrospective-document

Workflow [retrospective](../resources/workflow-retrospective.md#output-document-template) with lessons learned

#### artifact

`workflow-retrospective.md`

#### what_worked

What went well

#### improvements

What could improve

#### lessons_learned

Lessons for future sessions

## Rules

### retrospective-honest

Retrospective should be honest about what worked and what didn't — avoid generic positive statements

### skip-if-trivial

Skip retrospective if: only checkpoint responses occurred (no clarifications, corrections, or process questions), OR work package was trivial (<30 min, single task).

### history-private

Session history is private and is never committed to the repository.
