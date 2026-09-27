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

Tests the initiative's and the epics' acceptance criteria against the goal the user stated. It
runs on the drafts before any issue is created, and again whenever the goal, a criterion or an epic
changes.

1. **Clauses.** Take the goal the user stated and confirmed in the interview, as clauses, each an
   outcome someone could observe.
2. **Trace down.** Build a trace table: goal clause, the initiative criteria that make it true,
   the epics whose Description cells cite those criteria, and the epic criteria that deliver them.
   - A clause with no initiative criterion is a gap.
   - An initiative criterion no epic delivers, or that its epics' criteria only partly make true, is
     a gap.
   - An epic criterion no task row delivers is a gap; `format.py` finds these.
3. **Trace up.** Every criterion traces to a clause. One that traces to none is scope the
   user did not ask for: remove it, or put it to the user.
4. **Each criterion** states an end state, not an activity; names or implies the instrument that
   observes it: a test, a guard, a command or a measure; and is unambiguous, so two readers agree on
   whether it holds.
   - **One invariant.** Each criterion states a single condition that holds or does not.
     One joining several is split, and the Description cells cite the new ones.
   - **No counts.** An initiative criterion carries no counts or figures, which go stale: it
     measures against a named baseline or check ("against the baseline", "as the budget test
     measures it"). A figure stays only where it is the criterion's own target, such as a bound it
     holds to.
   - **SMART.** Each initiative criterion is **specific** about what holds; **measurable** by a named check or
     baseline; **achievable** by the epics that cite it; **relevant**, tracing to a clause and to
     the Problem; and **time-bound** by a release tag or another named milestone outside the
     initiative's own work, where one exists, and otherwise by the epics that cite it.
   - **Local.** An initiative criterion names no initiative, epic, task or issue, and is
     solution-agnostic: Description cells link epics to criteria, never the reverse. One that holds
     only through another initiative's work is not local: restate what this initiative achieves,
     or drop it.
   - **Verified.** An initiative criterion ends by naming its instrument, automated where one can
     exist: an end-to-end walk through the real server, a smoke run of an agent against a live
     server, or a live check on a deployed host. Where no automated test can exist, it names how
     the user confirms it. A named test that does not exist yet is work the plan holds: a task in
     the epic whose subject it tests, or a discrete test-infrastructure epic when the tests serve
     several criteria. That epic's row cites the criteria its tests verify.
   - **Whole.** An initiative criterion states what the initiative achieves as a whole. One that restates a single
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
  table, its title has the house form, and the initiative row carries the epic's title name.
- **Format.** Run review mode's check, `scripts/format.py`, on every issue the round changed. It
  confirms that each Description cell cites criteria that exist, and that every one has a
  row.
- **Task grain.** A task delivering more than three criteria that no other task delivers is
  split into tasks one pull request each can deliver.
- **Description.** Each cell is a short phrase of at most eight words. Detail in a longer cell
  that no cited criterion already states becomes a new criterion of one invariant,
  cited by the row. Each row's criteria are the ones its work makes true: a row does not claim a
  criterion another row delivers alone, and a criterion is not left to a row whose work cannot meet
  it. The check confirms coverage, not fit.
- **Contradictions.** Between acceptance criteria in one epic, and between an epic and its
  initiative.
- **Ownership overlaps.** Two epics or tasks claiming one piece of work. Assign one owner and state
  the boundary in both.
- **Duplicates.** The same outcome as a task in two epics, or an initiative criterion that restates
  an epic's. Remove one, or raise the initiative's.
- **Open questions.** Each has a recommendation in the planning record, and holds only what is
  undecided; a settled point moves to the planning record. An epic whose first task is next has
  none.
- **Links.** A link to an unmerged planning branch breaks when the branch merges; list those to
  repoint.
- **Non-goals.** Only the initiative has them: one succinct sentence each on what the initiative
  does not do, naming no initiative, epic, task or issue, and no owner. A boundary between sibling
  epics belongs in their Proposals.
- **Cross-initiative overlap.** Record it in References. Editing another initiative's issue needs
  the user's explicit approval, and the edit stays minimal.

## Ordering pass

Checks dependencies as a graph, then renumbers.

1. Run `scripts/deps.py I=<initiative body> E00=<body> E01=<body> ...` over the live bodies. It
   reports:
   - unknown references;
   - backward references: a task depending on a later task in its epic, or an epic depending on a
     later epic;
   - cycles;
   - dependencies listed twice, or already implied by another in the same cell;
   - Join pairs that are one-way, or where one task depends on the other, directly or through a
     task outside the pair;
   - initiative Depends on cells that name a task, or differ from the epics the epics' tasks depend
     on;
   - as advisory, numbering that does not follow start order;
   - the longest chains, and the tasks every one of them shares.
2. Read each task for dependencies the table omits. A task that measures, extends or consumes
   another task's output depends on it, even when the text never says so.
3. Fix a backward reference by moving the task to the epic that owns its inputs. When the task
   duplicates work the later epic already does, remove it instead.
4. Renumber so that epics run in number order and tasks are numbered in the order they can start,
   touching only work not yet delivered. Use `scripts/renumber.py --initiative NN --prs prs.json
   --map old:new,...` for epic numbers, and `--epic N --own <body> --tasks old:new,...` for one
   epic's tasks, with other initiatives' bodies after `--outside`. Then re-sort each table, check
   every range the script prints, and grep the prose for references it cannot see.
5. Update each initiative Depends on cell to the list `deps.py` gives, and re-run it until it
   reports no problems.
6. Record the longest chains from its output in the planning record. Issue bodies do not narrate
   order or its reasons.

## Folding findings

- **Small finding:** edit the owning epic's Proposal, Work Breakdown and acceptance criteria, and
  cite any new or renumbered criterion in the Description of the row that delivers it.
- **Distinct concern:** a new epic. Create it, link it from the initiative table, and renumber if
  run order requires.
- **Record:** in the planning record, add a table of findings and where each is resolved, plus the
  decisions taken with the review.
- **Local files:** patch every changed issue from its local file, and keep that file as the source
  for the next pass.
