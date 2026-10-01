---
metadata:
  version: 1.0.0
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### contract_complete

Whether the case wrote every Contract field.

### contract_check_held

Whether the check held.

### contract_check_missing

Fields the check found absent.

### plan_path

Path of the plan written for the case.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended.

## Protocol

### 1. Record Outcome

- Append one entry to `{case_outcomes}`: `{contract_complete}`, `{plan_path}`, `{contract_check_held}`, and `{contract_check_missing}`
