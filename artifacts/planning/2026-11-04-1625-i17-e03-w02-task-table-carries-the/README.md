# Task-Table Lane Contract — November 2026

> I17 E03 W02+W03 delivery · Created 2026-11-04

## Executive Summary

This joined unit gives each task row a Lane cell after Joins and before Done. The cell holds a bare decimal index such as 2, or is empty for unlaned work. The Work Item artifact describes the component and implementation plan.

W02 defines the epic-table contract and its population input, covering AC11. W03 removes the work-item lane declaration path, covering AC12. They ship through one task pull request so the lane has one owning location.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W02](w02.md) | Task-table contract, component and verification scope |
| [W03](w03.md) | Work-item declaration removal, component and verification scope |
| [Dispatch](dispatch.md) | Authorization, live queue, delivery context and execution checklist |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I17 E03 Delivery Lanes](https://github.com/m2ux/workflow-server/issues/1625) |
| Board | [Project 17](https://github.com/users/m2ux/projects/17/views/4) |
| Revised plan | [Task-table lanes](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-02-1597-i17-pre-cutover-fixes) |
| Draft integration | [#1627](https://github.com/m2ux/workflow-server/pull/1627) |
