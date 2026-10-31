# Standalone Body

Populates one standalone issue body.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Epic Issue Body](epic-issue-body.md)

## Operations

### *Populate* Standalone Body

One standalone issue body from its supplied scope.

**Inputs:** Problem, design, criteria, open questions and output path.

- Populate the body from the [Template](#template) at the supplied output path.
  - The title must meet the shared [Titles](issue-body.md#titles) conditions.
  - The Problem and Proposal must meet [Problem and Proposal](issue-body.md#problem-and-proposal).
  - All populated fields must meet [Fields](#fields), including the required [Sections](#sections).

### *Revise* Standalone Body

One standalone body with its confirmed boundary integrated.

**Inputs:** Current body, confirmed content and boundary decisions, and output path.

1. Populate the body through [Populate Standalone Body](#populate-standalone-body), folding any Non-Goals into Proposal as a closing boundary.
2. Return the revised file for publication.

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
