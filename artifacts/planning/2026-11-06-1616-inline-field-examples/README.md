# Inline Field Examples — November 2026

> Revision record · Created 2026-11-06

## Executive Summary

Work Planner field examples use `eg` followed by an inline code span containing the example. Multiple values use separate spans; JSON examples use their compact equivalent.

Command invocations, structural templates, diagrams and field definitions keep their contents. This record tracks the presentation change and its preservation checks on the existing E01 branch.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Plan](plan.md) | Scope, new writing rule and validation |
| [Original Specimens](before.json) | Fenced field examples and structural templates at the original source |
| [Validation](validation.md) | Exact source, preservation, reader correction and final checks |
| [Example Changes](changes.json) | Original values and their inline representations |
| [Preservation](preservation.json) | Scalar/JSON/rendered-value and command preservation |
| [Verification Instrument](verify-inline-examples.py) | Repeatable comparison against the original source |
| [Source Manifest](source.json) | Exact revised source and file hashes |
| [Planner Tests](planner-tests.log) | Final complete suite and opt-in skip |
| [Shared Tests](shared-tests.log) | Shared checker regression results |
| [Installed Checker](installed-checker.log) | Installed model result |
| [Reader Migration Finding](reader-migration-failure.log) | Intermediate failure exposing the fence-dependent test helper |

## Links

| Resource | Link |
| --- | --- |
| Integration PR | https://github.com/m2ux/workflow-server/pull/1641 |
