---
name: requirements-analysis-report
description: Structure for the analysis of requirement changes derived from a source document.
metadata:
  order: 2
---

# Requirements Analysis Report

The structure for the analysis of requirement changes derived from a source document — a meeting
transcript or an unstructured document. The report is a structured markdown document beginning directly
with the heading — no preamble.

## Template

```markdown
# Requirements Analysis Report

## Source
- **Source ID**: SRC-MTG### (meeting) or SRC-DOC### (document)
- **Source Type**: meeting | document
- **Title**: [meeting title or document title]
- **Attribution**: [participant initials for a meeting; author name for a document]
- **Source Path**: [path to the source document]
- **Analysis Date**: [date]

## Requirements Changes

### New Requirements
[Each new requirement to create: proposed REQ-ID, title, rationale, target section.]

### Updated Requirements
[Each existing requirement to modify: REQ-ID, change needed, rationale.]

### Deprecated Requirements
[Each requirement to deprecate: REQ-ID, rationale.]

## Source Coverage Matrix
| Source section | Normative? | Covered by |
|----------------|-----------|------------|
| [§n — title] | yes / no | REQ-ID(s), or "out of scope" |

## Document Updates Required
[Sections that need updating, including new source references for 2.2 Meeting Transcripts.]

## Quality Issues Identified
[Ambiguities, duplications, conflicts, or inconsistencies found.]

## Implementation Notes
[Additional context for applying the changes to the specification.]
```

## Source Coverage Matrix

The coverage matrix traces every source section to the requirement(s) it is covered by, so completeness
is verifiable. Each row records a source section, whether it carries a normative obligation, and the
requirement identifier(s) covering it; a section carrying no obligation is marked out of scope. What
counts as a normative obligation, and what makes a row a coverage gap, are defined in
[Source Coverage](./validation-rubric.md#source-coverage).

## Rules

- **Identifiers are reused where they apply.** Map each change to an existing requirement identifier where one applies; otherwise propose a new identifier within the correct category.
- **A source reference is listed under Document Updates Required.** Assign one for the document and list it there so it reaches the correct section — a meeting transcript (`SRC-MTG###`) to section 2.2, an unstructured document (`SRC-DOC###`, credited to its author) to section 2.5.
- **Each change is applicable without the source.** State it precisely enough to be applied without re-reading the source document.
- **Line budget:** ~120 lines. The source-coverage matrix is the payload; narrative about the source belongs in the intake record.
