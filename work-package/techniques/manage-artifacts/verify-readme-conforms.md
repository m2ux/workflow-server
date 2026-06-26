---
metadata:
  version: 2.0.0
---

## Capability

Verify the planning folder's `README.md` still matches its template's structure (header block, executive summary, the template's overview/progress sections, links). Catches template drift that would otherwise only be flagged late in the workflow by a human reviewer.

## Inputs

### readme_template

*(optional)* `get_resource` id of the README template to conform against.

#### default

`work-package/readme`

## Outputs

### readme_conformance

The conformance envelope — three drift arrays plus the aggregate verdict:

#### conforms

true iff `{missing_sections}`, `{extra_top_level_headings}`, and `{header_block_drift}` are all empty.

#### missing_sections

array of template H2 sections absent from the README.

#### extra_top_level_headings

array of H1 headings beyond the single title H1.

#### header_block_drift

array of header-block fields missing or renamed (e.g. a custom `Issue:` line in place of the canonical `Status:`/`Type:` rows).

## Protocol

1. Read `{planning_folder_path}/README.md` and load the README template named by `{readme_template}` via `get_resource`. If no `README.md` is found in `{planning_folder_path}`, re-apply [create-readme](./create-readme.md) to seed the README from `{readme_template}` before continuing.
2. Extract H1/H2/H3 sections from each. Compare the README's H2 sections against the set of required H2 sections the loaded template defines, and compare the README's header block (Created/Status/Type fields) against the template's header fields.
3. Compose `{readme_conformance}`: `{missing_sections}` lists template H2s absent from the README; `{extra_top_level_headings}` lists H1s beyond the single title H1; `{header_block_drift}` lists header fields missing or renamed (e.g., a custom `Issue:` line in place of the canonical `Status:`/`Type:` rows). `{conforms}` is true iff all three arrays are empty.
