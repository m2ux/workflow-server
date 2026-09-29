---
metadata:
  version: 1.5.0
---

## Capability

The run's single terminal record: what was delivered, what was decided, what stays open, and what the run itself taught.

## Inputs

### manifest_entries

The confirmed file manifest for this run — one entry per file to create, modify or remove, each with its path, its action and a one-line statement of the change.

### open_finding_count

Number of findings left on the decision surface at close-out.

### judgements_disposition

What the operator decided about the brief's open judgements. Empty when the brief left none open.

### coverage_ledger

One row per enumeration unit the criteria walk covered, each carrying its home, its anchor and its status.

### removals_approved

Whether the inventoried content removals were approved.

## Outputs

### completion_document

The close-out record: what the run delivered, links to where its decisions live, the scope outcome stated as exceptions only, the limitations and deferrals it leaves behind, and the retrospective on the run itself as a section rather than a separate document. Shaped by [Template](../../resources/completion-artifact.md#template).

#### artifact

`COMPLETE.md`

#### audience

`human`

## Protocol

### 1. State What Was Delivered

- Name the activities, techniques, resources, variables and rules the run produced or changed, concretely — where `{operation_type}` is `update`, framed as added, modified or removed against the prior version

### 2. Point at Where the Decisions Live

- Link the artifacts holding this run's decisions and record here only a decision made during drafting that has no other home

### 3. State the Scope Outcome and What Stays Open

- State delivery against `{manifest_entries}` as exceptions only: a manifest delivered exactly is one line, and rows appear only for drift
- Record the limitations and deferrals the run leaves behind, including any enumeration unit `{coverage_ledger}` shows as blocked, any finding left open by `{open_finding_count}`, any content preserved because `{removals_approved}` was withheld, and, where `{judgements_disposition}` records that the operator left the brief's judgements unresolved rather than settling them, every judgement the brief's Outcome column shows as still open — each named, so a reader learns which questions the run closed over

### 4. Record the Retrospective on the Run

- Record what the run itself taught, as a section of this document: what cost more than it should have, what a gate caught or missed, and what would change the next run
- Omit the section when nothing rises above noise

## Rules

### one-terminal-document

This is the run's only close-out artifact. There is no separate retrospective and no session summary beside it.

### link-rather-than-restate

Delivery, links and limitations — nothing here restates an artifact it links.
