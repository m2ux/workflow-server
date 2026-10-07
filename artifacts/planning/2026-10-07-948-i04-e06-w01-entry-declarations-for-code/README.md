# Entry Declarations for Code-Graph Operations — October 2026

> Work item · Created 2026-10-07

## Executive Summary

A code-graph operation that returns a list of entries publishes a fixed shape for each one, and a step downstream reads fields out of it. Where the operation never declares those fields, the step is reading against an understanding held nowhere, and the binding check has nothing to hold it to.

This work declares the entry fields of every list-returning code-graph operation with a fixed entry shape, and settles each declaration against what the operation's response from an indexed graph actually carries. The test of it is the binding check reporting no step read of a field its declaration lacks.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W01](./w01.md) | The work item: what the task delivers, the friction it answers, the design, and the parts of the work |
| [Declarations](./declarations.md) | How the subject was derived, the response each operation gave, and whether the settlement was a declaration or a statement that the answer has no entry to name |
| [Coverage](./coverage.md) | AC1, AC2 and AC3, the test that observes each, the runs that show it, and the places a declaration rests on something no test reaches |

## Links

| Resource | Link |
| --- | --- |
| [I04:E06] Declared Shapes | https://github.com/m2ux/workflow-server/issues/948 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
