---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 4
  legacy_id: 4
---

## Capability

Orchestrate prism analysis with isolated sub-agent passes for analytical independence

## Inputs

### target-content

The code or text to analyze — file path or inline content

### target-type

*(optional)* Whether the input is 'code' or 'general'

#### default

code

### pipeline-mode

*(optional)* Analysis mode: 'single', 'full-prism', 'portfolio', or 'behavioral'

#### default

single

### output-path

*(optional)* Directory to write analysis artifacts. Workers write artifacts here; the orchestrator passes the path to each worker.

#### default

.

### selected-lenses

*(optional)* For portfolio mode: array of lens names

## Protocol

### 1. Load Workflow

- Call get_workflow({ workflow_id: 'prism' }) to load the workflow definition
- Initialize state variables from inputs: target_content, target_type, pipeline_mode, output_path, selected_lenses

### 2. Resolve Target

- If target_content is a file path, read the file and capture the full text as {$resolved-content}. If the file does not exist, report the error to the user and stop — do not proceed with empty content.
- If target_content is inline text, use it directly as {$resolved-content}
- Ensure the output-path directory exists (create if needed)

### 3. Determine Lens Indices

- Based on target_type and pipeline_mode, determine which resource indices to use
- L12 pipeline (all target types): structural=00, adversarial=01, synthesis=02
- Portfolio: pedagogy=06, claim=07, scarcity=08, rejected-paths=09, degradation=10, contract=11, deep-scan=12, sdl-trust=13, sdl-coupling=14, sdl-abstraction=15, rec=16, ident=17, 73w=18, error-resilience=19, optim=20, evolution=21, api-surface=22, evidence-cost=29, reachability=30, fidelity=31, state-audit=32, archaeology=33, audit-code=34, cultivation=35, sdl-simulation=36, security-v1=37, simulation=38, testability-v1=39, knowledge-audit=40, knowledge-boundary=41, knowledge-typed=42, l12g=43, oracle=44, arc-code=50, architect=51, blindspot=52, codegen=53, counterfactual=54, emergence=55, falsify=56, genesis=57, history=58, prereq=59, significance=60, verify-claims=61
- Behavioral pipeline (code-only): error-resilience=19, optim=20, evolution=21, api-surface=22, behavioral-synthesis=23
- Domain-neutral variants (general targets in portfolio): error-resilience-neutral=24, api-surface-neutral=25, evolution-neutral=26
- Compressed variants (model-specific): error-resilience-compact=27, error-resilience-70w=28

### 4. Dispatch Structural Pass

- Dispatch a fresh sub-agent using harness-compat::spawn-agent. Do NOT use continue-agent.
- Worker prompt must include: (1) the {$resolved-content}, (2) the lens resource index to load, (3) the workflow_id 'prism' for resource loading, (4) the output-path to write its artifact, (5) instruction to load the lens for that index, execute every operation, and write to {output-path}/structural-analysis.md
- Worker prompt must NOT include any prior analysis — this is the first pass
- Capture the artifact path from the worker's response: structural_output_path = {output-path}/structural-analysis.md
- Verify the artifact was written by reading its first line. If the worker returned without writing its artifact, dispatch a new worker for the same pass with an explicit instruction to write the artifact — do not resume the failed worker.
- If pipeline_mode is 'single', go to present-result

### 5. Dispatch Adversarial Pass

- Dispatch a NEW FRESH sub-agent using harness-compat::spawn-agent. Do NOT use continue-agent on the structural worker.
- Worker prompt must include: (1) the {$resolved-content}, (2) structural_output_path — the worker will read this file and label it ANALYSIS 1, (3) the adversarial lens resource index, (4) the output-path, (5) instruction to write to {output-path}/adversarial-analysis.md
- CRITICAL: Do NOT include the structural analysis text inline. Pass only the file path. The worker reads the artifact from the filesystem.
- If the expected prior-pass artifact (structural_output_path) does not exist on the filesystem, re-dispatch the prior pass worker to produce it — do not proceed to this pass without the artifact.
- If the adversarial pass comes back agreeing with everything in the structural analysis, dispatch a new adversarial worker with an explicit instruction to find at least one wrong prediction, one overclaim, and one underclaim.
- Capture adversarial_output_path = {output-path}/adversarial-analysis.md
- Proceed to dispatch-synthesis-pass

### 6. Dispatch Synthesis Pass

- Dispatch a NEW FRESH sub-agent using harness-compat::spawn-agent. Do NOT use continue-agent on any prior worker.
- Worker prompt must include: (1) the {$resolved-content}, (2) structural_output_path and adversarial_output_path — the worker reads both files, (3) the synthesis lens resource index, (4) the output-path, (5) instruction to write to {output-path}/synthesis.md
- Capture synthesis_output_path = {output-path}/synthesis.md
- Verify the artifact was written
- Proceed to present-result

### 7. Dispatch Portfolio Passes

- For each selected lens, dispatch a fresh sub-agent using harness-compat::spawn-agent with: the {$resolved-content}, that lens's resource index, and the output-path
- Each worker writes to {output-path}/portfolio-{lens-name}.md
- Portfolio workers can be dispatched in parallel (up to 4 concurrent) since they are independent
- Capture all artifact paths in portfolio_output_paths keyed by lens name
- After all complete, proceed to present-result with a cross-lens synthesis

### 8. Dispatch Behavioral Passes

- For behavioral mode: dispatch 4 independent behavioral lens passes. Each is a fresh sub-agent via harness-compat::spawn-agent.
- Pass 1 (ERRORS): [error-resilience](../resources/error-resilience.md) (error-resilience). Worker writes to {output-path}/behavioral-errors.md
- Pass 2 (COSTS): [optimize](../resources/optimize.md) (optim). Worker writes to {output-path}/behavioral-costs.md
- Pass 3 (CHANGES): [evolution](../resources/evolution.md) (evolution). Worker writes to {output-path}/behavioral-changes.md
- Pass 4 (PROMISES): [api-surface](../resources/api-surface.md) (api-surface). Worker writes to {output-path}/behavioral-promises.md
- All 4 passes are independent — they can be dispatched in parallel (up to 4 concurrent). Capture all 4 artifact paths in behavioral_output_paths.

### 9. Dispatch Behavioral Synthesis

- After all 4 behavioral passes complete, dispatch the synthesis pass to a fresh sub-agent via harness-compat::spawn-agent.
- Worker prompt must include: (1) the {$resolved-content}, (2) all 4 behavioral artifact paths with role labels (ERRORS, COSTS, CHANGES, PROMISES), (3) resource index 23 (behavioral-synthesis), (4) the output-path
- Worker reads each artifact and constructs labeled sections: ## ERRORS, ## COSTS, ## CHANGES, ## PROMISES
- Worker writes to {output-path}/behavioral-synthesis.md
- Capture behavioral_synthesis_output_path. Proceed to present-result.

### 10. Present Result

- For single mode: read and present {structural_output_path}
- For full-prism mode: read and present {synthesis_output_path} as the primary result. Note {structural_output_path} and {adversarial_output_path} as appendices.
- For portfolio mode: present each per-lens artifact from {portfolio_output_paths} followed by a cross-lens convergence/divergence summary
- For behavioral mode: read and present {behavioral_synthesis_output_path} as the primary result. Note the per-role paths in {behavioral_output_paths} as appendices.
- Assemble and return the prism-result to the caller: the primary artifact path as final_artifact_path, every artifact produced during the pipeline as all_artifact_paths, and the pipeline_mode that was used

## Outputs

### prism-result

Complete prism analysis result with artifact paths

#### final_artifact_path

Path to the primary analysis artifact ({structural_output_path} for single, {synthesis_output_path} for full-prism)

#### all_artifact_paths

All artifact paths produced during the pipeline

#### pipeline_mode

Which mode was used

## Rules

### never-resume

NEVER use continue-agent between passes (harness-compat). Each pass MUST be a fresh sub-agent dispatched via spawn-agent. This is the core isolation guarantee.

### artifact-mediated

Pass outputs between workers via filesystem artifacts, not inline text. The orchestrator provides artifact paths; workers read and write files. This keeps prompts focused and artifacts as the source of truth.

### no-analysis

The orchestrator MUST NOT generate analysis, evaluate findings, or produce structural observations. It dispatches, captures paths, and presents results.

### lens-not-forwarded

The orchestrator tells workers which resource index to load — it does NOT load the lens resource and include it in the prompt.

### automatic-pipeline

The full pipeline runs without user interaction. No checkpoints, no confirmation between passes.

### verify-artifacts

After each pass, verify the artifact was written before dispatching the next pass.

### no-methodology-leak

Worker prompts never reveal how a prior artifact was generated. Pass only the artifact path and the target — never the analysis methodology, lens identities, or pass structure.
