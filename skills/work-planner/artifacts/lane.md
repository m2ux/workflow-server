# Lane

A board-wide delivery lane, its task assignments and the units a request admits.

## Operations

### Read Task Lanes

Lane assignments and malformed-cell findings from supplied task tables.

**Inputs:** Epic body file.

- Run [Read Lane Assignments](#read-lane-assignments) with the body file and return its row-to-index map and findings, meeting [Assignments](#assignments).

### Assign Task Lanes

A task table with confirmed lane assignments.

**Inputs:** Epic body file, confirmed task-to-index map and output body path.

1. Run [Write Lane Assignments](#write-lane-assignments) with the body, confirmed map and output path.
   - Refuse unknown task ids or malformed resulting cells.
2. Return the output body for the caller's full body and dependency validation.

### Check Unit Lanes

The common lane of a supplied work unit, or its assignment findings.

**Inputs:** Epic body file and complete unit task ids.

- Run [Validate Lane Unit](#validate-lane-unit) with the body and unit ids and return the common index or findings, meeting [Unit Consistency](#unit-consistency).

### Determine Lane Admission

The lane decision for one free unit and current request.

**Inputs:** Epic body file, complete unit task ids and optional requested lane index.

- Run [Evaluate Lane Admission](#evaluate-lane-admission) with the body, unit ids and requested index and return its admitted flag and findings, meeting [Admission](#admission).

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

## Commands

### Read Lane Assignments

Reads raw task-table Lane cells through the Lane module.

**Inputs:** Epic body file.

```bash
"<workspace>/scripts/sbx" python3 "<workspace>/skills/work-planner/scripts/lane.py" read '<epic-body-file>'
```

### Write Lane Assignments

Writes confirmed assignments while preserving other body content.

**Inputs:** Epic body file, confirmed task-to-index JSON map and output body path.

- The map is a JSON object keyed by task id; values are decimal strings or `null` for unlaned rows.

```bash
"<workspace>/scripts/sbx" python3 "<workspace>/skills/work-planner/scripts/lane.py" assign '<epic-body-file>' --map '<confirmed-map-file>' --out '<output-body-path>'
```

### Validate Lane Unit

Reports a unit's common lane or assignment findings.

**Inputs:** Epic body file and complete unit task ids.

- Unit ids form a comma-separated list.

```bash
"<workspace>/scripts/sbx" python3 "<workspace>/skills/work-planner/scripts/lane.py" check '<epic-body-file>' --unit '<task-ids>'
```

### Evaluate Lane Admission

Reports whether the request admits a valid unit.

**Inputs:** Epic body file, complete unit task ids and optional requested lane index.

- Unit ids form a comma-separated list; omit the lane option when the request supplies none.

```bash
"<workspace>/scripts/sbx" python3 "<workspace>/skills/work-planner/scripts/lane.py" admit '<epic-body-file>' --unit '<task-ids>' --lane '<lane-index>'
```
