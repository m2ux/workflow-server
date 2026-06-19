---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Assess the impact of proposed changes against an existing workflow: enumerate its files, classify each file's impact, verify transition-chain and reference integrity, and flag content being removed for explicit confirmation.

## Protocol

### 1. Enumerate Files

- Build a full inventory of the target workflow's files (`workflow.yaml`, activities, techniques, resources, `README.md`) with paths and purposes

### 2. Classify Impact

- Classify each file as unaffected, directly modified, indirectly affected, or removed, with justification

### 3. Check Integrity

- Verify transition-chain integrity across added/removed/reordered activities, reporting any broken `to` references
- Verify reference integrity for technique (primary/supporting) and resource references, reporting any orphaned references

### 4. Flag Removals

- Inventory the material being removed across modified files (diff-based) and surface it for explicit user confirmation
