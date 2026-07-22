---
metadata:
  version: 3.0.0
---

## Capability

Conformance check that the planning-folder `README.md` matches the universal planning Template (and seed-declared append H2s).

## Inputs

### seed_profile

*(optional)* Resource id of the workflow's readme-seed profile. When bound, required H2s include any append sections declared there; Progress inventory expectations may be checked against the profile.

## Outputs

### readme_conformance

The conformance envelope — three drift arrays plus the aggregate verdict:

#### conforms

true iff `{missing_sections}`, `{extra_top_level_headings}`, and `{header_block_drift}` are all empty.

#### missing_sections

array of Template (and seed-append) H2 sections absent from the README.

#### extra_top_level_headings

array of H1 headings beyond the single title H1.

#### header_block_drift

array of header-block fields missing or renamed relative to [Template](../../resources/planning-readme.md#template).

## Protocol

1. Read `{planning_folder_path}/README.md`. If absent, re-apply [create-readme](./create-readme.md) with the bound `{seed_profile}` (required when re-seeding) before continuing.
2. Load [Template](../../resources/planning-readme.md#template). When `{seed_profile}` is bound, load that profile and union any declared append H2 titles into the required section set.
3. Extract H1/H2 sections from the README. Compare H2s against the required set (Template H2s plus seed appends). Compare the header blockquote against Template header fields (classifier · Created · **Status:**).
4. Compose `{readme_conformance}`: `{missing_sections}`, `{extra_top_level_headings}`, `{header_block_drift}`; `{conforms}` is true iff all three arrays are empty.
