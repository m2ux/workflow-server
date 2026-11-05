# Delivery Evidence

## Scope and Ownership

W11 and W12 are one joined unit, covering AC8 and AC9. Board Queue defines the Ready-unit lane report, and board-queue.py prints it from supplied issue bodies through the shared raw lane reader. A Ready task belongs to a Ready or In Progress epic and meets Task Eligibility. The report names joined tasks and their common lane, or unlaned. It does not change placement, assignees or inputs.

Each component is delegated sequentially. The artifact contributor owns board-queue.md; the script contributor owns board-queue.py and its exclusive test_board_queue.py fixtures. The delivery session owns shared fixtures and integration, commits groups separately, and publishes all shared evidence.

## Execution Checklist

- [x] Verify live reservation and current criteria; publish component plans and ownership.
- [x] Implement the artifact and script through sequential component contributors.
- [x] Verify criterion cases, complete planner/shared suites and skill-file checks.
- [x] Publish task PR, record row links and merge verified work into epic base.
- [x] Verify merged revision; record AC8/AC9 and Done, update draft integration and confirm board.
- [x] Publish complete evidence and change list.

## T1: Board Queue Contract

Coverage: AC8. Inspect the committed artifact for Ready-unit lane source from task-table cells in supplied issue bodies, joined eligibility, index/unlaned wording and identical placement inputs. Run document tests and skill-file checks.

The committed artifact defines Ready Unit Lanes from raw task-table cells in supplied epic bodies, the common joined index or all-empty state, Task Eligibility under proposed Ready or In Progress epics, and lane-independent placement. Its unit and invalid report lines match the script. Eleven document-interface tests pass; the skill-file checker reports 52 files and zero findings.

## T2: Ready Unit Lane CLI

Coverage: AC9. Run real board-queue.py fixtures with laned and unlaned rows, joined units and rows with no work-item links. Confirm held, blocked and delivered units are excluded; same delivery states with populated or empty valid Lane cells yield identical placement and assignee calls. Preserve raw-cell validation and same-lane joins.

All 75 queue tests pass, including eight new real CLI cases. The cases observe unlinked laned/unlaned rows, opaque leading-zero indices and joined grouping; compare every Status and assignee call across populated/empty Lane cells; exclude held, open-PR, Done and dependency-blocked units; retain unverified same-repository producer outputs; and refuse raw markup/prose or split joins with affected-row diagnostics. No work-item files or engineering argument are supplied.

The actual Project 17 pre-reservation snapshot prints `unit I17:E03:W11+W12: unlaned`, omits blocked W13, and retains its current placement result of 23 current and zero changes.

## T3: Combined Validation

Run the full planner suite, shared checker suite and skill-file checker. Keep pass counts separate from the opt-in live skip and bind evidence to exact tested and merged heads.

At exact task head baef322b8b6fb83e5b1ffbd90d7de3afa33ad743, the complete planner suite ran 896 tests: 895 passed and one opt-in live Development-link test skipped. The shared checker suite passed 208 tests. The skill-file checker inspected 52 files with zero findings, and git diff --check passed. Both component contributors committed nothing; the session committed the complete artifact and script groups separately. The task checkout is clean and pushed.

Independent source review confirms that reporting calls the existing delivery eligibility/grouping helpers and shared raw lane reader, after placement derivation, without adding checkout/work-item inputs. No technical debt or arising issue was found in this unit.

## Merged Revision and Recording

Task PR [#1637](https://github.com/m2ux/workflow-server/pull/1637) merged into i17/e03/workspace at f29df94515dc4c4d229cfa5c07db18cea3f4307a from verified head baef322b8b6fb83e5b1ffbd90d7de3afa33ad743. The merged tree equals the tested tree. The target's classic protection returns 404 and active rules are empty; no required review/check exists. Exact-head checks and status contexts are absent (zero), and the current local Test Plan passes. The native approval layer permitted the SHA-pinned merge normally.

At the exact merged base revision, all 75 queue tests and 11 document-interface tests pass. The clean epic-base checkout is fast-forwarded to this revision. Live AC8/AC9 and both Done cells match the canonical body. Final Sync reports only the retained historical W01/AC1 coverage disagreement; the original declaration criterion was retired by the approved plan and its old PR evidence is preserved.

Draft integration #1627 has the current merge head and a complete body citing all eight actual task PRs, including #1637. Its full body was read back equal to the published file. Both Development relation directions were refreshed; the task has no issue and stays unlinked, while integration retains its epic relation. The exact board item reads In Progress. W13 and AC10 remain free and unticked; no later unit starts in this session. No plan change, arising issue or unresolved unit debt remains.
