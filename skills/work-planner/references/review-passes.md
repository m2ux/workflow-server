# Review Passes

The method for the goal pass, the consistency pass, and the ordering pass. The requirements they share are the [review criteria](review-criteria.md).

## Fetch

Each pass reads its inputs first.

1. **Issues.**  Fetch each issue the pass reads, with [Fetch Issue](commands.md#fetch-issue) and [Fetch Body](commands.md#fetch-body).
2. **Drafts.**  The goal pass that gates creation reads the local drafts.

## Report

A pass states each finding this way.

1. **Split by area.**  Report findings split by area.
2. **One pair.**  One problem/solution pair per finding, each with a severity.
3. **Verify.**  Verify every finding against its source before stating it, and quote the file:line that establishes it.
4. **Decide.**  Put findings that need a decision to the user.

## Goal Pass

Tests the drafts against the [review criteria](review-criteria.md) for the issue's kind. It runs on the drafts before any issue is created, and again whenever the goal, a criterion, a Problem, a Proposal, or an epic changes.

1. **Clauses.**
   Take the goal the user stated and confirmed in the interview, as clauses, each an outcome someone could observe.
2. **Trace.**
   Build a trace table: goal clause, the initiative criteria that make it true, the epics whose Description cells cite those criteria, and the epic criteria that deliver them. Each gap is one the [trace](review-criteria.md#trace) criteria name. Remove a criterion that traces to no clause, or put it to the user. [Check Format](commands.md#check-format) finds an epic criterion no task row delivers.
3. **Criteria.**
   Check each criterion against the [shared acceptance criteria](review-criteria.md#shared-acceptance-criteria) and the Acceptance Criteria for the issue's kind.
4. **Friction.**
   Read each Problem and Proposal against the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal), and record each finding the Problem criteria for the issue's kind name. [Check Format](commands.md#check-format) reports each excluded name.
5. **Outside threats.**
   Look past the clauses for what the [outside threats](review-criteria.md#outside-threats) name.
6. **Rank.**
   - Rank the gaps, and flag the few that most threaten the goal.
   - Record the trace table in the planning record, or give it to the user when the change has none.

## Consistency Pass

Runs after every round of edits. Check each section of the issue against the [review criteria](review-criteria.md) for its kind.

1. **Format.**
   Run [Check Format](commands.md#check-format) on every issue the round changed.

## Ordering Pass

Checks dependencies as a graph, then renumbers. A failure is one the [initiative](review-criteria.md#initiative) or [epic](review-criteria.md#epic) Work Breakdown criteria name.

1. **Check.**
   Run [Check Dependencies](commands.md#check-dependencies) over the live bodies.
2. **Read.**
   Read each task for a dependency the table omits.
3. **Fix.**
   Fix a backward reference by moving the task to the epic that owns its inputs. When the task duplicates work the later epic already does, remove it instead.
4. **Renumber.**
   Renumber so that epics run in number order and tasks are numbered in the order they can start, touching only work not yet delivered.
   - Use [Renumber Epics](commands.md#renumber-epics) for epic numbers and [Renumber Tasks](commands.md#renumber-tasks) for one epic's tasks, with other initiatives' bodies after `--outside`.
   - Then re-sort each table, check every range the script prints, and grep the prose for references it cannot see.
5. **Depends on.**
   Update each initiative Depends on cell to the list [Check Dependencies](commands.md#check-dependencies) gives, and re-run it until it reports no problems.
6. **Chains.**
   Record the longest chains from its output in the planning record. Issue bodies do not narrate order or its reasons.

## Folding Findings

- **Small finding:**
  Edit the owning epic's Proposal, Work Breakdown and acceptance criteria, and cite any new or renumbered criterion in the Description of the row that delivers it.
- **Distinct concern:**
  A new epic. Create it, link it from the initiative table, and renumber if run order requires.
- **Record:**
  In the planning record, add a table of findings and where each is resolved, plus the decisions taken with the review.
- **Local files:**
  Patch every changed issue from its local file, and keep that file as the source for the next pass.
