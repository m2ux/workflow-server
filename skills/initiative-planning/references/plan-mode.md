# Plan mode

Raises or restructures an initiative and its epics, and keeps them current as work lands.

## Procedure

1. **Understand the request.** Interview the user one question at a time, each with a recommended
   option, until the goal and scope are clear. State the goal back as clauses, each an outcome
   someone could observe, and have the user confirm them. Every later review tests against these
   clauses.
2. **Gather evidence.** Measure the current state: counts, paths, file:line. Delegate broad sweeps to
   parallel sub-agents, and spot-check what they return before recording it.
3. **Planning record**, for a new initiative or for a change whose decisions need a record. A
   one-epic addition with no open decision goes straight to step 4.
   - Branch a worktree from `origin/engineering` and add
     `artifacts/planning/<yyyy-mm-dd>-<slug>/`.
   - `README.md` holds the problem, the goal's clauses and their trace to the criteria, design,
     decisions, reviews and open questions.
     `inventory.md` holds the evidence.
   - Open a draft PR against `engineering` for discussion. The user merges it.
4. **Draft bodies** from the templates, into local files. Those files are the source for every later
   edit. Write the acceptance criteria before the Work Breakdown, so each row's Outcomes can cite
   them. The initiative states Goals, not acceptance criteria: SMART goals drawn from the goal's
   clauses, each bounded by a milestone, stating what the initiative achieves as a whole. The epics'
   criteria carry the detail that makes them true, so goals are not ticked.
5. **Review the drafts.** Run the goal pass in `review-passes.md`, and `deps.py I=… E00=…` over
   the drafts. Fold every gap and problem in and run both again. No issue is created while either
   reports one.
6. **Create issues** so that every number exists before it is cited:
   1. the initiative, with a placeholder link for each epic's row id, such as `[E00](#E00)`;
   2. the epics in dependency order, each citing the initiative and the epics created before it,
      with placeholders for any it cites that do not exist yet;
   3. patches replacing every remaining placeholder, in the initiative and in any epic that holds
      one. Grep the local files for `#E[0-9]` until none is left;
   4. a task issue from `templates/task.md` for each task that needs one, citing its epic, with the
      row id then linking the issue;
   5. `format.py --initiative issue-<initiative>.json --fix` on each epic, which links its epic
      references to their issues, and a patch from each fixed body.
7. **Review.** Run the passes in `review-passes.md`:
   - the goal pass, whenever the goal, a criterion or an epic changes;
   - the consistency pass, after every round of edits;
   - the ordering pass, whenever tasks or dependencies change.

   Fold each finding in and record it in the planning record.
8. **Keep in step.** After each round, patch every changed issue, update the planning record and the
   discussion PR body, then commit and push. Titles change with renumbering, and Outcomes cells
   change when criteria are renumbered.
9. **Resolve open questions** before an epic starts. An open question is unfinished planning, so
   no task of the epic starts while one remains. Put each to the user with its recommendation, record
   the answer in the planning record, and fold it into the epic: its Proposal, tasks, criteria and
   dependencies may all change. Run the goal pass, and the ordering pass when tasks or dependencies
   change, then delete the question. The epic is ready to start when its Open questions section is
   gone.
10. **Deliver.** As work lands, run update mode (`update-mode.md`).

## Commands

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/deps.py I=live-936.md E00=live-943.md E01=live-937.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/renumber.py --initiative 07 --prs prs.json --map 6:0,0:1 live-*.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/renumber.py --initiative 07 --epic 1 --own live-937.md --tasks 7:3,3:5 live-*.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/format.py issue-943.json --initiative issue-936.json
```

- `deps.py` checks the task dependency graph across the epics given, including dependencies
  listed twice or already implied, and Join pairs. With `I=` it checks the initiative's Depends on
  cells against the epics.
- The first `renumber.py` renumbers epics. The second renumbers E01's tasks: `E01 Wxx` and
  `E01:Wxx` everywhere, and bare `Wxx` inside E01's own body. Links keep their targets. Both
  rewrite files in place, and refuse a map that collides or that renumbers delivered work: a task
  whose id links its pull request, or an epic a pull request in `--prs` names.
- `format.py` checks one issue against its template, including that every criterion is delivered by
  a Work Breakdown row. An epic's check takes its initiative's JSON, which lists the epic issues its
  references link to.

## Rules

- **The discussion PR.** Merging it is the user's call. After it merges, repoint the issue links to
  `engineering`.
