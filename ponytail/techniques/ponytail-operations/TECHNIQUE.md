---
metadata:
  version: 1.0.0
---

# Ponytail Operations

## Capability

Own the lean-coding capability — capture and trace the task, climb the lazy [ladder](../../resources/the-ladder.md#rungs) to the minimal solution that still clears the [safety floor](../../resources/the-ladder.md#safety-floor), review and audit for over-engineering, harvest the deliberate-simplification debt, and report the honest gain. Operations inherit the shared inputs and rules below.

## Inputs

### task_description

The coding task, change, or audit target to be made lean.

### target_path

Path to the code or repo under the lazy lens.

#### default

`.`

### lazy_intensity

Strictness of the lazy lens — `lite`, `full`, or `ultra`. A higher intensity widens the review and lowers the bar for flagging an over-engineered construct.

#### default

`full`

### pass_scope

Breadth of the pass — `change` (diff-scoped) or `repo` (whole-tree).

#### default

`change`

## Rules

### output-discipline

Lead with the code; follow it with at most three lines of prose (what was skipped, and the trigger that would justify adding it). Produce no unrequested explanation, summary, or documentation.

### take-higher-rung

When two [rungs](../../resources/the-ladder.md#rungs) of the ladder both solve the problem, take the higher (lazier) one. Deletion is preferred over addition; no abstraction is introduced before its third concrete caller exists.

### deletion-over-addition

The leanest change that satisfies the task and clears the [safety floor](../../resources/the-ladder.md#safety-floor) wins. Removing code, dependencies, or indirection counts as progress; adding any of them must earn its place against a present, concrete need.
