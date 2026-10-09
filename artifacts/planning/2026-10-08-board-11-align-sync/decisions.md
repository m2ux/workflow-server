# Decisions

Seven questions, each put as an interview and answered by the user.

## D1. Scope

**Question.** Which initiatives on board 11 does the pass cover?

**Answer.** Both I04 and I00. I04 takes align and sync; I00's eleven backlog epics take alignment against the templates, the criteria rules and the dependency check.

## D2. Verification

**Question.** How are the forty-two ready-to-verify criteria handled?

**Answer.** Verify all, then tick. Each criterion runs the instrument it names, on the branch its pull requests merged into. What passes is ticked; what does not stays unticked with what is missing recorded on the issue.

## D3. I04 epic bases

**Question.** I04 delivers task branches straight into `i04/main` and `i04/workflows`, with no `i04/eNN/<name>` base. Does the align cut them?

**Answer, superseded by D10.** Leave as delivered. No task pull request is open, so a base would start empty and host no review. Pull requests #1225 and #1226 carry the review of the integration branches.

## D4. I00 state

**Question.** I00 sits at Backlog with [I00:E06] delivering six rows into `main` and `workflows`. How is that reconciled?

**Answer.** Move #527 and #700 to In Progress, verify E06's criteria against the branches the work landed in, and cut no `i00/*` branches until the next I00 unit starts.

## D5. Step Grammar (#709)

**Question.** #709 is closed as not planned, is absent from the I04 table, and reads Done on the board. What stands?

**Answer.** Remove it from the board and retitle it without the `[I04:E02]` prefix, so it reads as scoped-out work no initiative owns.

## D6. AC10

**Question.** I04's AC10 asked for a scheduled full coverage walk, which #1196 deliberately removed. What stands?

**Answer.** Remove AC10, and the schedule clause from the Proposal. The remaining criteria renumber to stay contiguous, and E04's Coverage drops it.

## D7. Test plans

**Question.** Thirty-seven merged pull requests carry a test-plan shape the template does not specify — a checklist plus a two-column `Test | Criteria` table, where the template wants one four-column table with a Coverage column. What changes?

**Answer.** Report the divergence and change nothing, and raise it no further: a merged pull request may be non-compliant. The measurement is legible to a reader; only the sync script cannot parse it, and the disagreement lines it prints are noise to be read past.

## D8. Body edits

**Question.** May the rule-mandated body edits be applied across all twenty affected issues?

**Answer.** Apply all: strip References rows that link same-board issues, restate Problem and Proposal text that names its own ids, fix #527's `Non-goals` heading, reword AC26 off its count, and split the four shared criteria and #530's four-criterion row.

## D9. The dependency checker

**Question.** `deps.py` drops a Work Breakdown row whose Task cell links more than one pull request, so eight dependencies and Joins read as unknown across I04. What carries the fix?

**Answer.** A standalone issue, #1264, outside any initiative and on no board.

## D10. I04 epic bases, superseding D3

**Question.** D3 left I04 delivering straight into its integration branches. Does it get the bases the Work Breakdown Guide expects?

**Answer.** Cut them. Twenty branches — `main` and `workflows` for each of the ten open epics E01, E03, E05, E06, E07, E09, E11, E12, E13 and E14 — from `i04/main` at `c2bfb89e` and `i04/workflows` at `47732727`.

Both trees for every epic, rather than only the tree an epic has so far changed: every started I04 epic has touched both, and the three unstarted ones have no delivery to read a tree from. A base an epic never uses stays empty and is dropped when the epic closes.

Nothing is retargeted. Only #1225 and #1226 are open, both integration pull requests that keep their long-lived base, and no task pull request is open. No base carries a merge, so no review pull request is due.
