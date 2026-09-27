# Review passes

Each pass reads the issues as they stand on GitHub, not the local drafts. Fetch every body first,
with full host permissions:
`unset GH_TOKEN GITHUB_TOKEN; gh api repos/{owner}/{repo}/issues/<n> --jq .body > live-<n>.md`.

Report findings split by area, one problem/solution pair per finding, each with a severity. Verify
every finding against the source or artifacts it concerns before stating it, and quote the
file:line that establishes it. Findings that need a decision go to the user as interview questions, one at a time,
each with a recommended option.

## Goal pass

Tests the plan against the end state the initiative promises.

1. Restate the goal as one checkable sentence built from clauses, each an outcome someone could
   observe.
2. For each clause, name the epic and acceptance criterion that make it true. A clause with no
   owner is a gap.
3. Look past the clauses for what defeats the goal from outside:
   - **Consumers.** Anything outside the plan that reads, builds or ships what the plan changes or
     removes.
   - **Silent failures.** Skips, fallbacks and fail-closed paths that hide a violation.
   - **Measurement.** Whether "done" has a threshold, a baseline, and an instrument that is
     independent of the thing measured. A baseline is fixed before the plan changes what it
     measures.
   - **Version skew.** Between the artifacts the plan produces and the implementations that read
     them.
   - **In-flight work.** Changes elsewhere that alter the ground the plan stands on.
4. Rank the gaps, and flag the few that most threaten the goal.

## Consistency pass

Runs after every round of edits.

- **Stale references.** Task and epic numbers, issue links, and wording from a superseded
  decision.
- **Titles.** Every issue's `[Ixx:Eyy]` prefix matches its row in the initiative's Work Breakdown
  table.
- **Format.** Run review mode's check, `scripts/format.py`, on every issue the round changed.
- **Contradictions.** Between acceptance criteria in one epic, and between an epic and its
  initiative.
- **Ownership overlaps.** Two epics or tasks claiming one piece of work. Assign one owner and state
  the boundary in both.
- **Duplicates.** The same outcome as a task in two epics. Remove one.
- **Links.** A link to an unmerged planning branch breaks when the branch merges; list those to
  repoint.
- **Cross-initiative overlap.** Record it in Non-goals and References. Editing another initiative's
  issue needs the user's explicit approval, and the edit stays minimal.

## Ordering pass

Checks dependencies as a graph, then renumbers.

1. Run `scripts/deps.py E00=<body> E01=<body> ...` over the live bodies. It reports:
   - unknown references;
   - backward references: a task depending on a later task in its epic, or an epic depending on a
     later epic;
   - cycles;
   - as advisory, numbering that does not follow start order;
   - the longest chains, and the tasks every one of them shares.
2. Read each task for dependencies the table omits. A task that measures, extends or consumes
   another task's output depends on it, even when the text never says so.
3. Fix a backward reference by moving the task to the epic that owns its inputs. When the task
   duplicates work the later epic already does, remove it instead.
4. Renumber so that epics run in number order and tasks are numbered in the order they can start.
   Use `scripts/renumber.py --initiative NN --map old:new,...` for epic numbers, and
   `--epic N --own <body> --tasks old:new,...` for one epic's tasks. Then re-sort each table,
   check every range the script prints, and grep the prose for references it cannot see.
5. Re-run `deps.py` until it reports no problems. State the longest chains from its output.
6. Update the initiative's Work Breakdown table. **Depends on** is what must be true before the epic
   starts. An epic whose first task can start at once, but whose main task waits, says so in the
   cell.

## Folding findings

- **Small finding:** edit the owning epic's Proposal, Work Breakdown and acceptance criteria.
- **Distinct concern:** a new epic. Create it, link it from the initiative table, and renumber if
  run order requires.
- **Record:** in the planning record, add a table of findings and where each is resolved, plus the
  decisions taken with the review.
- **Local files:** patch every changed issue from its local file, and keep that file as the source
  for the next pass.
