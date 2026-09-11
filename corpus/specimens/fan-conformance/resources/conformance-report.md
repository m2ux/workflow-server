---
name: conformance-report
description: Template and rules for the fan conformance report, the one document a run leaves behind.
metadata:
  version: 2.0.0
  order: 1
---

# Fan Conformance Report Guide

## What this guide is for

The shape of `fan-conformance-report.md` and what each section may claim. A reader opens that document to answer one question — did each branch run in a context of its own, and did the branches of a fan overlap in time — so every section is evidence for that and nothing else.

A second reader opens it to learn what the grammar can express, so the report also names which part of that grammar each fan stands for. That is why the first table carries the destination's written form beside its measurement.

## Template

```markdown
# Fan Conformance Report

> {component_path} · {run_started_at}

## What ran

| Fan | Form | Branches opened | Slots filled |
|-----|------|-----------------|--------------|
| plan-conformance.planned | a list naming two activities and fanning a third over a collection | 4 | |
| choose-probes.chosen | one activity per element | | |
| open-notes.opened | one activity per element, each in a checkout of its own | | |

## Forms the run exercised

One row per part of the destination grammar this run reached, so a reader can see which parts have been measured and which have not.

| Form | Where | Reached |
|------|-------|---------|
| A list member written as a bare activity id | plan-conformance.planned | |
| A list mixing bare ids with an instance fan | plan-conformance.planned | |
| One activity over a collection | choose-probes.chosen | |
| A member bounded by its own `maxInstances` | plan-conformance.planned | |
| A collection reached at a dotted path | plan-conformance.planned | |
| Elements that are plain strings | plan-conformance.planned | |
| Elements that are objects carrying an `id` | choose-probes.chosen, open-notes.opened | |
| A fan seeded by the call that enters it | plan-conformance.planned | |
| A convergence that opens a fan of its own | choose-probes | |
| An exit routing past a fan whose collection is empty | open-notes.nothing-to-note | |
| Instances committing in checkouts of their own | open-notes.opened | |

## Identity

One row per branch. A slot reporting a designator other than the one its unit was handed is a mismatch, and a mismatch is stated as a mismatch. A branch from a bare member reports its own activity id, so its row is filled the same way as a fanned one.

| Fan | Unit id | Designator the slot reports | Agree |
|-----|---------|-----------------------------|-------|

## Overlap

One row per branch, every fan, in container order.

| Fan | Branch | Started | Finished | Duration |
|-----|--------|---------|----------|----------|

| Fan | Wall clock | Sum of branch durations | Difference |
|-----|------------|-------------------------|------------|

**Reading:** [batch or queue, per fan, with the interval evidence that says which]

For the mixed destination, say whether the branches from its bare members overlapped the branches from its fanned member. A destination whose members run side by side within each kind but in sequence between them is a queue wearing a batch's shape, and the interval table is where that shows.

## Isolation

One row per note writer, from `{note_targets}` and `{merge_report}`. Empty of rows where the run routed past the writers, which is stated as the route taken rather than left blank.

| Note | Directory | Branch | Commit | Merged |
|------|-----------|--------|--------|--------|

**Reading:** [whether each writer committed on a branch of its own and whether every branch is accounted for]

## What the surveys found

[Three short paragraphs — the file survey's shape, the history survey's movement, the tree survey's per-root depth. Present so the run has a product, not because the report is about them.]

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

The survey section stays to three paragraphs, one per survey. The run's product is the evidence about the routing; the surveys exist so the branches have real work to do, and a report that grows a findings section has changed what it is for.

### a-form-not-reached-is-recorded-as-not-reached

The forms table lists every part of the destination grammar, including parts this run did not reach. A form is marked reached only where the run opened it, and a route past a fan leaves the forms that fan carries unreached. A table trimmed to what happened reads as full coverage, which is the one claim this report cannot make on its own.

### a-container-is-read-by-its-order

Every table that pairs a unit with a slot pairs them by position, because the container holds one slot per branch in collection order. Matching on a value inside the slot instead would find the right row even when the routing put it in the wrong place, which is the failure these tables exist to catch.
