# Original Issue

> Test Plan Ticks: A Passed Check Settles Its Criterion · issue #1241 · opened 2026-10-08 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E11:W01] Test Plan Ticks: A Passed Check Settles Its Criterion` |
| Labels | `bug`, `type:task`, `theme:planning` |
| Opened | 2026-10-08 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

This task makes `Sync Epic` derive an epic's criterion ticks from the test plans of the pull requests its rows link, so a merge records what it proved.

## Problem

- **The Pass cell is read and discarded.**
  [`plan_claims`](https://github.com/m2ux/workflow-server/blob/f0412b1b00a9cff8f414ff1dc601faf3371aa6ba/skills/work-planner/scripts/sync.py#L372-L381) takes each plan row as `(test, coverage, _mark)` and drops the mark, returning only the criteria a row names and those a row with a Test cell names.
- **The claims feed the report alone.**
  The sets `plan_claims` returns reach [the disagreement report](https://github.com/m2ux/workflow-server/blob/f0412b1b00a9cff8f414ff1dc601faf3371aa6ba/skills/work-planner/scripts/sync.py#L437-L450) and nothing else, so a plan whose every check has passed moves no tick.
- **The tick comes from a separate verification.**
  Sync verifies each criterion on the branch the pull requests merged into, with the instrument the criterion names. The evidence a merged pull request already carries is not that instrument's input.
- **Done stays empty on a delivered row.**
  A row is complete when it is delivered and every criterion its Coverage names is ticked, so an unticked criterion holds a delivered row open.

## Proposal

- **A passed check ticks the criterion it observes.**
  `plan_claims` returns the criteria whose observing row carries a tick in Pass, and Sync Epic ticks those on the epic.
- **An unticked check leaves its criterion alone.**
  A row whose Pass cell is empty names its criteria and settles none of them.
- **A criterion several rows observe needs every one.**
  Where more than one row's Coverage names a criterion, the tick waits until each of those rows has passed.

## Acceptance Criteria

- [ ] **AC1.** Sync Epic ticks an epic criterion when a linked pull request's test plan carries a passed check naming it, as the skill's fixture suite shows against a plan with and without the tick.

## References

- **R1.** [Test Plan Evidence](https://github.com/m2ux/workflow-server/issues/1249) — I11 E11, the epic this task belongs to.
- **R2.** [sync.py](https://github.com/m2ux/workflow-server/blob/f0412b1b00a9cff8f414ff1dc601faf3371aa6ba/skills/work-planner/scripts/sync.py#L372-L381) — `plan_claims`, and the disagreement report it feeds.


## Comment 1

> m2ux · 2026-10-08

The body before this issue took the [I11:E11:W01] layout:

## Overview

A unit's pull request records which parent epic criteria each of its tests observes, and ticks a box once that test has run and held. Nothing reads that record. A merged pull request therefore leaves its epic's criteria unticked, Done stays empty on a delivered row, and the evidence that would settle each criterion sits in the pull request unread. This issue makes `Sync Epic` derive the ticks from the test plans of the pull requests a row links, so a merge records what it proved.

## Problem

The Test Plan table is the only place a test is matched to the criterion it observes, and no code reads it.

- **The Criteria column is written by every unit and read by nothing.**
  The [pull request template](https://github.com/m2ux/workflow-server/blob/d128062e0722f57a51d463694704653bd9efde9f/skills/work-planner/templates/pull-request.md#L17-L19) carries a `Test | Criteria` table, and [deliver mode's Tests rule](https://github.com/m2ux/workflow-server/blob/d128062e0722f57a51d463694704653bd9efde9f/skills/work-planner/references/deliver-mode.md#L86) requires every criterion the unit covers to appear in a row. No script in the skill matches the string `Criteria` outside the `Acceptance Criteria` heading.
- **The one reader of a test plan counts boxes and discards the mapping.**
  [`plan_passed`](https://github.com/m2ux/workflow-server/blob/d128062e0722f57a51d463694704653bd9efde9f/skills/work-planner/scripts/deliver.py#L176-L182) answers whether every box is ticked. It never reads the table beneath them.
- **A tick happens only when a human names the ids.**
  `sync.py` takes the set to tick from [`--tick` alone](https://github.com/m2ux/workflow-server/blob/d128062e0722f57a51d463694704653bd9efde9f/skills/work-planner/scripts/sync.py#L536), so a sync that follows a merge reports the criteria ready to verify and writes none of them.
- **Done cannot follow a merge.**
  A row is complete when it is [delivered and every criterion its Coverage names is ticked](https://github.com/m2ux/workflow-server/blob/d128062e0722f57a51d463694704653bd9efde9f/skills/work-planner/scripts/sync.py#L360-L362). With no path from a passed test plan to a tick, a delivered row's Done cell stays empty however complete the work is.
- **Nineteen criteria are stranded on one initiative.**
  Four pull requests merged with every box ticked and their tables naming the criteria each test observed. The two epics they deliver carry nineteen criteria between them, none ticked, and both report every delivered row unmet.
- **A merged table's ids are frozen at the merge.**
  Each of those tables names its epic's criteria by the ids that epic held when the pull request merged. An epic that splits or renumbers a criterion afterwards leaves them pointing at conditions nobody tested, and one of the two epics has since split a criterion into four.

## Proposal

- **`Sync Epic` derives the ticks from the test plans it already matches.**
  For each row it finds delivered, it reads the Test Plan of every pull request the row links, collects the criteria named by rows whose box is ticked, and ticks those on the epic. Deliver mode needs no new step, since it already syncs each task issue and the epic after a merge.
- **Only a ticked box carries evidence.**
  A row whose box is unticked, and a row whose Criteria cell is empty, contribute nothing. A criterion the unit's Coverage names that no row observes stays unticked and is reported, as [Coverage Reports](https://github.com/m2ux/workflow-server/blob/d128062e0722f57a51d463694704653bd9efde9f/skills/work-planner/references/work-breakdown.md#L138-L145) requires.
- **Done follows on the pass that derives the ticks.**
  `sync_done` already recomputes every Done cell from delivery and the ticks the run holds, on any pass and without `--tick`. A row whose Coverage is fully observed by passed tests therefore carries its tick in the same run, with no second command and no confirmation step. The derivation is the only input it lacks.
- **The readiness refusal stands.**
  A derived criterion goes through the same gate as a named one: a criterion whose citing rows are not all delivered is refused, so one observed by a test in a merged pull request and also cited by an undelivered row stays unticked.
- **A derived tick is reported as derived.**
  The sync names the pull request and the test whose pass carries each tick, so the record says what settled the criterion rather than that someone asserted it.
- **An id outside the epic's criteria is a finding, not a tick.**
  A Criteria cell naming one is reported, and nothing is ticked from it. The alignment that renumbers a criterion repairs the tables of the merged pull requests that name it, so a table and the epic it cites stay one vocabulary.
- **Verification by hand remains the path for the rest.**
  Sync mode's verify step keeps every criterion no passed test observes, which is where a criterion whose instrument is a reading rather than a check is settled.

## Acceptance Criteria

- [ ] **AC1.** `Sync Epic` ticks a criterion named by a test-plan row whose box is ticked, in a pull request a delivered row links, as a run over an epic with that pull request shows.
- [ ] **AC2.** `Sync Epic` ticks no criterion named only by a test-plan row whose box is unticked, as a run over a pull request carrying one shows.
- [ ] **AC3.** `Sync Epic` ticks no criterion for a test-plan row whose Criteria cell is empty, as a run over a pull request carrying one shows.
- [ ] **AC4.** `Sync Epic` refuses a derived criterion whose citing rows are not all delivered, as a run over an epic with one such criterion shows.
- [ ] **AC5.** `Sync Epic` ticks Done on a delivered row whose Coverage is fully observed by passed tests, in the same run that derives those ticks and with no criterion named on the command line, as a run over such a row shows.
- [ ] **AC6.** `Sync Epic` reports the pull request and the test item behind each derived tick, as that run's output shows.
- [ ] **AC7.** `Sync Epic` reports a Criteria cell naming an id the epic's Acceptance Criteria do not hold, and ticks nothing from it, as a run over a pull request carrying a stale id shows.
- [ ] **AC8.** Align mode repairs the Criteria cells of merged pull requests naming a criterion it renumbers, as a read of its procedure shows.

## References

- **R1.** [Merge Gate: A Pull Request Merged on the Test Plan It Carries](https://github.com/m2ux/workflow-server/issues/1239) — the change that made the passed test plan the merge gate, on the expectation that the sync after the merge writes the ticks.

