# Standalone Body

Populates one standalone issue body.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Epic Issue Body](epic-issue-body.md)

## Operations

### Populate Standalone Body

One standalone issue body from its supplied scope.

#### 1. Populate Standalone Template

- Populate the [Template](#template) from [Issue Context](#issue-context "○") at the destination in [Output Body](#output-body "○").
- The title must meet the shared [Titles](issue-body.md#titles) conditions and the standalone [Titles](#titles).
- The Problem and Proposal must meet [Problem and Proposal](issue-body.md#problem-and-proposal).
- All populated fields must meet [Fields](#fields).

#### 2. Provide Populated Standalone Body

Provide the populated [Output Body](#output-body "●") for publication.

### Revise Standalone Body

One standalone body with its confirmed boundary integrated.

#### 1. Apply Confirmed Boundary

Apply [Populate Standalone Body](#populate-standalone-body "ƒ") to [Current Body](#current-body "○") with [Confirmed Boundary](#confirmed-boundary "○"), folding any Non-Goals into Proposal as a closing boundary and writing to [Output Body](#output-body "○").

#### 2. Provide Revised Body

Provide the revised [Output Body](#output-body "●") for publication.

## Fields

### Template

````markdown
## Overview

{{One paragraph: what this issue asks for and why.}}

## Problem

{{The friction as it is now. Bullets for distinct facets, sub-bullets for several items.}}

## Proposal

{{The design, in bullets or paragraphs, each opening with a bold statement, and its body on the next line.}}

## Acceptance Criteria

- [ ] **AC1.** {{An end state of one invariant. It ends by naming its instrument.}}

## Open Questions

- {{An undecided point the work cannot start without. Resolve every one before the work starts, then delete the section.}}

## References

- **R1.** [{{Title}}]({{URL}}) — {{What the reader finds there. Delete the section when there is none.}}
````

### Titles

- The title is `Name: Subtitle`, with no prefix.
- A standalone issue carries no `type:*` label.

### Sections

- A standalone issue has the [epic issue body](epic-issue-body.md)'s sections without the Work Breakdown table.

### Issue Context

The supplied problem, design, criteria and open questions for the standalone issue.

### Current Body

The supplied current complete standalone body.

### Confirmed Boundary

The confirmed content and boundary decisions for this body.

### Output Body

The supplied local destination for the complete body.
