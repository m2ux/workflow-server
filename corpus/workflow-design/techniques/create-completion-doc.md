---
metadata:
  version: 1.2.0
---

## Capability

Design-session close-out document, carrying the session retrospective as its section.

## Inputs

### manifest_entries

The confirmed file manifest for this run — one entry per file to create, modify or remove, each with its path, its action and a one-line statement of the change.

### retrospective_document

*(optional)* The session retrospective, as the close-out document's `## Workflow Retrospective` section. Absent or empty for a trivial session.

## Outputs

### completion_document

[Completion summary](../resources/completion-artifact.md#template): what was delivered, links to decisions/assumptions, scope outcome, known limitations, and the session retrospective.

#### artifact

`COMPLETE.md`

#### audience

`human`

## Protocol

### 1. Summarize Delivery

- Summarize what the session delivered: when `{operation_type}` is `create`, the workflow created; when `update`, the activities, techniques, and resources changed on the existing workflow

### 2. Link Design Decisions

- Link the design specification and the assumptions log — do not restate design-decision / alternatives essays in `{completion_document}`
- Record here only decisions made during drafting that have no other home

### 3. Note Drift And Limitations

- Compare delivered files against the confirmed `{manifest_entries}` and note any drift; list known limitations and deferred follow-ups

### 4. Assemble Completion Document

- Assemble `{completion_document}` at the shape [Template](../resources/completion-artifact.md#template) declares, under its [Rules](../resources/completion-artifact.md#rules), with `{retrospective_document}` as its `## Workflow Retrospective` section when present
