---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 3
  legacy_id: 3
---

## Capability

Plan an analysis strategy by detecting scope, classifying targets, and producing an execution plan that maps each unit of work to a pipeline mode and lens selection

## Inputs

### target

What to analyze. Can be: a file path, a directory path, inline text, a question, a concept, or a topic. The technique detects the scope from the form of the input.

### analytical_goal

*(optional)* What the caller wants to understand (e.g., 'find hidden bugs', 'assess maintainability', 'understand design trade-offs', 'security review', 'explore the implications of X', 'evaluate this strategy')

### analysis_budget

*(optional)* Analysis budget: 'quick' (minimize passes, skip low-risk), 'standard' (balanced depth and coverage), 'thorough' (full coverage, full-prism on high-risk). Default: standard

#### default

standard

### depth_preference

*(optional)* Override for pipeline mode when scope is query or file: 'single', 'pipeline', 'portfolio', or 'behavioral'. Ignored for multi-unit scopes where mode is determined per-unit by risk classification.

## Protocol

### 1. Detect Scope

- Determine the scope from the `{target}` input
- If `{target}` is a file path pointing to a single file → scope 'file'
- If `{target}` is a directory path, check for project markers (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`) to distinguish 'codebase' from 'module'. A directory of non-code files → 'document-set'.
- If `{target}` is inline text, a question, a concept, a strategy, or any non-path input → scope 'query'. Set `{target_type}` to `general` unless the text is clearly source code.
- If `{target_type}` was not provided, infer it: code file extensions (`.ts`, `.rs`, `.py`, `.go`, `.java`, etc.) → `code`. Everything else → `general`.
- Proceed to the appropriate planning path based on scope
- A query, question, concept, or inline text input is always `general` `{target_type}` unless it is clearly source code.
- If you cannot tell whether the `{target}` is a file path, directory, or query text, check whether it exists on the filesystem: if it does, use the file/directory scope; if not, treat it as a query.

### 2. Query Recommendation

- For scope 'query': the target is text, not files. Select lenses from the general set (resources 00-02 + 06-10 + 15 + 18 + 24-26).
- Map the `{analytical_goal}` to lenses: exploring implications → claim (07) + rejected-paths (09). evaluating a strategy → scarcity (08) + claim (07). understanding trade-offs → scarcity (08) + rejected-paths (09). deep structural analysis → L12 pipeline (00-02). general exploration → L12 single (00). abstraction quality → sdl-abstraction (15). error resilience → error-resilience-neutral (24). API quality → api-surface-neutral (25). evolution/coupling/dependencies → evolution-neutral (26). pattern transfer → pedagogy (06). hidden assumptions → claim (07). [scarcity](../resources/scarcity.md) → scarcity (08). rejected alternatives → rejected-paths (09). decay/degradation → degradation (10). code archaeology → archaeology (33). change resilience → cultivation (35). temporal simulation → simulation (38). confabulation detection → knowledge-audit (40). knowledge gaps → knowledge-boundary (41). epistemic typing → knowledge-typed (42). self-correcting analysis → l12g (43). maximum-trust analysis → oracle (44). README rewriting → writer (45) + [writer-critique](../resources/writer-critique.md) + [writer-synthesis](../resources/writer-synthesis.md). analysis strategy → strategist (48). architecture exploration → architect (51). catalog blindspots → blindspot (52). counterfactual analysis → counterfactual (54). conservation law falsification → falsify (56). creative synthesis → genesis (57). knowledge prerequisites → prereq (59). significance evaluation → significance (60).
- Apply `{depth_preference}` if provided: 'single' → single best lens, 'pipeline' → full-prism, 'portfolio' → 2-3 complementary lenses, 'behavioral' → behavioral pipeline (19-23, code-only — reject if `{target_type}` is general)
- Format as a single-unit plan with scope 'query' and proceed to format-plan

### 3. Single Unit Recommendation

- For scope 'file' or 'module': map the `{analytical_goal}` to lenses using the goal-mapping matrix
- Goal-mapping matrix: bug detection → L12 (00) or deep-scan (12). code review → L12 (00) + contract (11). design review → claim (07) + rejected-paths (09). comprehension → pedagogy (06) + rejected-paths (09). pre-commit → L12 pipeline (00-02). planning review → L12 (00). maintainability → degradation (10) + contract (11). assumption validation → claim (07) + scarcity (08). security review → sdl-trust (13) + error-resilience (19). error handling → error-resilience (19). performance → optim (20). API quality → api-surface (22). evolution/coupling → evolution (21) or sdl-coupling (14). trust boundaries → sdl-trust (13). abstraction quality → sdl-abstraction (15). structural defects → deep-scan (12) or rec (16). identity/naming → ident (17). dead code → reachability (30). state machine → state-audit (32). contract fidelity → fidelity (31). error+cost hybrid → evidence-cost (29). comprehensive behavioral → behavioral pipeline (19-23). pattern transfer → pedagogy (06). hidden assumptions → claim (07). [scarcity](../resources/scarcity.md) → scarcity (08). rejected alternatives → rejected-paths (09). decay/degradation → degradation (10). interface contracts → contract (11). quick structural scan → 73w (18, Sonnet-only). quick error resilience → error-resilience-compact (27). ultra-brief error resilience → error-resilience-70w (28). architecture exploration → architect (51). catalog blindspots → blindspot (52). code generation → codegen (53). counterfactual analysis → counterfactual (54). interaction emergence → emergence (55). conservation law falsification → falsify (56). creative synthesis → genesis (57). decision history → history (58). knowledge prerequisites → prereq (59). significance evaluation → significance (60). claim verification → verify-claims (61).
- Apply `{depth_preference}` if provided: 'single' → single best lens, 'pipeline' → full-prism, 'portfolio' → 2-3 complementary lenses, 'behavioral' → behavioral pipeline (19-23, synthesized by [behavioral-synthesis](../resources/behavioral-synthesis.md); code-only — reject if `{target_type}` is general)
- Format as a single-unit plan and proceed to format-plan

### 4. Survey Structure

- For scope 'codebase' or 'document-set': list files and directories at the top level
- If the target directory contains no analyzable files, report the empty directory and check that the path is correct and contains source files or documents.
- Identify module boundaries from directory layout, build system (workspaces, packages), and naming conventions
- When the target codebase is indexed (check via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md)): use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md) to discover functional areas and community clusters — these are better module boundaries than directory layout alone. If the codebase is not indexed, fall back to directory-based module detection and role-based risk classification, and note in the plan that fan-in analysis was not available.
- Record per-module: path, file count, estimated lines, primary language or content type

### 5. Classify Units

- Categorise each module by role: api-surface, auth-security, state-persistence, business-logic, integration-external, utilities, configuration, types-definitions
- Assess risk based on role and content signals: auth/crypto/permissions/session → high. state/database/persistence → high. API surface/public interfaces → medium. business logic/domain rules → medium. utilities/helpers → low. config/constants/types → low.
- If the scope is codebase but no analytical goal was provided, risk cannot be classified meaningfully — ask the caller for an analytical goal. Without one, default to 'bug detection', which maps all modules to L12.
- When the target codebase is indexed: use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) to check how many callers each module has — high fan-in modules are higher risk regardless of role
- If the analytical goal targets a specific concern (e.g., 'security'), elevate all modules touching that concern to high risk
- Record per-module: role, risk (high/medium/low), classification rationale

### 6. Select Strategy Per Unit

- Map risk to pipeline mode based on `{analysis_budget}`
- Budget 'quick': high → single L12, medium → single L12, low → skip
- Budget 'standard': high → full-prism, medium → single L12, low → portfolio (2 lenses matched to role)
- Budget 'thorough': high → full-prism, medium → full-prism, low → single L12

### 7. Select Lenses Per Unit

- For units assigned single mode: select the single best lens from the goal-mapping matrix matched to the module's role
- For units assigned portfolio mode: select 2 complementary lenses matched to role. api-surface → contract (11) + api-surface (22). auth-security → sdl-trust (13) + error-resilience (19). business-logic → scarcity (08) + rejected-paths (09). state-persistence → state-audit (32) + degradation (10). utilities → degradation (10) + claim (07). integration → contract (11) + sdl-coupling (14). architecture → deep-scan (12) + sdl-abstraction (15).
- For units assigned full-prism: no lens selection needed — the pipeline uses the L12 set (00-02) for all target types — structural (00), adversarial ([l12-complement-adversarial](../resources/l12-complement-adversarial.md)), synthesis ([l12-synthesis](../resources/l12-synthesis.md))

### 8. Plan Execution

- Order units by risk: high first, then medium, then low
- Within the same risk tier, order by dependency — modules depended on by others are analyzed first (their findings inform downstream analysis)
- Identify parallelism opportunities: independent modules at the same risk level can run concurrently (up to 4)
- Calculate cost estimate: 1 dispatch per single pass, 3 per full-prism, N per portfolio (N = number of selected lenses)

### 9. Build Analysis Units

- Build the `{analysis_units}` array — an ordered list of unit objects that the workflow iterates over
- Each unit object has: `target` (file path or content string), `target_type` (`code`|`general`), `pipeline_mode` (`single`|`full-prism`|`portfolio`|`behavioral`), `lenses` (array of resource indices for portfolio, empty for single/full-prism/behavioral), `role` (module role or `query`), `risk` (`high`|`medium`|`low`), `rationale` (why this mode was selected)
- For query and file scopes: produce a single-element array
- For module scope: produce a single-element array with the module path as target
- For codebase and document-set scopes: produce one element per module, ordered by execution priority (high-risk first). Include a `unit_output_subdir` field derived from the module name for artifact namespacing (e.g., `auth/`, `api/`).

### 10. Format Plan

- Produce `{analysis_plan}` as structured output and expose `{analysis_units}` as the ordered execution collection
- If `{output_path}` is provided, write the human-readable plan as `{analysis_plan}` into `{output_path}`
- A single-unit `{analysis_units}` array runs one analysis pass; a multi-unit array runs one pass per unit in order

## Outputs

### analysis_plan

Human-readable analysis plan artifact

#### artifact

`analysis-plan.md`

#### scope_type

Detected scope type (query, file, module, codebase, document-set)

#### strategy_summary

Overall strategy description

#### units_summary

Per-unit plan summary: target, role, risk, pipeline-mode, lenses, rationale

#### execution_order

Prioritised and grouped execution sequence (multi-unit scopes only)

#### parallelism_plan

Which units can run concurrently (multi-unit scopes only)

#### estimated_cost

Total sub-agent dispatches (multi-unit scopes only)

#### skipped_units

Units below budget threshold with justification (multi-unit scopes only)

### analysis_units

Machine-readable ordered array of analysis unit objects, each specifying a target, mode, and lens selection to execute

#### unit_specs

Array of `{ target, target_type, pipeline_mode, lenses, role, risk, rationale, unit_output_subdir }`

## Rules

### goal-mapping-matrix

Bug detection → L12 (00) or deep-scan (12). Code review → L12 (00) + contract (11). Design review → claim (07) + rejected-paths (09). Comprehension → pedagogy (06) + rejected-paths (09). Pre-commit validation → L12 pipeline (00-02). Planning review → L12 (00). Maintainability → degradation (10) + contract (11). Assumption validation → claim (07) + scarcity (08). Security review → sdl-trust (13) + security-v1 (37). Strategy evaluation → claim (07) + scarcity (08). Implication exploration → claim (07) + rejected-paths (09). General exploration → L12 (00). Error handling → error-resilience (19). Performance → optimize (20). API quality → api-surface (22). Evolution/coupling → evolution (21) or sdl-coupling (14). Trust boundaries → sdl-trust (13). Abstraction quality → sdl-abstraction (15). Structural defects → deep-scan (12) or fix-cascade (16). Identity/naming → identity (17). Dead code → reachability (30). State machine → state-audit (32). Contract fidelity → fidelity (31). Error+cost hybrid → evidence-cost (29). Comprehensive behavioral → behavioral pipeline (19-23). Pattern transfer → pedagogy (06). Hidden assumptions → claim (07). [scarcity](../resources/scarcity.md) → scarcity (08). Rejected alternatives → rejected-paths (09). Decay/degradation → degradation (10). Interface contracts → contract (11). Quick structural scan → l12-universal (18, Sonnet-only). Quick error resilience → error-resilience-compact (27). Ultra-brief error resilience → error-resilience-70w (28). Code archaeology → archaeology (33). Registration gaps → audit-code (34). Change resilience → cultivation (35). Temporal fragility → sdl-simulation (36) or simulation (38). Security audit → security-v1 (37). Testability → testability-v1 (39). Confabulation detection → knowledge-audit (40). Knowledge gaps → knowledge-boundary (41). Epistemic typing → knowledge-typed (42). Self-correcting analysis → l12g (43). Maximum-trust analysis → oracle (44). README rewriting → writer pipeline (45-47). Analysis strategy → strategist (48). Architecture exploration → architect (51). Catalog blindspots → blindspot (52). Code generation → codegen (53). Counterfactual analysis → counterfactual (54). Interaction emergence → emergence (55). Conservation law falsification → falsify (56). Creative synthesis → genesis (57). Decision history → history (58). Knowledge prerequisites → prereq (59). Significance evaluation → significance (60). Claim verification → verify-claims (61).

### code-vs-general

L12 pipeline (00-02) works for ALL target types. Code → resources 00-02 + 06-48 + 50-61. General (text, queries, concepts) → resources 00-02 + 06-10 + 15 (sdl-abstraction) + 18 (l12-universal, Sonnet-only) + 24-26 (neutral variants) + 33 (archaeology) + 35 (cultivation) + 38 (simulation) + 40-44 (knowledge/epistemic) + 51 (architect) + 52 (blindspot) + 54 (counterfactual) + 56 (falsify) + 57 (genesis) + 59 (prereq) + 60 (significance). Contract (11), SDL lenses (12-14, 16-17, 36), security-v1 (37), testability-v1 (39), behavioral pipeline (19-23), arc-code (50), codegen (53), emergence (55), history (58), and verify-claims (61) are code-only.

### single-lens-default

When no goal or depth is specified, default to [L12](../resources/l12.md).

### budget-drives-depth

For multi-unit scopes, the budget determines per-unit depth. The caller should not need to specify pipeline-mode for each module — the plan derives it from risk and budget.

### skip-is-explicit

When budget excludes low-risk modules, list them in skipped_units with justification. The caller can override by re-running with budget 'thorough'.

### model-sensitivity

Behavioral lenses (19-22) produce higher quality on Sonnet (+0.5-1.3 over Haiku). Structural/SDL lenses (00, 12-17) are model-independent. l12-universal (18) is Sonnet-only — Haiku fails below this compression floor. Deep-scan (12) and fix-cascade (16) produce best results on Opus. Oracle (44), l12g (43), knowledge lenses (40-42), and archaeology (33) are Sonnet-recommended. SDL-simulation (36), security-v1 (37), testability-v1 (39), and audit-code (34) are Haiku-optimized. Arc-code (50) is Haiku-optimized. Architect (51), blindspot (52), counterfactual (54), emergence (55), genesis (57), history (58), significance (60), and verify-claims (61) are Sonnet-recommended. Codegen (53) is Sonnet-recommended. Falsify (56) is Sonnet-recommended (unscored). Prereq (59) is Sonnet-recommended. Note model preferences when recommending lenses.

### behavioral-is-code-only

The behavioral pipeline (19-23) is code-only. optimize (20) has no domain-neutral variant. For general targets needing behavioral-style analysis, recommend individual neutral variants (24-26) in portfolio mode.

### neutral-variant-routing

When `{target_type}` is `general` and an individual behavioral lens is recommended, prefer the neutral variant: error-resilience → 24, api-surface → 25, evolution → 26. `optimize` has no neutral variant — use the code version (20) or omit.
