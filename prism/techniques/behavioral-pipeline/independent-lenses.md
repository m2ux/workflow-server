---
metadata:
  version: 1.1.0
---

## Capability

Run the four independent behavioral lenses over the target, each augmented with graph evidence where the graph can measure its claims. Atomic lens work: load prompts, run lens operations, augment, write artifacts. Agent/lens parallel dispatch prefers activity coordination (pattern activities; scatter-gather parallel mode and [spawn-concurrent](../../../meta/techniques/harness-compat/spawn-concurrent.md) as capability leaves the activity binds).

## Outputs

### error_resilience_analysis

How the code behaves when things fail: error paths, propagation, and handling completeness. Role label ERRORS.

#### artifact

`behavioral-errors.md`

### cost_analysis

Where the code spends: algorithmic complexity and optimization opportunities. Role label COSTS.

#### artifact

`behavioral-costs.md`

### evolution_analysis

How the code absorbs change: coupling points and their blast radius. Role label CHANGES.

#### artifact

`behavioral-changes.md`

### api_surface_analysis

What the code promises outward: the public surface and its callers. Role label PROMISES.

#### artifact

`behavioral-promises.md`

## Protocol

### 1. Load Lenses

- Load each lens prompt: `error-resilience` → [error-resilience](../../resources/error-resilience.md), `optimize` → [optimize](../../resources/optimize.md), `evolution` → [evolution](../../resources/evolution.md), `api-surface` → [api-surface](../../resources/api-surface.md)
- If a lens cannot be loaded, report the error.
- When `{target_type}` is `general`, report that the behavioral pipeline is code-only and recommend portfolio mode with individual neutral variant lenses for general targets.
- The lens prompt is the program — execute its operations in order

### 2. Read Target

- If `{target_content}` is a file path, read the file to obtain the code

### 3. Apply Independent Lenses

- Run each of the four lenses against the target content as independent lens work units. The four lenses share no context; only a later synthesis pass depends on their outputs. When this op is bound once per lens unit (after scatter under activity-owned agent fan-out), execute the lens body for that unit; when bound once over all four, execute each lens body in turn and emit the four analysis products.
- Execute every operation completely — the analytical depth comes from the full chain

### 4. Augment With Graph

- After lens execution, check GitNexus availability via [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../../meta/techniques/gitnexus-operations/verify-index.md). If unavailable, skip graph augmentation.
- `{error_resilience_analysis}`: Use [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) on error-returning functions identified by the lens to check whether all callers handle the error. Append a 'Graph Evidence: Error Propagation' section with measured error-handling completeness per function.
- `{evolution_analysis}`: Use [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../../meta/techniques/gitnexus-operations/impact.md)`(direction: 'upstream')` on coupling points identified by the lens to measure blast radius quantitatively. Append a 'Graph Evidence: Coupling Measurement' section with measured affected-symbol and affected-process counts.
- `{api_surface_analysis}`: Use [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../../meta/techniques/gitnexus-operations/cypher.md) to enumerate exported/public symbols with caller counts (`MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(fn) RETURN fn.name, fn.filePath, count(caller) ORDER BY count(caller) DESC`). Append a 'Graph Evidence: Measured API Surface' section with the actual public surface from the graph.
- `{cost_analysis}`: No graph augmentation — optimization analysis concerns algorithmic complexity, not graph structure.
- GitNexus data is appended as a 'Graph Evidence' section at the end of each behavioral artifact. The lens output stands alone; graph data provides supplementary measurement that the synthesis pass can reference.

### 5. Write Artifacts

- Write each lens's analysis into `{output_path}` as its declared artifact. If a write fails, verify `{output_path}` exists and is writable.

## Rules

### independent-lenses-atomic

This technique is atomic lens work: load prompts, run lens operations, augment, write artifacts. It does not scatter agent instances, wait-all, or gather — those verbs prefer activity coordination (pattern activities under [`meta/activities/patterns/`](../../../meta/activities/patterns/README.md); agent capability leaves include [scatter-gather](../../../meta/techniques/scatter-gather.md) parallel mode and [spawn-concurrent](../../../meta/techniques/harness-compat/spawn-concurrent.md)). Protocol does not Apply multi-op fan-out façades ([pass-orchestration-in-technique](../../../workflow-design/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique); [Prefer Parallel Independent Work via Formal Fan-Out](../../../workflow-design/resources/design-principles.md#34-prefer-parallel-independent-work-via-formal-fan-out)).
