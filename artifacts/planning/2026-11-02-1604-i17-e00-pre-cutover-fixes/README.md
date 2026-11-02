# Pre-Cutover Fixes Review — November 2026

> architecture-overview · Created 2026-11-02

## Executive Summary

This record explains the I17:E00 review pull request, which merges the Pre-Cutover Fixes epic base into `workspace`. It holds the architecture overview a reviewer reads before the diff, and the independent agent review of the integration head.

The epic corrects four work-planner behaviours before cutover: a plan is published as committed files of its planning record on the engineering branch, a not-planned epic leaves its initiative while the remaining criteria keep their labels, a board sync removes every item closed other than as completed, and delivery evidence holds every pull request the plan links whatever its title. A reviewer new to the skill needs the new `linked-pull-requests.py` flow, the board removal rule and the order to read the files in before the diff makes sense.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Architecture overview](architecture-overview.md) | Structure, flows and reading order for the epic's change |
| [Agent review](agent-review.json) | The independent agent reviews of the integration heads `6ef98753` and `6a6041c8`, their findings and the fixes |

## Links

| Resource | Link |
| --- | --- |
| Pull request | [#1604](https://github.com/m2ux/workflow-server/pull/1604) |
| Epic | [I17:E00](https://github.com/m2ux/workflow-server/issues/1598) |
