---
name: specification-protocol
description: The canonical specification layout preserved verbatim: section structure, identifier schemes, requirement-entry format, status conventions, and source-reference format.
metadata:
  order: 1
---

# Specification Protocol

The canonical layout and conventions a requirements specification follows. This protocol is preserved
verbatim when augmenting an existing specification, and instantiated in full when creating one from
scratch.

## Section Structure

A specification is organized into these top-level sections, in order:

1. **Executive Summary** — purpose and scope of the system.
2. **Requirements Sources** — the documents and discussions requirements derive from:
   - 2.1 Product and Solution Documents
   - 2.2 Meeting Transcripts
   - 2.3 Vendor Documents
   - 2.4 Source Reference Format
   - 2.5 Reference Documents
3. **Use Case Definition** — primary use case, personas, user journey, key success criteria.
4. **Functional Requirements** — capabilities the system provides, grouped into domain subsections with priority tags (`P0`, `P1`, …).
5. **Non-Functional Requirements** — architectural, operational, security, and governance constraints, grouped into subsections.
6. **Performance Requirements** — throughput, latency, and capacity targets.
7. **Project and Process Requirements** — delivery, process, and project-level requirements.

When augmenting, the existing section set and ordering are retained; new material is added under the
matching section.

## Identifier Schemes

| Entity | Identifier | Example |
|--------|-----------|---------|
| Product/solution source | `SRC-PRD###` | `SRC-PRD001` |
| Meeting transcript source | `SRC-MTG###` | `SRC-MTG004` |
| Vendor document source | `SRC-VDR###` | `SRC-VDR001` |
| Reference (unstructured) document source | `SRC-DOC###` | `SRC-DOC001` |
| Functional requirement | `REQ-F###` | `REQ-F012` |
| Non-functional requirement | `REQ-NF###` | `REQ-NF007` |
| Success criterion | `SUCCESS-###` | `SUCCESS-005` |

Identifiers are unique and never reused. Numbering need not be contiguous — a gap is not a defect.
Each new requirement takes the next available number within its category.

## Requirement Entry Format

Each requirement is a three-part entry, with a blank line between the title and the rationale and
between the rationale and Status, in this order: title, rationale, Status.

```markdown
**REQ-F013: When component is empty, the system SHALL infer component:* from title or repo, then apply the in-scope filter**

Empty component is common on stubs. Inference is how the in-scope filter still runs. [[1](meetings/planning.md#component-scope), [2](briefs/stubs.pdf), [3](notes/filter.md#in-scope)]

Status: pending
```

The title is the identifier and the atomic, testable statement, in bold. The statement uses the keyword
`SHALL` (mandatory), `SHOULD` (recommended), or `MAY` (optional).

The unlabeled paragraph under the title is the rationale: why the requirement exists and any relevant
design context. The rationale ends with the source list [Source Reference Format](#source-reference-format)
requires.

## Status Conventions

Permitted status values: `pending`, `under review`, `accepted`, `deprecated`.

- A newly added requirement takes status `pending`. The value `new` is not used.
- A status change away from `pending` follows explicit confirmation during requirements review.
- A retired requirement takes status `deprecated` rather than being deleted.

## Source Reference Format

Each cited source is a markdown hyperlink. The href is the source file recorded for that reference in
section 2.

- When the source is markdown, the href includes the fragment of the nearest heading above the
  derived passage — the nearest linkable position in that file.
- When the source is not markdown, the href is the file alone.

On a requirement, citations appear at the end of the rationale as a square-bracketed list of those
hyperlinks. The link text is the source's 1-based index in that list. Numbering is local to the list:
every requirement's first source is `1`.

```markdown
[[1](meetings/planning.md#component-scope), [2](briefs/stubs.pdf), [3](notes/filter.md#in-scope)]
```

When a requirement originates from a specific discussion within a meeting, participant initials MAY
follow the list; when it originates from a reference document, the document's author MAY follow the
list:

```markdown
[[1](meetings/2026-04-12.md#scope)] (PW, MC)
[[1](briefs/settlement.pdf)] (Jane Doe)
```

## Reference Documents

An unstructured reference document (a proposal, brief, email, or similar) is recorded under section 2.5
with an `SRC-DOC###` reference and credited to its author, mirroring the meeting-transcript listing:

```
**SRC-DOC###**: [Document Title](path/to/document) — Author Name
```

Example: `**SRC-DOC001**: [Cross-chain settlement brief](sources/documents/settlement-brief.md) — Jane Doe`

## Rules

- **Line budget:** ~15 lines per requirement entry. The specification grows with its requirements, so the ceiling is per entry rather than per file.
