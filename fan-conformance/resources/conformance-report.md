---
name: conformance-report
description: Template and rules for the fan conformance report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# Fan Conformance Report Guide

## What this guide is for

The shape of `fan-conformance-report.md` and what each section may claim. A reader opens that document to answer one question — did each branch run in a context of its own, and did the branches of a fan overlap in time — so every section is evidence for that and nothing else.

## Template

```markdown
# Fan Conformance Report

> {component_path} · {run_started_at}

## What ran

| Fan | Form | Branches opened | Slots filled |
|-----|------|-----------------|--------------|
| plan-conformance.planned | several activities | 2 | |
| choose-probes.chosen | one activity per element | | |

## Identity

One row per branch. A slot reporting a designator other than the one its unit was handed is a mismatch, and a mismatch is stated as a mismatch.

| Fan | Unit id | Designator the slot reports | Agree |
|-----|---------|-----------------------------|-------|

## Overlap

One row per branch, both fans, in container order.

| Fan | Branch | Started | Finished | Duration |
|-----|--------|---------|----------|----------|

| Fan | Wall clock | Sum of branch durations | Difference |
|-----|------------|-------------------------|------------|

**Reading:** [batch or queue, per fan, with the interval evidence that says which]

## What the surveys found

[Two short paragraphs — the file survey's shape, the history survey's movement. Present so the run has a product, not because the report is about them.]

## Probes

| Probe | Directory | Why picked | Files | Subdirectories | Largest file |
|-------|-----------|------------|-------|----------------|--------------|

## Anything the record did not expect

[Empty slots, missing intervals, a branch start earlier than the run start, a designator mismatch, a duplicate directory. One line each, or "none".]
```

## Rules

### state-the-reading-not-the-design

Each section says what the record holds. Where the record shows a queue rather than a batch, the report says so — a queue is a correct outcome of the routing and describing it as a batch would make the one measurement the run exists for unreliable.

### a-mismatch-is-not-reconciled

Where a slot's reported designator differs from the id its unit was handed, both values are printed and the row is marked as disagreeing. Choosing one of them, or omitting the row, hides the only evidence that a branch was served a sibling's element.

### intervals-come-from-the-branches

Every instant in the overlap table is one a branch recorded in its own output. The activity writing this report does not time the branches: it did not run while they did, so any instant it reads from its own clock describes the convergence rather than the fan.

### empty-slots-are-reported

A slot with no values is a branch that did not report, and it appears in the tables as an empty row rather than being dropped. A table of only the branches that worked cannot show that one did not.

### the-surveys-are-not-the-subject

The survey section stays to two paragraphs. The run's product is the evidence about the routing; the surveys exist so the branches have real work to do, and a report that grows a findings section has changed what it is for.
