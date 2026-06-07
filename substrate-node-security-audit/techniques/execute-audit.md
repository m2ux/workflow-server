---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.1.0
  order: 0
  legacy_id: 0
---

## Capability

Execute security audit phases with consistent tool usage, concurrent multi-agent coordination, and §3 checklist completeness verification

## Protocol

### 1. Setup

- Extract target submodule and commit from initial request — fail if not specified
- Checkout submodule at target commit
  - If the target submodule path does not exist, fail with a descriptive error — do not ask interactively
  - If the target commit hash is not found in the submodule history, fail with an error showing recent commits via `git log`
- Run `cargo audit` / `cargo deny` or fallback to manual dependency inspection
- Create `{planning_folder_path}` and initialize artifacts (see [start-here](../resources/start-here.md) for workflow orientation)

### 2. Reconnaissance

- Dispatch reconnaissance sub-agent (R) to identify crates, map architecture, build function registry, and write output files to `{planning_folder_path}`
  - If a dispatched sub-agent does not return within the expected time, check terminal output and resume or re-dispatch the agent
- Dispatch architectural analysis sub-agent (Arch) with R's output files to produce security decomposition
- Read R and Arch output files from `{planning_folder_path}` (orchestrator does NOT read source code)
- Map vulnerability domains by binding architectural analysis to §3 verification procedures, using the [vulnerability-pattern-vocabulary](../resources/vulnerability-pattern-vocabulary.md) as a recognition aid for known cross-project patterns
- Assign agent groups per target profile and route reconnaissance leads to specific agents

### 3. Primary Audit

- Dispatch all primary agents (A1-A7, B, D1, D2) concurrently with the [§3 checklist](../resources/audit-template-reference.md), cross-crate supplementary files, toolkit minimum checklist, and relevant calibration benchmarks
  - If the audit prompt template is not at its expected path, fail with an error showing the expected path
- Collect all results from primary agents and persist each agent's full output as JSON in the `{planning_folder_path}`
- Dispatch verification sub-agent (V) to validate output completeness against target profile, act on gap report, extract table-derived findings
- Re-dispatch targeted follow-up agents for any gaps identified by the verification agent
- Dispatch merge sub-agent (M) to perform structured merge, dedup, severity scoring with bidirectional calibration, reconciliation, and observation elevation in a fresh context window
- Validate M's reconciliation table — Unaccounted must equal zero (HARD STOP)
- Verify §3 checklist completeness from M's output

### 4. Adversarial

- Extract all PASS items from agent scratchpads
- Decompose each PASS into constituent properties
- Enumerate all fields/sites for multi-instance properties
- Verify each property independently — output CONFIRMED/REFUTED/INSUFFICIENT

### 5. Consolidation

- Integrate adversarial results into structured merge table (from M's output)
- Apply bidirectional severity scoring rubric (Impact x Feasibility) with calibration example cross-check against ALL findings, not just High/Critical
- Verify coverage gate (§5.14)
- Verify elevation completeness via merge table mapping
- Include reconciliation table in report as auditable evidence of zero finding loss

### 6. Track

- Track `current_phase` — which phase is active (setup, reconnaissance, primary, adversarial, report, ensemble, gap)
- Track `agent_status` — status of dispatched sub-agents
- Track `findings_count` — running count of identified findings
- Track `pass_count` — running count of PASS items in scratchpads
- Track `coverage_files` — list of files read by agents
- Track `checklist_coverage` — §3 coverage matrix showing per-item evaluation status
