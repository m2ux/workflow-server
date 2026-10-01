---
name: claim-report
description: Template and rules for the audit specimen report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# Claim Report Guide

## What this guide is for

The shape of `audit-specimen-report.md` and what each section may claim. A reader opens that document to answer three questions: whether the re-audit records no finding, whether the author load set equals the listing, and whether the ledger has a row for every canon unit.

## Template

```markdown
# Audit Specimen Report

## Author load set

| Listed | Used |
|--------|------|
| | |

## Ledger

| Unit | walked or not-applicable | Excluding wording |
|------|--------------------------|-------------------|

## Findings

The first audit's findings, then the re-audit count.

## Re-audit count

One number.
```

## Rules

### listed-equals-used

The two columns of the first table name the same units, in the same order.

### every-unit-has-a-row

The ledger has one row for every canon unit at the commit walked. A `not-applicable` row quotes the unit's own wording that excludes the subject file.

### the-reaudit-count-is-zero

The re-audit count is zero. The findings section keeps the first audit's findings, including the planted sentence.
