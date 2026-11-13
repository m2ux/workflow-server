# I18 Goal Trace

The goal clauses in [Decisions](decisions.md) traced to the criteria, against the drafts in this record.

## Trace Table

| Goal clause | Initiative criteria | Epics | Epic criteria | Source requirement |
| --- | --- | --- | --- | --- |
| G1. Engineering Branch owns where and how a record lands; Planning Record and other engineering-side content publish through it | AC1 | E00 | AC1, AC2, AC3 | Decisions 2, G1 |
| G2. Planning Record owns only the general record and defines no file kind | AC2 | E00 | AC4, AC5 | Decisions 2, G2 |
| G3. Each file kind belongs to its owner, which states path and template and links Planning Record | AC3 | E00 | AC6, AC7, AC10, AC11 | Decisions 2, G3 |
| G4. New records only; no migration | AC4 (opened once the check lands); Non-Goal 1 | E00 | AC9 | Decisions 2, G4 |
| G5. A cheap layout check | AC4 | E00 | AC8, AC9 | Decisions 2, G5 |

Every initiative criterion traces to a clause, and E00's rows deliver every epic criterion: W01 AC1–AC3, W02 AC4–AC5, W03 AC6–AC7, W04 AC8–AC9, W05 AC10–AC11.

## Outside Threats

- **Scripts that read record paths.**
  `deps.py` reads any `R=` path, and reserving or releasing a row checks for a work-item file named for the task id in the reserved folder. Work Item's two shapes keep that name in a delivery record, and a plan record's row links `e<nn>/w<nn>.md` as its epic body already does.
- **Tests that pin the old text.**
  `test_plan_mode` asserts Planning Record's draft sentence and Commit Planning Record's command. W01, W02 and W03 declare that module and rewrite those assertions.
- **Records reopened after the change.**
  A record opened before the layout check is republished by sync and delivery runs; the check's date leaves it as written.
- **Readers of review notes.**
  No script reads `review-notes.md`; the agent review gate reads the JSON record alone.

## Ranked Gaps

None remain. The review's findings are resolved in the drafts, as [Review](review.md) lists.
