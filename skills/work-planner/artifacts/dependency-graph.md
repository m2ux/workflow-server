# Dependency Graph

The task edges an initiative's epics declare, and the row numbers that graph permits.

## Prerequisites

Read these files first.

- [Issue](issue.md)
- [Initiative Issue Body](initiative-issue-body.md)
- [Work Item](work-item.md)
- [Plan Change](plan-change.md)
- [Delivery Branches](delivery-branches.md)

## Operations

### *Check* Dependencies and Numbering

The task graph and the row numbers it permits, checked and renumbered across the supplied bodies.

**Inputs:** Initiative and epic bodies or local drafts, the work-item file of each task that has one, current pull request records, confirmed numbering maps when any, the caller's change allowance when it has one, and explicitly authorized outside-initiative files.

1. Use the supplied local drafts when reviewing unpublished work.
   - For published issues, fetch the initiative and each epic body with [Read Tracker Issue](issue.md#read-tracker-issue).
   - Run [Check Dependencies](#check-dependencies) with the initiative body, every epic body and every supplied work-item file.
2. Resolve each finding, as [Check Plan Change Autonomy](plan-change.md#check-plan-change-autonomy) returns it for the supplied allowance: an automatic correction is taken, and a held one is settled as [Held Change](plan-change.md#held-change) states.
   - Name the producing row for each consumed output, meeting [Edges](#edges), replacing an epic a task row names with the rows the task consumes.
   - Read tasks for implied consumption edges.
   - Answer every open candidate unit as [Joins](#joins) states.
   - Account for every contending pair as [Component Contention](#component-contention) states: the proposed map separates the two epics by a number, or the contending rows move into one epic.
   - Resolve backward references by moving work to the epic owning its inputs, or removing duplicate work already owned there. Work claimed twice has one owner and a boundary in both bodies.
3. Renumber the confirmed maps, preserving the numbers [Numbering Map](#numbering-map) protects.
   - For a confirmed epic map, run [Renumber Epics](#renumber-epics) with current pull request records and every affected body.
   - For a confirmed task map, run [Renumber Tasks](#renumber-tasks) with the initiative and epic identities, owning epic body, confirmed old-to-new task-number map and every affected body file.
   - Re-sort rewritten tables.
   - Inspect every reported range.
   - Search prose for references the script cannot see.
   - Repeat Check Dependencies after each edge or numbering change until it reports no problem.
   - Record the printed longest chains and each printed contending pair in the planning record.
   - Return the checked bodies, the proposed [Epic Priority](#epic-priority) map and unresolved findings to the caller; do not publish a failed renumbering.

## Fields

- **Scope.** One initiative, its epics and their task rows.
- **Source.** The initiative body and every epic body it links, published or as local drafts.

### Edges

A task edge names the producing row for each output the depending row consumes. An edge a task's prose implies is carried explicitly.

- **An edge names rows, never an epic.**
  A row naming an epic gates its task on every row of that epic, including the rows it consumes nothing from, which is how a [whole-epic edge](#whole-epic-edges) the rows do not justify reaches the initiative.
- **A task consuming from every row of an epic names the producing row for each output.**
  An edge another in the cell already implies is dropped, so a prerequisite chain is named by its last row, and the whole-epic reach is what the rows establish either way.
- **An edge to another epic's row waits for that row's outputs.**
  The dependent row starts once the producing row is delivered and its outputs are available at the dependent epic's base, as [Producer Outputs](delivery-branches.md#producer-outputs) states; the producing epic's other rows and its closure gate nothing.
- **An entry that cannot resolve is a permanent condition, not a prerequisite to come.**
  An entry naming no row and linking no issue, naming an issue the run was not given, or naming a row the epic it points to does not carry, cannot resolve. Every tool reading the cell names the entry as written, leaves the row where it stands rather than placing it as work still to come, and exits nonzero.

### Whole-Epic Edges

An initiative Depends on cell takes the epics it derives, as [Work Breakdown](initiative-issue-body.md#work-breakdown) states. It derives one only where every row of the dependent epic requires every row of the prerequisite, through the task edges alone: a task row names rows, so no cell can assert a whole epic that the rows do not already establish.

- **The edge is the coarsest gate the plan has.**
  It holds the dependent epic until the prerequisite closes, not until the row it consumes merges, and it drops the dependent a [priority](#epic-priority) number, so the board keeps it out of Ready while the prerequisite runs.
- **Its cost is why it is derived and never written.**
  A narrower dependency stays in the task graph, where it gates the row that consumes the output rather than the epic around it.

### Epic Priority

The map proposes one positive integer for each epic supplied, derived from the whole-epic edges and the components its rows declare. Epics sharing a number start together, so the number asserts they can run in parallel, and it holds a set only where both of these do.

- **Prerequisite depth establishes when an epic may start.**
  An epic with no prerequisite epic, one whose tasks are not yet written among them, carries the largest number, and each other epic takes one less than the smallest its prerequisites carry.
- **Component contention establishes whether it can.**
  An epic holding a row that contends with a row of an epic of the same depth takes the number below that depth, and the epics depending on it follow it down, as [Component Contention](#component-contention) states.

### Component Contention

Two task rows in different epics whose work items declare one [component](work-item.md#component) contend. Concurrent epics are two bases and two pull requests, so one component written from both is a merge conflict.

- Rows of one epic are out of scope: they land on one base, in the order Depends on and [Joins](#joins) set, so one component written twice is a rebase on that base rather than a conflict between two of them. [Joins](#joins) proposes them as one unit.
- A contending pair is answered by the number that separates its epics, or by moving the rows into one epic.

### Joins

The undelivered rows of one epic whose work items declare one [component](work-item.md#component) are a candidate unit: one pull request writes that file once, where separate ones each rebase on the last. Rows declaring different components need no accounting.

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

## Commands

### Check Dependencies

Checks the task dependency graph across the epics given, and with `I=` the initiative's Depends on cells.

**Inputs:** Initiative body file, each epic id with its body file, each task id with its work-item file, and each planning-record file accounting for split candidate units.

- Keep `I=` for the initiative. Repeat the `<epic-id>=<epic-body-file>` argument once per epic, the `<epic-id>:<task-id>=<work-item-file>` argument once per work item, and `R=<record-file>` once per record.
- The command runs in `<workspace>`, and each file sits in a planning record or a working directory beyond it, so pass each one as an absolute path.

- Initiative edges follow the [whole-epic prerequisite rule](initiative-issue-body.md#work-breakdown); narrower dependencies stay in the task graph.
- It also reports dependencies listed twice or already implied, Joins pairs that do not name each other or that a dependency links, and a joined unit covering more than six criteria.
- It prints each candidate unit its rows do not join and no `R=` record line names exactly, with both resolutions and each direct edge a join drops, and each candidate split by rule with its reason, as [Joins](#joins) states. An `R=` file it cannot read is a problem.
- An entry it cannot resolve is a problem naming the entry as written, as [Edges](#edges) states. Its second clause says what this run could not find, which is the epics it was given.
- It prints each pair of rows in different epics whose work items declare one component, meeting [Component Contention](#component-contention), and names the rows it was given no work item for, so a partial report says what it passed over.
- A task row naming an epic rather than the rows it consumes is a problem, as [Edges](#edges) states. That row still reaches the epic's rows, so a body carrying the retired form is reported once rather than taking its initiative's gates down with it.
- It reads a declared component without its link, a wrapping code span, a trailing full stop or a leading `./`, and reports a work item it cannot read.
- It reports a work item declaring a directory: a path ending in `/`, carrying a glob, or naming a directory under `<workspace>`.
- It prints the proposed [Epic Priority](#epic-priority) of each epic, largest first.
- It reads bodies from [Read Tracker Issue](issue.md#read-tracker-issue), or local drafts.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deps.py 'I=<initiative-body-file>' '<epic-id>=<epic-body-file>' '<epic-id>:<task-id>=<work-item-file>' 'R=<record-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deps.py I=/drafts/live-936.md E00=/drafts/live-943.md E01=/drafts/live-937.md E00:W01=/drafts/e00/w01.md E01:W01=/drafts/e01/w01.md R=/records/joins.md
```

### Renumber Tasks

Renumbers one epic's tasks by the map given, in the files given.

**Inputs:** Initiative number, epic number, epic body file, task-number map and affected body files.

- `<task-number-map>` is a comma-separated list of `<old-number>:<new-number>` pairs. Pass each affected body file as a separate argument.

- It renumbers `<epic-id> Wxx` and `<epic-id>:Wxx` everywhere, and bare `Wxx` inside that epic's own body. **Example:** for `E01`, the qualified forms are `E01 Wxx` and `E01:Wxx`.
- The map assigns each old task number a distinct new number. A source absent from the files or a duplicate destination is refused.
- Append `--outside` followed by each explicitly authorized outside-initiative body file when supplied; only this initiative's prefixed references change there.
- Only rows no pull request names may be renumbered. Inspect the rewritten files before publishing them.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/renumber.py --initiative '<initiative-number>' --epic '<epic-number>' --own '<epic-body-file>' --tasks '<task-number-map>' '<affected-body-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/renumber.py --initiative 07 --epic 1 --own live-937.md --tasks 7:3,3:5 live-*.md
```

### Renumber Epics

Renumbers an initiative's epics across supplied body files.

**Inputs:** Initiative number, current pull request records, confirmed epic-number map, body files and explicitly authorized outside-initiative files when present.

- The map is a comma-separated list of `<old-number>:<new-number>` pairs. Pass each body file as a separate argument; append `--outside` followed by each outside-initiative file when supplied.
- Files are rewritten in place. Outside files change only references carrying this initiative's prefix; links retain their targets. A source absent from the files, a collision or a number already named by a pull request is refused.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/renumber.py --initiative '<initiative-number>' --prs '<pull-request-records-file>' --map '<epic-number-map>' '<body-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/renumber.py --initiative 07 --prs prs.json --map 6:0,0:1 live-936.md live-943.md
```
