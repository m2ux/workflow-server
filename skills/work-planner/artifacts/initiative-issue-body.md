# Initiative Issue Body

Populates one initiative body. The body states the goal as criteria and lists the epics that deliver them.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Requirement Characteristics](../references/requirement-characteristics.md)
- [Initiative](initiative.md)

## Operations

### Populate Initiative Issue Body

One initiative body and its local validation findings.

**Inputs:** [Proposal Context](#proposal-context), [Output Files](#output-files).

**Outputs:** [Output Files](#output-files), [Validation Findings](#validation-findings).

#### 1. Draft Scoped Body

Apply [Draft Initiative Issue Body](#draft-initiative-issue-body) with the supplied proposal context and output path.

#### 2. Check Current Round

Apply [Check Round of Edits](issue-body.md#check-round-of-edits).

#### 3. Return Draft Findings

Return the populated body and its local format findings to the caller.

### Draft Initiative Issue Body

One initiative body, scoped to one proposal.

**Inputs:** [Proposal Context](#proposal-context), [Output Files](#output-files).

**Outputs:** [Output Files](#output-files).

#### 1. Populate Initiative Template

Populate the body from the [Template](#template) into a local file at the supplied output path.
- That file must be the source for every later edit.
- All populated fields must meet [Fields](#fields).

#### 2. Derive Problem and Boundary

Derive the Problem and Non-Goals from the proposal this initiative is scoped to.
- The Problem must meet [Problem and Proposal](issue-body.md#problem-and-proposal).
- Each Non-Goal must meet [Non-Goals](#non-goals).

#### 3. Write Source-Based Criteria

Write the acceptance criteria before the Work Breakdown, so each row's Coverage can cite them.
- Each criterion must come from a confirmed clause and meet [Initiative Acceptance Criteria](#initiative-acceptance-criteria).
- The criteria must come from the requirements sources the proposal references. Where the proposal references none, they must come from the proposal's body alone.

#### 4. Populate Shared Table

Apply [Write Issue Table](issue-body.md#write-issue-table) with the supplied row data.

#### 5. Fill Initiative Cells

Fill the initiative-specific cells.
- Each row must meet [Work Breakdown](#work-breakdown).
- An item a test cannot observe must stay named as [Coverage Reports](issue-body.md#coverage-reports) define.

### Record Initiative Delivery

One initiative body with its epic delivery recorded.

**Inputs:** [Initiative Record](#initiative-record), [Epic Records](#epic-records), [Output Files](#output-files).

**Outputs:** [Output Files](#output-files), [Delivery Findings](initiative.md#delivery-findings).

#### 1. Record Supplied Epics

Apply [Sync Initiative](#sync-initiative) with the initiative and all linked epic records as `--epics`, supplying `--fix` when an output body is requested.

#### 2. Return Initiative Delivery

Return the body and [Delivery Findings](initiative.md#delivery-findings) from the supplied initiative and epic records. Delivery eligibility follows [Delivery State](initiative.md#delivery-state).

### Record Initiative Criteria

Verified criteria and completed rows in one initiative body.

**Inputs:** [Initiative Record](#initiative-record), [Epic Records](#epic-records), [Criterion Selection](#criterion-selection), [Output Files](#output-files).

**Outputs:** [Output Files](#output-files), [Criterion Selection](#criterion-selection).

#### 1. Record Verified Criteria

Apply [Tick Initiative Criteria](#tick-initiative-criteria) with the initiative, linked epics as `--epics`, verified ids as `--tick` and output as `--fix`. Refuse criteria not ready to verify.

#### 2. Return Criterion Disposition

Return the body and refused criteria.

### Validate Initiative Body

The body's local format and field findings.

**Inputs:** [Initiative Record](#initiative-record), [Epic Records](#epic-records), [Source Evidence](#source-evidence), [Output Files](#output-files).

**Outputs:** [Output Files](#output-files), [Validation Findings](#validation-findings).

#### 1. Validate Kind Conditions

Apply [Validate Issue Body](issue-body.md#validate-issue-body) with the current body, local [Fields](#fields), supplied related evidence and output file, supplying each linked epic as `--epic`.

#### 2. Retain Current Title

Use its current title for the initiative row.

#### 3. Identify Source Departures

Include excluded names in Problem and Proposal and criterion/source departures in the findings.

#### 4. Return Local Findings

Return the corrected body, mechanical diff and unresolved findings for the caller.

### Read Requirement Sources

The requirements evidence used to validate an initiative's criteria.

**Inputs:** [Requirement References](#requirement-references), [Source Evidence](#source-evidence), [Output Files](#output-files).

**Outputs:** [Source Evidence](#source-evidence), [Validation Findings](#validation-findings).

#### 1. Read Local Sources

Read each local source at its checkout path.

#### 2. Fetch Pinned Sources

For a pinned GitHub blob, Apply [Fetch Source](#fetch-source) with its repository, path, pinned revision and output file.

#### 3. Fetch Other URLs

Fetch other URLs through the harness's web access.

#### 4. Record Unreadable Sources

Record an unreadable or empty source as a [Sources](#sources) finding; its criteria remain unevaluated.

#### 5. Return Source Evidence

Return each source's contents and identity with those findings.

### Sync Initiative

Reports an initiative's delivery state against its epics, and ticks Done on an epic row whose issue is closed as completed. A row whose epic it is not given keeps its Done cell and is reported unchanged.

**Inputs:** [Initiative Record](#initiative-record), [Epic Records](#epic-records), [Output Files](#output-files).

**Outputs:** [Output Files](#output-files), [Delivery Findings](initiative.md#delivery-findings).

#### 1. Sync Initiative

Run this command from the workspace checkout with the supplied inputs.

- It takes every linked epic's current JSON. Delivery findings follow [Delivery State](initiative.md#delivery-state).

Pass every epic JSON file as a separate argument after `--epics`.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;initiative-json-file&gt;**](#initiative-record)' --epics '[**&lt;epic-json-file&gt;**](#epic-records)'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/sync.py issue-936.json --epics issue-943.json issue-937.json
</pre></big>

### Tick Initiative Criteria

Ticks confirmed initiative criteria, refusing any not ready to verify, and ticks completed rows.

**Inputs:** [Initiative Record](#initiative-record), [Epic Records](#epic-records), [Criterion Selection](#criterion-selection), [Output Files](#output-files).

**Outputs:** [Output Files](#output-files), [Criterion Selection](#criterion-selection).

#### 1. Tick Initiative Criteria

Run this command from the workspace checkout with the supplied inputs.

Pass every epic JSON file as a separate argument after `--epics`. `<criterion-ids>` is a comma-separated list of verified criterion ids.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;initiative-json-file&gt;**](#initiative-record)' --epics '[**&lt;epic-json-file&gt;**](#epic-records)' --tick '[**&lt;criterion-ids&gt;**](#criterion-selection)' --fix '[**&lt;output-body-file&gt;**](#output-files)'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/sync.py issue-936.json --epics issue-943.json issue-937.json --tick AC2 --fix fixed-936.md
</pre></big>

### Fetch Source

Saves one GitHub source at the revision its permalink pins.

**Inputs:** [Source Evidence](#source-evidence), [Output Files](#output-files).

**Outputs:** [Source Evidence](#source-evidence).

#### 1. Fetch Source

Run this command from the repository checkout with the supplied inputs.

<big><pre>
gh api 'repos/[**&lt;owner&gt;**](#source-evidence)/[**&lt;repository&gt;**](#source-evidence)/contents/[**&lt;source-path&gt;**](#source-evidence)?ref=[**&lt;revision&gt;**](#source-evidence)' --jq .content | base64 -d > '[**&lt;source-file&gt;**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api 'repos/m2ux/workflow-server/contents/docs/spec.md?ref=4a217fe6' --jq .content | base64 -d > source-R1.md
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

- A Problem meets [Problem and Proposal](issue-body.md#problem-and-proposal).

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
- Epic numbering meets [Numbering](issue-body.md#numbering).

### Initiative Acceptance Criteria

An initiative criterion meets the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria) and [Requirement Characteristics](../references/requirement-characteristics.md), and:

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

### Breakdown Prose

Work Breakdown contains its table. Explanatory prose belongs in Proposal. The body does not narrate execution order or how the tables work; Depends on carries the order.

### Proposal Context

The scoped proposal, confirmed goal clauses, requirement sources and epic summaries supplied for drafting.

### Initiative Record

The supplied complete current initiative issue JSON.

### Epic Records

Every linked epic's current JSON.

### Source Evidence

The source locations, checkout paths and authenticated source access supplied for reading, with the contents and source identities once read. A pinned GitHub source has its repository owner and name, path and pinned revision, URL-encoded for the request.

### Output Files

The supplied local destinations for source contents or a complete body; the body output is optional when only a delivery report is requested.

### Criterion Selection

The supplied verified criterion ids.

### Validation Findings

The corrected body, mechanical diff and unresolved findings, including unreadable or empty requirement sources.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Requirement References

The supplied initiative References entries identifying the requirements sources to read.
