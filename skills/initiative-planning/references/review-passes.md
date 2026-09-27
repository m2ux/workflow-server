# Review passes

Each pass reads the issues as they stand on GitHub, except the goal pass that gates creation, which
reads the local drafts. Fetch every issue first, with full host permissions, as JSON for `format.py`
and as a body for `deps.py` and `renumber.py`:
`gh api repos/{owner}/{repo}/issues/<n> > issue-<n>.json; gh api repos/{owner}/{repo}/issues/<n> --jq .body > live-<n>.md`.

Report findings split by area, one problem/solution pair per finding, each with a severity. Verify
every finding against the source or artifacts it concerns before stating it, and quote the
file:line that establishes it. Findings that need a decision go to the user as interview
questions, one at a time, each with a recommended option.

## Goal pass

Tests the initiative's goals and the epics' acceptance criteria against the goal the user stated. It
runs on the drafts before any issue is created, and again whenever the goal, a criterion or an epic
changes.

1. **Clauses.** Take the goal the user stated and confirmed in the interview, as clauses, each an
   outcome someone could observe.
2. **Trace down.** Build a trace table: goal clause, the initiative goals that make it true, the
   epics whose Outcomes cite those goals, and the epic criteria that deliver them.
   - A clause with no initiative goal is a gap.
   - A goal no epic delivers, or that its epics' criteria only partly make true, is a gap.
   - An epic criterion no task row delivers is a gap; `format.py` finds these.
3. **Trace up.** Every goal and criterion traces to a clause. One that traces to none is scope the
   user did not ask for: remove it, or put it to the user.
4. **Each criterion** states an end state, not an activity; names or implies the instrument that
   observes it: a test, a guard, a command or a measure; and is unambiguous, so two readers agree on
   whether it holds.
   - Each initiative goal is SMART: **specific** about what holds; **measurable** by a named
     threshold or check; **achievable** by the epics that cite it; **relevant**, tracing to a clause
     and to the Problem; and **time-bound** by a milestone, a release tag or an epic or task
     landing. It states what the initiative achieves as a whole. A goal that restates a single
     epic's criterion is a duplicate: raise it to what the epics achieve together, or leave it to
     the epic.
5. Look past the clauses for what defeats the goal from outside:
   - **Consumers.** Anything outside the plan that reads, builds or ships what the plan changes or
     removes.
   - **Silent failures.** Skips, fallbacks and fail-closed paths that hide a violation.
   - **Measurement.** Whether "done" has a threshold, a baseline, and an instrument that is
     independent of the thing measured. A baseline is fixed before the plan changes what it
     measures.
   - **Version skew.** Between the artifacts the plan produces and the implementations that read
     them.
   - **In-flight work.** Changes elsewhere that alter the ground the plan stands on.
6. Rank the gaps, and flag the few that most threaten the goal. Record the trace table in the
   planning record, or give it to the user when the change has none.

## Consistency pass

Runs after every round of edits.

- **Stale references.** Task and epic numbers, issue links, and wording from a superseded
  decision.
- **Titles.** Every issue's `[Ixx:Eyy]` prefix matches its row in the initiative's Work Breakdown
  table.
- **Format.** Run review mode's check, `scripts/format.py`, on every issue the round changed. It
  confirms that each Outcomes cell cites criteria or goals that exist, and that every one has a
  row.
- **Outcomes.** Each row's criteria are the ones its work makes true: a row does not claim a
  criterion another row delivers alone, and a criterion is not left to a row whose work cannot meet
  it. The check confirms coverage, not fit.
- **Contradictions.** Between acceptance criteria in one epic, and between an epic and its
  initiative.
- **Ownership overlaps.** Two epics or tasks claiming one piece of work. Assign one owner and state
  the boundary in both.
- **Duplicates.** The same outcome as a task in two epics, or an initiative goal that restates an
  epic's criterion. Remove one, or raise the goal.
- **Links.** A link to an unmerged planning branch breaks when the branch merges; list those to
  repoint.
- **Non-goals.** Only the initiative has them: one succinct sentence each, naming no epic or task
  of the initiative, and an owner only outside it. A boundary between sibling epics belongs in
  their Proposals.
- **Cross-initiative overlap.** Record it in the initiative's Non-goals and in References. Editing
  another initiative's issue needs the user's explicit approval, and the edit stays minimal.

## Ordering pass

Checks dependencies as a graph, then renumbers.

1. Run `scripts/deps.py I=<initiative body> E00=<body> E01=<body> ...` over the live bodies. It
   reports:
   - unknown references;
   - backward references: a task depending on a later task in its epic, or an epic depending on a
     later epic;
   - cycles;
   - dependencies listed twice, or already implied by another in the same cell;
   - Join pairs that are one-way, or that depend on each other through a task outside the pair;
   - initiative Depends on cells that name a task, or differ from the epics the epics' tasks depend
     on;
   - as advisory, numbering that does not follow start order;
   - the longest chains, and the tasks every one of them shares.
2. Read each task for dependencies the table omits. A task that measures, extends or consumes
   another task's output depends on it, even when the text never says so.
3. Fix a backward reference by moving the task to the epic that owns its inputs. When the task
   duplicates work the later epic already does, remove it instead.
4. Renumber so that epics run in number order and tasks are numbered in the order they can start,
   touching only work no pull request names yet. Use `scripts/renumber.py --initiative NN --prs
   prs.json --map old:new,...` for epic numbers, and `--epic N --own <body> --tasks old:new,...`
   for one epic's tasks. Then re-sort each table, check every range the script prints, and grep the
   prose for references it cannot see.
5. Update each initiative Depends on cell to the list `deps.py` gives, and re-run it until it
   reports no problems.
6. Record the longest chains from its output in the planning record. Issue bodies do not narrate
   order or its reasons.

## Folding findings

- **Small finding:** edit the owning epic's Proposal, Work Breakdown and acceptance criteria, and
  cite any new or renumbered criterion in the Outcomes of the row that delivers it.
- **Distinct concern:** a new epic. Create it, link it from the initiative table, and renumber if
  run order requires.
- **Record:** in the planning record, add a table of findings and where each is resolved, plus the
  decisions taken with the review.
- **Local files:** patch every changed issue from its local file, and keep that file as the source
  for the next pass.
