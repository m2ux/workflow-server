---
metadata:
  version: 1.0.0
---

## Capability

Separate the changed symbols a test reaches from the ones no test reaches, and from the ones whose tests were written against a shape the change moved.

## Inputs

### change_report

changed symbols, changed files, affected execution flows, risk level

### symbol_context_reports

One entry per changed symbol: its incoming calls, outgoing calls, and process membership.

## Outputs

### coverage_gaps

Changed symbols no test file calls.

### update_candidates

Changed symbols a test file calls against a signature or behaviour the change moved.

## Protocol

### 1. Partition By Test Caller

- Read each entry of `{symbol_context_reports}` for incoming calls whose file sits in a test location — a `tests/` tree, a `__tests__` folder, or a filename carrying `.test.` or `.spec.`.
- Take every symbol with no such caller into `{coverage_gaps}`.
  > A symbol reached only through a macro body or a type position carries no edge at all — edges-the-parser-cannot-see — so grep for its name across the test tree before recording the gap, and say which instrument answered.

### 2. Judge The Callers That Remain

- For each symbol a test does call, read the change `{change_report}` records against the test's expectation of it: a moved signature, a renamed field, a branch the test never reaches.
- Take every symbol whose test no longer exercises what the change made into `{update_candidates}`, carrying the test file that needs the edit.
