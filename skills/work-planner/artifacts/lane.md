# Lane

A board-wide delivery lane, its task assignments and the units a request admits.

## Commands

### Read Lane Assignments

Read raw task-table Lane cells through the Lane module and provide [Assignment Read Result](#assignment-read-result "●") to the requester.

<big><pre>
"[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/lane.py" read '[**&lt;epic-body-file&gt;**](#epic-body-file "○")'
</pre></big>

- Read each task's bare [Index](#index) from its Lane cell, independently of work-item links. An empty cell is unlaned. Malformed cells produce findings and no assignment; a missing Lane column produces an empty assignment map.
- JSON result commands exit 1 when `problems` is nonempty and 0 otherwise. Argument or input failures can exit before providing a JSON result.

### Write Lane Assignments

Write confirmed assignments while preserving other body content and provide [Output Body](#output-body "●") to the requester. Refuse unknown task ids or malformed resulting cells. The requester validates the complete body and dependencies before publication.

<big><pre>
"[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/lane.py" assign &#92;
  '[**&lt;epic-body-file&gt;**](#epic-body-file "○")' &#92;
  --map '[**&lt;confirmed-map-file&gt;**](#confirmed-map "○")' &#92;
  --out '[**&lt;output-body-path&gt;**](#output-body "○")'
</pre></big>

### Validate Lane Unit

Report a unit's common lane or assignment findings and provide [Unit Lane Result](#unit-lane-result "●") to the requester.

<big><pre>
"[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/lane.py" check &#92;
  '[**&lt;epic-body-file&gt;**](#epic-body-file "○")' &#92;
  --unit '[**&lt;task-ids&gt;**](#unit-task-ids "○")'
</pre></big>

- Validate the complete selected unit under [Unit Consistency](#unit-consistency). Findings from other rows remain in the result.
- Use the result and exit behavior of [Read Lane Assignments](#read-lane-assignments "ƒ"); `lane: null` alone does not establish a valid unlaned unit.

### Evaluate Lane Admission

Report whether the request admits a valid unit and provide [Admission Result](#admission-result "●") to the requester.

Omit the lane option when the request supplies none.

<big><pre>
"[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/lane.py" admit &#92;
  '[**&lt;epic-body-file&gt;**](#epic-body-file "○")' &#92;
  --unit '[**&lt;task-ids&gt;**](#unit-task-ids "○")' &#92;
  --lane '[**&lt;lane-index&gt;**](#requested-index "○")'
</pre></big>

- Apply [Admission](#admission) to the selected unit. Findings from other rows remain visible.
- Use the result and exit behavior of [Read Lane Assignments](#read-lane-assignments "ƒ"). An admitted unit can coexist with an unrelated row finding, so inspect both `admitted` and `problems`.

## Fields

### Index

An index is an opaque board-wide decimal string. Its spelling is significant: `02` and `2` are distinct indices, and `0` is valid. The same index identifies one lane across the theme board.

### Assignments

A map keyed by task id whose values are [Index](#index) strings or `null` for unlaned rows. Invalid cells and a missing Lane column contribute no assignment. eg `{"W01":"02","W02":null}`

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

### Assignment Read Result

One JSON object with `assignments`, the complete body-wide [Assignments](#assignments) map, and `problems`, an array of finding strings. An empty array means no findings. eg `{"assignments":{"W01":"02","W02":null},"problems":[]}`

### Unit Lane Result

One JSON object containing the members of [Assignment Read Result](#assignment-read-result), plus `lane`, the selected unit's common [Index](#index) or `null`. Null represents an unlaned unit or an invalid or undetermined unit; `problems` distinguishes them. eg `{"assignments":{"W01":"02","W02":null},"problems":[],"lane":"02"}`

### Admission Result

One JSON object containing the members of [Unit Lane Result](#unit-lane-result), plus `admitted`, a boolean indicating whether the selected unit is valid and the request admits it. The shared members remain at the top level. Findings can concern rows outside the selected unit. eg `{"assignments":{"W01":"02","W02":null},"problems":[],"lane":"02","admitted":true}`

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.

## Guidance

### Unit Consistency

Every member of a unit carries the same index, or every member is unlaned. Missing assignments and differing values are findings. A differing assignment requires changing the row lanes or unjoining the rows.

### Admission

A request naming an index admits free units with that index and unlaned units. A request naming none admits only unlaned units. Malformed or inconsistent assignments admit no unit. Availability and priority are supplied by the caller; lane admission applies to free units and leaves other findings visible. A unit without task rows is unlaned.
