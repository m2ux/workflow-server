---
name: conformance-report
description: Template and rules for the routine conformance report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# Routine Conformance Report Guide

## What this guide is for

The shape of `routine-conformance-report.md` and what each section may claim. A reader opens that document to answer one question — did one run serve two sites, each under the measurement its own site supplied — so every section is evidence for that and nothing else.

The measurements themselves are the run's excuse for having work to do. What they found is worth a column and nothing more.

## Template

```markdown
# Routine Conformance Report

> {component_path} · {initial_target}

## What each site supplied

| Site | Measurement supplied | Targets walked | Measurements recorded |
|------|----------------------|----------------|-----------------------|
| count-pass | | | |
| size-pass | | | |

## What the two passes measured

One row per target, with both passes' readings beside each other. A target one pass reached and the other did not is a row with a gap, written as a gap.

| Target | Entries | Bytes |
|--------|---------|-------|

## What the run did

One paragraph. Say how many passes each site took, whether both sites walked the same targets, and whether either pass stopped at the iteration bound rather than at a measurement naming nothing to follow.
```

## Rules

### say-which-measurement-each-site-supplied

The first table's second column is the whole point of the document: two sites, one run, and a different measurement at each. A report that names the run and not the arguments describes something a copied step list would also produce.

### a-gap-is-written-as-a-gap

Where one pass reached a target the other did not, the row carries the reading it has and an empty cell for the one it does not. Do not drop the row, and do not carry a reading across from the other pass: the two passes walking different targets is a finding about the run, and either treatment hides it.

### the-bound-is-an-outcome-worth-naming

A pass that ran out at the iteration bound reached a different end from one whose measurement named nothing to follow. Say which, in the closing paragraph. The bound stopping a walk is the run behaving as declared; it is also evidence the measurement kept naming targets, which is what a reader is deciding about.
