# Configuration From the Evaluated Revision — November 2026

> Delivery record · Created 2026-11-01

## Executive Summary

This record holds the delivery of I11:E09 W06. The long-lived branch names a run uses are read at the commit it evaluates, so runs evaluating the same commit agree whichever worktree they are invoked from, and an epic sync reads them from its pinned epic-base commit.

Reading the declaration from the invoking worktree lets a dirty or divergent checkout change which branches a check treats as long-lived. The work item carries the design and the test obligations for AC10 and AC12.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W06 work item](w06.md) | Component, scope, design, criteria and test rows for W06 |
| [Evidence](evidence.md) | Evaluated revisions, tests, review, plan-change list, debt and delivery |
| [Tests](tests.log) | Full Work Planner test output |
| [Documents](documents.log) | Skill document checker output |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I11:E09](https://github.com/m2ux/workflow-server/issues/1176) |
| Pull request | [#1490](https://github.com/m2ux/workflow-server/pull/1490) |
| Earlier record | [2026-10-09 W06 and W07 record](../2026-10-09-1268-i11-e09-w06-delivery-reading-the-set-a/) |
