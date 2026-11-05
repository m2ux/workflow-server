# Delivery Evidence

## Scope and Ownership

W11 and W12 are one joined unit, covering AC8 and AC9. Board Queue defines the Ready-unit lane report, and board-queue.py prints it from supplied issue bodies through the shared raw lane reader. A Ready task belongs to a Ready or In Progress epic and meets Task Eligibility. The report names joined tasks and their common lane, or unlaned. It does not change placement, assignees or inputs.

Each component is delegated sequentially. The artifact contributor owns board-queue.md; the script contributor owns board-queue.py and its exclusive test_board_queue.py fixtures. The delivery session owns shared fixtures and integration, commits groups separately, and publishes all shared evidence.

## Execution Checklist

- [x] Verify live reservation and current criteria; publish component plans and ownership.
- [ ] Implement the artifact and script through sequential component contributors. **In progress.**
- [ ] Verify criterion cases, complete planner/shared suites and skill-file checks.
- [ ] Publish task PR, record row links and merge verified work into epic base.
- [ ] Verify merged revision; record AC8/AC9 and Done, update draft integration and confirm board.
- [ ] Publish complete evidence and change list.

## T1: Board Queue Contract

Coverage: AC8. Inspect the committed artifact for Ready-unit lane source from task-table cells in supplied issue bodies, joined eligibility, index/unlaned wording and identical placement inputs. Run document tests and skill-file checks.

## T2: Ready Unit Lane CLI

Coverage: AC9. Run real board-queue.py fixtures with laned and unlaned rows, joined units and rows with no work-item links. Confirm held, blocked and delivered units are excluded; same delivery states with populated or empty valid Lane cells yield identical placement and assignee calls. Preserve raw-cell validation and same-lane joins.

## T3: Combined Validation

Run the full planner suite, shared checker suite and skill-file checker. Keep pass counts separate from the opt-in live skip and bind evidence to exact tested and merged heads.
