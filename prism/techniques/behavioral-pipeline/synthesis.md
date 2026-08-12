---
metadata:
  version: 1.1.0
---

## Capability

Reconcile the four independent behavioral analyses into one behavioral reading of the target

## Inputs

### prior_artifact_paths

Map of role label to artifact file path for the four independent passes. Keys: ERRORS, COSTS, CHANGES, PROMISES.

## Outputs

### behavioral_synthesis

The reconciled behavioral reading across failure, cost, change, and promise.

#### artifact

`behavioral-synthesis.md`

#### audience

`human`

## Protocol

### 1. Load Lens

- Load the [behavioral-synthesis](../../resources/behavioral-synthesis.md) lens prompt
- If the lens cannot be loaded, report the error.
- The lens prompt is the program — execute its operations in order

### 2. Construct Synthesis Input

- Read all 4 prior artifacts from `{prior_artifact_paths}`, capturing their contents as `{$errors_content}`, `{$costs_content}`, `{$changes_content}`, and `{$promises_content}`.
  > If a provided prior artifact path does not exist, report the missing artifact.
- Construct `{$synthesis_input}` by concatenating each artifact under its role heading separated by horizontal rules: ``## ERRORS\n\n`{errors_content}`\n\n---\n\n## COSTS\n\n`{costs_content}`\n\n---\n\n## CHANGES\n\n`{changes_content}`\n\n---\n\n## PROMISES\n\n`{promises_content}` ``

### 3. Apply Synthesis Lens

- Apply the lens against `{synthesis_input}`
- Execute every operation completely — the analytical depth comes from the full chain

### 4. Write Artifact

- Write the complete analysis as `{behavioral_synthesis}` into `{output_path}`. If the write fails, verify `{output_path}` exists and is writable.
