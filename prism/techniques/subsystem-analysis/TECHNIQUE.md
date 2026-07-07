---
metadata:
  version: 1.1.0
---

## Capability

Decompose source code into subsystems, assign different prisms per region via calibration, and synthesize cross-boundary findings

## Inputs

### code_subsystem

One decomposed structural subsystem of the source, carrying its identity, line range, source file, and the names of its peer subsystems. Shared across the decompose, calibrate, and execute operations.

#### subsystem_name

The subsystem's identifier (class, function, or block name)

#### start_line

First line of the subsystem in the source file

#### end_line

Last line of the subsystem in the source file

#### source_filename

Name of the source file the subsystem was decomposed from

#### other_subsystem_names

Names of the peer subsystems adjacent to this one

## Outputs

### code_subsystem

The set of decomposed structural subsystems, each carrying its identity, line range, source file, and peer names (see the matching input declaration for the per-subsystem fields).

### subsystem_result

Paths to per-subsystem artifacts, synthesis artifact, and prism assignments

#### artifact

`subsystem-{code_subsystem.subsystem_name}.md` (one per structural subsystem) / `subsystem-synthesis.md` (cross-subsystem synthesis)

#### subsystem_paths

Filesystem paths to the per-subsystem artifacts

#### synthesis_path

Filesystem path to the cross-subsystem synthesis artifact

#### assignments

Map of subsystem name (or id) to assigned prism resource index or lens id

## Rules

### code-only

Subsystem mode requires code input. Reject general targets with guidance to use portfolio mode instead.

### diversity-maximized

Prism assignment maximizes diversity — the same prism is not assigned to multiple subsystems unless they are structurally identical.

### subsystem-context-header

Each per-subsystem worker receives a context header naming its region and the names of its neighbours, so the prism is aware of adjacent regions.
