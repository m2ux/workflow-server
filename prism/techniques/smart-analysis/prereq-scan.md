---
metadata:
  version: 1.1.0
---

## Capability

Run the prerequisite scan over the target and extract atomic questions for knowledge fill

## Outputs

### prereq_scan

Prerequisite scan of the target, with the atomic questions knowledge fill answers.

#### artifact

`smart-prereq.md`

#### audience

`human`

## Protocol

### 1. Prereq Scan

- Dispatch [prereq](../../resources/prereq.md) over `{target_content}` to a fresh worker, writing `{prereq_scan}` into `{output_path}`
- Extract atomic questions from output for knowledge fill
