---
metadata:
  version: 1.0.0
---

## Capability

Walk the ISO 24495-1 Annex B checklist against the final draft and record the disposition of every item, the last record before delivery.

## Inputs

### document_draft

The final draft the checklist is walked against.

### evaluation_report

The latest evaluation — its open issues must agree with the checklist's open items.

## Outputs

### iso_checklist

The completed checklist with every item's disposition, shaped by [Template](../../resources/iso-checklist.md#template).

#### artifact

`iso-checklist.md`

### checklist_complete

True when every checklist item carries a disposition.

## Protocol

### 1. Walk Every Item

- Walk each item of the [ISO 24495-1 checklist](../../resources/iso-checklist.md#template) against `{document_draft}` — against the document itself, not from memory of the guidelines

### 2. Dispose Each Item

- Mark each item met, or leave it open with a one-line reason — no item is skipped without a note, per [Rules](../../resources/iso-checklist.md#rules)

### 3. Reconcile with the Evaluation

- Confirm every open checklist item corresponds to an open issue in `{evaluation_report}` — the two records agree before the run closes

### 4. Record Completion

- Set `{checklist_complete}` true when every item carries a disposition and return the completed checklist as `{iso_checklist}`
