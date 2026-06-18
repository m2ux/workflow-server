---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
---

## Capability

Run the prerequisite scan over the target and extract atomic questions for knowledge fill

## Protocol

### 1. Prereq Scan

- Dispatch [prereq](../../resources/prereq.md) over `{target_content}` to a fresh worker, writing `{smart_result.prereq_path}` into `{output_path}`
- Extract atomic questions from output for knowledge fill
