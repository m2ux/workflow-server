# W01 Validation — November 2026

> Delivery evidence · Created 2026-11-01

Evaluated at `48279d5` on `i11/e16/w01-the-link-relation-read`, cut from `i11/e16/workspace` at `b0294e2`.

## Changed Paths

| Path | Change |
| --- | --- |
| `skills/work-planner/scripts/development.py` | Batched, paginated Development relation read shared by both ends |
| `skills/work-planner/scripts/links-by-pull-request.py` | Pull-request-end capture writing `links.json` |
| `skills/work-planner/scripts/links-by-issue.py` | Issue-end capture keyed by issue number |
| `skills/work-planner/test/test_link_capture.py` | Capture tests against a stand-in `gh` that pages two links at a time |
| `skills/work-planner/artifacts/pull-request.md` | Fetch Pull Request Issue Links runs Capture Pull Request Links |
| `skills/work-planner/artifacts/issue.md` | Read Issue Development runs Capture Issue Links |
| `skills/work-planner/SKILL.md` | Scripts convention: a tracker-reading script runs outside `sbx` |

All paths sit inside the work item's file-change declaration.

## Capture Tests

`python3 -m pytest skills/work-planner/test/test_link_capture.py -q`: 8 passed.

| Test | Criterion | Observation |
| --- | --- | --- |
| `test_the_sync_reads_the_snapshot` | AC1 | sync.py, given the captured `links.json`, reports no uncited link when the pull request links the task issue, and `uncited: #950 does not link W01 #3` when it links another |
| `test_every_pull_request_appears_with_its_issues_or_an_empty_array` | AC2 | The snapshot's keys equal the collection across two repositories; a five-link relation read over three pages and an empty relation appear in full |
| `test_a_pull_request_collected_twice_appears_once` | AC2 | A pull request collected twice has one entry |
| `test_the_issue_end_agrees_with_the_pull_request_end` | AC3 | 120 pull requests over three batches: the issue-end pairs equal the pull-request-end pairs |
| `test_each_issue_is_keyed_by_number_with_its_pull_requests` | AC3 | Output keyed by issue number, each pull request with repository and state, an unlinked issue mapped to an empty array |

## Live Capture

Both captures ran against `m2ux/workflow-server` on 2026-11-01 from the REST collections the skill fetches.

| Capture | Input | Result | Time |
| --- | --- | --- | --- |
| `links-by-pull-request.py` | 216 initiative pull requests | 216 entries, 66 links, exit 0 | 2.7 s |
| `links-by-issue.py` | 429 issues | 429 entries, 133 links, exit 0 | 4.9 s |

Read against each other for pull requests in the collection, the 66 pull-request-end pairs and the 66 issue-end pairs are identical, with none on one side only.

## Regressions

| Suite | Result |
| --- | --- |
| `python3 -m unittest discover -s test` (work-planner) | 479 tests, OK |
| `python3 -m pytest skills/test -q` (shared) | 76 passed |
| `python3 skills/scripts/check_skill_files.py skills/work-planner` | 50 files, 0 findings |

Under pytest the work-planner suite also collects `align.py`'s `test_plan_agreement` helper as a test and errors on its missing fixtures; that error is present on the base revision and is outside this change.
