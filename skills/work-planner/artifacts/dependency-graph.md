# Dependency Graph

The task edges an initiative's epics declare, and the row numbers that graph permits.

## Operations

### Check Dependencies and Numbering

The task graph and the row numbers it permits, checked and renumbered across the supplied bodies.

#### 1. Check Supplied Task Graph

- Use local drafts from [Graph Inputs](#graph-inputs) when reviewing unpublished work.
- For published issues, Apply [Read Tracker Issue](issue.md#read-tracker-issue "ƒ") for the initiative and each epic body.
- Run [Check Dependencies](#check-dependencies "ƒ") with the initiative body, every epic body and every supplied work-item file. The computation invokes Run [Validate Lane Unit](lane.md#validate-lane-unit "ƒ") internally with each derived unit’s epic body and complete ids.

#### 2. Resolve Graph Findings

- For each finding, Apply [Check Plan Change Autonomy](plan-change.md#check-plan-change-autonomy "ƒ") with the supplied allowance.
- Take an automatic correction.
- Settle a held finding as [Held Change](plan-change.md#held-change) states.
- Name the producing row for each consumed output, meeting [Edges](#edges), replacing an epic a task row names with the rows the task consumes.
- Read tasks for implied consumption edges.
- Answer every open candidate unit as [Joins](#joins) states.
- Account for every contending pair through [Component Contention](#component-contention).
- Resolve backward references by moving work to the epic owning its inputs, or removing duplicate work already owned there. Work claimed twice has one owner and a boundary in both bodies.

#### 3. Apply Confirmed Numbering

- Renumber the confirmed maps, preserving the numbers [Numbering Map](#numbering-map) protects.
- For a confirmed epic map, Run [Renumber Epics](#renumber-epics "ƒ") with current pull request records and every affected body.
- For a confirmed task map, Run [Renumber Tasks](#renumber-tasks "ƒ") with the initiative and epic identities, owning epic body, confirmed old-to-new task-number map and every affected body file.
- Re-sort rewritten tables.
- Inspect every reported range.
- Search prose for references the script cannot see.
- After each edge or numbering change, Run [Check Dependencies](#check-dependencies "ƒ") with the refreshed initiative and epic bodies and every supplied work-item and split-unit record file. Repeat that operation until it reports no problem.
- Record the printed longest chains and each printed contending pair in the planning record.
- Provide [Graph Result](#graph-result) with the checked bodies, proposed [Epic Priority](#epic-priority) map and unresolved findings; do not publish a failed renumbering.

## Commands

### Check Dependencies

Check the task dependency graph across the supplied epics, include the initiative's Depends on cells when `I=` is supplied, and provide [Graph Result](#graph-result "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/deps.py 'I=[**&lt;initiative-body-file&gt;**](#dependency-files "○")' &#92;
  '[**&lt;epic-id&gt;**](#dependency-files "○")=[**&lt;epic-body-file&gt;**](#dependency-files "○")' '[**&lt;epic-id&gt;**](#dependency-files "○"):[**&lt;task-id&gt;**](#dependency-files "○")=[**&lt;work-item-file&gt;**](#dependency-files "○")' 'R=[**&lt;record-file&gt;**](#dependency-files "○")'
</pre></big>

- Keep `I=` for the initiative. Repeat the `<epic-id>=<epic-body-file>` argument once per epic, the `<epic-id>:<task-id>=<work-item-file>` argument once per work item, and `R=<record-file>` once per record.
- The command runs in `<workspace>`, and each file sits in a planning record or a working directory beyond it. Supply the paths as [Dependency Files](#dependency-files "○") defines them.

- Initiative edges must follow the [whole-epic prerequisite rule](initiative-issue-body.md#work-breakdown); narrower dependencies stay in the task graph.
- It also reports dependencies listed twice or already implied, Joins pairs that do not name each other or that a dependency links, and a joined unit covering more than six criteria.
- It refuses a joined unit that fails the [lane condition](#joins), naming each row and its lane, and exits nonzero.
- It prints each candidate unit its rows do not join and no `R=` record line names exactly, with both resolutions and each direct edge a join drops, and each candidate split by rule with its reason, as [Joins](#joins) states. An `R=` file it cannot read is a problem.
- An entry it cannot resolve is a problem naming the entry as written, as [Edges](#edges) states. Its second clause says what this run could not find, which is the epics it was given.
- It prints each pair of rows in different epics whose work items declare one component, meeting [Component Contention](#component-contention), and names the rows it was given no work item for, so a partial report says what it passed over.
- A task row naming an epic rather than the rows it consumes is a problem, as [Edges](#edges) states. That row still reaches the epic's rows, so a body carrying the retired form is reported once rather than taking its initiative's gates down with it.
- It reads a declared component without its link, a wrapping code span, a trailing full stop or a leading `./`, and reports a work item it cannot read.
- It reports a work item declaring a directory: a path ending in `/`, carrying a glob, or naming a directory under `<workspace>`.
- It prints the proposed [Epic Priority](#epic-priority) of each epic, largest first.
- Its supplied inputs are published body text or local drafts.

- The map proposes one positive integer for each epic supplied, derived from the whole-epic edges and the components its rows declare. Epics sharing a number start together, so the number asserts they can run in parallel, and it holds a set only where both of these do.

- **Prerequisite depth establishes when an epic may start.**
  An epic with no prerequisite epic, one whose tasks are not yet written among them, carries the largest number, and each other epic takes one less than the smallest its prerequisites carry.
- **Component contention establishes whether it can.**
  An epic holding a row that contends with a row of an epic of the same depth takes the number below that depth, and the epics depending on it follow it down, as [Component Contention](#component-contention) states.

### Renumber Tasks

Renumber one epic's tasks in the supplied files according to the given map and provide [Rewritten Bodies](#rewritten-bodies "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/renumber.py &#92;
  --initiative [**&lt;initiative-number&gt;**](#renumber-inputs "○") &#92;
  --epic [**&lt;epic-number&gt;**](#renumber-inputs "○") &#92;
  --own '[**&lt;epic-body-file&gt;**](#dependency-files "○")' &#92;
  --tasks [**&lt;task-number-map&gt;**](#renumber-inputs "○") '[**&lt;affected-body-file&gt;**](#renumber-inputs "○")'
</pre></big>

- `<task-number-map>` is a comma-separated list of `<old-number>:<new-number>` pairs. Pass each affected body file as a separate argument.

- It renumbers `<epic-id> Wxx` and `<epic-id>:Wxx` everywhere, and bare `Wxx` inside that epic's own body. **Example:** for `E01`, the qualified forms are `E01 Wxx` and `E01:Wxx`.
- The map assigns each old task number a distinct new number. A source absent from the files or a duplicate destination is refused.
- Append `--outside` followed by each explicitly authorized outside-initiative body file when supplied; only this initiative's prefixed references change there.
- Only rows no pull request names may be renumbered. Inspect the rewritten files before publishing them.

### Renumber Epics

Renumber an initiative's epics across supplied body files and provide [Rewritten Bodies](#rewritten-bodies "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/renumber.py &#92;
  --initiative [**&lt;initiative-number&gt;**](#renumber-inputs "○") &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --map [**&lt;epic-number-map&gt;**](#renumber-inputs "○") '[**&lt;body-file&gt;**](#renumber-inputs "○")'
</pre></big>

- The map is a comma-separated list of `<old-number>:<new-number>` pairs. Pass each body file as a separate argument; append `--outside` followed by each outside-initiative file when supplied.
- Files are rewritten in place. Outside files change only references carrying this initiative's prefix; links retain their targets. A source absent from the files, a collision or a number already named by a pull request is refused.

## Fields

### Scope

One initiative, its epics and their task rows.

### Source

The initiative body and every epic body it links, published or as local drafts.

### Edges

The collection of producer-to-consumer task-row references. A task edge names the producing row for each output the depending row consumes. An edge a task's prose implies is carried explicitly.

- **An edge names rows, never an epic.**
  A row naming an epic gates its task on every row of that epic, including the rows it consumes nothing from, which is how a [whole-epic edge](#whole-epic-edges) the rows do not justify reaches the initiative.
- **A task consuming from every row of an epic names the producing row for each output.**
  An edge another in the cell already implies is dropped, so a prerequisite chain is named by its last row, and the whole-epic reach is what the rows establish either way.
- **An edge to another epic's row waits for that row's outputs.**
  The dependent row starts once the producing row is delivered and its outputs are available at the dependent epic's base, as [Producer Outputs](delivery-branches.md#producer-outputs) states; the producing epic's other rows and its closure gate nothing.
- **An entry that cannot resolve is a permanent condition, not a prerequisite to come.**
  An entry naming no row and linking no issue, naming an issue the run was not given, or naming a row the epic it points to does not carry, cannot resolve. Every tool reading the cell names the entry as written, leaves the row where it stands rather than placing it as work still to come, and exits nonzero.

### Whole-Epic Edges

The collection of initiative-table epic dependency references. An initiative Depends on cell takes the epics it derives, as [Work Breakdown](initiative-issue-body.md#work-breakdown) states. It derives one only where every row of the dependent epic requires every row of the prerequisite, through the task edges alone: a task row names rows, so no cell can assert a whole epic that the rows do not already establish.

- **The edge is the coarsest gate the plan has.**
  It holds the dependent epic until the prerequisite closes, not until the row it consumes merges, and it drops the dependent a [priority](#epic-priority) number, so the board keeps it out of Ready while the prerequisite runs.
- **Its cost is why it is derived and never written.**
  A narrower dependency stays in the task graph, where it gates the row that consumes the output rather than the epic around it.

### Epic Priority

A map from each supplied epic id to one positive integer priority, ordered largest first in the report. Equal priorities identify epics that may run in parallel under the derived dependency and component constraints.

### Joins

The candidate joined units, each a set of task ids in one epic. The undelivered rows of one epic whose work items declare one [component](work-item.md#component) are a candidate unit: one pull request writes that file once, where separate ones each rebase on the last. Rows declaring different components need no accounting.

- **A joined unit has one lane.**
  Joined rows must meet [Unit Consistency](lane.md#unit-consistency).
- **A candidate is answered once.**
  Its rows name each other in Joins, or one line of a record names exactly its rows and why they stay split. A line naming only some of its rows, or rows besides, accounts for none.
- **Both resolutions are stated where the candidate is reported.**
  Naming the rows in Joins asserts one pull request; the record line says why there are several. A report naming only the first makes the assertion the cheaper answer.
- **A direct edge inside a candidate is the edge a join drops.**
  The report names it, since the joined pull request orders the commits.
- **Some candidates are split by rule.**
  A candidate whose rows cover more than six criteria, or with a path between two of them through a row outside it, cannot join. The report names the reason, and no record line is asked for.

### Numbering Map

A comma-separated list of `<old-number>:<new-number>` pairs assigning each old number one distinct new number. A number a pull request already names is preserved, and a row a pull request names is not renumbered. A source absent from the supplied files, or a duplicate destination, is refused.

### Graph Inputs

The supplied initiative and epic bodies or local drafts, work-item files for tasks that have them, current pull request records, any confirmed numbering maps, caller allowance when present and explicitly authorized outside-initiative files.

### Dependency Files

The initiative body file, each epic id and body file, each task id and work-item file, and each record file accounting for split candidate units. Files are absolute paths. eg `I=/drafts/live-936.md`, `E00=/drafts/live-943.md`, `E01=/drafts/live-937.md`, `E00:W01=/drafts/e00/w01.md`, `E01:W01=/drafts/e01/w01.md`, `R=/records/joins.md`

### Renumber Inputs

The initiative number, epic number for task renumbering, owning epic body for task renumbering, confirmed numbering map and affected body files, with explicitly authorized outside-initiative files when supplied. eg `initiative-number: 07`, `epic-number: 1`, `task-number-map: 7:3,3:5`, `affected-body-file: live-*.md`, `epic-number-map: 6:0,0:1`, `body-file: live-936.md live-943.md`

### Pull Request Records

The supplied current complete pull request records, one JSON object per nonempty line at the local file path. eg `prs.json`

### Graph Result

The checked bodies, proposed epic-priority map and unresolved dependency, numbering, component or lane findings, including the printed chains and contending pairs.

### Rewritten Bodies

The supplied bodies rewritten in place, with reported ranges and unresolved renumbering findings.

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.

## Guidance

### Component Contention

Two task rows in different epics whose work items declare one [component](work-item.md#component) contend. Concurrent epics are two bases and two pull requests, so one component written from both is a merge conflict.

- Rows of one epic are out of scope: they land on one base, in the order Depends on and [Joins](#joins) set, so one component written twice is a rebase on that base rather than a conflict between two of them. [Joins](#joins) proposes them as one unit.
- A contending pair is answered by the number that separates its epics, or by moving the rows into one epic.
