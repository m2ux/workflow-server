---
metadata:
  version: 1.0.0
---

## Capability

Create the completion document summarizing delivered work, test coverage, and deferred items.

## Inputs

### planning_folder_path

Path to the planning folder where the completion document is created.

## Output

### completion_document

[Summary](../../resources/complete-wp.md#section-guidelines) of delivered work, test coverage, and deferred items.

#### completion_artifact

`COMPLETE.md`

## Protocol

1. Create the `{completion_document}` at the `{planning_folder_path}`.
2. Summarize what was delivered.
3. Document what was tested and test coverage.
4. List deferred items and known limitations.
5. Follow the completion-document template in [complete-wp](../../resources/complete-wp.md).
