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

**Answer.** Leave as delivered. No task pull request is open, so a base would start empty and host no review. Pull requests #1225 and #1226 carry the review of the integration branches.

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

**Answer.** Report the divergence and change nothing. The measurement is legible to a reader; only the sync script cannot parse it.

## D8. Body edits

**Question.** May the rule-mandated body edits be applied across all twenty affected issues?

**Answer.** Apply all: strip References rows that link same-board issues, restate Problem and Proposal text that names its own ids, fix #527's `Non-goals` heading, reword AC26 off its count, and split the four shared criteria and #530's four-criterion row.
