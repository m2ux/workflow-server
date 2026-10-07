# Survey Every Structured-Condition Site — October 2026

> Work item · Created 2026-10-07

## Executive Summary

A step's gate can be written two ways: inline as a `when` expression, or structurally as a `condition` object. Two forms for one job means every reader — the validator, the guards, gate liveness, the walker — has to understand both, and an author choosing between them is choosing without a reason.

This work is the survey that has to precede retiring one of them. Every site carrying a structured condition gets a recorded disposition, converted or removed; each checkpoint site records whether anything downstream actually reads its dismissal; and each site marked for removal records the measurement showing its test could never be false. Nothing is converted here — the later tasks do that, and they need this record to do it safely.

## Artifacts

| Artifact | What it holds |
| --- | --- |

## Links

| Resource | Link |
| --- | --- |
| [I04:E05] Inline Gates | https://github.com/m2ux/workflow-server/issues/750 |
| [I04] Technical Debt | https://github.com/m2ux/workflow-server/issues/706 |
