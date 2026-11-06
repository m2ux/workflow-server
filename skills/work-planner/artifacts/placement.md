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

### Draft Issue Placement

One placement option from the supplied orphan and candidate destinations.

#### 1. Select Candidate Destination

- Identify an existing task, a new task, a new epic, a new initiative, a hot-fix, or Leave for the orphan and candidate destinations in [Placement Inputs](#placement-inputs "○").
- Offer a hot-fix only for an orphan that meets the hot-fix [Definition](hotfix-body.md#definition), with the theme board it joins and its [target](hotfix-body.md#target): the declared long-lived branch the orphan's evidence places the defect on, the repository's default branch where it is declared and the evidence names no other.

#### 2. Populate Placement Fields

Populate the placement meeting [Fields](#fields) and [Disposition Conditions](#disposition-conditions).

#### 3. Provide Placement Option

Provide [Placement Result](#placement-result "●") for the requester to offer and apply.

### Find Placement Candidates

The issue candidates and available destinations from supplied records.

#### 1. List Repository Candidates

Apply [List Orphans](#list-orphans "ƒ") to [Issue Collection](#issue-collection "○").

#### 2. Provide Available Destinations

Provide [Candidate Issues](#candidate-issues "●") and [Candidate Destinations](#candidate-destinations "●") with open initiative and epic destinations for investigation.

### Apply Issue Placement

One selected destination for an orphan's work.

#### 1. Apply Confirmed Destination

- Execute only the branch matching [Confirmed Placement](#confirmed-placement "○"):

##### Existing Task

- Add the orphan's outcomes to the task criteria.
- Add its design to Proposal.
- When they exceed the epic's criteria, add epic criteria cited by the task row.
- Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") with the affected bodies.

##### New Task

- Apply [Populate Epic Issue Body](epic-issue-body.md#populate-epic-issue-body "ƒ") with the confirmed task scope, current epic context and output path.
- Add the epic criteria the row's Coverage needs where the orphan's outcomes exceed the epic's, as [Destination Work](#destination-work) states.
- Leave the row's Task cell holding the row id alone until the work is planned and the row gains its work-item file, as [Task Delivery](epic-issue-body.md#task-delivery) states.
- Number the row where it can start, and keep its row id for the result.
- When movable rows change number, Apply [Check Dependencies and Numbering](dependency-graph.md#check-dependencies-and-numbering "ƒ") with the affected initiative and epic drafts and confirmed numbering map.
- Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") with the checked bodies.

##### New Epic

- Apply [Populate Epic Issue Body](epic-issue-body.md#populate-epic-issue-body "ƒ"), carrying the orphan's work in a task row, and keep its row id for the result.
- Apply [Draft Initiative Issue Body](initiative-issue-body.md#draft-initiative-issue-body "ƒ") with the covering row.
- Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") with the epic.
- Link its issue in the initiative row.

##### New Initiative Destination

- Apply [Populate Initiative Issue Body](initiative-issue-body.md#populate-initiative-issue-body "ƒ") from the orphan's scoped problem and confirmed goal.
- Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") with the populated initiative body.

##### Hot-Fix Destination

- Apply [Open Hot-fix Issue](hotfix.md#open-hot-fix-issue "ƒ") with the source issue.
- Use the source issue as the destination with disposition Kept. The caller rewrites its hot-fix body and keeps the issue open.

##### Leave

- Use the source issue as the destination with disposition Leave. The caller rewrites its standalone body and keeps the issue open.

#### 2. Provide Saved Placement

Provide [Placement Result](#placement-result "●") with the saved destination, identities of all affected bodies and confirmed disposition, including the destination initiative, epic and new row id for a new task or new epic, and the number for a hot-fix. The requester performs the rewrite or closure.

### Rewrite Orphan Issue

One kept or left orphan rewritten in the layout of its destination kind.

#### 1. Populate Selected Body

- Apply [Populate Initiative Issue Body](initiative-issue-body.md#populate-initiative-issue-body "ƒ"), Apply [Populate Hot-fix Body](hotfix-body.md#populate-hot-fix-body "ƒ") or Apply [Populate Standalone Body](standalone-body.md#populate-standalone-body "ƒ"), selecting the destination kind and evidence/design from [Rewrite Inputs](#rewrite-inputs "○").
- Carry evidence into Problem and design into Proposal.
- Pass a hot-fix its supplied number, theme label and target.

#### 2. Validate and Save Body

- Apply [Check Round of Edits](issue-body.md#check-round-of-edits "ƒ") with the populated body and selected kind conditions before publishing.
- Resolve findings.
- Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") with the validated body, title and labels, a hot-fix's being every label its [Titles](hotfix-body.md#titles) name.

#### 3. Settle Hot-fix Status

For a hot-fix, Apply [Settle Hot-fix Board Status](hotfix.md#settle-hot-fix-board-status "ƒ") with the confirmed theme board and the saved issue.

#### 4. Provide Saved Identity

Provide [Saved Orphan](#saved-orphan "●") with the saved identity and a hot-fix’s settled board item.

### Subsume Orphan Work

The work remains tracked by the taking issue.

#### 1. Transfer Tracked Work

- Transfer the work in [Transfer Inputs](#transfer-inputs "○") to the taking issue.
- Make each outcome a criterion of one invariant.
- Put the design in Proposal.
- Cite the orphan and any planning record in References.

#### 2. Prepare Closure Comment

Prepare the comment file naming the taking epic and row, or the taking task issue, for example `Tracked in [I07:E01](…/issues/937) W04.` The closure operation records it once.

#### 3. Close Transferred Orphan

- Apply [Close Transferred Work](issue.md#close-transferred-work "ƒ") with the orphan identity, confirmed destination evidence and closure comment file, retaining the orphan's body.
- Provide [Saved Orphan](#saved-orphan "●") with the confirmed closure or blocker.

### List Orphans

Lists the hoist candidates, and the open initiatives and epics they could join.

#### 1. List Orphans

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && \
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/orphans.py '[**&lt;issues-json-file&gt;**](#issue-collection "○")'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/orphans.py issues.json
</pre></big>

#### 2. Provide Listed Orphans

Provide [Candidate Destinations](#candidate-destinations "●") to the requester.

## Fields

### Source

The orphan's repository, issue number and current body.

### Destination

The selected issue or proposed work, with the criteria and design it takes.

### Disposition

Kept, subsumed or left, with a reason. A referenced planning record is carried with the source reference.

### Draft Bodies

Each proposed body meets its own kind's shape and states the result. It carries no account of how the work arrived. A source reference says what detail it holds.

### Links

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

### Placement Inputs

The current orphan body, candidate destinations, proposed work and supplied planning-record references.

### Issue Collection

The complete supplied repository issue collection, at its local JSON file path.

### Confirmed Placement

The supplied confirmed placement, current source and destination records, and affected initiative and epic bodies.

### Rewrite Inputs

The source identity, selected destination kind, body evidence and design; for a hot-fix, its theme label, confirmed target, theme board and provided number.

### Transfer Inputs

The orphan identity and body, confirmed destination evidence and referenced planning record when present.

### Placement Result

The proposed placement or saved destination and confirmed disposition, affected body identities, and provided initiative, epic, row or hot-fix identities as applicable.

### Candidate Destinations

The candidate issues and open initiative and epic destinations provided for investigation.

### Saved Orphan

The saved issue identity and settled hot-fix board item when applicable, or the confirmed transferred closure or blocker.

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.
