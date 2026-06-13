---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 0
  legacy_id: 0
---

## Capability

Diff an upstream prisms directory against current resources, producing a categorized change set (new, modified, renamed, deleted) with family classification for new prisms.

## Inputs

### exclusions

*(optional)* Upstream filenames to exclude from the diff.

#### default

`[]`

## Protocol

### 1. Enumerate Upstream

- List all `.md` files in `{upstream_path}`; filter out `{exclusions}`.
  Extract the base name as the prism identifier (`deep_scan.md` → `deep_scan`).
  > If the `{upstream_path}` directory does not exist, verify the path; the upstream repository may need cloning.

### 2. Enumerate Resources

- List all `.md` files in `{resource_path}` except `README.md`.
- Extract the numeric index prefix and prism name (`12-deep-scan.md` → index `12`, name `deep-scan`).

### 3. Build Name Mapping

- Map upstream identifiers to resource filenames (underscores → hyphens).
- A name match with a content diff is `modified`; no name match with high content similarity is `renamed`; no match is `new`; a resource with no upstream counterpart is `deleted`.

### 4. Classify New Prisms

- Read each new prism's YAML frontmatter and extract `name`, `description`, `type`, `optimal_model`, `quality_baseline`, `words`, and `domain`.
- Classify each new prism into a family: `structural-sdl`, `behavioral`, `knowledge`, `writer`, `analysis`, or `meta`.

### 5. Compute Next Index and Assemble Change Set

- Set `{next_index}` to the maximum existing resource index plus one.
- Assemble the categorized new, modified, renamed, and deleted entries together with `{next_index}` into `{change_set}`.
  > When no differences are found across all categories, report that resources are up to date; the workflow can end early.

## Outputs

### change_set

Categorized changes ready for review and import.

#### new

Array of `{ name, upstream_file, family, optimal_model, quality_baseline, words }`.

#### modified

Array of `{ name, resource_file, upstream_file }`.

#### renamed

Array of `{ old_name, new_name, old_resource_file, upstream_file }`.

#### deleted

Array of `{ name, resource_file }`.

### next_index

Next available resource index.
