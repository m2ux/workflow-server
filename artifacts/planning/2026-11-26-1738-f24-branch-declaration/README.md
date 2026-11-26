# F24: Branch Declaration

> Hot-fix record. Created 2026-11-26.

## Executive Summary

The work-planner reads the long-lived branches from config/branches at the tooling branch's remote head, origin/workspace, whatever branch it evaluates.

A project that keeps config/ on its tooling branch alone, as prosiform does, otherwise has no declaration at any epic base, and every branch-based check of its epics goes unrun.

## Decisions

| Decision | State |
| --- | --- |
| Which branch holds the declaration | The tooling branch is workspace for every project; no project setting names another. |

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Work Item](f24.md) | Declared files, design, criteria and test plan |
| [Validation](validation.md) | Tested revision, checks, observations and limits |
| [Focused Results](focused.txt) | The criterion tests' verbose output |
| [Suite Results](suite.txt) | Complete Work Planner test result |

## Links

| Resource | URL |
| --- | --- |
| Hot-fix issue | https://github.com/m2ux/workflow-server/issues/1738 |
