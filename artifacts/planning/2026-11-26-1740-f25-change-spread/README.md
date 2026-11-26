# F25: Change Spread

> Hot-fix record. Created 2026-11-26.

## Executive Summary

A work-planner change touches only what it changes: the test index maps modules without counts, every `config/` declaration is read at the tooling branch's remote head as one field states, and steps calling a reader react to its result rather than restating where it reads.

A count restated on every row, and a read location restated by every caller, made a one-rule change edit many files; and the required-criteria declaration, read at each epic base, went unread for a project keeping `config/` on its tooling branch alone.

## Decisions

| Decision | State |
| --- | --- |
| Where the tooling-branch rule lives | A Tooling Branch field in `delivery-branches.md`, for every `config/` declaration; Branches and Required Criteria link it. |
| Where `TOOLING_BRANCH` lives | `format.py`, which `sync.py` already imports from; `format.py` cannot import `sync.py`. |
| Where the required-criteria fetch is stated | On Check Body Format, as Sync Epic states its own; a fetch step in Validate Epic Body makes every caller up its chain name a checkout. |

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Work Item](f25.md) | Declared files, design, the AC2 search, criteria and test plan |
| [Agent Review](agent-review.json) | Exact-head review of PR #1741, its fixed finding, rejected cases and the pre-existing observation |
| [Validation](validation.md) | Tested revision, checks, spread measure and limits |
| [Focused Results](focused.txt) | The criterion tests' verbose output |
| [Suite Results](suite.txt) | Complete Work Planner test result |

## Links

| Resource | URL |
| --- | --- |
| Hot-fix issue | https://github.com/m2ux/workflow-server/issues/1740 |
| Pull request | https://github.com/m2ux/workflow-server/pull/1741 |
| F24, the change measured | https://github.com/m2ux/workflow-server/pull/1739 |
