# Corpus CI Repair — October 2026

> Delivery follow-up · Created 2026-10-09

## Executive Summary

The artifact destination specimen is registered in the coverage roster, and its activity contracts name only values their steps consume or produce. The bound activity passes its optional destination input explicitly to the writing technique.

These existing defects blocked corpus CI for advisory-reader PR #1290. The user authorized merging that verified change first, then repairing corpus CI separately. PR #1290 merged as 032597956b37a81602a0f19b17342a53c3391a95 and issue #949 is closed.

## Progress

- [x] Merge #1290 and close #949.
- [x] Register the artifact specimen and correct its activity contracts.
- [x] Validate and audit the repair.
- [ ] Push the repair, verify GitHub CI and merge. In progress.

## Local validation

- All 54 corpus guards pass, with zero failures or unmeasured guards.
- Coverage roster check passes.
- Artifact destination graph test passes: one selected test, 64 outside the selection skipped.
- Walk-protocol check and its self-test pass.
- Canon audit has zero introduced findings; whitespace check is clean.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Canon audit](canon-audit.md) | Review of the changed definitions and their consumers |
| [Corpus guards](canon-guards.log) | Complete guard sweep output |

## Links

| Resource | Link |
| --- | --- |
| Advisory delivery | https://github.com/m2ux/workflow-server/pull/1290 |
