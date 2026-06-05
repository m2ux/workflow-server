---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Diff an upstream prisms directory against current resources, producing a categorized change set (new, modified, renamed, deleted) with family classification for new prisms.

## Inputs

### upstream-path

Absolute path to the upstream prisms directory

### resource-path

Relative path to the prism workflow resources directory

#### default

prism/resources/

### exclusions

*(optional)* Upstream filenames to exclude from the diff

#### default

[]

## Protocol

### 1. Enumerate Upstream

- List all .md files in upstream-path. Filter out exclusions.
- Extract base name as prism identifier (deep_scan.md → deep_scan).

### 2. Enumerate Resources

- List all .md files in resource-path except README.md.
- Extract numeric index prefix and prism name (12-deep-scan.md → index 12, name deep-scan).

### 3. Build Name Mapping

- Map upstream identifiers to resource filenames (underscores → hyphens).
- Name match + content diff → modified. No name match + high similarity → renamed. No match → new.
- Resource with no upstream counterpart → deleted.

### 4. Classify New Prisms

- Read each new prism's YAML frontmatter.
- Extract: name, description, type, optimal_model, quality_baseline, words, domain.
- Classify into family: structural-sdl, behavioral, knowledge, writer, analysis, meta.

### 5. Compute Next Index and Assemble change-set

- Set next_index to max(existing resource indices) + 1.
- Assemble the categorized new, modified, renamed, and deleted entries together with next_index into the change-set result.

## Outputs

### change-set

Categorized changes ready for review and import

#### new

Array of { name, upstream_file, family, optimal_model, quality_baseline, words }

#### modified

Array of { name, resource_file, upstream_file }

#### renamed

Array of { old_name, new_name, old_resource_file, upstream_file }

#### deleted

Array of { name, resource_file }

#### next_index

Next available resource index

## Errors

### upstream_not_found

**Cause:** upstream_path directory does not exist

**Recovery:** Verify the path. The upstream repository may need cloning.

### no_changes

**Cause:** No differences found

**Recovery:** Report resources are up to date. Workflow can end early.
