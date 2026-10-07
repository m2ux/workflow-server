# Full Coverage Walk on Push and Schedule — October 2026

> Work item · Created 2026-10-07

## Executive Summary

The coverage walk is skipped on a pull request whose diff cannot move option coverage, which keeps the cost off every change. The consequence is that nothing runs the full walk at all: the cheap path became the only path, and coverage drifts between the pull requests that happen to touch it.

This work runs the full walk on a push to the default branch and again on a schedule, so the saving on pull requests is paid for somewhere rather than taken for free.

## Artifacts

| Artifact | What it holds |
| --- | --- |

## Links

| Resource | Link |
| --- | --- |
| [I04:E04] Coverage Walk | https://github.com/m2ux/workflow-server/issues/711 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
