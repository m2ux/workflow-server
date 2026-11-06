# Instruction Preservation Review — November 2026

> Review record · Created 2026-11-06

## Executive Summary

This review compares Work Planner before the E01 style refactor with the current committed layout. It traces command behavior, guards, conditional scope, selected evidence, result writing and continuation across moved sections and removed forwarding operations.

The review records real losses separately from intended style changes and pre-existing limitations. Confirmed regressions are corrected on the current E01 integration branch with observing command and reader checks.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Review Plan](plan.md) | Baselines, review scope and corrective verification |
| [Instruction Inventory](inventory.json) | Changed prose candidates and exact source identities |
| [Review Findings](review.md) | Confirmed regressions, corrections, preserved gates and limits |
| [Corrected Source](source.json) | Exact source identity and file hashes |
| [Command Payload Comparison](command-payloads.json) | All 116 generic commands and the seven explained differences |
| [Command Comparison Script](compare-command-payloads.py) | Repeatable normalized shell-token comparison |
| [Command Comparison Log](command-payloads.log) | Readable changed command tokens |
| [Field and Flag Coverage](coverage.json) | Eleven field bodies requiring semantic review and executable diff |
| [Coverage Script](review-coverage.py) | Repeatable field, flag and planner-script inventory |
| [Wrapper Flag Audit](flag-audit.json) | Flags whose original section no longer owns them |
| [Frozen Replay Script](replay-command-contracts.py) | Replay current observing tests against reviewed command documents |
| [Frozen Failures](frozen-command-failures.log) | Nine reproduced pre-review defects |
| [Command Tests](command-tests.log) | Nine corrected command fixtures |
| [Planner Tests](planner-tests.log) | Complete planner suite, including the opt-in skip |
| [Shared Tests](shared-tests.log) | Shared checker regression suite |
| [Installed Checker](installed-checker.log) | Installed model result |
| [Section Comparison](section-comparison.log) | Complete original-to-corrected third-level section comparison |

## Links

| Resource | Link |
| --- | --- |
| Integration PR | https://github.com/m2ux/workflow-server/pull/1641 |
| Skill Style Epic | https://github.com/m2ux/workflow-server/issues/1616 |
