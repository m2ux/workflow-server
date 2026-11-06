# Proposal Body

Populates one proposal body.

## Operations

### Validate Proposal Body

The body's local format and field findings.

#### 1. Validate Kind Conditions

Apply [Validate Issue Body](issue-body.md#validate-issue-body "ƒ") to [Proposal Record](#proposal-record) against local [Fields](#fields), using the supplied related evidence and [Output Body](#output-body), proposal field conditions and required title and label metadata.

#### 2. Provide Local Findings

Provide the corrected [Output Body](#output-body) and [Validation Findings](#validation-findings), including the mechanical diff and unresolved findings.

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

The proposal body's Problem prose section.

- A Problem must meet [Problem and Proposal](issue-body.md#problem-and-proposal).

### Goal

- Each clause is an outcome someone could observe.
- A clause does not describe the change.

### Non-Goals

- One succinct sentence each on what the proposal does not do.
- A non-goal names no initiative, epic, task or issue, and no owner.

### Sections

- Overview, Problem, Goal and Non-Goals are present in that order. References follows when it has content.

### Proposal Context

The confirmed problem, evidence, goal clauses and boundary supplied for this proposal.

### Proposal Record

The supplied current proposal issue JSON.

### Output Body

The supplied local destination for the complete body.

### Validation Findings

The corrected body, mechanical diff and unresolved format or field findings.
