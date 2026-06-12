# Requirements Analysis Report

## Source
- **Source ID**: SRC-DOC001
- **Source Type**: document
- **Title**: Technique Protocol Specification (`docs/technique-protocol-specification.md`)
- **Attribution**: Mike Clay (author)
- **Source Path**: `docs/technique-protocol-specification.md`
- **Analysis Date**: 2026-06-08

## Requirements Changes

### New Requirements

Create-from-scratch: every requirement below is new, derived from the authoring rules the source
document states. Functional requirements (`REQ-F###`) govern what a conformant technique definition must
contain and do; non-functional requirements (`REQ-NF###`) govern naming, case, and formatting.

**Structure & interface (target §4.1)**
- REQ-F001 — The system SHALL require every technique to declare `metadata.version` in frontmatter and a single `## Capability` paragraph. *(§3.1, §9)*
- REQ-F002 — A technique that performs work SHALL declare a `## Protocol` consisting of one or more ordered step blocks. *(§3.3, §9)*
- REQ-F003 — A technique MAY declare `## Inputs` and `## Output` entries, each a `### <id>` with a description and optional `#### <member>` sub-sections. *(§3.2)*
- REQ-F004 — When an output is persisted, the technique SHALL declare its artifact filename under `#### artifact` as a literal or a `{token}`-template, never hardcoded in protocol prose. *(§3.2, §8)*
- REQ-F005 — A protocol step SHALL be an imperative action; a standing prohibition or invariant SHALL be a `## Rules` entry or a `>` note folded into the step it qualifies. *(§3.3, §3.4)*

**File layout & inheritance (target §4.2)**
- REQ-F006 — Techniques SHALL reside under a workflow's `techniques/` directory as a standalone `<id>.md`, a container `<group>/TECHNIQUE.md`, or a nested `<group>/<op>.md`. *(§2)*
- REQ-F007 — A container `TECHNIQUE.md` SHALL define Inputs, Outputs, and Rules shared by the techniques it contains, inherited by every descendant. *(§5)*
- REQ-F008 — Protocol blocks titled `Initial` and `Final` on an ancestor container SHALL wrap a descendant technique's own protocol, outermost ancestor first. *(§6)*

**References & invocation (target §4.3)**
- REQ-F009 — Every protocol reference SHALL resolve to a concrete target via its anchor form: input/output as `{id}`, rule as a dotted symbol address, technique/operation via a `::` hyperlink, resource via a markdown hyperlink. *(§4, §8)*
- REQ-F010 — A protocol variable SHALL be bound once as `{$name}` and read thereafter as `{name}`, scoped to a single protocol run. *(§3.3)*
- REQ-F011 — An operation invocation SHALL pass its argument list in parentheses attached to the operation reference; curly braces are reserved for designators. *(§4.2)*
- REQ-F012 — A rule SHALL be cited by its dotted symbol address (`[workflow.]technique.rule-name`), never as prose or with the `::` form. *(§4.1)*

**Validation (target §7)**
- REQ-F013 — The system SHALL validate every parsed technique against the technique schema before delivery and SHALL treat an unresolved `::` reference as a definition defect. *(§9)*

**Naming & formatting (target §5 — non-functional)**
- REQ-NF001 — Symbol ids (inputs, outputs, sub-fields, protocol variables) SHALL be `snake_case`; names (technique, operation, resource, and rule identities) SHALL be `kebab-case`. *(§3.2)*
- REQ-NF002 — A boolean symbol id SHALL be an affirmative predicate stating the condition that holds when true. *(§3.2 naming structure)*
- REQ-NF003 — A collection id SHALL be a plural item noun with no representation suffix; a key-addressed map SHALL be singular and name the mapping. *(§3.2)*
- REQ-NF004 — An input/output id SHALL be a qualified noun phrase with the head noun last, encoding neither direction nor representation. *(§3.2)*
- REQ-NF005 — A rule name SHALL be a positive declarative assertion of the invariant it guards. *(§3.4)*
- REQ-NF006 — Every literal code-like token in rendered prose SHALL be wrapped in backticks, and a literal `$` in prose SHALL be backslash-escaped. *(§3.3, §4.3)*
- REQ-NF007 — An input or output description SHALL describe what the value is and SHALL NOT name a workflow-internal producer or consumer. *(§8)*
- REQ-NF008 — A resource SHALL describe what it is and SHALL NOT name the technique that produces, consumes, or calls it. *(§8)*

### Updated Requirements
None — the target specification does not yet exist.

### Deprecated Requirements
None.

## Document Updates Required
- Instantiate the full specification protocol structure (§1–7) for a new document `technique-protocol-requirements.md`.
- Add `SRC-DOC001` (Mike Clay) to a new §2.5 Reference Documents.
- Create §4 Functional Requirements (REQ-F001–REQ-F013) and §5 Non-Functional Requirements (REQ-NF001–REQ-NF008), all at status `pending`, each sourced to `SRC-DOC001`.

## Quality Issues Identified
- The source is a specification of authoring rules, so several constraints are conventions rather than runtime behaviours; they are expressed as `SHALL` requirements on the *technique definition* (the artifact), which is the testable subject.
- Some rules are tightly coupled (e.g. backticking and `$`-escaping); grouped into single requirements where they share a subject to keep entries atomic.

## Implementation Notes
- Author attribution carried inline as `*Source*: SRC-DOC001 (Mike Clay)*` on each requirement and in the §2.5 listing per the specification protocol.
- Section mapping above is a suggestion for the update activity; identifiers are non-sequential-tolerant.
