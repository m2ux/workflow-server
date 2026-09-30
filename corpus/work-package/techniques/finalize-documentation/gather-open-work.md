---
metadata:
  version: 1.0.0
---

## Capability

The work still open at close-out that no register entry holds, sorted into in-task follow-ups and out-of-scope deferrals.

## Inputs

### follow_ups_register

The in-task follow-ups register, named by its bare filename.

#### default

`follow-ups.json`

### deferred_items_register

The out-of-scope deferrals register, named by its bare filename.

#### default

`deferred-items.json`

## Outputs

### follow_ups

The in-task items still open and held by no follow-ups entry, each carrying what remains, where it surfaced, and what happens next. Empty where there are none.

### deferred_items

The out-of-scope items still open and held by no deferred-items entry, each carrying what was set aside, where, and why. Empty where there are none.

## Protocol

### 1. Find Unheld Open Work

- Read the plan's tasks, the validation verdict and the success criteria in `{planning_folder_path}` for work not done.
- Read `{follow_ups_register}` and `{deferred_items_register}` where they exist, and drop every item an entry already holds.

### 2. Sort the Remainder

- Emit each remaining item that must finish inside this work package as a `{follow_ups}` entry, and each set aside beyond it as a `{deferred_items}` entry.
