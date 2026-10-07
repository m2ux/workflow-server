# Contract Types Settled Against Filling Operations — October 2026

> Work item · Created 2026-10-07

## Executive Summary

A contract declares the values a step is handed, and an operation publishes the shape it fills them with. Where the two disagree, nothing says so: the step reads a field the operation never sends, and the run finds out by improvising past it. The declaration is the place a reader looks to know what a value holds, so a declaration that does not match its source is worse than none.

This work settles each declared value against the shape its filling operation publishes, and puts `check-operation-contract` in a state where it reports nothing against the corpus. Wiring that check into the standard sweep is the task after this one, which is why this one has to leave the corpus clean rather than merely measured.

## Artifacts

| Artifact | What it holds |
| --- | --- |

## Links

| Resource | Link |
| --- | --- |
| [I04:E06] Declared Shapes | https://github.com/m2ux/workflow-server/issues/948 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
