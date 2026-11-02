# Epic Issue Body

Populates one epic body. The body states one slice of the design and lists the tasks that deliver it.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Pull Request](pull-request.md)
- [Epic](epic.md)
- [Issue](issue.md)
- [Dependency Graph](dependency-graph.md)
- [Delivery Plan](delivery-plan.md)

## Operations

### *Populate* Epic Issue Body

One epic body and its local validation findings.

**Inputs:** Initiative context, epic scope, draft title and labels, criteria, proposed task rows, available pull request records, project checkout, evaluated revision and output path.

1. Populate the body from the [Template](#template) at the supplied output path.
   - Every section must meet [Fields](#fields).
   - Shared content must meet the common [body conditions](issue-body.md#fields).
2. Populate the shared table through [Write Issue Table](issue-body.md#write-issue-table).
3. Fill the epic-specific cells.
   - Each row must meet [Work Breakdown](#work-breakdown).
4. Call [Build Body Snapshot](issue-body.md#build-body-snapshot) with the draft body, title, labels and existing issue JSON when present.
5. Pass that snapshot, initiative context, available pull request records, project checkout, evaluated revision and output file to [Validate Epic Body](#validate-epic-body).
6. Identify unresolved publication links separately; they remain pending until tracker identities exist.
7. Return the draft rows, their dependency references and the validation findings for the caller's cross-body ordering check.

### *Record* Epic Delivery

One epic body with supplied delivery matches and completed rows recorded.

**Inputs:** Epic JSON, pull request records, complete issue-link snapshot, task issue records, confirmed task-to-pull-request matches, project checkout, fetched epic bases and output body file.

1. Run [Sync Epic](#sync-epic), mapping pull requests to `--prs`, links to `--links`, task issues to `--tasks`, each confirmed match to `--link`, the checkout to `--project`, each fetched epic base to a `--revision` and the output file to `--fix`.
   - Row changes must meet [Task Delivery](#task-delivery) and [Work Breakdown](#work-breakdown).
2. Return the updated body and [Delivery Findings](epic.md#delivery-findings) for the caller to resolve and publish. An unmerged epic base prevents a closable result.

### *Record* Epic Criteria

Verified criteria and completed rows in one epic body.

**Inputs:** Epic JSON, pull request records, complete issue-link snapshot, verified criterion ids and output body file.

1. Run [Tick Epic Criteria](#tick-epic-criteria) with the epic JSON, records as `--prs`, snapshot as `--links`, verified ids as `--tick` and output as `--fix`. Refuse criteria not ready to verify.
2. Return the body and refused criteria. Complete rows receive Done ticks.

### *Reserve* Task Rows

Task rows held for one confirmed delivery session.

**Inputs:** Epic JSON, confirmed task ids, board items with Status, supplied planning-folder identity, planning-records base URL, record date and output body file.

1. Require the caller's confirmed unit and existing planning folder. Refuse a row already held or linked to a pull request or commit, and a unit [Work Units](delivery-plan.md#work-units) does not admit.
2. Run [Reserve Row](#reserve-row) with the epic as `--epic`, every id of the unit as `--reserve`, the board items as `--items`, supplied base URL as `--records`, record date as `--date` and output as `--fix`.
3. Return the body with the unit's folder as each of its rows' single link, meeting [Task Delivery](#task-delivery).

### *Release* Task Rows

Held task rows returned to their work-item links.

**Inputs:** Epic JSON, task ids, explicit user decision releasing the hold, engineering worktree and output body file.

1. Require the supplied release decision and refuse any row that is not held.
2. Run [Release Row](#release-row) with the epic as `--epic`, every id of each released unit as `--release`, the engineering worktree as `--engineering` and output as `--fix`.
3. Return the body with each task id linked to its lowercase work-item file inside the reserved folder, meeting [Task Delivery](#task-delivery).

### *Validate* Epic Body

The body's local format and field findings.

**Inputs:** Epic JSON, initiative context, current pull request records, project checkout, evaluated revision and output file.

1. Read the changed paths of each epic pull request reaching a branch the project's [Required Criteria](#required-criteria) declare, through [Read Pull Request State](pull-request.md#read-pull-request-state).
2. Call [Validate Issue Body](issue-body.md#validate-issue-body) with the current body, local [Fields](#fields), supplied related evidence and output file, supplying initiative JSON as `--initiative`, pull requests as `--prs`, each pull request's changed paths as `--files <number>=<changed-paths-file>`, the checkout as `--project` and the revision as `--revision`.
   - The evaluated revision is the epic's base on the long-lived branch that holds the project's configuration, such as `origin/i07/e00/workspace`, or that branch itself, such as `origin/workspace`, while the epic has no base on it. Fetch it before the check reads it.
3. Read reach from each epic pull request's base, through an epic base or initiative branch. Without pull requests, no criterion is lacking.
4. Include in the findings each [Required Criteria](#required-criteria) criterion an epic lacks whose work changes the criterion's paths on its branch, required criteria the declaration or the changed paths leave unevaluable, and any epic criterion no task row delivers.
5. Return the corrected body, mechanical diff and unresolved findings for the caller.

### *Revise* Epic Rows

One epic body with confirmed task-grain and coverage corrections.

**Inputs:** Epic body, confirmed row changes, field findings, supplied dependency references and output path.

1. Apply the confirmed row changes through [Populate Epic Issue Body](#populate-epic-issue-body), preserving unrelated content.
   - Description, Coverage, Depends on, Joins and task grain must meet [Work Breakdown](#work-breakdown).
   - Split a task exceeding the allowed criterion grain into the confirmed tasks.
2. Return the revised body and any cross-body numbering or dependency changes for the caller.

### *Plan* Gap Task

The agreed disposition of criteria a delivered row left unmet.

**Inputs:** Current epic JSON and body, delivered task row, unmet criterion ids, delivery records, complete issue-link snapshot, project checkout, fetched epic bases and output body path.

1. Present each unmet criterion and its missing evidence to the user.
   - Return the criteria the user confirms already hold to the caller for verification and ticking. The delivered task retains them.
   - Record an unanswered decision as pending.
   - If no criteria need further work, return the pending findings to the caller.
   - Continue to the draft step with only the criteria the user confirms need further work.
2. Draft a further task for the criteria selected for further work, meeting [Work Breakdown](#work-breakdown).
   - Confirm the draft with the user.
   - On acceptance, call [Revise Epic Rows](#revise-epic-rows) with the further row and the criteria it adopts from the delivered task's Coverage.
   - Return an unanswered draft as pending without continuing to the reconcile step.
3. Run [Record Epic Delivery](#record-epic-delivery) with the revised epic, the supplied delivery evidence, the project checkout and the fetched epic bases.
   - Publish the returned body through [Save Tracker Issue](issue.md#save-tracker-issue).
   - Return the saved row and criterion disposition to the caller. Done follows [Tables](issue-body.md#tables).

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

| Task | Description | Coverage | Depends on | Joins | Done |
| --- | --- | --- | --- | --- | --- |
| W01 | {{What the task delivers, at most eight words}} | AC{{n}}, AC{{m}} | {{Earlier task in this epic, [Exx:Wyy](…) or [Exx](…) in an earlier epic, or #issue}} | {{Tasks that can land in the same pull request}} | |

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

The columns are `Task | Description | Coverage | Depends on | Joins | Done`.

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
- **Numbering.**
  Task numbering meets [Numbering](issue-body.md#numbering); a row whose id links a pull request is fixed.
- **Reference form.**
  A table reference uses colons (`E01:W03`, `I05:E00:W02`), and every epic reference links to that epic's issue: `[E01:W03](…/issues/937)`. Prose uses a space (`E01 W03`).

### Test Evidence

A criterion receives an automatic tick when every task covering it is delivered and supplies an observing check in its linked pull requests. Every observing check must pass in a merged pull request; absent records, unreadable plans and incomplete checks supply no verification. Evidence applies only to the linked task's Coverage. Existing ticks are preserved, and explicitly verified criteria remain subject to delivery readiness.

### Acceptance Criteria

An epic criterion meets the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria). Contradictions between criteria in one epic are findings.

### Open Questions

Each question holds only what is undecided and has a recommendation in the planning record. A settled point belongs in that record. No question remains when the epic starts.

### Required Criteria

A project states the criteria its epics must carry in `config/required-criteria.json` at its root. The file is a JSON array, and each entry is one required criterion with these fields, each a non-empty string except `paths`:

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
- **Example.**
  workflow-server requires its corpus audit of work that changes the workflow definitions under `corpus` on `workflows`:

  ```json
  [
    {
      "branch": "workflows",
      "paths": ["corpus"],
      "criterion": "The definitions this epic changes carry no outstanding confirmed finding, one neither fixed on the epic's branch nor taken by an issue, as the canon audit's coverage report shows.",
      "phrase": "canon audit",
      "row": "Canon audit of the changed definitions"
    }
  ]
  ```

### Task Delivery

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

### Breakdown Prose

Work Breakdown contains its table. Explanatory prose belongs in Proposal. The body does not narrate execution order or how the tables work; Depends on carries the order.

## Commands

### Sync Epic

Links each named task's id to the pull requests naming the epic it is delivered through, open or merged, and ticks Done on a row once it is complete.

**Inputs:** Epic JSON, pull request records, complete issue-link snapshot, task records, confirmed matches, project checkout, fetched epic bases and output body file.

- A row whose id links its task issue links the pull request instead.
- A pull request whose head is an epic base is the pull request that merges that base, and is not matched to a task.
- An unmerged epic base keeps the epic open, even when every row is delivered and every criterion is ticked.
- An epic base is reported `draft` only where it holds a commit its long-lived branch lacks. The base is read at the `--revision` naming it and the long-lived branch beside it on the same remote, so `origin/i07/e00/main` is compared with `origin/main`; a base no `--revision` names is reported `unevaluable`.
- `--project` is a checkout of the project and each `--revision` one of the epic's bases, such as `origin/i07/e00/main`. The long-lived branch names are the ones `config/branches` states at those commits, and each `source` line names a path, commit and repository.
- An absent, empty or unreadable statement, and statements that disagree across the bases, are reported `unevaluable` with their source. Without the long-lived branch names, the run names each check it did not make as `not checked`, and an epic that would otherwise be closable is not.
- An open review pull request's Changes paths are read at its head commit in the `--project` repository: a path with a directory stands where the head holds a file or a directory at it, and a bare file name anywhere in the tree. A head commit the repository does not hold is reported `unevaluable`.
- Passed checks settle criteria under [Test Evidence](#test-evidence).
- `--link` names each task id and the pull request number it links. An id repeats once for each pull request, one per long-lived branch its unit changes. The row keeps the deliveries it links in place and gains each named one it lacks, so a repeated run leaves it unchanged. `--tasks` is the task issues. `--links` is the pull requests' Development-linked issues. `--fix` is the body written with the Done ticks.

`<task-pull-request-map>` is a comma-separated list of `<task-id>=<pull-request-number>` pairs, with a pair for each pull request a task id links. Pass each task JSON file as a separate argument after `--tasks`.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/sync.py '<epic-json-file>' --prs '<pull-request-records-file>' --links '<issue-link-snapshot-file>' --tasks '<task-json-file>' --link '<task-pull-request-map>' --project '<checkout>' --revision '<epic-base-revision>' --fix '<output-body-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --links links.json --tasks issue-637.json --link W01=950,W01=951,W02=950 --project '<checkout>' --revision origin/i07/e00/main --revision origin/i07/e00/workflows --fix fixed-943.md
```

### Tick Epic Criteria

Ticks confirmed epic criteria, refusing any not ready to verify, and ticks completed rows.

**Inputs:** Current epic JSON, pull request and link snapshots, verified criterion ids and destination body file.

`<criterion-ids>` is a comma-separated list of verified criterion ids.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/sync.py '<epic-json-file>' --prs '<pull-request-records-file>' --links '<issue-link-snapshot-file>' --tick '<criterion-ids>' --fix '<output-body-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --links links.json --tick AC1,AC3 --fix fixed-943.md
```

### Reserve Row

Holds each named unit for one session, by setting its record folder as the single link of every row in it.

**Inputs:** Epic JSON, confirmed reservable task ids, board items with Status, planning-folder identity, record date, records base URL and output body file.
- `--items` is the board's items with Status.
- `--records` is the URL of the planning records folder, needed when no row id in the epic links a record.
- The caller supplies the planned folder identity; `--date` is the day it is opened.
- The folder is the one the unit's first task id and Description give it, as the available-work report's `unit` line names it. A call naming some rows of a joined unit and not the others is refused.

`<task-ids>` is a comma-separated list of task ids; `<records-base-url>` identifies the planning records folder.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --epic '<epic-json-file>' --reserve '<task-ids>' --items '<board-items-file>' --records '<records-base-url>' --fix '<output-body-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --epic issue-943.json --reserve W01,W02 --items items.json --records 'https://github.com/<owner>/<repo>/tree/engineering/artifacts/planning' --fix fixed-943.md
```

### Release Row

Frees each named task row, by replacing the planning-folder link with its work-item file link.

**Inputs:** Epic JSON, confirmed held task ids, authorized release, engineering worktree and output body file.
- The file is the task id in lowercase within that folder, as [Task ids](#task-delivery) defines.
- `--engineering` is the checkout holding the planning records. A row whose folder there holds no such file, or whose README does not link it, is refused.
- A call naming some rows of a joined unit and not the others is refused.

`<task-ids>` is a comma-separated list of task ids.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --epic '<epic-json-file>' --release '<task-ids>' --engineering '<engineering-worktree>' --fix '<output-body-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --epic issue-943.json --release W01 --engineering .engineering --fix fixed-943.md
```
