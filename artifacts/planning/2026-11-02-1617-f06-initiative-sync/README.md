# Initiative Sync Keeps Ticks — November 2026

> Delivery record · Created 2026-11-02

## Executive Summary

This record holds the delivery of hot-fix F06 into `workspace`. An initiative synced with a subset of its epics keeps the Done cell of every row whose epic was not given, and reports that row as left unchanged.

Sync unticks an epic it was not handed, so a partial sync silently undoes recorded delivery. Leaving unread rows as they stand makes a partial sync safe.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [F06](f06.md) | The work item: component, design and validation for unchanged unchecked rows |

## Links

| Resource | Link |
| --- | --- |
| Hot-fix | [F06](https://github.com/m2ux/workflow-server/issues/1617) |
