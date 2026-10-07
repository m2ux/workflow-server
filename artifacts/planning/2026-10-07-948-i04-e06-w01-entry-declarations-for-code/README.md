# Entry Declarations for Code-Graph Operations — October 2026

> Work item · Created 2026-10-07

## Executive Summary

A code-graph operation that returns a list of entries publishes a fixed shape for each one, and a step downstream reads fields out of it. Where the operation never declares those fields, the step is reading against an understanding held nowhere, and the binding check has nothing to hold it to.

This work declares the entry fields of every list-returning code-graph operation with a fixed entry shape, and settles each declaration against what the operation's response from an indexed graph actually carries. The test of it is the binding check reporting no step read of a field its declaration lacks.

## Artifacts

| Artifact | What it holds |
| --- | --- |

## Links

| Resource | Link |
| --- | --- |
| [I04:E06] Declared Shapes | https://github.com/m2ux/workflow-server/issues/948 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
