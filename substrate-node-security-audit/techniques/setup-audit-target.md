---
metadata:
  version: 1.0.0
---

## Capability

Extract, validate, and initialize a target codebase at a specific revision for analysis, including dependency scanning and file inventory generation

## Inputs

### user_request

Target specification (component, revision, scope).

### workspace_root

Path to the repository root

### audit_prompt_template

Path to the audit prompt template whose accessibility is confirmed during setup.

### target_submodule

The target component name used to build the planning-folder name.

## Outputs

### target_commit

The exact revision the target component is checked out at, recorded for reproducibility.

### file_inventory

Every in-scope source file with its line count, sorted largest first.

### reference_report

Path to any reference document the user supplied, recorded without being read so later phases can quarantine it.

### dependency_scan_results

Known-vulnerable dependency report, or the extracted dependency manifest when no scanner is available.

#### artifact

`dependency-scan.json`

### start_here

Session overview with audit target, commit, methodology, and artifact index.

#### artifact

`START-HERE.md`

## Protocol

### 1. Extract Target

- Extract the target component (submodule, crate, directory) from the `{user_request}` or workflow variables. If no target component can be identified in the user request, fail with a descriptive error listing the available targets.

### 2. Extract Revision

- Extract the git commit hash or branch from the `{user_request}`. If not specified, default to the component's current `HEAD`. Record the exact revision as `{target_commit}`.

### 3. Extract Reference

- If the user specified a reference document (e.g., a professional audit report or prior review), record its path as `{reference_report}` without loading or reading it, so later phases can quarantine it.

### 4. Checkout Revision

- Within the `{workspace_root}` repository, fetch and checkout the target component at the specified revision. Verify the checkout succeeded by confirming the `HEAD` matches the expected revision. If the specified commit hash does not exist in the component's history, fail with an error showing the recent commits.

### 5. Scan Dependencies

- Attempt to run dependency scanning tools (e.g., `cargo audit`, `cargo deny`, `npm audit`) and record the result as `{dependency_scan_results}` in the `{planning_folder_path}`.  
  > If the scanning tools cannot be executed, extract the dependency manifest (e.g., `Cargo.lock`, `package-lock.json`) instead and mark the result as requiring manual inspection.

### 6. Generate Inventory

- Produce `{file_inventory}` listing every in-scope source file with its line count, largest first, and save it to the `{planning_folder_path}`.

### 7. Create Planning Folder

- Create `{planning_folder_path}` following the naming pattern `YYYY-MM-DD-NN-{target_submodule}-security-audit`, where `NN` continues the numbering of existing audit folders at the same root.
- Initialize the `{start_here}` overview inside `{planning_folder_path}` from the [start-here overview](../resources/start-here.md#overview), [key artifacts](../resources/start-here.md#key-artifacts-produced), and [options at setup](../resources/start-here.md#options-at-setup), recording audit target, commit, methodology, and artifact index.

### 8. Load Template

- Confirm the audit prompt template is accessible at `{audit_prompt_template}`. If it is not at its expected path, fail with an error showing the expected path.
