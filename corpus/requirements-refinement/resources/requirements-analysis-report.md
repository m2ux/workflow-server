---
name: requirements-analysis-report
description: Structure for the analysis of requirement changes derived from a set of source documents.
metadata:
  order: 2
---

# Requirements Analysis Report

The structure for the analysis of requirement changes derived from a set of source documents — meeting
transcripts and unstructured documents. The report is a structured markdown document beginning directly
with the heading — no preamble.

## Template

```markdown
# Requirements Analysis Report

## Sources
**Analysis Date**: [date]

One block per source document:

- **Source ID**: SRC-MTG### (meeting) or SRC-DOC### (document)
- **Title**: [meeting title or document title]
- **Attribution**: [participant initials for a meeting; author name for a document]
- **Source Path**: [path to the source document]

## Requirements Changes

### New Requirements
[Each new requirement to create: proposed REQ-ID, title, rationale, target section.]

### Updated Requirements
[Each existing requirement to modify: REQ-ID, change needed, rationale.]

### Deprecated Requirements
[Each requirement to deprecate: REQ-ID, rationale.]

## Source Coverage Matrix
| Source | Source section | Normative? | Covered by |
|--------|----------------|-----------|------------|
| SRC-ID | [§n — title] | yes / no | REQ-ID(s), or "out of scope" |

## Document Updates Required
[Sections that need updating, including one new source reference per source — to 2.2 Meeting Transcripts or 2.5 Reference Documents, as its type directs.]

## Quality Issues Identified
[Ambiguities, duplications, conflicts, or inconsistencies found.]

## Implementation Notes
[Additional context for applying the changes to the specification.]
```

## Source Coverage Matrix

The coverage matrix traces every section of every source to the requirement(s) it is covered by, so
completeness is verifiable across the whole set. Each row records the source it belongs to, the section
within that source, whether that section carries a normative obligation, and the requirement
identifier(s) covering it; a section carrying no obligation is marked out of scope. The source column is
what keeps one source's sections distinguishable from another's where two sources number their sections
alike. What counts as a normative obligation, and what makes a row a coverage gap, are defined in
[Source Coverage](./validation-rubric.md#source-coverage).

## Rules

- **Identifiers are reused where they apply.** Map each change to an existing requirement identifier where one applies; otherwise propose a new identifier within the correct category.
- **Every source gets its own reference under Document Updates Required.** Assign one per source document and list each there so it reaches the correct section — a meeting transcript (`SRC-MTG###`) to section 2.2, an unstructured document (`SRC-DOC###`, credited to its author) to section 2.5.
- **A change drawn from several sources cites each of them.** Where two sources bear on one requirement, list both references rather than picking the fuller one.
- **Each change is applicable without the sources.** State it precisely enough to be applied without re-reading any source document.
- **Line budget:** ~120 lines, whatever the size of the source set. The source-coverage matrix is the payload; narrative about the sources belongs in the intake record.
