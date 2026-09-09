---
metadata:
  version: 1.2.0
---

## Capability

Post-task self-review for symbol provenance and code/test/documentation quality — catches fabricated symbols early.

## Inputs

### current_task

The task just implemented (description, affected files) whose changes are under review

### project_type

*(optional)* The project type the target tree is detected as, scoping which of the review criteria apply.

### task_implementation

The code changes produced for `{current_task}` — the files changed and the approach taken

## Outputs

### has_uncertain_symbols

`true` when one or more symbols cannot be confirmed against the codebase, declared dependencies, or new symbols introduced by this task; `false` when every referenced symbol resolves cleanly

### uncertain_symbols

Multi-line list of uncertain symbols (one per line: symbol name + the file/line where it was seen). Empty string when `{has_uncertain_symbols}` is false.

## Protocol

### 1. Verify Symbol Provenance

- Enumerate every symbol `{task_implementation}` introduces or references, in code and in the documents it wrote — change files, architecture decision records, test plans included
- Establish each one's provenance per [Verification](../resources/symbol-provenance.md#verification), against the codebase, the declared dependencies, and the symbols `{current_task}` creates
- Populate `{uncertain_symbols}` with every symbol that does not resolve — one per line, with the file and line where it was seen. Set `{has_uncertain_symbols}` to `true` when that list is non-empty, otherwise `false` with an empty `{uncertain_symbols}`.

### 2. Run Quality Checks

- Assess the task's changes against the [Review Criteria](../resources/rust-substrate-code-review.md#review-criteria), scoped to what this task wrote. The architecture, documentation and testing criteria hold on any project; the Rust-idioms and Substrate-framework criteria hold where `{project_type}` is `rust-substrate`
- Record what the task leaves behind that the criteria name: debug output still in the tree, a TODO carrying no issue reference, a documented symbol with no implementation


## Rules

### documentation-reflects-code

Every symbol a document names exists in the code it describes, per [Provenance](../resources/symbol-provenance.md#provenance). A name that cannot be verified leaves `{has_uncertain_symbols}` true rather than standing on an assumption.

### assumptions-to-the-log

Assumptions surfaced during the task are recorded as rows in the [assumptions log](../resources/assumptions-review.md#assumptions-log-template) — including a null row when none arise, so the log shows the review ran. This review adds no per-task log sections of its own; symbol-verification failures surface through `{has_uncertain_symbols}`, not the log.
