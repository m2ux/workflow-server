---
metadata:
  version: 1.4.0
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

## Outputs

### analysis_plan

Human-readable analysis plan artifact

#### artifact

`analysis-plan.md`

#### audience

`human`

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

Array of `{ target, target_type, pipeline_mode, lens_name, lenses, role, risk, rationale, unit_output_subdir }`

## Protocol

### 1. Detect Scope

- Resolve the scope of `{target}` per [Scope values](../resources/target-classification.md#scope-values), reading [Project markers](../resources/target-classification.md#project-markers) where the target is a directory.
- Resolve `{target_type}` per [Target type](../resources/target-classification.md#target-type) where it was not supplied.
- Proceed to the planning path that scope selects.

### 2. Query Recommendation

- For scope 'query': the target is text, not files. Map the `{analytical_goal}` to lenses using the single canonical `goal-mapping-matrix` rule, restricted to the lenses the `code-vs-general` rule marks usable on `general` targets (and preferring neutral variants per `neutral-variant-routing`).
- Emit the result as: a `single`-mode unit carrying the chosen lens slug when one lens fits; the L12 pipeline (`full-prism`) when the goal warrants self-correcting depth; or `portfolio` with 2-3 complementary general-safe lenses when the goal warrants breadth.
- Apply `{depth_preference}` if provided: 'single' → single best lens, 'pipeline' → full-prism, 'portfolio' → 2-3 complementary lenses, 'behavioral' → behavioral pipeline (19-23, code-only — reject if `{target_type}` is general)
- Format as a single-unit plan with scope 'query' and proceed to format-plan

### 3. Single Unit Recommendation

- For scope 'file' or 'module': map the `{analytical_goal}` to lenses using the single canonical `goal-mapping-matrix` rule. When the matrix offers a disjunction (e.g. deep-scan *or* fix-cascade) or several lenses fit, resolve it with the `disjunction-tiebreak` rule.
- Apply `{depth_preference}` if provided: 'single' → single best lens, 'pipeline' → full-prism, 'portfolio' → 2-3 complementary lenses, 'behavioral' → behavioral pipeline (19-23, synthesized by [behavioral-synthesis](../resources/behavioral-synthesis.md); code-only — reject if `{target_type}` is general)
- Format as a single-unit plan and proceed to format-plan

### 4. Survey Structure

- For scope 'codebase' or 'document-set': list files and directories at the top level
- If the target directory contains no analyzable files, report the empty directory and check that the path is correct and contains source files or documents.
- Identify module boundaries from directory layout, build system (workspaces, packages), and naming conventions
- Where `{repo_name}` is non-empty: use [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[query](/gitnexus/techniques/query.md)(*search_query*: the target's module and subsystem names as keywords, *repo_name*: `{repo_name}`) to discover functional areas and community clusters — these are better module boundaries than directory layout alone. If the codebase is not indexed, fall back to directory-based module detection and role-based risk classification, and note in the plan that fan-in analysis was not available.
- Record per-module: path, file count, estimated lines, primary language or content type

### 5. Classify Units

- Categorise each module by role: api-surface, auth-security, state-persistence, business-logic, integration-external, utilities, configuration, types-definitions
- Assess risk based on role and content signals: auth/crypto/permissions/session → high. state/database/persistence → high. API surface/public interfaces → medium. business logic/domain rules → medium. utilities/helpers → low. config/constants/types → low.
- If the scope is codebase but no analytical goal was provided, risk cannot be classified meaningfully — ask the caller for an analytical goal. Without one, default to 'bug detection', which maps all modules to L12.
- Where `{repo_name}` is non-empty: use [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[context](/gitnexus/techniques/context.md)(*name*: each module's entry symbol, *repo_name*: `{repo_name}`) to check how many callers it has — high fan-in modules are higher risk regardless of role
- If the analytical goal targets a specific concern (e.g., 'security'), elevate all modules touching that concern to high risk
- Record per-module: role, risk (high/medium/low), classification rationale

### 6. Select Strategy Per Unit

- Map risk to pipeline mode based on `{analysis_budget}`
- Budget 'quick': high → single L12, medium → single L12, low → skip
- Budget 'standard': high → full-prism, medium → single L12, low → portfolio (2 lenses matched to role)
- Budget 'thorough': high → full-prism, medium → full-prism, low → single L12

### 7. Select Lenses Per Unit

- For units assigned single mode: select the single best lens from the `goal-mapping-matrix` rule matched to the module's role (resolve ambiguity with `disjunction-tiebreak` and `model-gating`). Record it as the unit's `lens_name` slug. When no goal selects a specific lens, the `lens_name` is `l12` (`single-lens-default`).
- For units assigned portfolio mode: select 2 complementary lenses matched to role, recorded as the unit's `lenses` slug array. api-surface → contract + api-surface. auth-security → sdl-trust + error-resilience. business-logic → scarcity + rejected-paths. state-persistence → state-audit + degradation. utilities → degradation + claim. integration → contract + sdl-coupling. architecture → deep-scan + sdl-abstraction.
- For units assigned full-prism: the pipeline uses the L12 set for all target types — structural ([l12](../resources/l12.md)), adversarial ([l12-complement-adversarial](../resources/l12-complement-adversarial.md)), synthesis ([l12-synthesis](../resources/l12-synthesis.md)). Record the unit's `lens_name` as `l12`.

### 8. Plan Execution

- Order units by risk: high first, then medium, then low
- Within the same risk tier, order by dependency — modules depended on by others are analyzed first (their findings inform downstream analysis)
- Identify parallelism opportunities: independent modules at the same risk level can run concurrently (up to 4)
- Calculate cost estimate: 1 dispatch per single pass, 3 per full-prism, N per portfolio (N = number of selected lenses)

### 9. Build Analysis Units

- Build the `{analysis_units}` array — an ordered list of unit objects that the workflow iterates over
- Each unit object has: `target` (file path or content string), `target_type` (`code`|`general`), `pipeline_mode` (`single`|`full-prism`|`portfolio`|`behavioral`), `lens_name` (the single lens slug for `single` and `full-prism` units — `l12` unless the goal selected another single lens; unused for `portfolio`/`behavioral`), `lenses` (array of lens slugs for `portfolio`, empty otherwise), `role` (module role or `query`), `risk` (`high`|`medium`|`low`), `rationale` (why this mode and lens were selected)
- For query and file scopes: produce a single-element array
- For module scope: produce a single-element array with the module path as target
- For codebase and document-set scopes: produce one element per module, ordered by execution priority (high-risk first). Include a `unit_output_subdir` field derived from the module name for artifact namespacing (e.g., `auth/`, `api/`).

### 10. Format Plan

- Produce `{analysis_plan}` as structured output and expose `{analysis_units}` as the ordered execution collection
- If `{output_path}` is provided, write `{analysis_plan}` into `{output_path}` per [analysis-plan](../resources/analysis-plan.md#template) and its [Rules](../resources/analysis-plan.md#rules)
- A single-unit `{analysis_units}` array runs one analysis pass; a multi-unit array runs one pass per unit in order

## Rules

### goal-mapping-matrix

A stated goal selects its lens from the [goal-to-lens table](../resources/lens-selection.md#goal-to-lens). A goal the table does not carry takes the default in `single-lens-default`.

### code-vs-general

What a target admits is settled by its type, per [Code and general targets](../resources/lens-selection.md#code-and-general-targets). A lens that table marks code-only is never planned for a general target.

### single-lens-default

When no goal or depth is specified, default to [L12](../resources/l12.md).

### budget-drives-depth

For multi-unit scopes, the budget determines per-unit depth. The caller should not need to specify pipeline-mode for each module — the plan derives it from risk and budget.

### skip-is-explicit

When budget excludes low-risk modules, list them in skipped_units with justification. The caller can override by re-running with budget 'thorough'.

### model-sensitivity

A lens recommendation names the model that lens is sensitive to, per [Model sensitivity](../resources/lens-selection.md#model-sensitivity).

### behavioral-is-code-only

The behavioral pipeline (19-23) is code-only. optimize (20) has no domain-neutral variant. For general targets needing behavioral-style analysis, recommend individual neutral variants (24-26) in portfolio mode.

### neutral-variant-routing

When `{target_type}` is `general` and an individual behavioral lens is recommended, prefer the neutral variant: error-resilience → error-resilience-neutral (24), api-surface → api-surface-neutral (25), evolution → evolution-neutral (26). `optimize` has no neutral variant — use the code version optimize (20) or omit.

### disjunction-tiebreak

When the `goal-mapping-matrix` offers two lenses for one goal (e.g. bug detection → L12 *or* deep-scan; structural defects → deep-scan *or* fix-cascade; temporal fragility → sdl-simulation *or* simulation), pick a single lens by, in order: (1) `target_type` fit per `code-vs-general`; (2) `model-gating` on the active model; (3) budget — the lighter lens under budget 'quick', the deeper lens under 'thorough'. If still tied, take the first-listed lens. In `portfolio` mode, run both rather than choosing.

### model-gating

Model sensitivity gates selection, it does not merely advise it. Never route to a lens the active model cannot run: l12-universal (18) requires Sonnet or better — on Haiku, substitute l12 (00). When a lens is model-*preferred* but not model-*required* (deep-scan and fix-cascade favour Opus; behavioral, knowledge, and generative lenses favour Sonnet), route to it but record the model preference in the unit `rationale`. See `model-sensitivity` for the per-lens table.
