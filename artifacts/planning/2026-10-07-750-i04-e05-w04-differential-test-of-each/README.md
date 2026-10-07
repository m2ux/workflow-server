# Differential Test of Each Converted Gate — October 2026

> Work item · Created 2026-10-07

## Executive Summary

A differential test evaluates each converted gate and the structured condition it replaced, over the variables that site reads, and finds them agreeing on every assignment. The `when` expression holds exactly when the condition it replaced held.

The conversion is on the corpus. This task is the measurement that the two forms still decide the same way, so a rewrite that changed the gate's meaning fails the comparison rather than waiting for a walk to take the wrong branch.

## Artifacts

| Artifact | What it holds |
| --- | --- |

## Links

| Resource | Link |
| --- | --- |
| [I04:E05] Inline Gates | https://github.com/m2ux/workflow-server/issues/750 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
| [W02 conversion] | https://github.com/m2ux/workflow-server/pull/1193 |
