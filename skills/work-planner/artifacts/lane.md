# Lane

A board-wide delivery lane, its task assignments and the units a request admits.

## Operations

### Read Task Lanes

Lane assignments and malformed-cell findings from supplied task tables.

#### 1. Read Task Lane Cells

Apply [Read Lane Assignments](#read-lane-assignments "operation") to [Epic Body File](#epic-body-file "input") and provide [Lane Result](#lane-result "output") with the row-to-index map and findings, meeting [Assignments](#assignments).

### Assign Task Lanes

A task table with confirmed lane assignments.

#### 1. Write Confirmed Lane Map

- Apply [Write Lane Assignments](#write-lane-assignments "operation") to [Epic Body File](#epic-body-file "input") with [Confirmed Map](#confirmed-map "input"), writing to [Output Body](#output-body "input").
- Refuse unknown task ids or malformed resulting cells.

#### 2. Provide Updated Body

Provide the [output body](#output-body "output") for the caller's full body and dependency validation.

### Check Unit Lanes

The common lane of a supplied work unit, or its assignment findings.

#### 1. Check Complete Unit Lane

Apply [Validate Lane Unit](#validate-lane-unit "operation") to [Epic Body File](#epic-body-file "input") with [Unit Task Ids](#unit-task-ids "input") and provide [Lane Result](#lane-result "output") with the common index or findings, meeting [Unit Consistency](#unit-consistency).

### Determine Lane Admission

The lane decision for one free unit and current request.

#### 1. Evaluate Requested Lane

Apply [Evaluate Lane Admission](#evaluate-lane-admission "operation") to [Epic Body File](#epic-body-file "input") with [Unit Task Ids](#unit-task-ids "input") and [Requested Index](#requested-index "input"), and provide [Lane Result](#lane-result "output") with its admitted flag and findings, meeting [Admission](#admission).

### Read Lane Assignments

Reads raw task-table Lane cells through the Lane module.

#### 1. Read Lane Assignments

Run the following command using [Epic Body File](#epic-body-file "input"), [Workspace](#workspace "input").

<big><pre>
"[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace)/skills/work-planner/scripts/lane.py" read '[**&lt;epic-body-file&gt;**](#epic-body-file)'
</pre></big>

#### 2. Provide Read Lane Assignments

Provide [Lane Result](#lane-result "output") to the requester.

### Write Lane Assignments

Writes confirmed assignments while preserving other body content.

#### 1. Write Lane Assignments

Run the following command using [Epic Body File](#epic-body-file "input"), [Confirmed Map](#confirmed-map "input"), [Output Body](#output-body "input"), [Workspace](#workspace "input").

<big><pre>
"[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace)/skills/work-planner/scripts/lane.py" assign '[**&lt;epic-body-file&gt;**](#epic-body-file)' --map '[**&lt;confirmed-map-file&gt;**](#confirmed-map)' --out '[**&lt;output-body-path&gt;**](#output-body)'
</pre></big>

#### 2. Provide Written Lane Assignments

Provide [Output Body](#output-body "output") to the requester.

### Validate Lane Unit

Reports a unit's common lane or assignment findings.

#### 1. Validate Lane Unit

Run the following command using [Epic Body File](#epic-body-file "input"), [Unit Task Ids](#unit-task-ids "input"), [Workspace](#workspace "input").

<big><pre>
"[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace)/skills/work-planner/scripts/lane.py" check '[**&lt;epic-body-file&gt;**](#epic-body-file)' --unit '[**&lt;task-ids&gt;**](#unit-task-ids)'
</pre></big>

#### 2. Provide Validated Lane Unit

Provide [Lane Result](#lane-result "output") to the requester.

### Evaluate Lane Admission

Reports whether the request admits a valid unit.

#### 1. Evaluate Lane Admission

- Run the following command using [Epic Body File](#epic-body-file "input"), [Unit Task Ids](#unit-task-ids "input"), [Requested Index](#requested-index "input"), [Workspace](#workspace "input").

- Omit the lane option when the request supplies none.

<big><pre>
"[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace)/skills/work-planner/scripts/lane.py" admit '[**&lt;epic-body-file&gt;**](#epic-body-file)' --unit '[**&lt;task-ids&gt;**](#unit-task-ids)' --lane '[**&lt;lane-index&gt;**](#requested-index)'
</pre></big>

#### 2. Provide Evaluate Lane Admission

Provide [Lane Result](#lane-result "output") to the requester.

## Fields

### Index

An index is an opaque board-wide decimal string. Its spelling is significant: `02` and `2` are distinct indices, and `0` is valid. The same index identifies one lane across the theme board.

### Assignments

Each task's Lane cell holds a bare [Index](#index), or is empty for an unlaned task. A populated cell's complete content is the index. Raw cells supply assignments independently of work-item links. Malformed cells supply findings and no assignment; a missing Lane column supplies no lane data.

### Unit Consistency

Every member of a unit carries the same index, or every member is unlaned. Missing assignments and differing values are findings. A differing assignment requires changing the row lanes or unjoining the rows.

### Admission

A request naming an index admits free units with that index and unlaned units. A request naming none admits only unlaned units. Malformed or inconsistent assignments admit no unit. Availability and priority are supplied by the caller; lane admission applies to free units and leaves other findings visible. A unit without task rows is unlaned.

### Report Label

A populated index is reported as `lane 2`, preserving its spelling; an unlaned unit is reported as `unlaned`.

### Epic Body File

The local file containing the supplied complete epic body text.

### Confirmed Map

The local JSON object keyed by task id, with decimal-string indices or `null` for unlaned rows.

### Output Body

The supplied local output path and resulting epic body. The output is absent until written.

### Unit Task Ids

The complete supplied unit task ids as a comma-separated list.

### Requested Index

The optional lane index named by the request; absence selects an unlaned request.

### Lane Result

The row-to-index map, common unit index or admitted flag selected by the operation, with its assignment findings.

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.
