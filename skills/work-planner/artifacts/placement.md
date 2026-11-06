# Placement

A proposed destination and disposition for one orphan's work.

## Commands

### List Orphans

List the hoist candidates and the open initiatives and epics they could join, and provide [Candidate Issues](#candidate-issues "●") and [Candidate Destinations](#candidate-destinations "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/orphans.py '[**&lt;issues-json-file&gt;**](#issue-collection "○")'
</pre></big>

## Fields

### Source

The orphan's repository, issue number and current body.

### Destination

The selected issue or proposed work, with the criteria and design it takes.

### Disposition

A tagged value: kept, subsumed or left, with its reason. A referenced planning record accompanies the source reference.

### Draft Bodies

The collection of proposed complete issue-body documents, one per destination issue. Each proposed body must meet its own kind's shape and states the result. It carries no account of how the work arrived. A source reference says what detail it holds.

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

### Candidate Issues

Candidates are open issues without an agent-engineering prefix, other than a proposal, a [hot-fix](hotfix-body.md#titles), and a declared throwaway target: an issue carrying a `throwaway:*` label, a fixture a write check changes, which stays open and belongs in no initiative. Orphans have no incoming link from an open initiative, epic or task. Cited standalone issues have such a link in prose or References; their records include labels, citing issues and any linked planning folder. An investigation cited by an epic is a candidate, with disposition determined from supplied criteria.

### Destination Work

An existing-epic option identifies the row to add, with Description, criteria, Depends on and Joins, or the existing task already delivering the work. Leave applies when no initiative goal covers it and it is no hot-fix, or when it is not planned work. Each option names its disposition, as [Disposition Conditions](#disposition-conditions) state.

### Placement Inputs

The current orphan body, candidate destinations, proposed work and supplied planning-record references.

### Issue Collection

The complete supplied repository issue collection, at its local JSON file path. eg `issues.json`

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

## Guidance

### Disposition Conditions

- **Existing task, new task and new epic.**
  The source is subsumed, its work planned as an ordinary task row.
- **Hot-fix.**
  The source is kept, under the hot-fix layout, and is placed on its theme board once it is saved as a hot-fix.
- **New initiative.**
  A source with a planning-record reference is subsumed, with that folder cited beside the source in the destination. Otherwise the source is kept when its work needs its own discussion or evidence, and subsumed when its detail fits in rows, criteria and a reference.
- **Existing criterion.**
  Work an existing criterion already states is subsumed into the issue holding that criterion, without a new row; for cited standalone work this is usually the citing issue.
