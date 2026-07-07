---
metadata:
  version: 1.1.0
---

## Capability

Analyse a codebase to identify security-relevant characteristics, map its trust boundaries and audit domains, and compose a detailed, self-contained audit prompt tailored to its architecture, language, and risk profile. The operations in this set decompose that work into the survey, characteristic-scan, trust-boundary, domain-mapping, cross-cutting, prompt-composition, and scope-building phases.

## Inputs

### target_path

Path to the codebase or directory to audit

### audit_description

User's description of what to audit, focus areas, and specific concerns

### output_path

Directory to write the audit prompt artifact

### total_loc

Total lines of code across the surveyed modules, excluding tests, docs, and generated files.

### trust_boundaries

Array of trust-boundary crossings, each `{ from_community, to_community, crossing_symbols }`; absent when GitNexus is unavailable.

### security_blast_radii

Map of each security-critical symbol to its blast radius `{ direct_callers, affected_processes, affected_modules, risk }`; absent when GitNexus is unavailable.

## Outputs

### audit_prompt

The composed [audit prompt document](../../resources/audit-prompt-template.md#audit-prompt-template)

#### artifact

`audit-prompt.md`

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
