# Plan mode

Raises or restructures an initiative and its epics, and keeps them current as work lands.

## Procedure

1. **Understand the request.**
   - Interview the user until the goal and scope are clear.
   - State the goal back as clauses, each an outcome someone could observe, and have the user confirm them.
   - Every later review tests against these clauses.
2. **Gather evidence.**
   - Measure the current state: counts, paths, file:line.
   - Delegate broad sweeps to parallel sub-agents, and spot-check what they return before recording it.
3. **Planning record.**
   Keep one for a new initiative, or for a change whose decisions need a record. A one-epic addition with no open decision goes straight to step 4.
   - Branch a worktree from `origin/engineering` and add `artifacts/planning/<yyyy-mm-dd>-<slug>/`.
   - `README.md` holds the problem, the goal's clauses and their trace to the criteria, design, decisions, reviews and open questions. `inventory.md` holds the evidence.
   - Open a draft PR against `engineering` for discussion. The user merges it.
4. **Draft bodies.**
   - Draft each body from its template into a local file. Those files are the source for every later edit.
   - Write the acceptance criteria before the Work Breakdown, so each row's Description can cite them.
   - The initiative's criteria are drawn from the goal's clauses, and the epics' criteria carry the detail that makes them true, as the goal pass in `review-passes.md` defines.
   - Each criterion names its instrument, and a test it names that does not exist yet is planned as work, as the goal pass's Verified rule defines.
   - The initiative closes once every criterion is ticked.
5. **Review the drafts.**
   - Run the goal pass in `review-passes.md`, and [Check dependencies](commands.md#check-dependencies) over the drafts.
   - Fold every gap and problem in and run both again. No issue is created while either reports one.
6. **Create issues.**
   Create them with [Create issue](commands.md#create-issue), so that every number exists before it is cited:
   1. the initiative, with a placeholder link for each epic's row id, such as `[E00](#E00)`;
   2. the epics in dependency order, each citing the initiative and the epics created before it, with placeholders for any it cites that do not exist yet;
   3. a [Patch body](commands.md#patch-body) replacing every remaining placeholder, in the initiative and in any epic that holds one. Grep the local files for `#E[0-9]` until none is left;
   4. a task issue from `templates/task.md` for each task that needs one, citing its epic;
   5. [Check format](commands.md#check-format) with `--fix` on each epic, which links its epic references to their issues, and on the initiative, which gives each row its epic's title name; a [Patch body](commands.md#patch-body) from each fixed body.
7. **Review.**  Run the passes in `review-passes.md`:
   - the goal pass, whenever the goal, a criterion or an epic changes;
   - the consistency pass, after every round of edits;
   - the ordering pass, whenever tasks or dependencies change.

   Fold each finding in and record it in the planning record.
8. **Keep in step.**
   - After each round, patch every changed issue, update the planning record and the discussion PR body, then commit and push.
   - Titles change with renumbering, and Description cells change when criteria are renumbered.
9. **Ready the epic.**
   Ready each epic before it starts. No task of the epic starts until all hold:
   - **Integration branches exist.**
     - Each long-lived branch the epic's tasks change has the initiative's integration branch, as the [Work Breakdown guide](work-breakdown.md#delivery) defines.
     - Cut a missing one with [Create integration branch](commands.md#create-integration-branch), and point an open pull request of the epic at it with [Retarget pull request](commands.md#retarget-pull-request).
   - **Open questions resolved.**
     - An open question is unfinished planning.
     - Put each to the user with its recommendation, record the answer in the planning record, and fold it into the epic: its Proposal, tasks, criteria and dependencies may all change.
     - Then delete the question; the section goes with the last one.
   - **One condition per criterion.**
     - Read each criterion for conditions joined by "and" or a list of clauses that different tasks make true.
     - Split each such criterion, adding the new ones at the end of the list, and cite each from the rows that deliver it.
     - A condition over a list of subjects ("every reader reads `when` alone: the validator, the guards …") is one condition.

   Run the goal pass, and the ordering pass when tasks or dependencies change.
10. **Deliver.**  As work lands, run update mode (`update-mode.md`).

## Rules

- **The discussion PR.**
  Merging it is the user's call. After it merges, repoint the issue links to `engineering`.
