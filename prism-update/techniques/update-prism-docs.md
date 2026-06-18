---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 3
  legacy_id: 3
---

## Capability

Rebuild prism documentation to reflect the current resource catalog, adding prompt guide entries for new prisms with concrete example prompts that align with the goal-mapping matrix.

## Protocol

### 1. Update Resources Readme

- From `{change_set}`, rebuild the full catalog table in `{prism_resources_readme}` organized by family: index, name, description, optimal model, quality baseline.
- Update the total count and preserve the existing cross-workflow and provenance documentation.
  > If the expected README file cannot be found, verify that the prism workflow directory structure is intact before proceeding.

### 2. Update Workflow Readme

- Update the Resources section of `{prism_readme}`: family table rows and total count.
- Update the Model Sensitivity table, categorizing each entry in `{change_set}.new` by its `optimal_model`.
- Add one Prompt Guide row per entry in `{change_set}.new` with an example prompt, scope, and routing target, and fix renamed references.
- Update the file-structure tree with the new resource ranges.

### 3. Update Techniques Readme

- Update the resource counts and lens catalog counts in the technique descriptions of `prism/techniques/TECHNIQUE.md`.

### 4. Commit

- Stage and commit: `docs: update prism workflow documentation for upstream sync`.
