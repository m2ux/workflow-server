# W06 Validation — November 2026

> Delivery evidence · Created 2026-11-01

Evaluated at `c1e5fca` on `i11/e16/w06-development-links-written-and`, which merges `i11/e16/workspace` at `861e181` (W02 included).

## Changed Paths

| Path | Change |
| --- | --- |
| `skills/work-planner/scripts/development-link.py` | Add and remove mutations from a query file, with readback from both ends |
| `skills/work-planner/test/test_development_link.py` | Write tests against a stand-in `gh` that holds and mutates the relation |
| `skills/work-planner/artifacts/pull-request.md` | Set and Remove Development Link carry the command; Access Development Links returns its verified relation |
| `skills/work-planner/test/test_sync.py` | Test Plan builder renamed `plan_section`, out of pytest collection |

All paths sit inside the work item's file-change declaration.

## T1

**Add once or twice leaves one relation (AC8), fixture.** `test_adding_once_or_twice_leaves_one_relation`: with a retained link on the issue, two adds each exit 0; the issue holds the retained link and the pull request once, and the pull request holds the issue. `test_a_duplicated_relation_is_a_discrepancy`: a tracker that duplicates on add makes the script exit 1 with `discrepancy: … holds o/r#950, o/r#950`. Result: pass.

## T2

**Add once or twice leaves one relation (AC8), live.** On 2026-11-01, against throwaway issue [#924](https://github.com/m2ux/workflow-server/issues/924) and draft scratch pull requests [#1512](https://github.com/m2ux/workflow-server/pull/1512) and [#1513](https://github.com/m2ux/workflow-server/pull/1513), both targeting `i11/e16/w06-development-links-written-and` (non-default; the default is `main`).

| Run | Issue end after | Pull-request end after | Result |
| --- | --- | --- | --- |
| `add` #1512 | #1512 | #1512: #924 | verified |
| `add` #1512 again | #1512 | #1512: #924 | verified |
| `add` #1513 | #1512, #1513 | #1513: #924 | verified |

A separate readback through W01's captures, with #1513 linked: `links-by-pull-request.py` over #1512 and #1513 gave `#1512: []`, `#1513: [#924]`; `links-by-issue.py` over #924 gave `924: [#1513 OPEN]`. Result: pass.

## T3

**Removal leaves the other links (AC9), fixture.** `test_removal_leaves_the_other_links`: the issue holds a retained link and the pull request, and the pull request also links a second issue. Removal exits 0; the issue keeps the retained link and the pull request keeps its other issue. Result: pass.

## T4

**Removal leaves the other links (AC9), live.** Continuing T2:

| Run | Issue end after | Pull-request end after | Result |
| --- | --- | --- | --- |
| `remove` #1512 | #1513 | #1512: none | verified |
| `remove` #1513 | none | #1513: none | verified |

`links-by-issue.py` over #924 after cleanup: `924: []`. #1512 and #1513 are closed, and `scratch/e16w06-a` and `scratch/e16w06-b` deleted. Result: pass.

## T5

**A failed write names its operation and error (AC10).** `test_a_failed_write_names_its_operation_and_error` runs four stand-in failures on the mutation call; each exits 1, prints `failed: <add|remove> o/r#950 -> o/r#924: <mutation>:` with the observed error, never `unavailable`, and leaves the relation unchanged.

| Fixture | Mutation | Observed error printed |
| --- | --- | --- |
| Authentication | `addCloseIssueReferences` | `gh: Bad credentials (HTTP 401)` |
| Permission | `addCloseIssueReferences` | `Resource not accessible by integration` |
| Unsupported schema | `removeCloseIssueReferences` | `Field 'removeCloseIssueReferences' doesn't exist on type 'Mutation'` |
| Transport | `addCloseIssueReferences` | `Post "https://api.github.com/graphql": dial tcp: lookup api.github.com: no such host` |

`test_a_failed_lookup_or_readback_names_its_step` covers a failed node-id lookup and a failed readback. Live: `add` with pull request #999999 printed `failed: add m2ux/workflow-server#999999 -> m2ux/workflow-server#924: node id of pull request m2ux/workflow-server#999999: gh: Not Found (HTTP 404)` and exited 1. Result: pass.

## T6

**Skill test suites.** `python3 -m pytest skills/work-planner/test -q`: 496 passed. `python3 -m unittest discover -s test` (work-planner): OK. `python3 -m pytest skills/test -q`: 76 passed. Result: pass.

## T7

**Skill file check.** `python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files, 0 findings. Result: pass.

## Sync Test Collection

Under pytest, `test_sync.py`'s helper `test_plan` was collected as a test and raised `PytestReturnNotNoneWarning`; it is present on the epic base. Classified trivial debt and fixed in this unit at `e8e8997` by renaming it `plan_section`. The warning is gone.

## W08

**Read Development Links had no command.** Auditing the operations W06 changed found Access Development Links' read-only path running Read Development Links, which described the read without a command, while Capture Pull Request Links performs it. Classified trivial debt and delivered as row W08 on `i11/e16/w08-development-links-read-by-capture` at `8c848bc`: Read Development Links is removed and the read-only path runs Capture Pull Request Links with the one pull request's record.

### T1

**Single pull request read.** `links-by-pull-request.py` over review pull request #1505 alone: `1 pull request(s), 1 link(s)`, entry `#1505: [#1474]`, exit 0. Result: pass.

### T2

**Skill suites and file check.** `python3 -m pytest skills/work-planner/test -q`: 496 passed. `python3 -m pytest skills/test -q`: 76 passed. `check_skill_files.py skills/work-planner`: 50 files, 0 findings. No remaining reference to Read Development Links. Result: pass.
