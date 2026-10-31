# Proposal Body

Populates one proposal body.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)

## Operations

### *Populate* Proposal Body

One proposal body from a confirmed problem and goal.

**Inputs:** Confirmed problem, evidence, goal clauses, boundary and output path.

- Populate the body from the [Template](#template) at the supplied output path.
  - The title must meet the shared [Titles](issue-body.md#titles) conditions.
  - The Problem must meet the shared [Problem and Proposal](issue-body.md#problem-and-proposal) conditions.
  - All populated fields must meet [Fields](#fields), including the required [Sections](#sections).

### *Validate* Proposal Body

The body's local format and field findings.

**Inputs:** Proposal issue JSON and output file.

1. Call [Validate Issue Body](issue-body.md#validate-issue-body) with the current body, local [Fields](#fields), supplied related evidence and output file, using the proposal field conditions and required title and label metadata.
2. Return the corrected body, mechanical diff and unresolved findings for the caller.

## Fields

### Template

````markdown
## Overview

{{One paragraph: the problem this proposal scopes. Name the goal the clauses state.}}

## Problem

{{One sentence on the friction, then one bullet per facet. Each bullet opens with a bold statement, and its body is on the next line.}}

- **{{Facet}}.**
  {{The evidence.}}

## Goal

- {{A clause: an outcome someone could observe. Not a description of the change.}}

## Non-Goals

- {{One succinct sentence on what this proposal does not do. It names no initiative, epic, task or issue, and no owner.}}

## References

- **R1.** [{{Title}}]({{URL}}) — {{What the reader finds there. Delete the section when there is none.}}
````

### Titles

- The title is `[P00] Name: Subtitle`.
- The label is `type:proposal`.
- `P` is the proposal number. Proposals count from `00`.

### Problem

- A Problem meets [Problem and Proposal](issue-body.md#problem-and-proposal).

### Goal

- Each clause is an outcome someone could observe.
- A clause does not describe the change.

### Non-Goals

- One succinct sentence each on what the proposal does not do.
- A non-goal names no initiative, epic, task or issue, and no owner.

### Sections

- Overview, Problem, Goal and Non-Goals are present in that order. References follows when it has content.
