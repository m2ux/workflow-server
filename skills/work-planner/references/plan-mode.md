# Plan Mode

Scopes the solution: the design, the criteria, and the breakdown of an initiative and its epics, and keeps them current as work lands.

## Procedure

1. **Take the proposal.**
   - When the user names a proposal, its Problem, its Non-Goals, and its goal clauses are the problem scope. Plan does not interview that scope again.
   - When no proposal is named, understand the problem and gather the evidence as [Propose Mode](propose-mode.md) does under Understand the problem and Gather evidence.
   - Every later review tests against these clauses.
2. **Planning record.**
   Keep one for a new initiative, or for a change whose decisions need a record. A one-epic addition with no open decision goes straight to Draft bodies.
   - Add the record with [Add Planning Record](commands.md#add-planning-record), and fill it as the [planning layout](planning-layout.md) describes.
   - Draft the discussion pull request's body from the [pull request template](../templates/pull-request.md) and open it as a draft. The user merges it.
3. **Draft bodies.**
   - Draft each body from its template into a local file. Those files are the source for every later edit.
   - A Problem and a Proposal follow the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal). The initiative's Problem and Non-Goals are the proposal's, when a proposal was taken.
   - Write the acceptance criteria before the Work Breakdown, so each row's Description can cite them. Each criterion comes from a confirmed clause.
   - The initiative's criteria are drawn from the goal's clauses, and the epics' criteria carry the detail that makes them true, as the [review criteria](review-criteria.md) for an initiative define.
   - Each acceptance criterion is written to this mode's Criteria at creation rule. It ends by naming its instrument as that pass's Verified rule defines. A test it names that does not exist yet is planned as work.
   - An item a test cannot observe is named as [Coverage Reports](work-breakdown.md#coverage-reports) defines.
   - The initiative closes as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
4. **Review the drafts.**
   - Run the [Goal Pass](review-passes.md#goal-pass), including its [trace](review-criteria.md#trace) and its [Whole](review-criteria.md#whole) rule, and [Check Dependencies](commands.md#check-dependencies) over the drafts. The trace and the Whole rule run because the plan has epics.
   - Fold every gap and problem in and run both again. No issue is created while either reports one. An acceptance criterion is created only once it complies with this mode's Criteria at creation rule.
5. **Create issues.**
   Create them with [Create Issue](commands.md#create-issue), so that every number exists before it is cited:
   1. the initiative, with a placeholder link for each epic's row id, such as `[E00](#E00)`;
   2. the epics in dependency order, each citing the initiative and the epics created before it, with placeholders for any it cites that do not exist yet;
   3. a [Patch Body](commands.md#patch-body) replacing every remaining placeholder, in the initiative and in any epic that holds one. Grep the local files for `#E[0-9]` until none is left;
   4. a task issue from the [task template](../templates/task.md) for each task that needs one, citing its epic, its acceptance criteria written to this mode's Criteria at creation rule;
   5. [Check Format](commands.md#check-format) with `--fix` on each epic, which links its epic references to their issues, and on the initiative, which gives each row its epic's title name; a [Patch Body](commands.md#patch-body) from each fixed body.
6. **Review.**  Run the [Review Passes](review-passes.md):
   - The goal pass, whenever the goal, a criterion, a Problem, a Proposal, or an epic changes;
   - The consistency pass, after every round of edits;
   - The ordering pass, whenever tasks or dependencies change.

   Fold each finding in and record it in the planning record.
7. **Keep in step.**
   - After each round, patch every changed issue, update the planning record and the discussion pull request's body from the [pull request template](../templates/pull-request.md), then commit and push.
   - Titles change with renumbering, and Description cells change when criteria are renumbered.
8. **Ready the epic.**
   Ready each epic before it starts. No task of the epic starts until all hold:
   - **Integration branches exist.**
     - Each long-lived branch the epic's tasks change has the initiative's integration branch, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
     - Cut a missing one with [Create Integration Branch](commands.md#create-integration-branch), and point an open pull request of the epic at it with [Retarget Pull Request](commands.md#retarget-pull-request).
   - **Open Questions resolved.**
     - An open question is unfinished planning.
     - Put each to the user with its recommendation, record the answer in the planning record, and fold it into the epic: its Proposal, tasks, criteria and dependencies may all change.
     - Then delete the question; the section goes with the last one.
   - **One condition per criterion.**
     - Read each criterion for conditions joined by "and" or a list of clauses that different tasks make true.
     - Split each such criterion, adding the new ones at the end of the list, and cite each from the rows that deliver it.
     - A condition over a list of subjects ("every reader reads `when` alone: the validator, the guards …") is one condition.

   Run the goal pass, and the ordering pass when tasks or dependencies change.
9. **Deliver.**  As work lands, run [Sync Mode](sync-mode.md).

## Rules

- **Criteria at creation.**
  - An acceptance criterion complies with the [shared acceptance criteria](review-criteria.md#shared-acceptance-criteria) and, for an initiative, its [Acceptance Criteria](review-criteria.md#acceptance-criteria) when it is written.
  - The issue that carries it is created only after the criterion complies.
- **The discussion PR.**
  Merging it is the user's call.
- **Pull request bodies.**
  Every pull request this mode opens is drafted from the [pull request template](../templates/pull-request.md).
