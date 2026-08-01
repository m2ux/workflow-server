---
metadata:
  version: 1.1.0
---

## Capability

Run the four independent behavioral lenses over the target, each augmented with graph evidence where the graph can measure its claims. Atomic lens work: load prompts, run lens operations, augment, write artifacts.

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

- Run each of the four lenses against the target content as independent lens work units. The four lenses share no context; only a later synthesis pass depends on their outputs. When bound once per lens unit, execute the lens body for that unit; when bound once over all four, execute each lens body in turn and emit the four analysis products.
- Execute every operation completely — the analytical depth comes from the full chain

### 4. Augment With Graph

- After lens execution, when a symbol/call graph index for the target is available, append measured graph evidence; when it is not, skip this phase.
- `{error_resilience_analysis}`: On error-returning functions the lens identified, measure caller error-handling completeness from the graph. Append a 'Graph Evidence: Error Propagation' section per function.
- `{evolution_analysis}`: On coupling points the lens identified, measure upstream blast radius (affected symbols and processes). Append a 'Graph Evidence: Coupling Measurement' section.
- `{api_surface_analysis}`: Enumerate exported/public symbols with caller counts from the graph. Append a 'Graph Evidence: Measured API Surface' section.
- `{cost_analysis}`: No graph augmentation — optimization analysis concerns algorithmic complexity, not graph structure.
- Graph data is a 'Graph Evidence' section at the end of each behavioral artifact. The lens output stands alone; graph data is supplementary measurement for later synthesis.

### 5. Write Artifacts

- Write each lens's analysis into `{output_path}` as its declared artifact. If a write fails, verify `{output_path}` exists and is writable.

## Rules

### independent-lenses-atomic

Atomic lens work: load prompts, run lens operations, augment, write artifacts. Does not scatter agent instances, wait-all, gather, or Protocol-Apply techniques.
