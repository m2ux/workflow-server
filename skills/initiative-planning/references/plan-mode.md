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
   them.
5. **Review the criteria.** Run the goal pass in `review-passes.md` on the drafts. Fold every gap
   in and run it again. No issue is created while a gap remains.
6. **Create issues** so that every number exists before it is cited:
   1. the initiative, with placeholders such as `#E00` for its epics;
   2. the epics in dependency order, each citing the initiative and the epics created before it,
      with placeholders for any it cites that do not exist yet;
   3. patches replacing every remaining placeholder, in the initiative and in any epic that holds
      one. Grep the local files for `#E[0-9]` until none is left.
7. **Review.** Run the passes in `review-passes.md`:
   - the goal pass, whenever the goal, a criterion or an epic changes;
   - the consistency pass, after every round of edits;
   - the ordering pass, whenever tasks or dependencies change.

   Fold each finding in and record it in the planning record.
8. **Keep in step.** After each round, patch every changed issue, update the planning record and the
   discussion PR body, then commit and push. Titles change with renumbering, and Outcomes cells
   change when criteria are renumbered.
9. **Deliver.** As work lands, keep each epic current:
   - **PR column:** the pull request or commit link, or `in flight` while it is open.
   - **Outcomes cell:** append `— **done**` after the criteria when the task lands, or
     `— **moved to [#nnn](…) Wzz**` when another issue takes it.
   - **Criteria:** tick each acceptance criterion when its outcome is observable.
   - **Where it stands:** record what landed and any figure that came out differently from the plan.
   - **Closing:** close an epic when every criterion is ticked, and the initiative when every epic is
     closed.

## Commands

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/deps.py E00=live-943.md E01=live-937.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/renumber.py --initiative 07 --map 6:0,0:1 live-*.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/renumber.py --initiative 07 --epic 1 --own live-937.md --tasks 7:3,3:5 live-*.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/format.py issue-943.json
```

- `deps.py` checks the task dependency graph across the epics given.
- The first `renumber.py` renumbers epics. The second renumbers E01's tasks: `E01 Wxx` everywhere,
  and bare `Wxx` inside E01's own body. Both rewrite files in place and refuse a map that collides.
- `format.py` checks one issue against its template, including that every criterion is delivered by
  a Work Breakdown row.

## Rules

- **Dependencies.** Every dependency points to an earlier epic or an earlier task. **Depends on** is
  what must be true before the work starts.
- **The discussion PR.** Merging it is the user's call. After it merges, repoint the issue links to
  `engineering`.
