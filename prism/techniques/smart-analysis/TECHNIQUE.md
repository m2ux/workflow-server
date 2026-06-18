---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 11
  legacy_id: 11
---

## Capability

Automatically compose an analysis pipeline based on input characteristics — the only mode where the system decides the pipeline topology

## Outputs

### smart_result

Paths and pipeline trace for the smart adaptive run

#### artifact

`smart-prereq.md` (prereq scan) / the selected analysis mode's artifact — `smart-analysis.md` for structural, or the subsystem mode's per-subsystem artifact / the dispute-correction artifact (when run)

#### prereq_path

Filesystem path to the prereq-scan artifact

#### analysis_paths

Filesystem paths to the selected analysis mode's artifacts

#### dispute_paths

Filesystem paths to the dispute-correction artifacts (empty if dispute skipped)

#### pipeline_steps

Array of step names executed in order

## Rules

### auto-composition

Smart is the only mode that composes its pipeline automatically. Do not ask the user which sub-mode to use — decide based on input.

### conditional-steps

Each step after the prerequisite scan is conditional. Knowledge fill requires extracted questions. Subsystem decomposition requires multi-class code. Dispute requires sufficient analysis output.

### knowledge-fill-best-effort

Knowledge gap fill is best-effort: when no knowledge source can answer the extracted questions, analysis proceeds without verified facts rather than blocking.
