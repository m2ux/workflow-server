---
metadata:
  version: 1.5.0
---

## Capability

Work package's single terminal close-out artifact — delivered work, coverage, limitations, and the open work its registers hold.

## Inputs

### is_review_mode

*(optional)* True when the run audited an external change; false or unset when it produced an implementation.

### finalized_adr

*(optional)* The ADR as accepted, with the implementation outcome recorded. Absent where the work package created no ADR.

### adr_document_path

*(optional)* Full filesystem path to the ADR. Absent where the work package created no ADR.

### finalized_test_plan

*(optional)* The test plan with each case linked to its test source file and line. Absent on a review run.

### follow_ups_register

The in-task follow-ups register, named by its bare filename.

#### default

`follow-ups.json`

### deferred_items_register

The out-of-scope deferrals register, named by its bare filename.

#### default

`deferred-items.json`

## Outputs

### completion_document

[Close-out summary](../../resources/complete-wp-guide.md#template) of delivered work, test coverage, and the open work its registers hold.

#### artifact

`COMPLETE.md`

#### audience

`human`

### completion_document_path

Path to the written close-out document, for user-facing links.

## Protocol

### 1. Create the Completion Document

- Create the `{completion_document}` at the `{planning_folder_path}` following the close-out [Template](../../resources/complete-wp-guide.md#template) — single terminal artifact; do not create separate session-summary, close-out-summary, or retrospective files. Emit its path as `{completion_document_path}`.

### 2. Summarise What Was Delivered

- Summarize what was delivered (2-3 sentences) and link the plan — do not restate its task list.  
   > When `{is_review_mode}` is true, the delivered thing is a verdict: name the audited PR in the header, state the verdict posted, and link the review summary.

### 3. Record Known Limitations

- Record known limitations — this document is their canonical home.

### 4. State Open Work

- Read `{follow_ups_register}` and `{deferred_items_register}` in `{planning_folder_path}` (shapes per the [follow-ups template](../../resources/follow-ups.md#template) and [deferred-items template](../../resources/deferred-items.md#template)), then write Open Work as one line per register that exists, carrying its open count, each open entry's ID and one-line item, and a link to each issue raised from it. Omit the section when neither register exists.

### 5. Link the Supporting Records

- Link `token-usage.md` for cost when it exists — one line, no figure restated.
- State the validation verdict in one line, and link the change-block index for files changed — link, don't copy the tables.
- Link the test plan for test coverage, from `{finalized_test_plan}`.
  > Omit the line where `{finalized_test_plan}` is absent.
- Link the ADR at `{adr_document_path}` by the decision title `{finalized_adr}` records.
  > Omit the line where `{adr_document_path}` is absent.

### 6. Report the Success Criteria

- Report success criteria exception-only: one line when all are met, rows only for divergences.
