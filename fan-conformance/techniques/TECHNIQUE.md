---
metadata:
  version: 1.0.0
---

## Capability

Shared inputs and invariants for the fan conformance operations — the cheap surveys each branch runs, and the record every branch keeps of its own interval so the report can say whether a batch overlapped.

## Inputs

### component_path

Path of the component being surveyed, relative to the host repository. `.` for a regular repository, the submodule path for a monorepo.

## Rules

### record-your-own-interval

Every operation that runs in a branch records the instant it began and the instant it finished, in its own output, as ISO 8601. A branch cannot see its siblings and must not guess at them: it reports only what it did and when, and the activity the branches converge on is where those intervals are compared.

### survey-cheaply

Each survey answers its question from directory listings and commit metadata, and reads no file contents. The run exists to exercise the routing, so a survey that costs more than the routing it demonstrates has changed what is being measured.

### one-directory-per-probe

A probe describes the one directory it was handed and no other. Reaching outside it would make the instance's context indistinguishable from a whole-component pass, which is the thing an instance of its own exists to avoid.

### report-what-ran-not-what-should

The report states what the record holds — which slots were filled, by which designator, over which interval. Where the record shows something the design does not expect, the report says so plainly rather than describing the design.
