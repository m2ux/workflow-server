# Technique Protocol — System Requirements

## 1. Executive Summary

This specification defines the requirements a workflow-server **technique definition** must satisfy to
be well-formed, addressable, and deliverable. It is derived from the Technique Protocol Specification
and governs the structure, interface, references, naming, and validation of technique files within the
`Goal → Activity → Technique → Tools` model.

## 2. Requirements Sources

### 2.1 Product and Solution Documents

None.

### 2.2 Meeting Transcripts

None.

### 2.3 Vendor Documents

None.

### 2.4 Source Reference Format

Requirements cite their sources as *Source: [Source ID] - [specific section or requirement]*. When a
requirement originates from a reference document, the document's author is included for attribution in
the format *Source: [Source ID] (Author Name)*.

### 2.5 Reference Documents

**SRC-DOC001**: [Technique Protocol Specification](technique-protocol-specification.md) — Mike Clay

## 3. Use Case Definition

**Primary Use Case**: An author writes or maintains a technique definition; the workflow server parses,
validates, composes, and delivers it to an agent. A conformant technique definition loads without
error, resolves all its references, and presents a clear capability, interface, and procedure.

**Key User Personas**:
- *Workflow authors*: write techniques that pass schema validation and the anti-pattern audit on the first attempt.
- *Agents*: receive techniques whose protocol references resolve unambiguously to inputs, outputs, rules, techniques, and resources.

## 4. Functional Requirements

This section defines what a conformant technique definition must contain and do.

### 4.1 Structure and Interface

**REQ-F001: The system SHALL require every technique to declare a `metadata.version` in frontmatter and a single `## Capability` paragraph.**

*Status*: *pending*

*Rationale*: The version identifies the technique revision and the capability states what the technique does; both are mandatory for a parseable, deliverable technique.

*Source*: SRC-DOC001 (Mike Clay) - §3.1, §9

**REQ-F002: The system SHALL require a technique that performs work to declare a `## Protocol` of one or more ordered step blocks.**

*Status*: *pending*

*Rationale*: The protocol is the procedure an agent executes; a working technique without it has no actionable content.

*Source*: SRC-DOC001 (Mike Clay) - §3.3, §9

**REQ-F003: The system SHALL allow a technique to declare `## Inputs` and `## Output` entries, each a named entry with a description and optional sub-section members.**

*Status*: *pending*

*Rationale*: Typed inputs and outputs form the technique's interface for deterministic chaining and binding.

*Source*: SRC-DOC001 (Mike Clay) - §3.2

**REQ-F004: The system SHALL require a persisted output to declare its artifact filename under an `#### artifact` member as a literal or a token-template, and SHALL NOT permit that filename to be hardcoded in protocol prose.**

*Status*: *pending*

*Rationale*: Keeping the artifact name in the interface declaration makes the I/O contract the single source of truth and keeps the technique reusable.

*Source*: SRC-DOC001 (Mike Clay) - §3.2, §8

**REQ-F005: The system SHALL require each protocol step to be an imperative action, and SHALL require a standing prohibition or invariant to be expressed as a rule or a blockquote note rather than a step.**

*Status*: *pending*

*Rationale*: Separating actions from constraints keeps the procedure executable and prevents the parser from flattening a caveat into a disconnected step.

*Source*: SRC-DOC001 (Mike Clay) - §3.3, §3.4

**REQ-F014: The system SHALL allow an input to be marked optional and to declare a default value that is applied when the input is not supplied.**

*Status*: *pending*

*Rationale*: Optional inputs with defaults let a technique operate when a caller omits a non-essential value, keeping the interface tolerant.

*Source*: SRC-DOC001 (Mike Clay) - §3.2

**REQ-F015: The system SHALL require a rule to be declared at the smallest containment scope that covers everything it governs — inline in a step when step-specific, on the common container when shared by sibling techniques, and on the child when it governs only that child.**

*Status*: *pending*

*Rationale*: Scoping a rule to its smallest covering container avoids cross-level duplication and the silent drift it causes.

*Source*: SRC-DOC001 (Mike Clay) - §3.4, §8

**REQ-F016: The system SHALL require a step's failure condition and recovery to be stated inline within that step, naming any recovery technique inline.**

*Status*: *pending*

*Rationale*: Co-locating error handling with the action that can fail keeps recovery discoverable and avoids a separate error section that drifts from the steps it covers.

*Source*: SRC-DOC001 (Mike Clay) - §3.5

**REQ-F021: The system SHALL allow a symbol to be declared in both `## Inputs` and `## Output`, denoting a value that arrives populated when a caller supplies it and is exposed at the technique's surface on completion.**

*Status*: *pending*

*Rationale*: The input∩output form models an idempotent receive-or-compute resolver and lets a produced-then-consumed value be hoisted to a common ancestor.

*Source*: SRC-DOC001 (Mike Clay) - §3.2

### 4.2 File Layout and Inheritance

**REQ-F006: The system SHALL require techniques to reside under a workflow's `techniques/` directory as a standalone file, a container `TECHNIQUE.md`, or a nested operation file.**

*Status*: *pending*

*Rationale*: A fixed layout lets the loader resolve an identifier to its file and a container to its children.

*Source*: SRC-DOC001 (Mike Clay) - §2

**REQ-F007: The system SHALL require a container `TECHNIQUE.md` to define the inputs, outputs, and rules shared by the techniques it contains, and SHALL deliver them to every descendant by inheritance.**

*Status*: *pending*

*Rationale*: Shared contract declared once on the common ancestor avoids per-technique duplication and drift.

*Source*: SRC-DOC001 (Mike Clay) - §5

**REQ-F008: The system SHALL wrap a descendant technique's protocol with each ancestor container's `Initial` and `Final` blocks, outermost ancestor first.**

*Status*: *pending*

*Rationale*: Initial/Final wrapping lets a container contribute setup and teardown around every descendant's procedure.

*Source*: SRC-DOC001 (Mike Clay) - §6

**REQ-F018: The system SHALL give a technique-local input, output, or rule precedence over an inherited ancestor entry of the same identifier or name.**

*Status*: *pending*

*Rationale*: Local override lets a technique specialise inherited contract without editing the ancestor.

*Source*: SRC-DOC001 (Mike Clay) - §5

**REQ-F019: The system SHALL treat the workflow-root `TECHNIQUE` as the ancestor of every technique in its workflow and SHALL exclude it from the addressable technique list.**

*Status*: *pending*

*Rationale*: The root technique carries shared contract rather than an invocable capability, so it is inherited but never addressed directly.

*Source*: SRC-DOC001 (Mike Clay) - §2

### 4.3 References and Invocation

**REQ-F009: The system SHALL require every protocol reference to resolve to a concrete target through its anchor form — an input or output as a brace designator, a rule as a dotted symbol address, a technique or operation through a `::` hyperlink, and a resource through a markdown hyperlink.**

*Status*: *pending*

*Rationale*: Anchored references let an agent resolve every referent without inference, eliminating dangling references.

*Source*: SRC-DOC001 (Mike Clay) - §4, §8

**REQ-F010: The system SHALL require a protocol variable to be bound once in the dollar-sigil form and read thereafter in the bare form, scoped to a single protocol run.**

*Status*: *pending*

*Rationale*: Declare-once binding makes the point of production explicit and prevents unbound reads and dead bindings.

*Source*: SRC-DOC001 (Mike Clay) - §3.3

**REQ-F011: The system SHALL require an operation invocation to pass its argument list in parentheses attached to the operation reference, reserving curly braces for designators.**

*Status*: *pending*

*Rationale*: Distinct call and reference syntaxes keep an invocation's arguments unambiguous against the designator namespace.

*Source*: SRC-DOC001 (Mike Clay) - §4.2

**REQ-F012: The system SHALL require a rule to be cited by its dotted symbol address rather than as prose or in the executable `::` form.**

*Status*: *pending*

*Rationale*: A rule is a named symbol, not an invocable technique; the dotted address names it precisely and navigably.

*Source*: SRC-DOC001 (Mike Clay) - §4.1

**REQ-F017: The system SHALL resolve an unprefixed reference against the current workflow first and the shared meta layer second.**

*Status*: *pending*

*Rationale*: Current-workflow-first precedence lets a workflow override shared techniques while still inheriting them by default.

*Source*: SRC-DOC001 (Mike Clay) - §2, §4

**REQ-F020: The system SHALL resolve a `::`-delimited technique path of the form `[<workflow>::]<technique>[::<nested>…]`, resolving a trailing segment that matches a rule name to that rule and expanding a `<technique>::<group>` reference to every rule named `<group>-*`.**

*Status*: *pending*

*Rationale*: A uniform path grammar lets references address techniques, nested operations, and rule groups consistently.

*Source*: SRC-DOC001 (Mike Clay) - §4

### 4.4 Validation

**REQ-F013: The system SHALL validate every parsed technique against the technique schema before delivery and SHALL treat an unresolved technique reference as a definition defect.**

*Status*: *pending*

*Rationale*: Validation at load time and reference-resolution checks keep malformed or dangling definitions out of delivery.

*Source*: SRC-DOC001 (Mike Clay) - §9

## 5. Non-Functional Requirements

### 5.1 Naming Conventions

**REQ-NF001: The system SHALL require symbol identifiers (inputs, outputs, sub-fields, protocol variables) to be `snake_case` and names (technique, operation, resource, and rule identities) to be `kebab-case`.**

*Status*: *pending*

*Rationale*: Symbols become runtime variables resolved by exact string match against the snake-case state namespace, while names are slugs; the two-case split is a binding requirement, not a style choice.

*Source*: SRC-DOC001 (Mike Clay) - §3.2

**REQ-NF002: The system SHALL require a boolean symbol identifier to be an affirmative predicate stating the condition that holds when the value is true.**

*Status*: *pending*

*Rationale*: An affirmative predicate lets a condition read as an assertion and a reader infer the kind from the shape.

*Source*: SRC-DOC001 (Mike Clay) - §3.2

**REQ-NF003: The system SHALL require a collection identifier to be a plural item noun without a representation suffix, and a key-addressed map identifier to be singular and name the mapping.**

*Status*: *pending*

*Rationale*: Shape-encoding multiplicity lets a reader distinguish a collection from a scalar or a map without reading the description.

*Source*: SRC-DOC001 (Mike Clay) - §3.2

**REQ-NF004: The system SHALL require an input or output identifier to be a qualified noun phrase with the head noun last, encoding neither direction nor representation.**

*Status*: *pending*

*Rationale*: Head-noun-last qualified phrases name the concept the value is; direction is structural and representation is not part of the identity.

*Source*: SRC-DOC001 (Mike Clay) - §3.2

**REQ-NF005: The system SHALL require a rule name to be a positive declarative assertion of the invariant it guards.**

*Status*: *pending*

*Rationale*: A positive assertion names the state that must hold, which reads more clearly than a negation in the common case.

*Source*: SRC-DOC001 (Mike Clay) - §3.4

### 5.2 Formatting and Decoupling

**REQ-NF006: The system SHALL require every literal code-like token in rendered prose to be wrapped in backticks and every literal dollar sign in prose to be backslash-escaped.**

*Status*: *pending*

*Rationale*: Backticking makes code unmistakable on sight and exempts contained sigils from markdown math parsing; escaping a literal dollar prevents inline-math mis-rendering.

*Source*: SRC-DOC001 (Mike Clay) - §3.3, §4.3

**REQ-NF007: The system SHALL require an input or output description to state what the value is and SHALL NOT permit it to name a workflow-internal producer or consumer of that value.**

*Status*: *pending*

*Rationale*: Source/destination-agnostic interfaces keep a technique decoupled from any one workflow and reusable.

*Source*: SRC-DOC001 (Mike Clay) - §8

**REQ-NF008: The system SHALL require a resource to describe what it is and SHALL NOT permit it to name the technique that produces, consumes, or calls it.**

*Status*: *pending*

*Rationale*: A resource is a reusable asset; a back-reference to a caller couples it to one consumer and breaks reuse.

*Source*: SRC-DOC001 (Mike Clay) - §8

**REQ-NF009: The system SHALL require a capability or description to state what a construct is and SHALL NOT permit it to enumerate the sequence of activities, phases, modes, or steps that is canonical in the corresponding structured field.**

*Status*: *pending*

*Rationale*: A description that restates the sequence duplicates the structured declaration and drifts when the sequence changes.

*Source*: SRC-DOC001 (Mike Clay) - §8

## 6. Performance Requirements

None defined in the source.

## 7. Project and Process Requirements

None defined in the source.
