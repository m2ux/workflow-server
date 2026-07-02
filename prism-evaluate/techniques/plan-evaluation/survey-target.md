---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Survey the target's structure, claims, and key topics — inventorying documents or modules and capturing a scope summary — to inform each dimension's analysis focus.

## Outputs

### structure_inventory

Sections or modules with their sizes, inventoried from the survey.

### key_topics

The target's key topics, claims, and structural highlights discovered during the survey.

### target_summary

A summary of the target's scope, goals, and major content.

## Protocol

- List the files and directories at the top level of `{target_path}`.  
  > When `{target_path}` holds no analysable files, confirm the path is correct and check whether the target lives elsewhere before continuing.
- For `codebase` (and the code half of `mixed`) targets, apply the structure survey defined in prism's [plan-analysis](../../../prism/techniques/plan-analysis.md) technique — build-system detection, module/package enumeration, per-module LOC, test-directory location, and the GitNexus functional-area/community-cluster survey (`gitnexus-operations::verify-index` then `query`). That method lives in plan-analysis and is not restated here, so both workflows survey code identically.
- For `document` / `document-set` (and the document half of `mixed`) targets — which prism's code-oriented survey does not cover — inventory the documents, their topics, structure, and cross-references, and note total word or section count. For proposal documents, identify the major sections, stated goals, key claims, architectural decisions, resource assumptions, and timeline commitments.
- Read enough of the target to understand its scope, key topics, claims, and structure.
- Capture `{target_summary}`, `{structure_inventory}` (sections or modules with sizes), and `{key_topics}`.
