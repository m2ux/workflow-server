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
- For `document` / `document-set` targets, inventory the documents, their topics, structure, and cross-references, and note total word or section count.
- For `codebase` targets, identify the build system, enumerate modules and packages, count lines of code per module, and locate test directories.
- For `mixed` targets, apply both the document and the code survey.
- For `codebase` targets when GitNexus has indexed the target ([gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../../meta/techniques/gitnexus-operations/verify-index.md)), discover functional areas and community clusters via [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../../meta/techniques/gitnexus-operations/query.md) for module classification.
- Read enough of the target to understand its scope, key topics, claims, and structure; for proposal documents, identify the major sections, stated goals, key claims, architectural decisions, resource assumptions, and timeline commitments.
- Capture `{target_summary}`, `{structure_inventory}` (sections or modules with sizes), and `{key_topics}`.
