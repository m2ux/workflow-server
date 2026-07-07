---
metadata:
  version: 1.0.0
---

## Capability

Establish the audit's scope before analysis begins: collect the target, description, and output location from the user's request; validate that the target is an analysable codebase and gather its structural metadata; summarise the assembled scope for confirmation; and create the output directory. The operations in this set decompose that setup into the input-collection, target-validation, scope-summary, and output-folder phases.

## Inputs

### target_path

Path to the codebase or directory to audit

### audit_description

User's description of what to audit, focus areas, and specific concerns

### output_path

Directory to write all audit artifacts
