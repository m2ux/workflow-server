---
metadata:
  version: 1.0.0
---

## Capability

Evaluate a draft against the four principles as its reader would, recording the per-principle verdict and the open issues that gate delivery.

## Inputs

### document_draft

The draft to evaluate.

### document_profile

The settled reader, purpose, and context the draft is evaluated against.

### revision_round

*(optional)* The evaluation round this is — the first pass is round 0.

## Outputs

### evaluation_report

The per-principle verdict and the open-issue list, shaped by [Template](../../resources/evaluation-report.md#template).

#### artifact

`evaluation-report.md`

### open_issue_count

Number of evaluation issues still open against this draft.

### needs_revision

True when any open issue sends the draft back for another pass; false when every principle is met.

## Protocol

### 1. Reread as the Reader

- Reread `{document_draft}` with the readers' understanding, purpose, and context from `{document_profile}` in mind — the profile governs the verdict, not the writer's sense of the prose

### 2. Verdict Each Principle

- Assign each of the four principles a verdict per [Usability](../../resources/plain-language-standard.md#usability) and the guidelines it cites — relevant, findable, understandable, usable — naming the guidelines that carry each verdict per [Verdict by principle](../../resources/evaluation-report.md#template)

### 3. Record the Open Issues

- Record each failure as an open issue with its location, principle, the problem the reader hits, and the fix — per [Open issues](../../resources/evaluation-report.md#template) — so the revision pass has no interpretation to redo

### 4. Set the Revision Signal

- Set `{open_issue_count}` to the number of open issues and `{needs_revision}` true when any remain, false when every principle is met
