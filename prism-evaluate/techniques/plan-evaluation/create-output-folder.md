---
metadata:
  version: 1.0.0
---

## Capability

Create the evaluation output directory, materialising `{evaluation_output_path}` when it does not already exist so subsequent activities can write artifacts into it.

## Protocol

### 1. Create Output Folder

- Run `mkdir -p {evaluation_output_path}` to create the output directory when it does not already exist.
- Verify the directory exists and is writable before proceeding.
