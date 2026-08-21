---
metadata:
  version: 2.0.0
---

## Capability

Turns a codebase into the self-contained audit prompt an analysis run works from, tailored to that codebase's architecture, language and risk exposure.

## Inputs

### security_characteristics

The security-relevant patterns the scan found, each `{ category, location, description, severity_relevance }`.

### total_loc

Total lines of code across the surveyed modules, excluding tests, docs, and generated files.

### trust_boundaries

Trust-boundary crossings, each `{ from_community, to_community, crossing_symbols }`. Empty where the target carries no index.

### security_blast_radii

Each security-critical symbol mapped to its blast radius `{ direct_callers, affected_processes, affected_modules, risk }`. Empty where the target carries no index.

## Outputs

### audit_prompt

The composed [audit prompt document](../../resources/audit-prompt-template.md#audit-prompt-template)

#### artifact

`audit-prompt.md`

#### audience

`human`

#### codebase_overview

Codebase architecture and structure

#### domains

Audit domains with risk levels and focus areas

#### cross_cutting

Cross-cutting security concerns

#### output_requirements

Expected deliverable format

### audit_scopes

Array of scope objects for triggering prism workflows

#### scopes

Array of `{ target, output_subdir, pipeline_mode, analysis_focus }`
