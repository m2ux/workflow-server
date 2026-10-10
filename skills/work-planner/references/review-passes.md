# Review Passes

The method for the goal pass, the consistency pass, and the ordering pass. The requirements they share are the [review criteria](review-criteria.md).

## Prerequisites

Command operations use the [command conventions](commands.md#conventions), read before the first spec.

## Goal Pass

Tests the drafts against the [review criteria](review-criteria.md) for the issue's kind. It runs on the drafts before any issue is created, and again whenever the goal, a criterion, a Problem, a Proposal, or an epic changes.

1. **Clauses.**
   Take the goal the user stated and confirmed in the [Interview](interview.md), as clauses, each an outcome someone could observe.
2. **Trace.**
   Build a trace table: goal clause, the initiative criteria that make it true, the epics whose Coverage cells cite those criteria, and the epic criteria that deliver them. Each gap is one the [trace](review-criteria.md#trace) criteria name. Remove a criterion that traces to no clause, or put it to the user as an [Interview](interview.md). [Check Format](commands.md#check-format) finds an epic criterion no task row delivers.
3. **Align.**
   Read each source the initiative's References mark, and extend the trace table with the source requirement each criterion answers to. Each unmatched requirement, each criterion that departs from the one it cites, and each source that could not be read is a finding the [sources](review-criteria.md#sources) criteria name.
4. **Criteria.**
   Check each criterion against the [shared acceptance criteria](review-criteria.md#shared-acceptance-criteria) and the Acceptance Criteria for the issue's kind.
5. **Friction.**
   Read each Problem and Proposal against the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal), and record each finding the Problem criteria for the issue's kind name. [Check Format](commands.md#check-format) reports each excluded name.
6. **Outside threats.**
   Look past the clauses for what the [outside threats](review-criteria.md#outside-threats) name.
7. **Rank.**
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
2. **Grain.**
   Read each cross-epic dependency against the whole-epic section [Check Dependencies](commands.md#check-dependencies) prints.
   - Name the row that produces what the dependent row consumes.
   - A whole epic stays only when every row of that epic must hold before the task starts, as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
   - Re-run the check after an edge changes.
3. **Joins.**
   Complete Joins as the [Work Breakdown Guide](work-breakdown.md#tables) defines. A pair [Check Dependencies](commands.md#check-dependencies) prints is joined, or named in the planning record with why it does not share a pull request.
4. **Read.**
   Read each task for a dependency the table omits.
5. **Fix.**
   Fix a backward reference by moving the task to the epic that owns its inputs. When the task duplicates work the later epic already does, remove it instead.
6. **Renumber.**
   Renumber under [Numbering](work-breakdown.md#numbering), preserving the numbers of work already named by a pull request.
   - Use [Renumber Epics](commands.md#renumber-epics) for epic numbers and [Renumber Tasks](commands.md#renumber-tasks) for one epic's tasks, with other initiatives' bodies after `--outside`.
   - Then re-sort each table, check every range the script prints, and grep the prose for references it cannot see.
7. **Depends on.**
   Check each initiative edge against the [whole-epic prerequisite rule](work-breakdown.md#tables), keeping narrower dependencies in task rows. Apply the corrections [Check Dependencies](commands.md#check-dependencies) reports, and re-run it until it reports no problems.
8. **Chains.**
   Record the longest chains from its output in the planning record. Name each whole-epic edge whose binding row is on a chain: that edge sets the chain's length. Issue bodies do not narrate order or its reasons.

## Fetch

Each pass reads its inputs first.

1. **Issues.**  Fetch each issue the pass reads, with [Fetch Issue](commands.md#fetch-issue) and [Fetch Body](commands.md#fetch-body).
2. **Drafts.**  The goal pass that gates creation reads the local drafts.
3. **Sources.**
   Fetch each source the initiative's References mark, with [Fetch Source](commands.md#fetch-source). An epic's fetch takes its initiative's.

## Report

A pass states each finding this way.

1. **Split by area.**  Report findings split by area.
2. **One pair.**  One problem/solution pair per finding, each with a severity.
3. **Verify.**  Verify every finding against its source before stating it, and quote the file:line that establishes it.
4. **Decide.**  Put findings that need a decision to the user as an [Interview](interview.md).

## Folding Findings

- **Small finding:**
  Edit the owning epic's Proposal, Work Breakdown and acceptance criteria, and cite any new or renumbered criterion in the Coverage of the row that delivers it.
- **Distinct concern:**
  A new epic. Create it, link it from the initiative table, and renumber if run order requires.
- **Record:**
  In the planning record, add a table of findings and where each is resolved, plus the decisions taken with the review.
- **Local files:**
  Patch every changed issue from its local file, and keep that file as the source for the next pass.
