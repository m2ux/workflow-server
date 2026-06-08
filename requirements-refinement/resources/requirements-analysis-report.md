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

## Document Updates Required
[Sections that need updating, including new source references for 2.2 Meeting Transcripts.]

## Quality Issues Identified
[Ambiguities, duplications, conflicts, or inconsistencies found.]

## Implementation Notes
[Additional context for applying the changes to the specification.]
```

## Conventions

- Map each change to an existing requirement identifier where one applies; otherwise propose a new
  identifier within the correct category.
- Assign a source reference for the document and list it under Document Updates Required so it is added
  to the correct section — a meeting transcript (`SRC-MTG###`) to section 2.2, an unstructured document
  (`SRC-DOC###`, credited to its author) to section 2.5.
- State each change precisely enough to be applied without re-reading the source document.
