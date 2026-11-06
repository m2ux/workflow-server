# Goal Trace

The table tying each clause of a confirmed goal to the initiative criteria that make it true, the epics that deliver them, and the source requirements they answer to, with the ranked gaps that trace exposes.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Initiative Issue Body](initiative-issue-body.md)
- [Planning Record](planning-record.md)

## Operations

### Review Initiative Goal

The draft checked against the initiative outcomes.

#### 1. Identify Confirmed Goal Clauses

Take the user’s stated and confirmed goal from [Goal Evidence](#goal-evidence) as clauses, each an outcome someone could observe.

#### 2. Build Goal Trace

- Build the [Trace Table](#trace-table) from those clauses, the initiative criteria, the epics whose Coverage cells cite them and the epic criteria that deliver them.
- Every goal clause has an initiative criterion that makes it true.
- Every initiative criterion is delivered by an epic, and that epic's criteria make the criterion wholly true.
- Every initiative criterion traces to a goal clause.
- Remove one that traces to none, or put that scope to the user.
- Record any criterion no task row delivers as a gap from the supplied epic format results.

#### 3. Read Marked Requirement Sources

- Apply [Read Requirement Sources](initiative-issue-body.md#read-requirement-sources "ƒ") with the initiative References, checkout, authenticated access and output files.
- Extend the trace table with the source requirement each criterion answers to. Each unmatched requirement, each criterion that departs from the one it cites, and each source that could not be read is a gap [Sources](initiative-issue-body.md#sources) names.

#### 4. Check Acceptance Criteria

Check each criterion against the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria) and [Initiative Acceptance Criteria](initiative-issue-body.md#initiative-acceptance-criteria).

#### 5. Validate Local Drafts

- Apply [Build Body Snapshot](issue-body.md#build-body-snapshot "ƒ") for each supplied local draft with its title, labels and existing identity when present.
- Apply [Validate Initiative Body](initiative-issue-body.md#validate-initiative-body "ƒ") with the initiative JSON, every linked epic's current JSON, source evidence and output file.
- Incorporate its local findings into this review.

#### 6. Check Outside Threats

Apply [Check Outside Threats](#check-outside-threats "ƒ") with the current initiative and epic bodies or drafts, and the artifacts and consumers the plan changes.

#### 7. Provide Ranked Gaps

- Rank the gaps, meeting [Gaps](#gaps).
- Flag the few that most threaten the goal.
- Record the trace table in the [planning record](planning-record.md), or give it to the user when the change has none.
- Provide [Review Result](#review-result) with the trace and ranked findings.

### Check Outside Threats

An item the draft leaves open is a gap.

#### 1. Check External Consumers

Check for anything outside [Plan Bodies](#plan-bodies) that reads, builds or ships the [Changed Surface](#changed-surface).

#### 2. Check Hidden Violations

Check for a skip, a fallback, or a fail-closed path that hides a violation.

#### 3. Check Completion Instrument

Check that done has a threshold, a baseline, and an instrument that is independent of the thing measured. The baseline is fixed before the plan changes what it measures.

#### 4. Check Consumer Alignment

Check for skew between an artifact the plan produces and an implementation that reads it.

#### 5. Provide External Threats

- Check for a change elsewhere that alters the ground the plan stands on.
- Provide [Review Result](#review-result) with the evidenced threats and gaps to the requesting goal review.

## Fields

### Trace Table

| Goal clause | Initiative criteria | Epics | Epic criteria | Source requirement |
| --- | --- | --- | --- | --- |
| The outcome the user confirmed | The criteria that make the clause true | The epics whose Coverage cells cite those criteria | The epic criteria that deliver them | The requirement the criterion answers to |

Every clause, criterion and epic the initiative holds occupies a row. A cell with no entry is a gap, not an omission.

### Gaps

A gap is a clause no criterion makes true, a criterion no epic delivers, a criterion tracing to no clause, a criterion no task row delivers, an unmatched source requirement, a criterion departing from the source it cites, a source that could not be read, or a threat the draft leaves open. Gaps are ranked, and the few that most threaten the goal are flagged.

### Goal Evidence

The current initiative and epic bodies or local drafts, confirmed goal clauses, marked requirement sources and supplied epic-format results.

### Changed Surface

The supplied artifacts and consumers the plan changes.

### Review Result

The trace table and ranked findings, including evidenced outside threats and gaps.

### Plan Bodies

The supplied current initiative and epic bodies or local drafts.
