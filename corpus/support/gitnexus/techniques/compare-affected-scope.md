---
metadata:
  version: 1.0.0
---

## Capability

Measure the execution flows a change touches against the flows it was meant to touch.

## Inputs

### change_report

changed symbols, changed files, affected execution flows, risk level

### requirements_scope

the processes / functional areas the work package is meant to touch

## Outputs

### scope_findings

Affected flows falling outside `{requirements_scope}`, each with the changed symbol that reaches it.

## Protocol

1. Take the affected execution flows from `{change_report}` and hold each against `{requirements_scope}`.
2. Collect every flow outside that scope into `{scope_findings}`, naming the changed symbol that reaches it so the reader can tell a deliberate widening from a change that spread.
   > A flow inside the scope is evidence of nothing on its own: `{requirements_scope}` names what the work was for, and a symbol may sit in an in-scope flow while the edit it carries serves another.
