# Plain Label Fix — November 2026

> Delivery record · Created 2026-11-02

## Executive Summary

This record holds the delivery of hot-fix F05 into `workspace`. The format check's list fixer makes a plain `AC<n>.` or `R<n>.` label bold in place, and checks plain numbering as it checks bold numbering.

The fixer takes a plainly labelled item as unlabelled and doubles its label, and reports that as a safe fix. A caller publishing the fixed body then publishes the doubled labels.

## Artifacts

| Artifact | What it holds |
| --- | --- |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix | [F05](https://github.com/m2ux/workflow-server/issues/1613) |
