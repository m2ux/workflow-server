---
metadata:
  version: 1.1.1
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

The list with this case's outcome appended: whether the case wrote every Contract field, the plan path, whether the check held, and the field names it found absent.

## Protocol

### 1. Record Outcome

- Append this case to `{case_outcomes}` from `{contract_complete}`, `{contract_check_held}`, `{contract_check_missing}`, and `{plan_path}`
