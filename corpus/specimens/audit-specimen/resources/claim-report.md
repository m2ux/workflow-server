---
name: claim-report
description: Template and rules for the audit specimen report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# Claim Report Guide

## What this guide is for

The shape of `audit-specimen-report.md` and what each section may claim. The attest script is what decides the three claims. The report quotes its verdict and the files it read.

## Template

```markdown
# Audit Specimen Report

## Verdict

The attest script's stdout.

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

The listing headings and the author headings are the same set. Each author row records `applied` or a finding. The author file is the application record.

### every-unit-has-a-row

The ledger ids are the inventory command's ids. A `not-applicable` row quotes the unit's own wording that excludes the subject file. A `walked` row records `applied` or a finding.

### one-round-below-baseline

`specimen-rounds.txt` holds `1`. `baseline-rounds.txt` holds the baseline audit's round count. The specimen count is lower, and the re-audit findings file is empty.
