# Joined Task Lanes — November 2026

> I17 E03 W04+W05+W06 delivery · Created 2026-11-04

## Executive Summary

Joined task rows share one Lane index or have empty Lane cells throughout. This unit defines the rule, implements one task-table lane reader and joined-unit check, and validates cells through the issue-format check.

The unit also proves that valid and empty Lane values stay attached to their task rows through normalization, reservation, release and delivery recording. It covers AC3, AC4, AC13 and AC14 through one task pull request into `i17/e03/workspace`.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W04](w04.md) | Joined-lane rule and its document verification |
| [W05](w05.md) | Shared table-lane reader, joined-unit checks and dependency fixtures |
| [W06](w06.md) | Format validation and table-operation preservation fixtures |
| [Dispatch](dispatch.md) | Authorization, live delivery context and execution checklist |
| [Delivery evidence](delivery.md) | Execution checklist, criterion observations and validation results |
| [Change list](change-list.md) | Applied and held plan changes |
| [Planner results](planner-tests.log) | Complete planner suite output |
| [Shared results](shared-tests.log) | Shared checker suite output |
| [Criterion results](criterion-tests.log) | Exact-revision detached criterion run |
| [Priority recursion](priority-recursion.json) | Pinned pre-existing unsupported-input reproduction |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I17 E03 Delivery Lanes](https://github.com/m2ux/workflow-server/issues/1625) |
| Board | [Project 17](https://github.com/users/m2ux/projects/17/views/4) |
| Plan | [Task-table lane plan](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes) |
| Prior unit | [Merged #1628](https://github.com/m2ux/workflow-server/pull/1628) |
| Draft integration | [#1627](https://github.com/m2ux/workflow-server/pull/1627) |
