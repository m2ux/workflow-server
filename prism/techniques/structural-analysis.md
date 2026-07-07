---
metadata:
  version: 1.1.0
---

## Capability

Apply L12 structural analysis lens to code for deep structural findings, conservation laws, and bug detection

## Inputs

### analysis_focus

*(optional)* Optional focus area to guide the analysis (e.g., 'error handling', 'state management', 'concurrency')

## Outputs

### structural_analysis

L12 structural analysis with conservation law, meta-law, and classified bug table

#### artifact

`structural-analysis.md`

#### conservation_law

The named conservation law between original and inverted impossibilities, carrying the producer/clearer ledger — the set-wide enumeration of every producer of each conserved resource against its clearers, with the matched/unmatched verdict per termination path

#### meta_law

What the conservation law itself conceals — the deeper finding

#### bug_table

Every concrete bug with location, severity, and fixable/structural classification — including each unmatched producer surfaced by the producer/clearer ledger

#### concealment_mechanism

How the code hides its real problems

#### structural_invariant

The property that persists through every improvement

## Protocol

### 1. Load Lens

- Load and apply [l12](../resources/l12.md) (the l12-structural lens) from the prism workflow
- The lens contains the full L12 prompt — a sequence of analytical operations the agent must execute step by step

### 2. Read Target

- If `{target_content}` is a file path, read the file to obtain the code
- If no code content was provided or the file cannot be found, request the file path or code content from the caller before proceeding
- If an `{analysis_focus}` is provided, note it as a framing constraint but do not narrow the analysis — the lens operations are exhaustive

### 3. Gather Structural Context

- Check GitNexus availability via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md). If the target codebase is not indexed, skip this step entirely and proceed to execute-lens.
- Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md) with queries derived from the target code's primary concerns (e.g., the module name, key function names, or `{analysis_focus}` if provided) to discover execution flows through the target — this identifies which call chains the code participates in and which are most relevant.
- Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) on the primary entry points and exported symbols of the target to obtain caller/callee maps — the lens can then make blast-radius claims backed by actual graph data rather than inference.
- Record the structural context (execution flows, caller counts, callee maps) as a preamble section that the lens operations can reference when making claims about impact, coupling, or dead code.
- If any GitNexus call fails, log the failure and continue without structural context — the lens operates independently.  
  > Structural context from GitNexus is supplementary evidence, not a replacement for the lens operations. The L12 chain executes completely regardless of whether graph data is available. Graph data strengthens blast-radius claims and call-chain evidence but does not alter the analytical method.

### 4. Execute Lens

- Apply every operation in the lens prompt sequentially against the code
- Start with the falsifiable claim about the code's deepest structural problem
- Follow the construction-based reasoning chain through improvements, invariants, inversions, and conservation laws
- Conclude with the concrete bug table — every bug, edge case, and silent failure discovered at any stage
- If the analysis stays at the surface without reaching the conservation law, re-execute from the structural invariant step — the depth comes from the inversion chain, not the initial claim

#### Producer/clearer ledger

The conservation law names a resource the code must conserve (a storage record, a queue entry, an allocation, a lock, a handle). Make the conservation concrete with a written ledger that enumerates, set-wide, every site that **produces** the resource against every site that **clears** it — not only the sites on the diff's path. For each resource the conservation law identifies:

- List every producer (each site that creates an instance of the resource) and every clearer (each site that ends an instance's lifecycle), across the whole reachable code set, using the structural context gathered in step 3 to find producers and clearers in unchanged upstream code.
- Match each producer to the clearer(s) that release what it creates, and trace **every** termination path — normal completion, early return, error, panic, and governance/teardown — to confirm a matching clear exists on each.
- A producer with no matching clearer on some reachable termination path is an **unmatched producer**: the resource accumulates without bound on that path. Record it as a Bug-Table entry (see step 6) so it reaches classification.
- The conservation law holds — "no new bug" — only when the invariant is satisfied on **every** producing path. A single unmatched path falsifies it.

### 5. Write Artifact

- Write the complete analysis as `{structural_analysis}` into `{output_path}`. If the write fails, verify `{output_path}` exists and is writable.
- Include a YAML front-matter header with target file, analysis date, and lens used (L12 structural)

### 6. Format Output

- Structure `{structural_analysis}` with clear section headers: Claim, Dialectic, Concealment Mechanism, Improvements, Structural Invariant, Conservation Law, Meta-Law, Bug Table
- Render the producer/clearer ledger as a table within the Conservation Law section — one row per resource with its producers, clearers, and the matched/unmatched verdict per termination path
- In the Bug Table, classify each finding as fixable or structural based on whether the conservation law predicts it can be resolved; every unmatched producer from the ledger appears as a Bug-Table entry
- Include file paths, line numbers, and specific function names for every finding

## Rules

### construction-over-description

Build improvements and observe what they reveal. Do not merely describe problems — construct alternatives and trace what becomes visible.

### meta-law-specificity

The meta-law must predict a concrete, testable consequence for this specific code. It must not generalize the conservation law to a broader category.
