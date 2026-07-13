---
metadata:
  version: 1.1.0
---

## Capability

Create the close-out document — the work package's single terminal artifact — summarizing delivered work, test coverage, and known limitations. There is no separate retrospective, session-summary, or close-out-summary artifact: the retrospective is written into this document by conduct-retrospective, and everything else is a link to its canonical artifact.

## Inputs

### planning_folder_path

Path to the planning folder where the completion document is created.

## Outputs

### completion_document

[Close-out summary](../../resources/complete-wp.md#template) of delivered work, test coverage, and deferred items.

#### artifact

`COMPLETE.md`

## Protocol

1. Create the `{completion_document}` at the `{planning_folder_path}` following the close-out template in [complete-wp](../../resources/complete-wp.md).
2. Summarize what was delivered (2-3 sentences) and link the plan — do not restate its task list.
3. Record known limitations — this document is their canonical home. Deferred items live in the [deferred-items register](../../resources/deferred-items.md); the Deferred Items section is one line linking the register (omit it when no register exists).
4. Link the validation artifact for test results and the change-block index for files changed — link, don't copy the tables.
5. Report success criteria exception-only: one line when all are met, rows only for divergences.
