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

### audit_target

Initialized target ready for analysis.

#### confirmed_target

Confirmed target component and revision

#### dependency_scan_results

Dependency scan results or fallback manifest

#### file_inventory

File inventory sorted by size

#### reference_documents

Reference document paths (if any, quarantined for later phases)

### start_here

Session overview with audit target, commit, methodology, and artifact index.

#### artifact

`START-HERE.md`

## Protocol

### 1. Extract Target

- Extract the target component (submodule, crate, directory) from the `{user_request}` or workflow variables. If no target component can be identified in the user request, fail with a descriptive error listing the available targets.

### 2. Extract Revision

- Extract the git commit hash or branch from the `{user_request}`. If not specified, default to the component's current `HEAD`. Record the exact revision for reproducibility.

### 3. Extract Reference

- If the user specified any reference documents (e.g., professional audit reports, prior reviews), record their paths without loading or reading them. Set corresponding workflow variables for later phases.

### 4. Checkout Revision

- Within the `{workspace_root}` repository, fetch and checkout the target component at the specified revision. Verify the checkout succeeded by confirming the `HEAD` matches the expected revision. If the specified commit hash does not exist in the component's history, fail with an error showing the recent commits.

### 5. Scan Dependencies

- Attempt to run dependency scanning tools (e.g., `cargo audit`, `cargo deny`, `npm audit`). Save outputs to the `{planning_folder_path}`. If the scanning tools cannot be executed, fall back to manual dependency manifest extraction: extract the dependency manifest (e.g., `Cargo.lock`, `package-lock.json`) and set a flag indicating manual inspection is needed.

### 6. Generate Inventory

- Produce a sorted file inventory listing all source files with line counts, largest first. Save to the `{planning_folder_path}`. Together with the confirmed target, revision, and dependency scan results, this completes the `{audit_target}` ready for analysis.

### 7. Create Planning Folder

- Create `{planning_folder_path}` following the naming pattern `YYYY-MM-DD-NN-{target_submodule}-security-audit`, where `NN` continues the numbering of existing audit folders at the same root.
- Initialize the `{start_here}` overview inside `{planning_folder_path}` from the [start-here](../resources/start-here.md) orientation, recording audit target, commit, methodology, and artifact index.

### 8. Load Template

- Confirm the audit prompt template is accessible at `{audit_prompt_template}`. If it is not at its expected path, fail with an error showing the expected path.
