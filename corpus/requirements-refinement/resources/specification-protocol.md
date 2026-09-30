---
name: specification-protocol
description: The canonical specification layout preserved verbatim: section structure, identifier schemes, requirement-entry format, status conventions, final specification form, and source-reference format.
metadata:
  order: 1
---

# Specification Protocol

The canonical layout and conventions a requirements specification follows. This protocol is preserved
verbatim when augmenting an existing specification, and instantiated in full when creating one from
scratch.

## Section Structure

A specification is organized into these top-level sections, in order:

1. **Executive Summary** — the purpose of the system. The requirements define its scope, so this section carries no scope statement.
2. **Requirements Sources** — the documents and discussions requirements derive from:
   - 2.1 Product and Solution Documents
   - 2.2 Meeting Transcripts
   - 2.3 Vendor Documents
   - 2.4 Source Reference Format
   - 2.5 Reference Documents
3. **Use Case Definition** — primary use case, personas, user journey, key success criteria.
4. **Functional Requirements** — capabilities the system provides, grouped into domain subsections.
5. **Non-Functional Requirements** — architectural, operational, security, and governance constraints, grouped into subsections.
6. **Performance Requirements** — throughput, latency, and capacity targets.
7. **Project and Process Requirements** — delivery, process, and project-level requirements.

Section 2.4 carries the two lines the [Template](#template) gives it, and
[Source Reference Format](#source-reference-format) holds the full form.

When augmenting, the existing section set and ordering are retained; new material is added under the
matching section.

## Template

```markdown
# {System name} Requirements Specification

## 1. Executive Summary

{The purpose of the system.}

## 2. Requirements Sources

### 2.1 Product and Solution Documents

### 2.2 Meeting Transcripts

### 2.3 Vendor Documents

### 2.4 Source Reference Format

- Each cited source is a markdown hyperlink to the file listed for it in section 2.
- Participant initials may follow the list.

### 2.5 Reference Documents

## 3. Use Case Definition

## 4. Functional Requirements

## 5. Non-Functional Requirements

## 6. Performance Requirements

## 7. Project and Process Requirements
```

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

Each requirement and success criterion is an entry of a title, a rationale, an optional note, and a
status line, in that order, with a blank line between parts.

```markdown
**REQ-F013: When component is empty, the system SHALL infer component:* from title or repo, then apply the in-scope filter**

Empty component is common on stubs. Inference is how the in-scope filter still runs. [[1](../.engineering/artifacts/meetings/2026-04-12-planning.md#001412), [2](../.engineering/artifacts/documents/stubs.pdf), [3](filter.md#in-scope)]

> The sources do not state which repositories count as in scope.

Status: pending
```

The title is the identifier and the atomic, testable statement, in bold. It carries no priority tag:
delivery priority and timing belong to planning. The statement uses the keyword `SHALL` (mandatory),
`SHOULD` (recommended), or `MAY` (optional).

The unlabeled paragraph under the title is the rationale: the reason the requirement exists and any
relevant design context, in plain words. It never reproduces a source's wording, including a
speaker-attributed form such as `SP: "…"`. The rationale ends with the source list
[Source Reference Format](#source-reference-format) requires.

The note is a plain quote block, with no admonition marker such as `[!NOTE]`. It states what the
sources leave open or undecided about the requirement, and the entry omits it when they leave nothing
open. The rationale carries no such statement.

The status line carries a value from [Status Conventions](#status-conventions).
[Final Specification Form](#final-specification-form) places it on the title.

## Status Conventions

| Status | Icon | Meaning |
|--------|------|---------|
| `pending` | 🕒 | Recorded from the sources, not yet reviewed |
| `under review` | 💬 | In discussion, not yet settled |
| `accepted` | ✅ | Confirmed at review |
| `deprecated` | 🗑️ | Retired, kept for history |

- A newly added requirement takes status `pending`. The value `new` is not used.
- A status change away from `pending` follows explicit confirmation during requirements review.
- A retired requirement takes status `deprecated` rather than being deleted.

## Final Specification Form

The final specification carries each entry's status as its icon from
[Status Conventions](#status-conventions), opening the title, and the entry has no status line:

```markdown
🕒 **REQ-F013: When component is empty, the system SHALL infer component:* from title or repo, then apply the in-scope filter**
```

The final specification closes with the status key after a rule, giving each icon and status in
[Status Conventions](#status-conventions) order:

```markdown
---

*Status: 🕒 pending · 💬 under review · ✅ accepted · 🗑️ deprecated*
```

A working specification carries the status line and no key.

## Source Reference Format

Each cited source is a markdown hyperlink. The href is the path to the file recorded for that
reference in section 2, relative to the folder of the target specification.

- A meeting transcript is its copy in the engineering artifacts' `meetings` folder, beside `planning`,
  redacted per [transcript-redaction](./transcript-redaction.md).
- A document from outside the repository is its copy in the `documents` folder beside it. A document
  inside the repository is the file where it sits.
- When the source is markdown, the href includes the fragment of the nearest heading above the
  derived passage — for a transcript, the timestamp heading. When the source is not markdown, the href
  is the file alone.

Section 2.2 lists each transcript, and section 2.5 each document, by a link to that same file.

On a requirement, citations appear at the end of the rationale as a square-bracketed list of those
hyperlinks. The link text is the source's 1-based index in that list, never a timestamp. Numbering is
local to the list: every requirement's first source is `1`.

```markdown
[[1](../.engineering/artifacts/meetings/2026-04-12-planning.md#000203), [2](../.engineering/artifacts/meetings/2026-04-12-planning.md#000732), [3](filter.md#in-scope)]
```

When a requirement originates from a specific discussion within a meeting, participant initials MAY
follow the list; when it originates from a reference document, the document's author MAY follow the
list:

```markdown
[[1](../.engineering/artifacts/meetings/2026-04-12-planning.md#000732)] (PW, MC)
[[1](../.engineering/artifacts/documents/settlement-brief.pdf)] (Jane Doe)
```

## Reference Documents

An unstructured reference document (a proposal, brief, email, or similar) is recorded under section 2.5
with an `SRC-DOC###` reference and credited to its author, mirroring the meeting-transcript listing:

```
**SRC-DOC###**: [Document Title](path/to/document) — Author Name
```

Example: `**SRC-DOC001**: [Cross-chain settlement brief](../.engineering/artifacts/documents/settlement-brief.md) — Jane Doe`

## Rules

- **Line budget:** ~15 lines per requirement entry. The specification grows with its requirements, so the ceiling is per entry rather than per file.
