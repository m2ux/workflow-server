# Delivery Lane Admission — November 2026

> I17 E03 W07+W08 delivery · Created 2026-11-05

## Executive Summary

A delivery run serves its requested lane and unlaned units. A run without a lane serves unlaned units.

The Delivery Plan defines that admission rule and deliver.py applies it to the task table while retaining availability and priority.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W07](w07.md) | Delivery Plan admission rule and document verification |
| [W08](w08.md) | Available-work filter and observing fixtures |
| [Dispatch](dispatch.md) | Automatic authorization, current queue and checklist |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I17 E03](https://github.com/m2ux/workflow-server/issues/1625) |
| Automatic authorization | [Remaining E03 delivery](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-05-free-work-auto-start) |
| Prior unit | [Merged #1629](https://github.com/m2ux/workflow-server/pull/1629) |
| Draft integration | [#1627](https://github.com/m2ux/workflow-server/pull/1627) |
