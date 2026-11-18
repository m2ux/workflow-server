# Outside Dependencies — November 2026

> Hot-fix · Created 2026-11-18

## Executive Summary

A `Depends on` entry whose text is a bare `#750` is read against the repository of the issue holding the row, whatever its link names, so a cross-repository edge written that way waits on the wrong issue and can read as met. The dependency check passes such an entry unchecked.

The fix has a linked entry resolve by its link, an unlinked number by the row's own repository, and an entry whose number and link disagree reported by both the dependency check and the board reader. Work Breakdown states the cross-repository form.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [F20 work item](f20.md) | The files the hot-fix changes and its plan |
| [Test results](test-results.md) | The checks run for F20, the revision tested and each result |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix issue | [[F20] Outside Dependencies](https://github.com/m2ux/workflow-server/issues/1724) |
| Board | [Work Planner](https://github.com/users/m2ux/projects/17) |
| Pull request | [#1730](https://github.com/m2ux/workflow-server/pull/1730) |
