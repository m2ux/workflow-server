# The Link Relation Read From Each End — November 2026

> Delivery record · Created 2026-11-01

## Executive Summary

This record holds the delivery of I11:E16 W01. Two scripts read the Development relation, one from each end, from batched GraphQL query files. The pull-request end writes the link array the epic sync consumes, and the issue end reports each issue's pull requests.

Building that snapshot by hand costs one call per pull request, and nothing checks that it is complete. The work item carries the design and the test obligations for AC1 to AC3.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W01 work item](w01.md) | Component, scope, design, criteria and test rows for W01 |
| [Validation](validation.md) | Changed paths, capture tests, live capture and regressions |
| [Change list](changes.md) | Plan changes applied and held by the delivery session |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I11:E16](https://github.com/m2ux/workflow-server/issues/1474) |
| Pull request | [#1508](https://github.com/m2ux/workflow-server/pull/1508) |
| Follow-up pull request | [#1509](https://github.com/m2ux/workflow-server/pull/1509) |
