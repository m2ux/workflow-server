# Placement

A proposed destination and disposition for one orphan's work.

## Prerequisites

Read these files first.

- [Issue](issue.md)
- [Issue Body](issue-body.md)
- [Epic Issue Body](epic-issue-body.md)
- [Initiative Issue Body](initiative-issue-body.md)
- [Task Body](task-body.md)
- [Standalone Body](standalone-body.md)
- [Dependency Graph](dependency-graph.md)

## Operations

### *Draft* Issue Placement

One placement option from the supplied orphan and candidate destinations.

**Inputs:** Current orphan body, candidate destinations, proposed work and supplied planning-record references.

1. Identify an existing task, a new task, a new epic, a new initiative, or Leave.
2. Record the destination and the work it takes, meeting [Fields](#fields).
3. Record whether the orphan is kept, subsumed or left, meeting [Disposition Conditions](#disposition-conditions), including the reason, the original-body preservation requirement and any planning record reference.
4. Return the placement for the caller to offer and apply. The output is the [Placement](#placement-record), including the draft issue changes.

### *Find* Placement Candidates

The issue candidates and available destinations from supplied records.

**Inputs:** Complete repository issue collection.

1. Run [List Orphans](#list-orphans) with the supplied issue file.
2. Return the [Candidate Issues](#candidate-issues) and open initiative and epic destinations for the caller to investigate.

### *Apply* Issue Placement

One selected destination for an orphan's work.

**Inputs:** Confirmed placement, current source and destination records, and the affected initiative and epic bodies.

1. Execute only the branch matching the confirmed destination:
   - **Existing task.**
     - Add the orphan's outcomes to the task criteria.
     - Add its design to Proposal.
     - When they exceed the epic's criteria, add epic criteria cited by the task row.
     - Publish the affected bodies through [Save Tracker Issue](issue.md#save-tracker-issue).
   - **New task.**
     - Run [Populate Epic Issue Body](epic-issue-body.md#populate-epic-issue-body) with the confirmed task scope, current epic context and output path.
     - Add the epic criteria the row's Coverage needs where the orphan's outcomes exceed the epic's, as [Destination Work](#destination-work) states.
     - Link the kept orphan's issue in the row's Task cell, as [Task Delivery](epic-issue-body.md#task-delivery) states for a task with its own issue. A subsumed orphan leaves the cell holding the row id alone until the work is planned and the row gains its work-item file.
     - Number the row where it can start.
     - When movable rows change number, run [Check Dependencies and Numbering](dependency-graph.md#check-dependencies-and-numbering) with the affected initiative and epic drafts and confirmed numbering map.
     - Publish the checked bodies through Save Tracker Issue.
   - **New epic.**
     - Run [Populate Epic Issue Body](epic-issue-body.md#populate-epic-issue-body).
     - Populate the covering row through [Draft Initiative Issue Body](initiative-issue-body.md#draft-initiative-issue-body).
     - Publish the epic through [Save Tracker Issue](issue.md#save-tracker-issue).
     - Link its issue in the initiative row.
   - **New initiative.**
     - Run [Populate Initiative Issue Body](initiative-issue-body.md#populate-initiative-issue-body) from the orphan's scoped problem and confirmed goal.
     - Publish through [Save Tracker Issue](issue.md#save-tracker-issue).
   - **Leave.**
     - Use the source issue as the destination with disposition Leave. The caller rewrites its standalone body and keeps the issue open.
2. Return the saved destination, the identities of all affected bodies and the confirmed disposition to the caller, including the destination epic and row for a new task. The caller performs the rewrite or closure.

### *Rewrite* Orphan Issue

The selected layout, with the original wording preserved for readers.

**Inputs:** Source issue identity, selected destination kind, and the evidence and design the body carries.

1. Fetch the body and discussion live with [Read Tracker Issue](issue.md#read-tracker-issue).
   - Post the body word for word through [Comment on Issue](issue.md#comment-on-issue), preceded by the line in [Original Body](#original-body) and a blank line.
   - Skip the comment where the discussion already carries one, since a second hoist of the same issue would otherwise repeat it.
2. Use the selected [Populate Task Body](task-body.md#populate-task-body), [Populate Epic Issue Body](epic-issue-body.md#populate-epic-issue-body), [Populate Initiative Issue Body](initiative-issue-body.md#populate-initiative-issue-body) or [Populate Standalone Body](standalone-body.md#populate-standalone-body) body.
   - Carry evidence into Problem and design into Proposal.
3. Run [Check Round of Edits](issue-body.md#check-round-of-edits) with the populated body and selected kind conditions before publishing.
   - Resolve findings.
   - Run [Save Tracker Issue](issue.md#save-tracker-issue) with the validated body, title and labels.
   - Return the saved identity to the caller.

### *Subsume* Orphan Work

The work remains tracked by the taking issue.

**Inputs:** Orphan identity and body, confirmed destination evidence, and the planning record it references when it has one.

1. Transfer the work to the taking issue.
   - Make each outcome a criterion of one invariant.
   - Put the design in Proposal.
   - Cite the orphan and any planning record in References.
2. Prepare the comment file naming the taking issue and task, for example `Tracked in [I07:E01](…/issues/937) W04.` The closure operation records it once.
3. Run [Close Transferred Work](issue.md#close-transferred-work) with the orphan identity, confirmed destination evidence and closure comment file, retaining the orphan's body.
   - Return the confirmed closure or blocker to the caller.

## Fields

- **Source.** The orphan's repository, issue number and current body.
- **Destination.** The selected issue or proposed work, with the criteria and design it takes.
- **Disposition.**
  Kept, subsumed or left, with a reason. A referenced planning record is carried with the source reference.
- **Draft bodies.**
  Each proposed body meets its own kind's shape and states the result. It carries no account of how the work arrived. A source reference says what detail it holds.
- **Links.**
  An initiative row identifies its epic issue. A task issue has its delivery link through Development.
- **Preservation.**
  A kept or left issue has the complete original-body comment ready before its rewrite. A subsumed issue retains its body.

### Placement Record

| Destination | Work | Issue Disposition |
| --- | --- | --- |
| Existing task | Criteria and design in a task that has its own issue | Subsumed |
| New task | A row in an existing epic, with its criteria | Kept or subsumed |
| New epic | An epic in an existing initiative | Kept or subsumed |
| New initiative | An initiative | Kept or subsumed |
| Leave | Work outside the initiative structure | Left open |

### Original Body

The comment starts with `The body before this issue took the [I07:E01:W04] layout:` for a kept issue, or `The body before this issue took the standalone layout:` for one left in place. A blank line separates that lead from the complete original body.

### Disposition Conditions

A source with a planning-record reference is subsumed, with that folder cited beside the source in the destination. Otherwise the source is kept when its work needs its own discussion or evidence, and subsumed when its detail fits in rows, criteria and a reference. Work an existing criterion already states is subsumed into the issue holding that criterion, without a new row; for cited standalone work this is usually the citing issue.

### Candidate Issues

Candidates are open issues without an agent-engineering prefix. Orphans have no incoming link from an open initiative, epic or task. Cited standalone issues have such a link in prose or References; their records include labels, citing issues and any linked planning folder. An investigation cited by an epic is a candidate, with disposition determined from supplied criteria.

### Destination Work

An existing-epic option identifies the row to add, with Description, criteria, Depends on and Joins, or the existing task already delivering the work. Leave applies when no initiative goal covers it or it is not planned work. Each option names whether the source is kept or subsumed.

## Commands

### List Orphans

Lists the hoist candidates, and the open initiatives and epics they could join.

**Inputs:** Complete supplied repository issue collection.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/orphans.py '<issues-json-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/orphans.py issues.json
```
