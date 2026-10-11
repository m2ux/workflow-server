---
metadata:
  version: 1.0.0
---

## Capability

Read what the roster asked of each checkout and what the readiness run answered, confirm the refused name left its checkout where the earlier pin put it, and write the one document the run leaves behind.

## Inputs

### checkout_pins

The roster the run walked — one entry per pin, carrying the worktree, the name, and the form it was expected to resolve as.

### checkout_readiness

What the run answered, one entry per roster entry in the same order — the commit landed and the form the name resolved as, or the refusal.

### left_checkout

The worktree the refused name addressed, whose head is read back.

## Outputs

### conformance_report

What the run did, shaped by [Template](../resources/conformance-report.md#template).

#### artifact

`git-pin-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Put Asked Beside Landed

- Take `{checkout_pins}` and `{checkout_readiness}` in their shared order and write one row per pin: the worktree, the name, the form expected, and either the commit landed with the form it resolved as or the refusal. `conformance-report.expected-beside-landed` governs what a row may omit, and `conformance-report.a-gap-is-written-as-a-gap` what a missing kind owes.

### 2. Read the Refused Checkout Back

- `git -C {left_checkout} rev-parse HEAD`, held against the commit the branch pin on that same worktree landed in `{checkout_readiness}`. `conformance-report.a-refusal-leaves-a-commit-to-check` governs what the closing paragraph says about the two.

### 3. Write the Report

- Write `{conformance_report}` to `{planning_folder_path}` following [Template](../resources/conformance-report.md#template), with the [Rules](../resources/conformance-report.md#rules) governing what each section may claim.
