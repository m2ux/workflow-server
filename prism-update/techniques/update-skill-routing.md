---
name: update-skill-routing
description: Fix renamed references, add goal-mapping entries for new prisms, expand lens catalogs, and update resource lists across plan-analysis, portfolio-analysis, behavioral-pipeline, and orchestrate-prism.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Update prism workflow skill files to reflect resource changes

## Inputs

### changes

Change set with new, renamed, and deleted prisms

## Protocol

### 1. Update Plan Analysis

- Find-and-replace old names with new names across all rules and protocol sections.
- Add goal-mapping-matrix entry for each new prism: analytical goal keyword → prism index.
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

- Stage all modified skill files. Commit: 'feat: update skill routing for N new prisms and M renames'.

## Outputs

### routing-result

Summary of skill updates

- **skills_modified**: List of modified skill files
- **entries_added**: Number of new goal-mapping entries
- **references_fixed**: Number of renamed references updated

## Rules

### coverage

Every routing surface must be updated: goal-mapping-matrix, code-vs-general, model-sensitivity, neutral-variant-routing, resource lists, lens catalogs, selection guides.

## Errors

### missing_skill

**Cause:** Expected skill file not found

**Recovery:** Check that the prism workflow skills directory exists.
