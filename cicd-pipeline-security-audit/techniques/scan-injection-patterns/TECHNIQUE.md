---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Apply all seven CI/CD injection detection patterns (P1-P7) — derived from the hackerbot-claw campaign and GitHub's script injection documentation, each identifying a specific source-to-sink vulnerability class — to GitHub Actions workflow files, tracing data flow from attacker-controlled input (source) to privileged execution (sink) and documenting the complete chain. The operations in this set decompose that scan into pattern-catalog loading, the seven per-pattern detection passes, and structured-result assembly.

## Inputs

### submodule

Directory name of the submodule being scanned.

### scanner_number

The 1-based scanner agent ordinal (the numeric part of the `S1`-`Sn` designator).

### workflow_files

List of workflow file paths to scan

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with pre-classified trigger, permission, and checkout data.

### ai_config_inventory

*(optional)* AI configuration files found in the submodule

## Outputs

### scan_results

Structured findings for this submodule, conforming to the [scanner output schema](../../resources/sub-agent-output-schema.md#schema).

#### artifact

`s{scanner_number}-{submodule}.json`

#### findings

Each with pattern_id, source, sink, severity_hint, file, lines, evidence

#### observations

Items without clear source-to-sink flow

#### coverage

Per-file, per-pattern scan confirmation

## Rules

### all-seven-patterns-applied

All seven detection patterns (P1-P7) are applied to every workflow file in scope; no pattern is skipped for any file.

### source-sink-required

Every finding identifies both the source (attacker-controlled input) and the sink (privileged execution point), with the affected file path and line range.

### evidence-required

Every finding includes the vulnerable code snippet as evidence.

### chain-tracing

For P2 and P5, trace the complete chain from trigger through checkout to execution.
