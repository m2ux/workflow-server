---
metadata:
  version: 1.0.0
---

## Capability

Verify the planning folder's README.md still matches the [readme](../../resources/readme.md) template structure (header block, executive summary, problem/solution overview, progress table, links). Catches template drift that would otherwise only be flagged late in the workflow by a human reviewer.

## Inputs

### planning_folder_path

Absolute path to the planning folder containing README.md

## Output

### readme_conformance

The conformance envelope — three drift arrays plus the aggregate verdict:

#### conforms

true iff `missing_sections`, `extra_top_level_headings`, and `header_block_drift` are all empty.

#### missing_sections

array of template H2 sections absent from the README.

#### extra_top_level_headings

array of H1 headings beyond the single title H1.

#### header_block_drift

array of header-block fields missing or renamed (e.g. a custom `Issue:` line in place of the canonical `Status:`/`Type:` rows).

## Protocol

1. Read `{planning_folder_path}/README.md` and load [readme](../../resources/readme.md) (the README template) via `get_resource`. If no README.md is found in `planning_folder_path`, re-apply [create-readme](./create-readme.md) to seed the README from [readme](../../resources/readme.md) before continuing.
2. Extract H1/H2/H3 sections from each. Compare H2 sections against the template's required set: Executive Summary, Problem Overview, Solution Overview, Progress, Links. Compare the header block (Created/Status/Type fields) against the template's header fields.
3. Compose `readme_conformance`: `missing_sections` lists template H2s absent from the README; `extra_top_level_headings` lists H1s beyond the single title H1; `header_block_drift` lists header fields missing or renamed (e.g., a custom `Issue:` line in place of the canonical `Status:`/`Type:` rows). `conforms` is true iff all three arrays are empty.
