---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Update prism routing technique files to reflect resource changes: fix renamed references, add goal-mapping entries for new prisms, expand lens catalogs, and update resource lists.

## Protocol

### 1. Update Plan Analysis

- For each rename in {change-set}, find-and-replace the old name with the new name across all rules and protocol sections.
- If an expected technique file cannot be found, verify that the prism workflow techniques directory exists.
- Add a goal-mapping-matrix entry for every new prism in {change-set}: analytical goal keyword → prism index.
- Update code-vs-general, model-sensitivity, resource list, query-recommendation, and single-unit-recommendation.
- Each new prism's goal keyword should match its cognitive operation or domain from the YAML frontmatter description.

### 2. Update Portfolio Analysis

- Fix renamed references in description, selected-lenses, select-lenses guide, load-lenses mapping.
- Add new prisms to catalog and selection guide with complementary pairings.
- Update resource list.

### 3. Update Behavioral Pipeline

- Fix renamed references to behavioral lens names or indices.

### 4. Update Orchestrate Prism

- Update determine-lens-indices and fix renamed references.

### 5. Commit

- Stage all modified technique files. Commit: 'feat: update skill routing for N new prisms and M renames'.

## Rules

### coverage

Every routing surface must be updated: goal-mapping-matrix, code-vs-general, model-sensitivity, neutral-variant-routing, resource lists, lens catalogs, selection guides.
