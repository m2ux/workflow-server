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

- Dispatch [prereq](../resources/prereq.md) over `{target_content}` to a fresh worker, writing `smart-prereq.md` into `{output_path}`
- Extract atomic questions from output for knowledge fill

### 2. Knowledge Fill

- If questions were extracted, attempt to fill via available knowledge sources
- Construct `<verified_knowledge>` context block with answered questions

### 3. Select Mode

- Branch on `{target_type}`: when it is 'code', attempt AST decomposition via `_split_into_subsystems` logic
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

#### prereq_path

Filesystem path to `smart-prereq.md`

#### analysis_paths

Array of paths to `smart-analysis.md` and/or `subsystem-*.md` as produced

#### dispute_paths

Array of paths to `smart-dispute-*.md` (empty if dispute skipped)

#### pipeline_steps

Array of step names executed in order

## Rules

### auto-composition

Smart is the only mode that composes its pipeline automatically. Do not ask the user which sub-mode to use — decide based on input.

### conditional-steps

Each step after prereq is conditional. Knowledge fill requires extracted questions. Subsystem requires multi-class code. Dispute requires sufficient analysis output.

### model-selection

Each sub-step uses the optimal model for its prism. Prereq uses sonnet. Analysis uses the selected prism's optimal model. Dispute synthesis uses sonnet.

### tool-usage

use harness-compat spawn-agent — smart mode never uses continue-agent and each sub-step uses a new worker; use read_file — orchestrator reads artifacts to decide conditionals and inject `verified_knowledge`
