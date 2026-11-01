# I11 Parallel Delivery — November 2026

> Planning record · Created 2026-11-01

## Executive Summary

This record holds the decisions that let I11's open work run in parallel wherever the rows' write sets allow it. E09, E13 and E16 share priority 3 and start together, E10 follows at 2 and E14 at 1. E18 stays unranked until its AC14 question is settled.

The 31 October order separated every epic, because almost every pair shares some file. Row by row, E09, E13 and E16 overlap only in a few rows that edit different regions of `format.py`, `board.py` and `sync.py`. E10 against E13 and E16, and E10 against E14 (107 row pairs on the shared checker and guidelines), are genuine overlaps and stay separated by number.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Pair decisions](joins.md) | One line for each row pair delivered as separate pull requests, including E14 W03 and W04, which are now unjoined |

## Links

| Resource | Link |
| --- | --- |
| Initiative | [I11](https://github.com/m2ux/workflow-server/issues/1166) |
| Earlier order | [31 Oct parallel delivery assessment](../2026-10-31-project17-plan-review/parallel-delivery.md) |
| Write sets | [Work-item inventory](../2026-10-31-project17-plan-review/work-items/inventory.json) |
