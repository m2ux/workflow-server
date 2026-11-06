# Epic Issue Body

Populates one epic body. The body states one slice of the design and lists the tasks that deliver it.

## Operations

### Populate Epic Issue Body

One epic body and its local validation findings.

#### 1. Populate Epic Template

- Populate the body from the [Template](#template) using [Draft Metadata](#draft-metadata) at the supplied output path.
- Every section must meet [Fields](#fields).
- Shared content must meet the common [body conditions](issue-body.md#fields).

#### 2. Populate Shared Table

Apply [Write Issue Table](issue-body.md#write-issue-table "ƒ") with [Task Rows](#task-rows).

#### 3. Fill Epic Cells

- Fill the epic-specific cells.
- Each row must meet [Work Breakdown](#work-breakdown).
- Run [Write Lane Assignments](lane.md#write-lane-assignments "ƒ") with the populated body, confirmed task-to-index map and output path.

#### 4. Build Draft Snapshot

Apply [Build Body Snapshot](issue-body.md#build-body-snapshot "ƒ") with the draft body, title, labels and existing issue JSON when present.

#### 5. Validate Draft Body

Apply [Validate Epic Body](#validate-epic-body "ƒ") to the resulting snapshot.

#### 6. Identify Pending Links

Identify unresolved publication links separately; they remain pending until tracker identities exist.

#### 7. Provide Draft Findings

Provide the populated [Output Body](#output-body), [Row Result](#row-result) with draft rows and dependency references, and [Validation Findings](#validation-findings) for the cross-body ordering check.

### Validate Epic Body

The body's local format and field findings.

#### 1. Read Changed Paths

For each epic pull request reaching a branch the project's [Required Criteria](#required-criteria) declare, Apply [Read Pull Request State](pull-request.md#read-pull-request-state "ƒ") to read its changed paths.

#### 2. Validate Kind Conditions

- Apply [Validate Issue Body](issue-body.md#validate-issue-body "ƒ") against local [Fields](#fields) and initiative context, including each changed-path record at the supplied project revision.
- The [evaluated revision](#evaluated-revision) is the epic's base on the long-lived branch that holds the project's configuration, such as `origin/i07/e00/workspace`, or that branch itself, such as `origin/workspace`, while the epic has no base on it. Fetch it before the check reads it.

#### 3. Read Delivery Reach

Read reach from each epic pull request's base, through an epic base or initiative branch. Without pull requests, no criterion is lacking.

#### 4. Identify Required Criteria

Include in the findings each [Required Criteria](#required-criteria) criterion an epic lacks whose work changes the criterion's paths on its branch, required criteria the declaration or the changed paths leave unevaluable, and any epic criterion no task row delivers.

#### 5. Provide Local Findings

Provide the corrected [Output Body](#output-body) and [Validation Findings](#validation-findings), including the mechanical diff and unresolved findings.

### Revise Epic Rows

One epic body with confirmed task-grain and coverage corrections.

#### 1. Apply Confirmed Changes

- Apply [Populate Epic Issue Body](#populate-epic-issue-body "ƒ") with the confirmed task-row changes, preserving unrelated content.
- Description, Coverage, Depends on, Joins, Lane and task grain must meet [Work Breakdown](#work-breakdown).
- Split a task exceeding the allowed criterion grain into the confirmed tasks.

#### 2. Provide Revised Body

Provide [Output Body](#output-body) and [Validation Findings](#validation-findings), including any cross-body numbering or dependency changes.

### Plan Gap Task

The agreed disposition of criteria a delivered row left unmet.

#### 1. Resolve Unmet Criteria

- Present each unmet criterion in [Epic Body](#epic-body) and its missing evidence from [Epic Record](#epic-record) to the user.
- Provide the criteria the user confirms already hold to the caller for verification and ticking. The delivered task retains them.
- Record an unanswered decision as pending.
- If no criteria need further work, provide the pending findings to the caller.
- Continue to the draft step with only the criteria the user confirms need further work.

#### 2. Confirm Further Task

- Draft a further task for the [Criterion Selection](#criterion-selection) requiring further work, starting from the delivered [Task Rows](#task-rows) and meeting [Work Breakdown](#work-breakdown).
- Confirm the draft with the user.
- On acceptance, Apply [Revise Epic Rows](#revise-epic-rows "ƒ") with the further row and the criteria it adopts from the delivered task's Coverage.
- Provide an unanswered draft as pending without continuing to the reconcile step.

#### 3. Reconcile Revised Delivery

- Run [Sync Epic](#sync-epic "ƒ") for the revised epic in the project checkout with the same fetched epic bases.
- Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") with the provided body.
- Provide [Row Result](#row-result) with the saved row and criterion disposition.

## Commands

### Sync Epic

Link each named task id to the open or merged pull requests naming the epic it is delivered through, tick Done on completed rows, and provide [Output Body](#output-body "●") and [Delivery Findings](epic.md#delivery-findings "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;epic-json-file&gt;**](#epic-record "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-links "○")' &#92;
  --tasks '[**&lt;task-json-file&gt;**](#task-records "○")' &#92;
  --link '[**&lt;task-pull-request-map&gt;**](#delivery-matches "○")' &#92;
  --project '[**&lt;checkout&gt;**](#project-checkout "○")' &#92;
  --revision '[**&lt;epic-base-revision&gt;**](#epic-bases "○")' &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-body "○")'
</pre></big>

- A row whose id links its task [issue links](#issue-links "○") the pull request instead.
- A pull request whose head is an epic base is the pull request that merges that base, and is not matched to a task.
- An unmerged epic base keeps the epic open, even when every row is delivered and every criterion is ticked.
- An epic base is reported `draft` only where it holds a commit its long-lived branch lacks. The base is read at the `--revision` naming it and the long-lived branch beside it on the same remote, so `origin/i07/e00/main` is compared with `origin/main`; a base no `--revision` names is reported `unevaluable`.
- Read long-lived branch names from `config/branches` at each supplied epic-base revision, such as `origin/i07/e00/main`; each `source` line names its path, commit and repository. Repeat `--revision` for every fetched epic base.
- An absent, empty or unreadable statement, and statements that disagree across the bases, are reported `unevaluable` with their source. Without the long-lived branch names, the run names each check it did not make as `not checked`, and an epic that would otherwise be closable is not.
- An open review pull request's Changes paths are read at its head commit in the `--project` repository: a path with a directory stands where the head holds a file or a directory at it, and a bare file name anywhere in the tree. A head commit the repository does not hold is reported `unevaluable`.
- Passed checks settle criteria under [Test Evidence](#test-evidence).
- Repeat a task id in `--link` once per pull request, one per long-lived branch its unit changes. Retain its existing deliveries and add only those missing, so repeated execution is idempotent.

- `<task-pull-request-map>` is a comma-separated list of `<task-id>=<pull-request-number>` pairs, with a pair for each pull request a task id links. Pass each task JSON file as a separate argument after `--tasks`.

- Updated rows must meet [Task Delivery](#task-delivery) and [Work Breakdown](#work-breakdown).

### Tick Epic Criteria

Tick confirmed epic criteria and completed rows, refusing criteria not ready to verify, and provide [Output Body](#output-body "●") and [Criterion Selection](#criterion-selection "●") to the requester.

`<criterion-ids>` is a comma-separated list of [verified criterion ids](#criterion-selection "○").

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;epic-json-file&gt;**](#epic-record "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-links "○")' &#92;
  --tick '[**&lt;criterion-ids&gt;**](#criterion-selection "○")' &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-body "○")'
</pre></big>

### Reserve Row

Hold each named unit for one session by setting its record folder as the single link of every row in it, and provide [Output Body](#output-body "●") and [Row Result](#row-result "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/deliver.py &#92;
  --epic '[**&lt;epic-json-file&gt;**](#epic-record "○")' &#92;
  --reserve [**&lt;task-ids&gt;**](#task-selection "○") &#92;
  --items '[**&lt;board-items-file&gt;**](#board-items "○")' &#92;
  --records '[**&lt;records-base-url&gt;**](#planning-folder "○")' &#92;
  --date [**&lt;record-date&gt;**](#planning-folder "○") &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-body "○")'
</pre></big>

- Supply the planning-records base URL when no epic row links a record.
- The caller supplies the planned folder identity; `--date` is the day it is opened.
- The folder is the one the unit's first task id and Description give it, as the available-work report's `unit` line names it. A call naming some rows of a joined unit and not the others is refused.

- `<task-ids>` is a comma-separated list of task ids; `<records-base-url>` identifies the planning records folder.

- Require a confirmed [Task Selection](#task-selection "○") and existing [Planning Folder](#planning-folder "○"). Refuse a row already held or linked to a pull request or commit, and a unit [Work Units](delivery-plan.md#work-units) does not admit.

### Release Row

Free each named task row by replacing the planning-folder link with its work-item file link, and provide [Output Body](#output-body "●") and [Row Result](#row-result "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/deliver.py &#92;
  --epic '[**&lt;epic-json-file&gt;**](#epic-record "○")' &#92;
  --release [**&lt;task-ids&gt;**](#task-selection "○") &#92;
  --engineering '[**&lt;engineering-worktree&gt;**](#engineering-worktree "○")' &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-body "○")'
</pre></big>

- The file is the task id in lowercase within that folder, as [Task ids](#task-delivery) defines.
- Refuse a row when its planning folder contains no matching work-item file or its README does not link that file.
- A call naming some rows of a joined unit and not the others is refused.

- `<task-ids>` is a comma-separated list of task ids.

- Require a confirmed release decision and refuse any row that is not held.

## Fields

### Template

````markdown
## Overview

{{One paragraph: what this epic delivers and why it exists within the initiative.}}

## Problem

{{The friction as it is now. Bullets for distinct facets, sub-bullets for several items.}}

## Proposal

{{The design, in bullets or paragraphs, each opening with a bold statement, and its body on the next line.}}

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Lane | Done |
| --- | --- | --- | --- | --- | --- | --- |
| W01 | {{What the task delivers, at most eight words}} | AC{{n}}, AC{{m}} | {{Earlier task in this epic, [Exx:Wyy](…) or [Exx](…) in an earlier epic, or #issue}} | {{Tasks that can land in the same pull request}} | {{Lane index, or empty}} | |

## Acceptance Criteria

- [ ] **AC1.** {{An end state of one invariant. It ends by naming its instrument.}}

## Open Questions

- {{An undecided point the epic cannot start without, with a recommendation in the planning record. Resolve every one before the first task starts, then delete the section.}}

## References

- **R1.** [Planning record]({{PLANNING_RECORD_URL}}) — {{What the reader finds there.}}
````

### Titles

- The title is `[I07:E00] Name: Subtitle`. Its prefix matches its row in the initiative table.
- Labels are `type:epic` and its initiative's `theme:*`.
- `E` is the epic within its initiative. Epics count from `00`.
- The prefix separates levels with colons, then a short name, a colon, and a subtitle: `[I07:E06] Reliability Evaluation: Briefs, Measures and the Thresholds That Define Reliable`.

### Proposal

- A boundary with a sibling epic is plain language.

### Work Breakdown

New tasks exist as epic rows with their details, discussion and evidence in the epic and planning record. Planning creates no separate task issues. Existing issues hoisted into an epic retain their records and row links when new tasks are planned.

The columns are `Task | Description | Coverage | Depends on | Joins | Lane | Done`.

- **Done.**
  A task row is complete when it is delivered, and every criterion its Coverage names is ticked.
- **Row id.**
  The row id is the task, `W01`. `W00` holds preparatory work that must land before the first real task.
- **Description.**
  Each detail beyond the phrase is a criterion stating one invariant.
- **Coverage.**
  Coverage names the epic's criteria the task delivers, whether its Done cell is ticked or empty. Each row claims only criteria its work makes true; it cannot claim a criterion another row delivers alone or one its work cannot meet. A cell is empty only on a delivered task whose criteria a further task adopts, as task grain states.
- **Depends on.**
  A task row names the rows it depends on. An earlier task in the epic (`W03`, `W04–W09`), a row of an earlier epic (`[E01:W02](…)`), or something outside the initiative (`#750`, `[I05:E00:W02](…)`).
  - A task row names rows, never an epic. It names the row producing each output it consumes (`[E01:W01](…), [E01:W02](…)`), and where the task consumes from every row of an epic that is what establishes the whole-epic reach.
  - Cross-epic dependencies name rows before any issue of the epic is created. Both tables exist, and each edge names the row that produces what the dependent row consumes.
  - A dependency listed twice or already implied by another in the cell is unsound. A task that measures, extends or consumes another task's output depends on it, even when the prose does not say so.
- **Task grain.**
  - A task is one pull request's worth of work.
  - A criterion a merged pull request left unticked belongs to a further task. The further task depends on the delivered task, and its Coverage is that criterion. Criteria one pull request can deliver share one further task. The delivered task's Coverage omits each criterion a further task adopts.
  - A task delivering more than three criteria is split into tasks one pull request each can deliver.
  - A task covers at least one acceptance criterion. A criterion more than one row cites is imprecise: it is split into the invariant each task makes true, and each is cited from the row that delivers it.
  - Every test the work calls for accompanies that task. The content steers which kinds those are, including the project's system test when the work is something that test can exercise. A failure in any test the task carries keeps the task open. None of those tests is a later row.
  - Reusable routines, techniques, and resources are specced, created, and tested before an activity binds them. The grain of an existing resource is in that work.
  - When the behaviour a wired activity produces differs from the behaviour the work expected, that task changes the routine, technique, or resource, and the tests that cover the change, until fit, form, and function hold.
- **Joins.**
  The tasks that share one pull request. Two tasks sharing one name each other, and tasks linked by such pairs are one joined unit.
  - A joined unit holds no Depends on between its members: the pull request orders their commits.
  - Only a path between two members through a task outside the unit bars a join.
  - A joined unit covers at most six criteria, two full rows' worth, so it stays one pull request's worth.
  - Joins are complete before any issue of the epic is created. Each candidate unit, the rows declaring one component, is answered as [Joins](dependency-graph.md#joins) states.
  - An empty cell is a task that shares no pull request.
- **Lane.**
  The row's delivery lane must meet [Assignments](lane.md#assignments).
- **Numbering.**
  Task numbering must meet [Numbering](issue-body.md#numbering); a row whose id links a pull request is fixed.
- **Reference form.**
  A table reference uses colons (`E01:W03`, `I05:E00:W02`), and every epic reference links to that epic's issue: `[E01:W03](…/issues/937)`. Prose uses a space (`E01 W03`).

Work Breakdown contains its table. Explanatory prose belongs in Proposal. The body does not narrate execution order or how the tables work; Depends on carries the order.

### Acceptance Criteria

The epic's collection of labelled criterion statements. An epic criterion must meet the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria). Contradictions between criteria in one epic are findings.

### Open Questions

A collection of undecided question statements, each with a recommendation in the planning record. Settled points belong in that record. The collection is empty when the epic starts.

### Required Criteria

The project's required-criterion declaration array. A project states the criteria its epics must carry in `config/required-criteria.json` at its root. The file is a JSON array, and each entry is one required criterion with these fields, each a non-empty string except `paths`:

| Field | What it states |
| --- | --- |
| `branch` | The long-lived branch the criterion's work reaches. |
| `paths` | A non-empty list of files and directories on `branch`. An epic carries the criterion when a pull request of its work reaching `branch` changes a file that is one of them or lies under one. |
| `criterion` | The criterion's text, which the epic carries after its `**ACn.**` label. |
| `phrase` | A phrase identifying the criterion in an epic that carries it, matched without regard to case. |
| `row` | The Description of the task row that delivers the criterion. |

- **The declared row delivers the criterion.**
  It carries the declared `row` as its Description, depends on the rows whose work changes the declared paths, and covers that criterion alone.
- **The tracker states what the work changes.**
  The check reads each pull request's changed files as the tracker lists them. A pull request reaching the declared branch whose changed files are not supplied leaves the criterion unevaluable, unless another pull request of the epic is known to change a declared path.
- **The evaluated commit holds the statement.**
  The check reads the file at the commit its evaluated revision resolves to, in the repository its checkout locates, and names that path, commit and repository as its source. Which worktree the checkout is, and what its working files hold, choose nothing.
- **A project declaring nothing requires nothing.**
  A missing or empty file at the evaluated commit, or an empty array, declares no required criterion, and the check reports none. A project declaring nothing acquires no other project's criteria.
- **An unreadable statement is unevaluable.**
  A revision resolving to no commit, unreadable JSON, a value other than an array, or an entry lacking a field or stating `paths` as anything but a non-empty list of non-empty strings leaves the project's required criteria unevaluable. The check reports that and names the fault, and reports no epic as lacking a criterion.
- workflow-server requires its corpus audit of work that changes the workflow definitions under `corpus` on `workflows`: eg `[{"branch": "workflows", "paths": ["corpus"], "criterion": "The definitions this epic changes carry no outstanding confirmed finding, one neither fixed on the epic's branch nor taken by an issue, as the canon audit's coverage report shows.", "phrase": "canon audit", "row": "Canon audit of the changed definitions"}]`

### Task Delivery

Each task's delivery state consists of its Task-cell references, reservation or work-item identity, per-branch delivery links and completion state.

- **Task ids.**
  - An unreserved task awaiting its pull request links its file in the planning record: `[W01](…/w01.md)`. The file name is the task id in lower case.
  - Every link on a task row names that row's id, and the row carries one delivery per long-lived branch its unit changes. A reserved task links only its planning folder: `[W01](…/2026-10-06-943-i07-e00-w01-queue-plan/)`. Every row of a joined unit links the one folder its first row names. The folder's README links each work-item file by the name the row's link carries. Releasing the reservation points the row to that file.
  - Once a pull request is open, its link replaces the planning link: `[W01](…/pull/950)`. A unit changing two long-lived branches links the pull request on each: `[W01](…/pull/950), [W01](…/pull/951)`. Further delivery work on one of those branches gets another task row under Task grain. Joined rows each link their shared pull request.
  - The task is delivered when a linked pull request has merged, or its id links a commit.
  - A link to an open pull request does not deliver the task.
  - A linked pull request whose title names another epic delivers the task once it has merged. The mismatch is reported, and the row stays open while a criterion its Coverage names is unticked.
- **Tasks with their own issue.**
  - A task issue belongs to one epic. Its title carries that epic's prefix.
  - When that epic's table has no row for its id, the issue is unplaced. Once the row exists, that epic's planning manages the issue.
  - The row links the pull request, not the issue.
  - The pull request's Development field links the issue as [Issue Links](pull-request.md#issue-links) state.
  - A completed task issue has all criteria verified and every Development-linked pull request merged.
- **Issues backing several tasks.**
  An issue backing several tasks, such as an investigation, is a reference: the epic cites it under References, no row id links it, and its title carries no agent-engineering prefix.
- **Work another issue takes.**
  It leaves the table. Its criteria go with it, or to another row that delivers them.

### Epic Record

The supplied complete current epic issue JSON. eg `issue-943.json`

### Initiative Context

The supplied current initiative context, epic scope and criteria.

### Task Rows

The proposed task rows or confirmed row changes, including descriptions, Coverage, dependencies, Joins, task grain and optional lane indices. Cross-body dependency references and field findings accompany a revision.

### Pull Request Records

The supplied current pull request records for the epic. eg `prs.json`

### Issue Links

The complete supplied issue-link snapshot. eg `links.json`

### Task Records

The supplied task issue JSON files. eg `issue-637.json`

### Delivery Matches

The confirmed task-to-pull-request matches supplied by the caller. eg `W01=950,W01=951,W02=950`

### Project Checkout

The supplied project checkout.

### Evaluated Revision

The fetched revision supplied for evaluation at the project checkout.

### Epic Bases

The fetched epic bases supplied for recording delivery, each identified by its revision. eg `origin/i07/e00/main`, `origin/i07/e00/workflows`

### Output Body

The supplied local output path for the complete body. eg `fixed-943.md`

### Criterion Selection

The supplied verified criterion ids, or the unmet criterion ids and their delivery evidence for gap planning. eg `AC1,AC3`

### Task Selection

The confirmed task ids for the selected delivery units. A release selection also carries the supplied explicit user decision releasing the hold. eg `W01,W02`

### Board Items

The supplied current board items, including Status. eg `items.json`

### Planning Folder

The existing supplied planning-folder identity, planning-records base URL and the date the record is opened. eg `https://github.com/<owner>/<repo>/tree/engineering/artifacts/planning`

### Engineering Worktree

The supplied engineering checkout containing the planning records. eg `.engineering`

### Validation Findings

The corrected body, mechanical diff and unresolved local or cross-body field findings, including pending publication links.

### Row Result

The resulting task rows, dependency references and their reservation, release or criterion disposition, with any pending decisions.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Epic Body

The supplied complete current epic body text.

### Draft Metadata

The supplied draft title and labels, with the existing complete issue JSON when one is available for the body snapshot.

## Guidance

### Test Evidence

A criterion receives an automatic tick when every task covering it is delivered and supplies an observing check in its linked pull requests. Every observing check must pass in a merged pull request; absent records, unreadable plans and incomplete checks supply no verification. Evidence applies only to the linked task's Coverage. Existing ticks are preserved, and explicitly verified criteria remain subject to delivery readiness.
