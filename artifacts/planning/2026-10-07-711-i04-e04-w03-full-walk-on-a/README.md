# Full Coverage Walk on a Schedule — October 2026

> Work item · Created 2026-10-07

## Executive Summary

Running the full coverage walk on a push to the default branch catches drift at the moment it lands, but only for branches that receive pushes. A quiet period leaves the measurement as old as the last merge, and a walk that has not run recently is not evidence about the corpus as it stands.

This work puts the full walk on a schedule as well, so coverage is measured on a cadence rather than only on activity. It is the companion to the push trigger and ships with it.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W03](w03.md) | The work item: why a cron on the corpus branch would never fire, the weekly cadence and the reason for it, and the checks that accompany it. |

## Links

| Resource | Link |
| --- | --- |
| [I04:E04] Coverage Walk | https://github.com/m2ux/workflow-server/issues/711 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
