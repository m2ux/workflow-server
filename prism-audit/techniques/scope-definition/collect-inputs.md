---
metadata:
  version: 1.0.0
---

## Capability

Extract the audit parameters — target path, audit description, and output path — from the user's request, deriving the output path from the target name and current date when the user did not specify one.

## Outputs

### target_path

Path to the codebase or directory to audit

### audit_description

User's description of what to audit, focus areas, and specific concerns

### output_path

Directory to write all audit artifacts, derived from the target name and current date when the user did not specify one

## Protocol

### 1. Collect Inputs

- Extract `{target_path}` from the user's request: the path to the codebase or directory to audit.
- Extract `{audit_description}` from the user's request: what to audit and any focus areas or specific concerns.
- Extract `{output_path}` from the user's request: the directory for all audit artifacts.
- If the user did not specify an output path, derive `{output_path}` from the target's base name and the current date.
