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

Lead with the code; follow it with at most three lines of prose (what was skipped, and the trigger that would justify adding it). Produce no unrequested explanation, summary, or documentation. If the explanation runs longer than the code, delete the explanation — every paragraph defending a simplification is complexity smuggled back in as prose. Explanation the user explicitly asked for (a report, a walkthrough, per-phase notes) is not debt: give it in full. The rule targets only *unrequested* prose, not requested artifacts.

### take-higher-rung

When two [rungs](../../resources/the-ladder.md#rungs) of the ladder both solve the problem, take the higher (lazier) one. Deletion is preferred over addition; no abstraction is introduced before a second concrete case exists.

### deletion-over-addition

The leanest change that satisfies the task and clears the [safety floor](../../resources/the-ladder.md#safety-floor) wins. Removing code, dependencies, or indirection counts as progress; adding any of them must earn its place against a present, concrete need. Prefer boring over clever — clever is what someone decodes at 3am — and the fewest files possible.

### shortest-diff-once-understood

The shortest diff wins only once the problem is understood. The smallest change in the wrong place is not lazy; it is a second bug.

### no-scaffolding-for-later

No boilerplate or scaffolding built "for later" — later can scaffold for itself.

### correct-on-edge-cases

When two options at the same rung are equal in size, take the one that is correct on edge cases. Lazy means writing less code, not picking the flimsier algorithm.

### report-only-no-apply

The review, audit, debt-harvest, and gain operations report only and apply nothing — they list findings into their artifact and change no code. Only `apply-ladder` changes code; the read-only operations never edit the tree.
