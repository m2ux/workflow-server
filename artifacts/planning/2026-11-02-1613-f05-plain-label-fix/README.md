# Plain Label Fix — November 2026

> Delivery record · Created 2026-11-02

## Executive Summary

This record holds the delivery of hot-fix F05 into `workspace`. The format check's list fixer makes a plain `AC<n>.` or `R<n>.` label bold in place, and checks plain numbering as it checks bold numbering.

The fixer takes a plainly labelled item as unlabelled and doubles its label, and reports that as a safe fix. A caller publishing the fixed body then publishes the doubled labels.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [F05 work item](f05.md) | Component, scope, design and test rows for F05 |
| [Test results](test-results.md) | The checks run for F05, the revision tested and each result |
| [Agent review](agent-review.json) | The independent agent review of the delivering pull request's head `c8ef9a8f` |
| [Change list](changes.md) | Each plan change the delivery session applied or held |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix | [F05](https://github.com/m2ux/workflow-server/issues/1613) |
