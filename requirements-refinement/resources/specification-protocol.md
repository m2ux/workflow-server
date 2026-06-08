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

Each requirement is a four-part entry, with a blank line between the title and each field and between
fields:

```markdown
**REQ-ID: The system SHALL/SHOULD/MAY [atomic, testable requirement statement]**

*Status*: *status value*

*Rationale*: explanation of why the requirement exists and any relevant design context

*Source*: source reference
```

The statement uses the keyword `SHALL` (mandatory), `SHOULD` (recommended), or `MAY` (optional), and
is atomic, testable, and unambiguous.

## Status Conventions

Permitted status values: `pending`, `under review`, `accepted`, `deprecated`.

- A newly added requirement takes status `pending`. The value `new` is not used.
- A status change away from `pending` follows explicit confirmation during requirements review.
- A retired requirement takes status `deprecated` rather than being deleted.

## Source Reference Format

Requirements, constraints, and success criteria cite their sources as:

```
*Source: [Source ID] - [specific section or requirement]*
```

When a requirement originates from a specific discussion within a meeting, participant initials MAY be
included for attribution; when it originates from a reference document, the document's author is
included for attribution:

```
*Source: [Source ID] (Initials)*
*Source: [Source ID] (Author Name)*
```

Examples:

- `*Source*: SRC-PRD001 - Core Features (P0) functional requirements`
- `*Source*: SRC-MTG006 (PW, MC)`
- `*Source*: SRC-DOC001 (Jane Doe)`

A requirement may cite multiple comma-separated sources: `*Source*: SRC-PRD001, SRC-MTG005, SRC-DOC001`.

## Reference Documents

An unstructured reference document (a proposal, brief, email, or similar) is recorded under section 2.5
with an `SRC-DOC###` reference and credited to its author, mirroring the meeting-transcript listing:

```
**SRC-DOC###**: [Document Title](path/to/document) — Author Name
```

Example: `**SRC-DOC001**: [Cross-chain settlement brief](sources/documents/settlement-brief.md) — Jane Doe`
