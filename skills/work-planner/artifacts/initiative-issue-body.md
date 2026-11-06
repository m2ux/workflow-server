# Initiative Issue Body

Populates one initiative body. The body states the goal as criteria and lists the epics that deliver them.

## Operations

### Populate Initiative Issue Body

One initiative body and its local validation findings.

#### 1. Draft Scoped Body

Apply [Draft Initiative Issue Body](#draft-initiative-issue-body "ƒ") with [Proposal Context](#proposal-context) and destinations in [Output Files](#output-files).

#### 2. Check Current Round

Apply [Check Round of Edits](issue-body.md#check-round-of-edits "ƒ").

#### 3. Provide Draft Findings

Provide [Output Files](#output-files) with the populated body and [Validation Findings](#validation-findings).

### Draft Initiative Issue Body

One initiative body, scoped to one proposal.

#### 1. Populate Initiative Template

- Populate the [Template](#template) into the local destination in [Output Files](#output-files).
- That file must be the source for every later edit.
- All populated fields must meet [Fields](#fields).

#### 2. Derive Problem and Boundary

- Derive the Problem and Non-Goals from [Proposal Context](#proposal-context).
- The Problem must meet [Problem and Proposal](issue-body.md#problem-and-proposal).
- Each Non-Goal must meet [Non-Goals](#non-goals).

#### 3. Write Source-Based Criteria

- Write the acceptance criteria before the Work Breakdown, so each row's Coverage can cite them.
- Each criterion must come from a confirmed clause and meet [Initiative Acceptance Criteria](#initiative-acceptance-criteria).
- The criteria must come from the requirements sources the proposal references. Where the proposal references none, they must come from the proposal's body alone.

#### 4. Populate Shared Table

Apply [Write Issue Table](issue-body.md#write-issue-table "ƒ") with the supplied row data.

#### 5. Fill Initiative Cells

- Fill the initiative-specific cells.
- Each row must meet [Work Breakdown](#work-breakdown).
- An item a test cannot observe must stay named as [Coverage Reports](issue-body.md#coverage-reports) define.

#### 6. Provide Draft Initiative Issue Body

Provide [Output Files](#output-files) with the populated initiative body.

### Validate Initiative Body

The body's local format and field findings.

#### 1. Validate Kind Conditions

Apply [Validate Issue Body](issue-body.md#validate-issue-body "ƒ") against local [Fields](#fields) and the supplied epic and source evidence.

#### 2. Retain Current Title

Use its current title for the initiative row.

#### 3. Identify Source Departures

Include excluded names in Problem and Proposal and criterion/source departures in the findings.

#### 4. Provide Local Findings

Provide [Output Files](#output-files) with the corrected body and [Validation Findings](#validation-findings) containing the mechanical diff and unresolved findings.

## Commands

### Sync Initiative

Report an initiative's delivery state against its epics, tick Done on an epic row whose issue is closed as completed, and provide [Delivery Findings](initiative.md#delivery-findings "●") and, when a body was requested, [Output Files](#output-files "●") to the requester. A row whose epic it is not given keeps its Done cell and is reported unchanged.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;initiative-json-file&gt;**](#initiative-record "○")' &#92;
  --epics '[**&lt;epic-json-file&gt;**](#epic-records "○")' &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-files "○")'
</pre></big>

- Omit `--fix` when only a delivery report is requested.

- It takes every linked epic's current JSON. Delivery findings should follow [Delivery State](initiative.md#delivery-state).

- Pass every epic JSON file as a separate argument after `--epics`.

### Tick Initiative Criteria

Tick confirmed initiative criteria and completed rows, refusing criteria not ready to verify, and provide [Output Files](#output-files "●") and [Criterion Selection](#criterion-selection "●") to the requester.

Pass every epic JSON file as a separate argument after `--epics`. `<criterion-ids>` is a comma-separated list of [verified criterion ids](#criterion-selection "○").

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;initiative-json-file&gt;**](#initiative-record "○")' &#92;
  --epics '[**&lt;epic-json-file&gt;**](#epic-records "○")' &#92;
  --tick '[**&lt;criterion-ids&gt;**](#criterion-selection "○")' &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-files "○")'
</pre></big>

### Fetch Source

Save one GitHub source at the revision its permalink pins and provide [Source Evidence](#source-evidence "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api 'repos/[**&lt;owner&gt;**](#source-evidence "○")/[**&lt;repository&gt;**](#source-evidence "○")/contents/[**&lt;source-path&gt;**](#source-evidence "○")?ref=[**&lt;revision&gt;**](#source-evidence "○")' &#92;
  --jq .content &#92;
  | base64 &#92;
  -d &#92;
  &gt; '[**&lt;source-file&gt;**](#output-files "○")'
</pre></big>

## Fields

### Template

````markdown
## Overview

{{One paragraph: what the initiative achieves, stated as the end state. Name the goal the reviews will test against.}}

## Problem

{{One sentence on the friction, then one bullet per facet. Each bullet opens with a bold statement, and its body is on the next line.}}

- **{{Facet}}.**
  {{The evidence.}}

## Proposal

- **{{Move}}.**
  {{What is done, within two lines.}}

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/{{OWNER}}/{{REPO}}/issues/{{EPIC_ISSUE}}) | {{The epic's title name, the part before the colon}} | AC{{n}}, AC{{m}} | {{Earlier epic}} | |

## Acceptance Criteria

- [ ] **AC1.** {{One invariant. It is specific, measurable, achievable, relevant, and time-bound. It carries no stale count. It names no initiative, epic, task, or issue. It states what the initiative achieves as a whole, and it ends by naming its instrument.}}

## Non-Goals

- {{One succinct sentence on what this initiative does not do. It names no initiative, epic, task or issue, and no owner.}}

## References

- **R1.** [{{Title}}]({{URL}}) — {{What the reader finds there.}}
- **R2.** **Source.** [{{Title}}]({{URL}}) — {{The requirements this initiative's criteria answer to.}}
````

### Titles

- The title is `[I07] Name: Subtitle`.
- Labels are `type:initiative` and a `theme:*`.
- `I` is the initiative number. Initiatives count from `00`.

### Problem

The initiative body's Problem prose section.

- A Problem must meet [Problem and Proposal](issue-body.md#problem-and-proposal).

### Proposal

- A Proposal states the design, as [Problem and Proposal](issue-body.md#problem-and-proposal) defines.
- A Proposal names no epic, task, or acceptance criterion of its own initiative.

### Work Breakdown

The columns are `Epic | Description | Coverage | Depends on | Done`. The table has no Joins column.

- An epic row's id is the epic, linked to its issue: `[E01](…/issues/937)`.
- An epic row's Description is the epic's title name, and its Coverage names the initiative criteria the epic serves.
- An epic row is complete when its issue is closed as completed.
- An epic row whose issue is closed as not planned leaves the table. Each criterion only that row covers leaves with it, and a criterion another row also covers stays. The criteria that remain keep their [labels](issue-body.md#criterion-labels).
- Depends on names epics only. A cell that names a task fails. Name a prerequisite epic only when every task or joined unit in the dependent epic requires every task in that prerequisite epic, directly or through its dependencies. The consumed output and the work producing it establish that requirement. Dependencies on selected tasks remain in the task tables. An edge another named whole-epic prerequisite already implies is omitted.
- An initiative dependency that only some tasks need, or that requires only part of its prerequisite epic, is overbroad. The output and its producing tasks establish the edge.
- An epic depending on a later epic is a backward reference.
- Epic numbering must meet [Numbering](issue-body.md#numbering).

Work Breakdown contains its table. Explanatory prose belongs in Proposal. The body does not narrate execution order or how the tables work; Depends on carries the order.

### Initiative Acceptance Criteria

An initiative criterion must meet the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria) and [Requirement Characteristics](../references/requirement-characteristics.md), and:

- **No counts.**
  An initiative criterion carries no counts or figures, which go stale: it measures against a named baseline or check ("against the baseline", "as the budget test measures it"). A figure stays only where it is the criterion's own target, such as a bound it holds to.
- **SMART.**
  Each initiative criterion is specific about what holds, measurable by a named check or baseline, achievable by the epics that cite it, and relevant, tracing to a clause and to the Problem. It is time-bound by a release tag or another named milestone outside the initiative's own work, where one exists, and otherwise by the epics that cite it.
- **Local.**
  An initiative criterion names no initiative, epic, task or issue, and is solution-agnostic. Coverage cells link epics to criteria. One that holds only through another initiative's work is restated as what this initiative achieves, or it is dropped.
- **Whole.**
  An initiative criterion states what the initiative achieves as a whole. One that restates a single epic's criterion is a duplicate: it is raised to what the epics achieve together, or left to the epic.
- **Verified.**
  - An initiative criterion ends by naming its instrument. Which instruments keep a criterion is [Verifiable](issue-body.md#verifiable).
  - An automated test is an end-to-end walk through the real server, a smoke run of an agent against a live server, a live check on a deployed host, or a guard, fixture suite or check that continuous integration runs. The walk, smoke run or live check is preferred where the criterion is about what a run does.
  - A named test that does not exist yet is work the plan holds: a task in the epic whose subject it tests, or a discrete test-infrastructure epic when the tests serve several criteria. That epic's row cites the criteria its tests verify.

### Non-Goals

- One succinct sentence each on what the initiative does not do, naming no initiative, epic, task or issue, and no owner.

### References

- A proposal-derived initiative identifies its originating proposal in References with the proposal's exact title and issue URL, labelled as the originating proposal.
- A reference the criteria answer to carries **Source.** after its label: `- **R1.** **Source.** [Title](url) — what it binds`. An unmarked reference is background, and binds no criterion. What a marked one requires of the criteria is [Sources](#sources).
- A cross-initiative overlap is recorded in References. An approved edit to another initiative's issue stays minimal.
- An initiative that removes a not-planned epic's row carries a reference linking the issue that takes that epic's work.

### Sources

A marked source in References is a document the initiative's criteria answer to. The criteria are aligned with it in both directions.

- A criterion that misstates or contradicts a marked source fails the [Correct](../references/requirement-characteristics.md#individual) characteristic.
- A requirement a marked source states that no criterion makes true, and no Non-Goal excludes, is a gap.
- An epic is aligned against its initiative's marked sources, through the initiative criteria its row covers.
- A marked source that cannot be read leaves its criteria unaligned until it is read.

### Proposal Context

The scoped proposal, confirmed goal clauses, requirement sources and epic summaries supplied for drafting.

### Initiative Record

The supplied complete current initiative issue JSON. eg `issue-936.json`

### Epic Records

Every linked epic's current JSON. eg `issue-943.json issue-937.json`

### Source Evidence

The source locations, checkout paths and authenticated source access supplied for reading, with the contents and source identities once read. A pinned GitHub source has its repository owner and name, path and pinned revision, URL-encoded for the request. eg `repository: m2ux/workflow-server`, `source-path: docs/spec.md`, `revision: 4a217fe6`

### Output Files

The supplied local destinations for source contents or a complete body; the body output is optional when only a delivery report is requested. eg `output-body-file: fixed-936.md`, `source-file: source-R1.md`

### Criterion Selection

The supplied verified criterion ids. eg `AC2`

### Validation Findings

The corrected body, mechanical diff and unresolved findings, including unreadable or empty requirement sources.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Requirement References

The supplied initiative References entries identifying the requirements sources to read.
