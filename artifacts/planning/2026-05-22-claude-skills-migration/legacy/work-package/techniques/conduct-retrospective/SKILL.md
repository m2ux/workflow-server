---
name: conduct-retrospective
description: Conduct a retrospective on the completed work package.
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

### planning-folder-path

Path to planning folder for context

### pr-number

PR number for status checking

## Protocol

### 1. Capture History

- If metadata repository exists, capture session history
- History is private — never committed to the repository

### 2. Conduct Retrospective

- Count total user messages; separate checkpoint responses from non-checkpoint interactions (clarifications, corrections, process questions, frustration signals, feature requests, skip requests)
- Categorize non-checkpoint messages by signal type and map to specific workflow sections
- Identify root causes and determine pattern frequency across categories
- Formulate prioritized recommendations: high (repeated corrections, frustration), medium (single clarifications), low (edge cases)
- Create workflow-retrospective.md using the [workflow-retrospective](../../resources/workflow-retrospective/SKILL.md) template

### 3. Update Status

- After PR merged, update work package plan status
- Record final outcome in planning artifacts

### 4. Select Next

- Identify next work package if applicable
- Prepare context for transition

## Outputs

### retrospective-document

Workflow retrospective with lessons learned

- **artifact**: `workflow-retrospective.md`
- **what_worked**: What went well
- **improvements**: What could improve
- **lessons_learned**: Lessons for future sessions

## Rules

### retrospective-honest

Retrospective should be honest about what worked and what didn't — avoid generic positive statements

### skip-if-trivial

Skip retrospective if: only checkpoint responses occurred (no clarifications, corrections, or process questions), OR work package was trivial (<30 min, single task).

## Errors

### pr_not_merged

**Cause:** PR has not been merged yet

**Recovery:** Wait for merge or check if review feedback needs addressing first
