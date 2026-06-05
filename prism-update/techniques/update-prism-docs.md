---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Rebuild prism documentation to reflect the current resource catalog, adding prompt guide entries for new prisms with concrete example prompts that align with the goal-mapping matrix.

## Inputs

### changes

Change set — needed to know what's new, renamed, and deleted

## Protocol

### 1. Update Resources Readme

- Using `changes` to know what's new, renamed, and deleted, rebuild the full catalog table organized by family: index, name, description, optimal model, quality baseline.
- Update total count. Preserve existing cross-workflow and provenance documentation.
- If the expected README file cannot be found, verify that the prism workflow directory structure is intact before proceeding.

### 2. Update Workflow Readme

- Update Resources section: family table rows and total count.
- Update Model Sensitivity table: categorize each new prism by optimal_model.
- Add Prompt Guide rows: one per new prism with example prompt, scope, and routing target. Fix renamed references.
- Update file structure tree with new resource ranges.

### 3. Update Techniques Readme

- Update resource counts and lens catalog counts in technique descriptions.

### 4. Commit

- Stage and commit: 'docs: update prism workflow documentation for upstream sync'.
- Return `docs-result` summarizing the files updated and the number of prompt guide entries added.

## Outputs

### docs-result

Summary of documentation updates

#### files_updated

List of modified files

#### prompt_guide_entries_added

Number of new prompt guide rows
