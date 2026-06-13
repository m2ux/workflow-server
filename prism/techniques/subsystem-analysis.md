---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 8
  legacy_id: 8
---

## Capability

Decompose source code into subsystems, assign different prisms per region via calibration, and synthesize cross-boundary findings

## Protocol

### 1. Decompose

- Parse `{target_content}` via AST (Python) or regex heuristic (other languages), capturing the `{$source_filename}` and the identified subsystems — each with its `{$subsystem_name}`, `{$start_line}`, `{$end_line}`, and the `{$other_subsystem_names}` of its peers
- Identify classes, functions, top-level blocks as subsystems
- Min 10 lines per subsystem; merge smallest pairs to stay under 8 subsystems
- If only 1 subsystem found, fall back to single [L12](../resources/l12.md) pass
- If AST parsing fails and regex finds no definitions, chunk into ~100-line blocks

### 2. Calibrate

- Load subsystem calibration resource (63) ([subsystem-calibration](../resources/subsystem-calibration.md))
- Send prism catalog + subsystem summaries to calibration worker
- Parse JSON assignments — fallback to L12 for unassigned subsystems
- Prism assignments MUST maximize diversity — the calibration prompt enforces this

### 3. Execute

- For each subsystem, dispatch a fresh worker with its assigned prism, prefixing the subsystem content with a context header that names the region and its neighbours: ``# SUBSYSTEM: {subsystem_name} (lines {start_line}-{end_line} of {source_filename})`` then ``# OTHER SUBSYSTEMS: {other_subsystem_names}``
- Each worker writes one `{subsystem_result.subsystem_paths}` entry into `{output_path}`

### 4. Synthesize

- Load [subsystem synthesis](../resources/subsystem-synthesis.md) resource (64)
- Dispatch synthesis worker with all per-subsystem outputs
- Worker writes `{subsystem_result.synthesis_path}` into `{output_path}`
- Return `{subsystem_result}`: the per-subsystem paths, the synthesis path, and the prism assignments from calibration

## Outputs

### subsystem_result

Paths to per-subsystem artifacts, synthesis artifact, and prism assignments

#### artifact

`subsystem-{subsystem_name}.md` (one per structural subsystem) / `subsystem-synthesis.md` (cross-subsystem synthesis)

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
