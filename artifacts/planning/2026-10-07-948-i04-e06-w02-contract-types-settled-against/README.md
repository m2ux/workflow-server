# Contract Types Settled Against Filling Operations — October 2026

> Work item · Created 2026-10-07

## Executive Summary

A contract declares the values a step is handed, and an operation publishes the shape it fills them with. Where the two disagree, nothing says so: the step reads a field the operation never sends, and the run finds out by improvising past it. The declaration is the place a reader looks to know what a value holds, so a declaration that does not match its source is worse than none.

This work settles each declared value against the shape its filling operation publishes, and puts `check-operation-contract` in a state where it reports nothing against the corpus. Wiring that check into the standard sweep is the task after this one, which is why this one has to leave the corpus clean rather than merely measured.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W02](./w02.md) | The work item: what the task delivers, the friction it answers, the design, and the parts of the work |
| [Declarations](./declarations.md) | Every finding the check reports against the integration branch, the operation output behind it, the direction each value was settled in and why, and the files the edit touched |
| [Coverage](./coverage.md) | AC4 and AC5, the test that observes each, the runs that show it, and the places a declared value's shape is settled by something the check does not inspect |

## Links

| Resource | Link |
| --- | --- |
| [I04:E06] Declared Shapes | https://github.com/m2ux/workflow-server/issues/948 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
