# Harness Merge Permission — November 2026

> Delivery record · Created 2026-11-02

## Executive Summary

This record holds the delivery of hot-fix F03 into `workspace`. Deliver states the harness permission a session needs to merge a task pull request into an epic base, checks for it before dispatch, and tells a permission-layer refusal apart from a GitHub one.

An agent harness can refuse a merge the skill already authorizes, and the session reads that as a branch blocker and hands it to the user. Stating and checking the permission keeps delivery unattended and leaves default-branch merges with a person.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [F03 work item](f03.md) | Component, scope, design and test rows for F03 |
| [Test results](test-results.md) | The checks run for F03, the revision tested and each result |
| [Agent review](agent-review.json) | The review record of pull request #1622 at its reviewed head |
| [Change list](changes.md) | Each plan change the delivery session applied or held |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix | [F03](https://github.com/m2ux/workflow-server/issues/1586) |
| Pull request | [#1622](https://github.com/m2ux/workflow-server/pull/1622) |
