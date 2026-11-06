# Lane

A board-wide delivery lane, its task assignments and the units a request admits.

## Commands

### Read Lane Assignments

Read raw task-table Lane cells through the Lane module and provide [Lane Result](#lane-result "●") to the requester.

- Results meet [Assignments](#assignments).

<big><pre>
"[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/lane.py" read '[**&lt;epic-body-file&gt;**](#epic-body-file "○")'
</pre></big>

### Write Lane Assignments

Write confirmed assignments while preserving other body content and provide [Output Body](#output-body "●") to the requester.

- Refuse unknown task ids or malformed resulting cells. The requester validates the complete body and dependencies before publication.

<big><pre>
"[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/lane.py" assign &#92;
  '[**&lt;epic-body-file&gt;**](#epic-body-file "○")' &#92;
  --map '[**&lt;confirmed-map-file&gt;**](#confirmed-map "○")' &#92;
  --out '[**&lt;output-body-path&gt;**](#output-body "○")'
</pre></big>

### Validate Lane Unit

Report a unit's common lane or assignment findings and provide [Lane Result](#lane-result "●") to the requester.

- Results meet [Unit Consistency](#unit-consistency).

<big><pre>
"[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/lane.py" check &#92;
  '[**&lt;epic-body-file&gt;**](#epic-body-file "○")' &#92;
  --unit '[**&lt;task-ids&gt;**](#unit-task-ids "○")'
</pre></big>

### Evaluate Lane Admission

Report whether the request admits a valid unit and provide [Lane Result](#lane-result "●") to the requester.

Omit the lane option when the request supplies none.

- Results meet [Admission](#admission).

<big><pre>
"[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/lane.py" admit &#92;
  '[**&lt;epic-body-file&gt;**](#epic-body-file "○")' &#92;
  --unit '[**&lt;task-ids&gt;**](#unit-task-ids "○")' &#92;
  --lane '[**&lt;lane-index&gt;**](#requested-index "○")'
</pre></big>

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
