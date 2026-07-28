---
metadata:
  version: 1.0.0
---

## Capability

The run's single terminal record: what was delivered, what was decided, what stays open, and what the run itself taught.

## Inputs

### operation_type

The classified operation for the request — create, update or review.

### scope_manifest

The confirmed file manifest for this run, against which delivery is stated.

### open_finding_count

Number of findings left on the decision surface at close-out.

### coverage_ledger

One row per enumeration unit the criteria walk covered, each carrying its home, its anchor and its status.

### removals_approved

Whether the inventoried content removals were approved.

## Outputs

### completion_document

The close-out record: what the run delivered, links to where its decisions live, the scope outcome stated as exceptions only, the limitations and deferrals it leaves behind, and the retrospective on the run itself as a section rather than a separate document. Shaped by [Template](../../resources/completion-artifact.md#template).

#### artifact

`COMPLETE.md`

## Protocol

### 1. State What Was Delivered

- Name the activities, techniques, resources, variables and rules the run produced or changed, concretely — on an update run framed as added, modified or removed against the prior version

### 2. Point at Where the Decisions Live

- Link the artifacts holding this run's decisions and record here only a decision made during drafting that has no other home

### 3. State the Scope Outcome and What Stays Open

- State delivery against `{scope_manifest}` as exceptions only: a manifest delivered exactly is one line, and rows appear only for drift
- Record the limitations and deferrals the run leaves behind, including any enumeration unit `{coverage_ledger}` shows as blocked, any finding left open by `{open_finding_count}`, and any content preserved because `{removals_approved}` was withheld

### 4. Record the Retrospective on the Run

- Record what the run itself taught, as a section of this document: what cost more than it should have, what a gate caught or missed, and what would change the next run
- Omit the section when nothing rises above noise

## Rules

### one-terminal-document

This is the run's only close-out artifact. There is no separate retrospective and no session summary beside it: a second terminal document splits the record a reader has to find.

### link-rather-than-restate

Delivery, links and limitations — nothing here restates an artifact it links. A close-out that reprints the decisions is the artifact that goes stale first.
