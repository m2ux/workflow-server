---
metadata:
  version: 1.0.0
---

## Capability

Read what both passes produced and write what the run did — which measurement each site supplied, which targets each pass walked, and how each pass ended.

## Inputs

### entry_counts

What the counting pass measured, one entry per target it reached, in the order it walked them.

### size_measurements

What the sizing pass measured, one entry per target it reached, in the order it walked them.

### initial_target

The target both passes opened with.

## Outputs

### conformance_report

What the run did, shaped by [Template](../resources/conformance-report.md#template).

#### artifact

`routine-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Name What Each Site Supplied

- Fill the first table from the two activities' own bindings: the counting site supplies [count-entries](./count-entries.md) and the sizing site supplies [measure-size](./measure-size.md), and each row carries the target count and measurement count that site produced. `conformance-report.say-which-measurement-each-site-supplied` governs what the column may omit.

### 2. Put The Two Readings Side By Side

- Take `{entry_counts}` and `{size_measurements}` in their own orders and write one row per target, carrying each pass's reading for it. A target only one pass reached keeps its row, per `conformance-report.a-gap-is-written-as-a-gap`.

### 3. Say How Each Pass Ended

- Write the closing paragraph from the two passes' lengths against the iteration bound the run declares, opening from `{initial_target}`. `conformance-report.the-bound-is-an-outcome-worth-naming` governs which endings have to be distinguished.

### 4. Write The Report

- Write `{conformance_report}` to `{planning_folder_path}` following [Template](../resources/conformance-report.md#template), with the [Rules](../resources/conformance-report.md#rules) governing what each section may claim.
