---
metadata:
  version: 1.1.1
---

## Capability

Add the symbols and flows a diff touches to the task record.

## Inputs

### task_record

The task record so far: the approach taken, residual ambiguity, tests left unrun, and any high or critical blast-radius rating with the symbols it names.

### change_report

The symbols the diff touches, the flows they reach, and the risk level of that set.

### target_symbol

The function, class, or method this task changes.

## Outputs

### task_implementation

The task record: the approach, residual ambiguity, tests left unrun, and any high or critical blast-radius rating from the input record, plus the symbols and flows the diff touches and whether those symbols are the primary edit target.

## Protocol

### 1. Record the Scope

- Add the symbols and flows in `{change_report}` to `{task_record}`, and record whether `{target_symbol}` is the primary edit target. The result is `{task_implementation}`.
