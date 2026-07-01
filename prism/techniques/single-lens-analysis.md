---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
---

## Capability

Apply one named lens to a target in a single isolated pass and write its output artifact. This is the general single-lens path for any lens the plan selects that is not L12 — the concern-specific SDL lenses (deep-scan, sdl-trust, reachability, state-audit, identity, …), the behavioral singles (error-resilience, optimize, evolution, api-surface), the epistemic lenses (l12g, oracle, knowledge-*), and the generative lenses (architect, codegen, genesis, counterfactual, history, arc-code, writer, strategist). L12 itself is handled by [structural-analysis](./structural-analysis.md); two or more complementary lenses are handled by [portfolio-analysis](./portfolio-analysis.md).

## Inputs

### lens_name

The lens resource to apply, named by its slug (e.g. `reachability`, `state-audit`, `deep-scan`, `oracle`, `architect`). The slug matches the resource filename without `.md`. This technique loads exactly one lens.

### analysis_focus

*(optional)* Optional focus area to guide the analysis (e.g. 'error handling', 'state management', 'concurrency'). Noted as a framing constraint; it does not narrow the lens — the lens operations are exhaustive.

## Protocol

### 1. Load Lens

- Load the lens named by `{lens_name}` from the prism workflow resources (e.g. `{lens_name}` = `reachability` → [reachability](../resources/reachability.md))
- The lens prompt is the program — it defines the exact sequence of analytical operations to execute
- If the named lens cannot be loaded, report the error and the fact that `{lens_name}` did not resolve to a known resource; do not silently fall back to a different lens

### 2. Read Target

- If `{target_content}` is a file path, read the file to obtain the code or text
- If no content was provided or the file cannot be found, request the file path or content from the caller before proceeding
- If an `{analysis_focus}` is provided, note it as a framing constraint but do not narrow the analysis — the lens operations are exhaustive

### 3. Gather Structural Context

- When the lens makes claims about impact, coupling, reachability, or dead code and the target codebase is indexed (check via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md)): use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md) and [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) on the target's entry points to obtain execution flows and caller/callee maps as supplementary evidence. If the codebase is not indexed, skip this step.
- Structural context is supplementary evidence, not a replacement for the lens operations. The lens chain executes completely regardless of whether graph data is available.

### 4. Execute Lens

- Apply every operation in the lens prompt sequentially against the target
- Execute completely — do not abbreviate or skip operations. The analytical depth comes from the full chain.

### 5. Write Artifact

- Write the complete output as `{lens_analysis}` into `{output_path}`. If the write fails, verify `{output_path}` exists and is writable.
- Include a YAML front-matter header with target, analysis date, and the lens applied (`{lens_name}`)

### 6. Format Output

- Structure `{lens_analysis}` with the section headers the lens's own operations produce — a lens defines its own output shape (a bug table, a trust map, a dead-code list, an alternative-architecture set, …). Do not force an L12 conservation-law structure onto a non-L12 lens.
- Include file paths, line numbers, and specific names for every finding, per `evidence-required`

## Outputs

### lens_analysis

The applied lens's complete output following its own operations

#### artifact

`{lens_name}-analysis.md`

#### findings

The lens's findings, in the structure the lens defines

## Rules

### lens-is-program

The lens resource is an imperative program. Execute its operations in order, producing the output each operation requests. The lens determines what kind of analysis is performed; this technique only loads it, feeds it the target, and persists its output.

### single-lens-scope

This technique applies exactly one lens. For the default structural pass (L12) use [structural-analysis](./structural-analysis.md); for two or more complementary lenses with cross-lens synthesis use [portfolio-analysis](./portfolio-analysis.md).
