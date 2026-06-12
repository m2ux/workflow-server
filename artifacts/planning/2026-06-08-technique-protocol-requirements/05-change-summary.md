# Change Summary — Technique Protocol Requirements

**Source**: SRC-DOC001 — Technique Protocol Specification (Mike Clay)
**Validation**: passed (1 correction pass — coverage augmentation closing GAP-1…GAP-9)
**Requirement count**: 30 (REQ-F001–F021, REQ-NF001–NF009)

## New Requirements
- REQ-F001: technique declares `metadata.version` + `## Capability`
- REQ-F002: a working technique declares a `## Protocol` of ordered step blocks
- REQ-F003: technique may declare `## Inputs` / `## Output` entries
- REQ-F004: persisted output declares its artifact filename in the interface, not in protocol prose
- REQ-F005: protocol steps are actions; constraints are rules or `>` notes
- REQ-F006: techniques live under `techniques/` as standalone / container / nested files
- REQ-F007: container `TECHNIQUE.md` declares shared inputs/outputs/rules, inherited by descendants
- REQ-F008: ancestor `Initial`/`Final` blocks wrap a descendant's protocol
- REQ-F009: every protocol reference resolves via its anchor form
- REQ-F010: protocol variables are declare-once (`{$name}` then `{name}`)
- REQ-F011: operation invocations use parentheses; braces are for designators
- REQ-F012: rules are cited by dotted symbol address
- REQ-F013: techniques validate against the schema before delivery; unresolved refs are defects
- REQ-NF001: symbols `snake_case`, names `kebab-case`
- REQ-NF002: booleans are affirmative predicates
- REQ-NF003: collections are plural item nouns; key-addressed maps are singular
- REQ-NF004: I/O ids are head-noun-last qualified phrases, no direction/representation
- REQ-NF005: rule names are positive declarative assertions
- REQ-NF006: code tokens backticked; literal `$` escaped in prose
- REQ-NF007: I/O descriptions are producer/consumer-agnostic
- REQ-NF008: resources do not name the techniques that use them
- REQ-F014: inputs may be optional and declare a `#### default`
- REQ-F015: a rule is declared at the smallest containment scope that covers it
- REQ-F016: a step's failure condition and recovery are stated inline
- REQ-F017: an unprefixed reference resolves current-workflow-first, then meta
- REQ-F018: a technique-local entry overrides an inherited ancestor entry
- REQ-F019: the workflow-root `TECHNIQUE` is inherited but excluded from the addressable list
- REQ-F020: `::` path grammar, including rule resolution and `<group>-*` expansion
- REQ-F021: a symbol may be declared in both `## Inputs` and `## Output` (input∩output)
- REQ-NF009: descriptions state what a construct is, not the step/activity sequence

## Updated Requirements
None (created from scratch).

## Deprecated Requirements
None.

## Sources Added
- SRC-DOC001: Technique Protocol Specification — Mike Clay

## Promotion
Final specification staged at: `.engineering/artifacts/planning/2026-06-08-technique-protocol-requirements/05-final-spec.md`
Promote to: `docs/technique-protocol-requirements.md`
