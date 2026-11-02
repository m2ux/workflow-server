# Delivery Selection: The Board Decides What Starts — November 2026

> standalone delivery · Created 2026-11-02

## Executive Summary

A delivery run starts only what the board's queue hands it. `board-queue.py` readies no epic without a priority label and prints a `rank` line naming each one; Deliver mode takes every status move, assignment and epic base from the queue Advance returned in the same run; `deliver.py --reserve` holds a unit only while its epic is Ready or In Progress in the board items it is given.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Test Evidence](test-evidence.md) | Each check, its failing run at `3cb9cbcf3` and its passing run at the head |
| [Change List](change-list.md) | Each file changed and why, debt fixed, and plan changes |

## Links

| Resource | Link |
| --- | --- |
| Issue | [#1591](https://github.com/m2ux/workflow-server/issues/1591) |
| Pull request | [#1593](https://github.com/m2ux/workflow-server/pull/1593) |
| Branch | `skill/delivery-board-first`, cut at `3cb9cbcf3` (`i11/e10/workspace`, carrying #1590) |
