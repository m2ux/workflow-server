# Review Graph Measurement — November 2026

> Delivery record · Created 2026-11-11

## Executive Summary

This record holds the delivery of hot-fix F09 into `workspace`. Measure Repository Change indexes a review worktree without writing anything beside the index, and measures a pull request's change against the merge base of its head and its base commit.

Indexing rewrote AGENTS.md and CLAUDE.md and added skill folders, so an indexed review worktree was refused on the next run; and the base branch name gave an empty or foreign surface once the base moved, as it does when the pull request merges. Understand readers worked around both by hand.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [F09 work item](f09.md) | Component, scope, design and test rows for F09 |
| [Test results](test-results.md) | The checks run for F09, the revision tested and each result |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix | [F09](https://github.com/m2ux/workflow-server/issues/1696) |
