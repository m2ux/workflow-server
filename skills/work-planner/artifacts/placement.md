# Placement

A proposed destination and disposition for one orphan's work.

## Prerequisites

Read these files first.

- [Issue](issue.md)
- [Issue Body](issue-body.md)
- [Epic Issue Body](epic-issue-body.md)
- [Initiative Issue Body](initiative-issue-body.md)
- [Standalone Body](standalone-body.md)
- [Hot-fix Body](hotfix-body.md)
- [Hot-fix](hotfix.md)
- [Dependency Graph](dependency-graph.md)

## Operations

### *Draft* Issue Placement

One placement option from the supplied orphan and candidate destinations.

**Inputs:** Current orphan body, candidate destinations, proposed work and supplied planning-record references.

1. Identify an existing task, a new task, a new epic, a new initiative, a hot-fix, or Leave.
   - Offer a hot-fix only for an orphan that meets the hot-fix [Definition](hotfix-body.md#definition), with the theme board it joins and its [target](hotfix-body.md#target): the declared long-lived branch the orphan's evidence places the defect on, the repository's default branch where it is declared and the evidence names no other.
2. Record the destination and the work it takes, meeting [Fields](#fields).
3. Record whether the orphan is kept, subsumed or left, meeting [Disposition Conditions](#disposition-conditions), including the reason and any planning record reference.
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
     - Leave the row's Task cell holding the row id alone until the work is planned and the row gains its work-item file, as [Task Delivery](epic-issue-body.md#task-delivery) states.
     - Number the row where it can start, and keep its row id for the return.
     - When movable rows change number, run [Check Dependencies and Numbering](dependency-graph.md#check-dependencies-and-numbering) with the affected initiative and epic drafts and confirmed numbering map.
     - Publish the checked bodies through Save Tracker Issue.
   - **New epic.**
     - Run [Populate Epic Issue Body](epic-issue-body.md#populate-epic-issue-body), carrying the orphan's work in a task row, and keep its row id for the return.
     - Populate the covering row through [Draft Initiative Issue Body](initiative-issue-body.md#draft-initiative-issue-body).
     - Publish the epic through [Save Tracker Issue](issue.md#save-tracker-issue).
     - Link its issue in the initiative row.
   - **New initiative.**
     - Run [Populate Initiative Issue Body](initiative-issue-body.md#populate-initiative-issue-body) from the orphan's scoped problem and confirmed goal.
     - Publish through [Save Tracker Issue](issue.md#save-tracker-issue).
   - **Hot-fix.**
     - Run [Open Hot-fix Issue](hotfix.md#open-hot-fix-issue) with the source issue.
     - Use the source issue as the destination with disposition Kept. The caller rewrites its hot-fix body and keeps the issue open.
   - **Leave.**
     - Use the source issue as the destination with disposition Leave. The caller rewrites its standalone body and keeps the issue open.
2. Return the saved destination, the identities of all affected bodies and the confirmed disposition to the caller, including the destination initiative, epic and new row id for a new task or new epic, and the number for a hot-fix. The caller performs the rewrite or closure.

### *Rewrite* Orphan Issue

One kept or left orphan rewritten in the layout of its destination kind.

**Inputs:** Source issue identity, selected destination kind, the evidence and design the body carries, and for a hot-fix its theme label, confirmed target and theme board, and the number [Apply Issue Placement](#apply-issue-placement) returned.

1. Use the selected [Populate Initiative Issue Body](initiative-issue-body.md#populate-initiative-issue-body), [Populate Hot-fix Body](hotfix-body.md#populate-hot-fix-body) or [Populate Standalone Body](standalone-body.md#populate-standalone-body) body.
   - Carry evidence into Problem and design into Proposal.
   - Pass a hot-fix its supplied number, theme label and target.
2. Run [Check Round of Edits](issue-body.md#check-round-of-edits) with the populated body and selected kind conditions before publishing.
   - Resolve findings.
   - Run [Save Tracker Issue](issue.md#save-tracker-issue) with the validated body, title and labels, a hot-fix's being every label its [Titles](hotfix-body.md#titles) name.
3. For a hot-fix, run [Settle Hot-fix Board Status](hotfix.md#settle-hot-fix-board-status) with the confirmed theme board and the saved issue.
4. Return the saved identity, and a hot-fix's settled board item, to the caller.

### *Subsume* Orphan Work

The work remains tracked by the taking issue.

**Inputs:** Orphan identity and body, confirmed destination evidence, and the planning record it references when it has one.

1. Transfer the work to the taking issue.
   - Make each outcome a criterion of one invariant.
   - Put the design in Proposal.
   - Cite the orphan and any planning record in References.
2. Prepare the comment file naming the taking epic and row, or the taking task issue, for example `Tracked in [I07:E01](…/issues/937) W04.` The closure operation records it once.
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

### Placement Record

| Destination | Work | Issue Disposition |
| --- | --- | --- |
| Existing task | Criteria and design in a task that has its own issue | Subsumed |
| New task | A row in an existing epic, with its criteria | Subsumed |
| New epic | An epic in an existing initiative, with a task row carrying the work | Subsumed |
| New initiative | An initiative | Kept or subsumed |
| Hot-fix | A [hot-fix](hotfix-body.md#definition) on its theme board, with its target | Kept |
| Leave | Work outside the initiative structure | Left open |

### Disposition Conditions

- **Existing task, new task and new epic.**
  The source is subsumed, its work planned as an ordinary task row.
- **Hot-fix.**
  The source is kept, under the hot-fix layout, and is placed on its theme board once it is saved as a hot-fix.
- **New initiative.**
  A source with a planning-record reference is subsumed, with that folder cited beside the source in the destination. Otherwise the source is kept when its work needs its own discussion or evidence, and subsumed when its detail fits in rows, criteria and a reference.
- **Existing criterion.**
  Work an existing criterion already states is subsumed into the issue holding that criterion, without a new row; for cited standalone work this is usually the citing issue.

### Candidate Issues

Candidates are open issues without an agent-engineering prefix, other than a proposal, a [hot-fix](hotfix-body.md#titles), and a declared throwaway target: an issue carrying a `throwaway:*` label, a fixture a write check changes, which stays open and belongs in no initiative. Orphans have no incoming link from an open initiative, epic or task. Cited standalone issues have such a link in prose or References; their records include labels, citing issues and any linked planning folder. An investigation cited by an epic is a candidate, with disposition determined from supplied criteria.

### Destination Work

An existing-epic option identifies the row to add, with Description, criteria, Depends on and Joins, or the existing task already delivering the work. Leave applies when no initiative goal covers it and it is no hot-fix, or when it is not planned work. Each option names its disposition, as [Disposition Conditions](#disposition-conditions) state.

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
