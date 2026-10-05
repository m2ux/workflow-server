---
metadata:
  version: 2.0.0
---

## Capability

Initialize a target codebase pinned at its audited commit for analysis, including dependency scanning and file inventory generation.

## Inputs

### audit_prompt_template

Path to the audit prompt template whose accessibility is confirmed during setup.

### target_submodule

Path to the component being audited, whose name also builds the planning-folder name.

### target_commit

The exact commit the target component is checked out at, recorded for reproducibility.

## Outputs

### file_inventory

Every in-scope source file with its line count, sorted largest first.

### dependency_scan_results

Known-vulnerable dependency report, or the extracted dependency manifest when no scanner is available.

#### artifact

`dependency-scan.json`

#### audience

`agent`

### start_here

Session overview with audit target, commit, methodology, and artifact index.

#### artifact

`START-HERE.md`

#### audience

`human`

## Protocol

### 1. Scan Dependencies

- Attempt to run dependency scanning tools (e.g., `cargo audit`, `cargo deny`, `npm audit`) and record the result as `{dependency_scan_results}` in the `{planning_folder_path}`.  
  > If the scanning tools cannot be executed, extract the dependency manifest (e.g., `Cargo.lock`, `package-lock.json`) instead and mark the result as requiring manual inspection.

### 2. Generate Inventory

- Produce `{file_inventory}` listing every in-scope source file with its line count, largest first, and save it to the `{planning_folder_path}`.

### 3. Create Planning Folder

- Create `{planning_folder_path}` following the naming pattern `YYYY-MM-DD-NN-{target_submodule}-security-audit`, where `NN` continues the numbering of existing audit folders at the same root.
- Initialize the `{start_here}` overview inside `{planning_folder_path}` from the [start-here overview](../resources/start-here.md#overview), [key artifacts](../resources/start-here.md#key-artifacts-produced), and [options at setup](../resources/start-here.md#options-at-setup), recording audit target, `{target_commit}`, methodology, and artifact index.

### 4. Load Template

- Confirm the audit prompt template is accessible at `{audit_prompt_template}`. If it is not at its expected path, fail with an error showing the expected path.
