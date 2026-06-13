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

## Protocol

### 1. Prereq Scan

- Dispatch [prereq](../resources/prereq.md) over `{target_content}` to a fresh worker, writing `{smart_result.prereq_path}` into `{output_path}`
- Extract atomic questions from output for knowledge fill

### 2. Knowledge Fill

- If questions were extracted, attempt to fill via available knowledge sources
- Construct `<verified_knowledge>` context block with answered questions

### 3. Select Mode

- Branch on `{target_type}`: when it is 'code', attempt AST-based subsystem decomposition (per the subsystem-analysis Decompose protocol)
- If >1 subsystem found: use subsystem mode (different prisms per region)
- If 1 subsystem, or `{target_type}` is 'general': use [L12](../resources/l12.md) single pass (or 3-pass for general)

### 4. Execute Analysis

- Run the selected analysis mode with enriched content (verified facts injected); subsystem mode assigns different prisms per region, e.g. [claim](../resources/claim.md) and [identity](../resources/identity.md)
- Capture output for dispute decision

### 5. Dispute Correction

- Check analysis output quality: look for conservation law presence and output length
- If adequate output (>200 chars): run [dispute-synthesis](../resources/dispute-synthesis.md) for self-correction
- If analysis found a conservation law, dispute is supplementary; if not, dispute is critical
- Assemble `{smart_result}` from the artifacts written to `{output_path}` and the ordered pipeline trace

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
