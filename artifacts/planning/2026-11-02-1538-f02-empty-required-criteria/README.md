# Empty Required Criteria — November 2026

> Delivery record · Created 2026-11-02

## Executive Summary

This record holds the delivery of hot-fix F02 into `workspace`. A project that declares no required criterion, by a missing file, an empty file or an empty array, has its epics held to nothing, and only an unreadable statement stays unevaluable.

prosiform requires no recurring criterion, and the format check reports every epic of such a project as unevaluable. The fix lets a project state that it requires nothing without a false finding or a criterion that is untrue of it.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [F02 work item](f02.md) | Component, scope, design and test rows for F02 |
| [Test results](test-results.md) | The checks run for F02, the revision tested and each result |
| [Agent review](agent-review.json) | The review record for pull request #1621 at its reviewed head |
| [Change list](changes.md) | Each plan change the delivery session applied or held |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix | [F02](https://github.com/m2ux/workflow-server/issues/1538) |
| Pull request | [#1621](https://github.com/m2ux/workflow-server/pull/1621) |
