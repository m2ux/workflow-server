---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Plan and review each file in a per-file drafting pass: present the drafting approach before each file and present the drafted content for review afterward. The drafting and per-file schema validation themselves are performed via [toon-authoring](../toon-authoring.md).

## Protocol

### 1. Present File Approach

- Present the per-file drafting plan: the schema constructs to be used, the reference patterns to be followed, and the intended content structure
- Draft files in the confirmed order — `workflow.toon`, activities, techniques, resources, README — and use formal schema constructs for all structured information

### 2. Present for Review

- Present the drafted content for user review, highlighting the schema constructs used and notable design decisions
- In update mode, compare new content against existing content and surface any material being removed
