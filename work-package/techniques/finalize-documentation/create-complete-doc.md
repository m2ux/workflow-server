---
metadata:
  version: 1.4.0
---

## Capability

Work package's single terminal close-out artifact — delivered work, coverage, limitations, and pointers to the registers that hold open work; retrospective inlined by conduct-retrospective, else link-only to canonical homes.

## Inputs

### is_review_mode

*(optional)* True when the run audited an external change; false or unset when it produced an implementation.

### finalized_adr

*(optional)* The ADR as accepted, with the implementation outcome recorded — absent when the work package created no ADR.

### finalized_test_plan

*(optional)* The test plan with each case linked to its test source file and line.

### documented_apis

*(optional)* The public APIs in the diff that the documentation pass covered.

## Outputs

### completion_document

[Close-out summary](../../resources/complete-wp-guide.md#template) of delivered work, test coverage, and pointers to the open-work registers.

#### artifact

`COMPLETE.md`

#### audience

`human`

### completion_document_path

Path to the written close-out document, for user-facing links.

## Protocol

1. Create the `{completion_document}` at the `{planning_folder_path}` following the close-out [Template](../../resources/complete-wp-guide.md#template) — single terminal artifact; do not create separate session-summary, close-out-summary, or retrospective files (retrospective is inlined later by conduct-retrospective, or omitted per that group's skip rule). Emit its path as `{completion_document_path}`.
2. Summarize what was delivered (2-3 sentences) and link the plan — do not restate its task list.  
   > When `{is_review_mode}` is true, the delivered thing is a verdict: name the audited PR in the header, state the verdict posted, and link the review summary.
3. Record known limitations — this document is their canonical home.
4. Read the in-task follow-ups register and the out-of-scope deferred-items register (shapes per the [follow-ups template](../../resources/follow-ups.md#template) and [deferred-items template](../../resources/deferred-items.md#template)), then write Open Work as one link line per register that exists, carrying each register's open count and nothing else. Omit the section when neither register exists.
   > Work still open at close-out and held by no register row goes to the register that owns it first — in-task to follow-ups, out-of-scope to deferred-items, creating that register when this is its first row — and Open Work links it like any other. Writing it into the close-out instead is the second home the guide forbids, and it is the one place where the alternative to a register row is silence.
5. Link `token-usage.md` for cost when it exists — one line, no figure restated.
6. Link the validation artifact for test results and the change-block index for files changed — link, don't copy the tables.
7. Report success criteria exception-only: one line when all are met, rows only for divergences.
