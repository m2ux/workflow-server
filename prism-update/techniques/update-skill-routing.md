---
metadata:
  version: 1.1.0
---

## Capability

Update prism routing technique files to reflect resource changes: fix renamed references, add goal-mapping entries for new prisms, expand lens catalogs, and update resource lists.

## Protocol

### 1. Update Plan Analysis

- For each entry in `{change_set}.renamed`, replace the old name with the new name across all rules and protocol sections of `{plan_analysis_technique}`.
  > If an expected technique file cannot be found, verify that the prism workflow techniques directory exists.
- Add a goal-mapping-matrix entry for every entry in `{change_set}.new`: analytical goal keyword to prism index, where the goal keyword matches the prism's cognitive operation or domain from its YAML frontmatter `description`.
- Update the code-vs-general, model-sensitivity, neutral-variant-routing, resource list, query-recommendation, and single-unit-recommendation sections.

### 2. Update Portfolio Analysis

- Fix renamed references in the description, selected-lenses, select-lenses guide, and load-lenses mapping of `portfolio-analysis.md`.
- Add each entry in `{change_set}.new` to the catalog and selection guide with complementary pairings.
- Update the resource list.

### 3. Update Behavioral Pipeline

- Fix renamed references to behavioral lens names or indices in `behavioral-pipeline.md`.

### 4. Update Orchestrate Prism

- Update the determine-lens-indices mapping and fix renamed references in `orchestrate-prism.md`.

### 5. Commit

- Stage all modified technique files and commit: `feat: update skill routing for N new prisms and M renames`.
