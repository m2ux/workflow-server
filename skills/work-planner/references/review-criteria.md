# Review Criteria

The requirements every review uses, scoped to the kind of issue and to the section under review. A pass or a mode checks the section against its criteria here, and does not restate them.

## Proposal

A proposal states the problem, the boundary, and the goal clauses. The design, the acceptance criteria, and the Work Breakdown are written in [Plan Mode](plan-mode.md).

### Problem

- A Problem states the friction as it is now. Its evidence is a count or a code link for that friction, as the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal) defines.
- A Problem that describes the plan is a finding.

### Goal

- Each clause is an outcome someone could observe.
- A clause does not describe the change.

### Non-Goals

- One succinct sentence each on what the proposal does not do.
- A non-goal names no initiative, epic, task or issue, and no owner.

## Initiative

An initiative states the goal as criteria and lists the epics that deliver them. The trace from the goal to that work, and what defeats the goal from outside, are reviewed here.

### Problem

- A Problem states the friction as it is now, as the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal) defines.
- A Problem that describes the plan is a finding.

### Proposal

- A Proposal states the design, as the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal) defines.
- A Proposal names no epic, task, or acceptance criterion of its own initiative.

### Trace

- A clause with no initiative criterion is a gap.
- An initiative criterion no epic delivers, or that its epics' criteria only partly make true, is a gap.
- A criterion that traces to no clause is scope the user did not ask for.

### Work Breakdown

- An epic row's Description is the epic's title name, and its Coverage names the initiative criteria the epic serves.
- Depends on names epics only, never tasks, and only the epics this epic's tasks depend on that another named epic does not already cover.
- An initiative Depends on cell that names a task, or that differs from the epics the epics' tasks depend on, is unsound.
- An epic depending on a later epic is a backward reference.
- Numbering that does not follow start order is advisory.

### Acceptance Criteria

An initiative criterion meets the [shared acceptance criteria](#shared-acceptance-criteria), and:

- **No counts.**
  An initiative criterion carries no counts or figures, which go stale: it measures against a named baseline or check ("against the baseline", "as the budget test measures it"). A figure stays only where it is the criterion's own target, such as a bound it holds to.
- **SMART.**
  Each initiative criterion is **specific** about what holds; **measurable** by a named check or baseline; **achievable** by the epics that cite it; **relevant**, tracing to a clause and to the Problem; and **time-bound** by a release tag or another named milestone outside the initiative's own work, where one exists, and otherwise by the epics that cite it.
- **Local.**
  An initiative criterion names no initiative, epic, task or issue, and is solution-agnostic: Description cells link epics to criteria, never the reverse. One that holds only through another initiative's work is not local: restate what this initiative achieves, or drop it.
### Whole

An initiative criterion states what the initiative achieves as a whole. One that restates a single epic's criterion is a duplicate: raise it to what the epics achieve together, or leave it to the epic.

### Verified
  - An initiative criterion ends by naming its instrument. Which instruments keep a criterion is the [Verifiable](#verifiable) rule.
  - An automated test is an end-to-end walk through the real server, a smoke run of an agent against a live server, a live check on a deployed host, or a guard, fixture suite or check that continuous integration runs. The walk, smoke run or live check is preferred where the criterion is about what a run does.
  - A named test that does not exist yet is work the plan holds: a task in the epic whose subject it tests, or a discrete test-infrastructure epic when the tests serve several criteria. That epic's row cites the criteria its tests verify.

### Non-Goals

- Only the initiative has them: one succinct sentence each on what the initiative does not do, naming no initiative, epic, task or issue, and no owner.

### References

- A cross-initiative overlap is recorded in References. An approved edit to another initiative's issue stays minimal.

### Outside threats

What defeats the goal from outside the clauses:

- **Consumers.**
  Anything outside the plan that reads, builds or ships what the plan changes or removes.
- **Silent failures.**  Skips, fallbacks and fail-closed paths that hide a violation.
- **Measurement.**
  Whether "done" has a threshold, a baseline, and an instrument that is independent of the thing measured. A baseline is fixed before the plan changes what it measures.
- **Version skew.**
  Between the artifacts the plan produces and the implementations that read them.
- **In-flight work.**  Changes elsewhere that alter the ground the plan stands on.

## Epic

An epic states one slice of the initiative's design and lists the tasks that deliver it.

### Problem

- A Problem states the friction of this epic, as the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal) defines.
- A Problem that describes the plan is a finding.

### Proposal

- A Proposal states the design of this epic, as the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal) defines.
- A boundary with a sibling epic is plain language in the Proposals, not a non-goal.

### Work Breakdown

- A task row's Description is at most eight words, with no semicolon, and names what the row delivers.
- Detail in a longer Description that no cited criterion already states becomes a new criterion of one invariant, cited by the row.
- Coverage names the epic criteria the task must meet. Each row's criteria are the ones its work makes true: a row does not claim a criterion another row delivers alone, and a criterion is not left to a row whose work cannot meet it.
- An epic criterion no task row delivers is a gap.
- A task delivering more than three criteria no other task delivers is split into tasks one pull request each can deliver.
- Depends on is references only. A task depending on a later task in its epic is a backward reference.
- A dependency listed twice, or already implied by another in the same cell, is unsound.
- A cycle is unsound.
- A Joins pair that is one-way, or where one task depends on the other, directly or through a task outside the pair, is unsound.
- A task that measures, extends or consumes another task's output depends on it, even when the text never says so.
- An unknown reference is unsound.
- Numbering that does not follow start order is advisory.
- Two epics or tasks claiming one piece of work have one owner, and the boundary is stated in both.
- The same outcome as a task in two epics is a duplicate: remove one, or raise the initiative's.

### Acceptance Criteria

An epic criterion meets the [shared acceptance criteria](#shared-acceptance-criteria). Contradictions between acceptance criteria in one epic are findings.

### Open Questions

- Each has a recommendation in the planning record, and holds only what is undecided. A settled point moves to the planning record.
- An epic whose first task is next has none.

### Title

- The epic's `[Ixx:Eyy]` prefix matches its row in the initiative's Work Breakdown table.
- The initiative row carries the epic's title name.

## Task

A task states one pull request's worth of its epic's design.

### Problem

- A Problem states the friction of this task, as the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal) defines.

### Proposal

- A Proposal states the design of this task, as the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal) defines.

### Acceptance Criteria

A task criterion meets the [shared acceptance criteria](#shared-acceptance-criteria).

### Open Questions

- Each holds only what is undecided, and is resolved before the task starts.

## Any issue

These criteria bind every issue, whatever its kind.

### Title

- The name is two or three words and the subtitle a succinct summary of at most ten, in title case.
- Its title has the agent-engineering form.

### Stale references

- Task and epic numbers, issue links, and wording from a superseded decision are stale.

### Body

- A body states the plan as it is. It carries no change narrative, as the skill's [Rules](../SKILL.md#rules) state.
- A name the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal) excludes is a finding.

## Shared acceptance criteria

An initiative criterion, an epic criterion, and a task criterion each meet these. A kind adds its own under its Acceptance Criteria.

- States an end state, not an activity.
- Names or implies the instrument that observes it: a test, a guard, a command or a measure.
- Is unambiguous, so two readers agree on whether it holds.
- **One invariant.**
  Each criterion states a single condition that holds or does not. One joining several is split, and the Description cells cite the new ones.

### Verifiable

An acceptance criterion is kept only when a test can fail it. The source is the verifiable characteristic in ISO/IEC/IEEE 29148: a requirement is verifiable when its realisation can be proved, and subjective wording is barred.
  - Subjective wording is rewritten to an observable pass or fail, or the criterion is removed.
  - A fact a test can check is kept, such as every option having a description.
  - A judgment about meaning, such as a claim that a description states what choosing means, is that subjective wording.
  - An item a test cannot observe is named as [Coverage Reports](work-breakdown.md#coverage-reports) defines.
