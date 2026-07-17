---
metadata:
  version: 1.0.0
---

## Capability

Author a two-paragraph, plain-language overview suitable for non-technical stakeholders and write it into a named section of the planning folder README — reusable at any call-site by varying the section heading and source material.

## Inputs

### source_material

The basis for the overview — issue details, ticket description, work-package plan, test plan, design decisions, and any context gathered upstream.

### readme_section_heading

The README section to write into (e.g. `## Problem Overview`, `## Solution Overview`). The overview replaces the placeholder text under this heading.

### planning_folder_path

Path to the planning folder whose `README.md` holds the section.

## Outputs

### stakeholder_overview

The two-paragraph plain-language overview written under `{readme_section_heading}` in the planning folder README.

## Protocol

1. Synthesize a plain-language overview from `{source_material}`.
2. Write exactly two paragraphs in simple, accessible language suitable for non-technical stakeholders; do not use jargon without explanation.
3. Frame the first paragraph as the situation or what the work does, and the second paragraph as the consequences or guarantees — what matters and why — tailoring the framing to `{readme_section_heading}` and `{source_material}`.
4. Write it into `{planning_folder_path}`/`README.md` by replacing the placeholder text under the `{readme_section_heading}` section, and emit `{stakeholder_overview}` as the bindable overview text.

## Rules

### two-paragraphs-plain-language

Exactly two paragraphs, accessible to a non-technical reader, no unexplained jargon — the overview is stakeholder-facing reference, not an engineering description.

### section-heading-is-an-input

The target README section is supplied via `{readme_section_heading}`; the technique does not hardcode a heading, so it serves every call-site uniformly.
