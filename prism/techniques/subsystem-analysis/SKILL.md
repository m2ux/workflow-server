---
name: subsystem-analysis
description: Decompose code into subsystems, analyze each with an assigned prism, then synthesize cross-boundary findings.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 8
  legacy_id: 8
---

# Subsystem Analysis

## Capability

Decompose source code into subsystems, assign different prisms per region via calibration, and synthesize cross-boundary findings

## Inputs

### target-content

Code to analyze

### target-type

Must be 'code' — subsystem mode is code-only

### output-path

Directory for subsystem-{name}.md and subsystem-synthesis.md

## Protocol

### 1. Decompose

- Parse source code via AST (Python) or regex heuristic (other languages)
- Identify classes, functions, top-level blocks as subsystems
- Min 10 lines per subsystem; merge smallest pairs to stay under 8 subsystems
- If only 1 subsystem found, fall back to single L12 pass
- If AST parsing fails and regex finds no definitions, chunk into ~100-line blocks

### 2. Calibrate

- Load subsystem calibration resource (63)
- Send prism catalog + subsystem summaries to calibration worker
- Parse JSON assignments — fallback to L12 for unassigned subsystems
- Prism assignments MUST maximize diversity — the calibration prompt enforces this

### 3. Execute

- For each subsystem, dispatch a FRESH worker with its assigned prism
- Include context header with subsystem name, line range, and list of other subsystem names
- Workers write to {output-path}/subsystem-{name}.md
- Each per-subsystem worker receives a context header noting its position in the file and the names of adjacent subsystems

### 4. Synthesize

- Load subsystem synthesis resource (64)
- Dispatch synthesis worker with all per-subsystem outputs
- Worker writes to {output-path}/subsystem-synthesis.md

## Outputs

### subsystem-result

Paths to per-subsystem artifacts, synthesis artifact, and prism assignments

- **subsystem_paths**: Array of filesystem paths to subsystem-{name}.md files
- **synthesis_path**: Filesystem path to subsystem-synthesis.md
- **assignments**: Map of subsystem name (or id) to assigned prism resource index or lens id

## Rules

### code-only

Subsystem mode requires code input. Reject general targets with guidance to use portfolio mode instead.

## Resources

- [subsystem-calibration](../../resources/subsystem-calibration/SKILL.md)
