---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 5
  legacy_id: 5
---

## Capability

Execute the behavioral pipeline — 4 independent behavioral lenses followed by a synthesis pass

## Inputs

### lens_name

Which behavioral lens to apply: `error-resilience`, `optimize`, `evolution`, `api-surface`, or `synthesis`. The first four are the independent lenses; `synthesis` reconciles their outputs.

### prior_artifact_paths

*(optional)* For synthesis pass only: map of role labels to artifact file paths. Keys: ERRORS, COSTS, CHANGES, PROMISES. Empty for independent lens passes.

## Protocol

### 1. Load Lens

- Load the lens prompt for `{lens_name}`: `error-resilience` → [error-resilience](../resources/error-resilience.md), `optimize` → [optimize](../resources/optimize.md), `evolution` → [evolution](../resources/evolution.md), `api-surface` → [api-surface](../resources/api-surface.md), `synthesis` → [behavioral-synthesis](../resources/behavioral-synthesis.md). If the lens cannot be loaded, report the error; the valid behavioral lenses are `error-resilience`, `optimize`, `evolution`, `api-surface`, and `synthesis`.
- The behavioral pipeline is code-only: if `{target_type}` is `general`, report that the behavioral pipeline is code-only and recommend portfolio mode with individual neutral variant lenses for general targets.
- The lens prompt is the program — execute its operations in order

### 2. Read Target

- If `{target_content}` is a file path, read the file to obtain the code

### 3. Apply Independent Lens

- For the independent lens passes (`error-resilience`, `optimize`, `evolution`, `api-surface`): apply the lens against the target content
- Execute every operation completely — the analytical depth comes from the full chain
- Write `{behavioral_artifact}` into `{output_path}` under its declared `#### artifact` name for `{lens_name}`

### 4. Augment With Graph

- After lens execution for the independent passes (`error-resilience`, `optimize`, `evolution`, `api-surface`), check GitNexus availability via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md). If unavailable, skip graph augmentation.
- Error-resilience: Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) on error-returning functions identified by the lens to check whether all callers handle the error. Append a 'Graph Evidence: Error Propagation' section with measured error-handling completeness per function.
- Evolution: Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)`(direction: 'upstream')` on coupling points identified by the lens to measure blast radius quantitatively. Append a 'Graph Evidence: Coupling Measurement' section with measured affected-symbol and affected-process counts.
- API-surface: Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../meta/techniques/gitnexus-operations/cypher.md) to enumerate exported/public symbols with caller counts (`MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(fn) RETURN fn.name, fn.filePath, count(caller) ORDER BY count(caller) DESC`). Append a 'Graph Evidence: Measured API Surface' section with the actual public surface from the graph.
- Optimize: No graph augmentation — optimization analysis concerns algorithmic complexity, not graph structure.
- GitNexus data is appended as a 'Graph Evidence' section at the end of each behavioral artifact. The lens output stands alone; graph data provides supplementary measurement that the synthesis pass can reference.

### 5. Construct Synthesis Input

- When `{lens_name}` is `synthesis`, read all 4 prior artifacts from `{prior_artifact_paths}`, capturing their contents as `{$errors_content}`, `{$costs_content}`, `{$changes_content}`, and `{$promises_content}`.  
  > If a provided prior artifact path does not exist, report the missing artifact.
- Construct `{$synthesis_input}` by concatenating each artifact under its role heading separated by horizontal rules: ``## ERRORS\n\n`{errors_content}`\n\n---\n\n## COSTS\n\n`{costs_content}`\n\n---\n\n## CHANGES\n\n`{changes_content}`\n\n---\n\n## PROMISES\n\n`{promises_content}` ``

### 6. Apply Synthesis Lens

- When `{lens_name}` is `synthesis`, apply the [behavioral-synthesis](../resources/behavioral-synthesis.md) lens against `{synthesis_input}`

### 7. Write Artifact

- Write the complete analysis as `{behavioral_artifact}` into `{output_path}`. If the write fails, verify `{output_path}` exists and is writable.

## Outputs

### behavioral_artifact

Behavioral analysis artifact written to the filesystem

#### artifact

`behavioral-errors.md` (`error-resilience`) / `behavioral-costs.md` (`optimize`) / `behavioral-changes.md` (`evolution`) / `behavioral-promises.md` (`api-surface`) / `behavioral-synthesis.md` (`synthesis`)

#### artifact_path

Full filesystem path to the written artifact

#### role_label

The role label for this pass (ERRORS, COSTS, CHANGES, PROMISES, or SYNTHESIS)

## Rules

### label-mapping

The behavioral pipeline uses fixed role labels mapped to specific lenses: `error-resilience` → ERRORS, `optimize` → COSTS, `evolution` → CHANGES, `api-surface` → PROMISES. The `synthesis` lens expects these exact labels.

### code-only

The behavioral pipeline is code-only. `optimize` uses strongly code-oriented vocabulary with no domain-neutral variant. Do not use the behavioral pipeline when `{target_type}` is `general`.

### independent-lenses-parallel

The four independent behavioral lenses (`error-resilience`, `optimize`, `evolution`, `api-surface`) share no context and may be dispatched concurrently, up to four at once. Only the `synthesis` lens depends on their outputs.

