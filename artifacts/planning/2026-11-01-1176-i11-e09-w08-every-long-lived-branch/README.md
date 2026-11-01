# Every Long-Lived Branch Carries the Declaration — November 2026

> Delivery record · Created 2026-11-01

## Executive Summary

This record holds the delivery of I11:E09 W08. The branches `main`, `workflows` and `docker` each commit `config/branches`, naming the set `workspace` names, so an epic base cut from any long-lived branch reads its own declaration at its own commit.

Since W06, a sync reads the declaration only at the commit it evaluates, so an epic base cut from a branch without the file cannot be evaluated at all. The work item carries the design and the test obligations for AC15.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W08 work item](w08.md) | Component, scope, design and test rows for W08 |
| [Evidence](evidence.md) | Declaration reads before and after, per long-lived branch |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I11:E09](https://github.com/m2ux/workflow-server/issues/1176) |
| Source issue | [#1492](https://github.com/m2ux/workflow-server/issues/1492) |
