# Routines Protocol — Requirements Specification

## 1. Executive Summary

An activity's steps already nest: a loop's body is a list of steps, and the server walks, checks and
delivers it exactly as it does the list above. What such a run of steps cannot be is *named*. It
therefore cannot be referred to from anywhere else, and where two activities need the same run, each
carries its own copy.

The routines protocol specifies a **routine**: a named run of steps that declares what it needs and
what it produces. An activity refers to a routine by name and supplies its arguments at the point of
use. The loader materialises the routine's steps into the referring activity when the definitions
load, so everything downstream — the step manifest, artifact composition, the guard suite, the
end-to-end walker and the delivery composer — sees ordinary steps.

The protocol covers the routine definition and its declaration shapes, the reference site and its
argument and output binding, materialisation and identifier generation, the contract boundary a
reference presents to the derivation, where a routine lives, how its artifacts are named, what a
routine may not do, the two delivery representations, and the guard, walker and process obligations
that hold the construct together. It also covers the delivery staging by which the construct and the
two corpus migrations that motivate it are landed.

Out of scope: higher-order technique parameters, which the design settles in reasoning but excludes
from the first version because the re-derived corpus signature has no site for them; the
producer-plus-persist pairing, which is named rather than proposed and depends on a finding not yet
fixed; scoped variable names, recorded as open with the construct explicitly not blocked on them; and
the behavioural content decisions belonging to the workflow whose duplicated runs are migrated.

## 2. Requirements Sources

### 2.1 Product and Solution Documents

No product or solution document is referenced by this specification.

### 2.2 Meeting Transcripts

No meeting transcript is referenced by this specification.

### 2.3 Vendor Documents

No vendor document is referenced by this specification.

### 2.4 Source Reference Format

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

### 2.5 Reference Documents

**SRC-DOC001**: [Routines — proposal](../2026-09-03-routines/README.md) — Mike Clay

**SRC-DOC002**: [What this folder owes before planning starts](../2026-09-03-routines/gap-review.md) — Mike Clay

**SRC-DOC003**: [Routines — decision record](../2026-09-03-routines/decisions.md) — Mike Clay

## 3. Use Case Definition

### 3.1 Primary Use Case

A definition author has a run of steps that two or more activities need. Today each activity carries
its own copy, the copies drift, and nothing reports the drift because no check compares one sequence
of steps against another. The author instead writes the run once as a routine, declares what it needs
and what it produces, and refers to it from each activity with arguments at the point of use. The
loader materialises it into each referring activity, so a change to the run lands in one place and a
divergence between two uses stops being expressible.

### 3.2 Personas

**Definition author** — writes a shared run once and refers to it with arguments at each site. Needs
to know what a run requires before referring to it, and to vary it where it genuinely differs without
forking it.

**Reviewer** — needs a shared run to have one obvious home, needs a divergence between two uses to be
a load failure or a guard finding rather than something noticed by reading four files side by side,
and needs a run's declared signature checked against what its steps actually do.

**Worker** — receives ordinary steps with their identifiers already resolved, and needs nothing about
how a definition was assembled to reach it.

**Loader** — resolves a routine reference, materialises its steps into the referring activity, and
prefixes every identifier inside it.

**Contract derivation** — treats a routine reference as a boundary: the routine's declared signature
counts and its body does not.

**Guard suite** — walks `routines/` as a second definition directory, checks a routine's contract
against its own body with no host workflow present, and reports a run repeated at two or more sites
with any difference between the copies.

### 3.3 User Journey

1. The author writes a routine file under `routines/`, declaring its inputs, outputs, internals and
   steps.
2. The author adds a `kind: routine` step to each activity that needs the run, binding arguments
   under `with` and output names under `outputs`.
3. The definitions load. Identifiers resolve, shared gate bodies resolve, then each routine reference
   resolves: the loader checks the arguments against the declared inputs, prefixes every identifier in
   the body from the reference site, and splices the substituted steps into the activity.
4. The contract derivation meets each reference as a boundary and holds the referring activity's
   declared contract against the routine's signature.
5. The guard suite checks each routine's declared signature against its own body, computes its home
   from its referring files, and reports any remaining repeated run.
6. At run time a worker receives ordinary steps and cannot tell one came from a routine.

### 3.4 Key Success Criteria

**SUCCESS-001: Two uses of one shared run SHALL be unable to disagree on their steps.**

*Status*: *pending*

*Rationale*: Agreement between copies is today a convention that nothing checks — no guard anywhere compares a sequence of steps against another sequence. With one body, the ten measured differences across the four copies of the assumption run have nowhere to live.

*Source*: SRC-DOC001 (Mike Clay) - Enforcement strength, guarantees that get stronger

**SUCCESS-002: A shared run's variables SHALL be declared exactly once.**

*Status*: *pending*

*Rationale*: The assumption run's seven variables are declared four times over, once per host activity, for 28 declarations; at two of the four hosts that is seven of eight declared writes. A routine declares the signature once and each host declares only what it supplies, collapsing 28 declarations to seven.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The contract boundary

**SUCCESS-003: A shared run's declared signature SHALL be held against what its steps do, and a disagreement SHALL be refused at load.**

*Status*: *pending*

*Rationale*: A declared signature is checkable only where the body is steps. This guarantee does not exist at any strength today.

*Source*: SRC-DOC001 (Mike Clay) - Guarantees that are newly possible

**SUCCESS-004: A shared run SHALL be checkable with no host workflow present.**

*Status*: *pending*

*Rationale*: A shared gate body is today only ever checked through whichever workflows happen to import it, so its coverage depends on which hosts a walk reaches.

*Source*: SRC-DOC001 (Mike Clay) - Guarantees that are newly possible

**SUCCESS-005: A shared run's writes SHALL be visible to the producer index.**

*Status*: *pending*

*Rationale*: A run writing caller-named variables is invisible to the producer index — measured at 20 parameter bindings, seven with no declared write anywhere. An output binding is a write the derivation can see.

*Source*: SRC-DOC001 (Mike Clay) - Guarantees that are newly possible

**SUCCESS-006: Every option of every gate inside a shared run SHALL be exercised once, independently of which host activities a walk reaches.**

*Status*: *pending*

*Rationale*: Gate coverage today depends on host reachability. A routine-level walker entry makes coverage a property of the routine.

*Source*: SRC-DOC001 (Mike Clay) - Guarantees that are newly possible

**SUCCESS-007: The duplicated convergence-loop structure SHALL exist exactly once.**

*Status*: *pending*

*Rationale*: Six activities carry a byte-identical 32-line loop block under one SHA and a seventh carries a variant of it — 192 lines of duplicated structure, with nothing in the guard suite comparing step sequences to keep the copies together.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - Executive summary; stage 6 re-measurement

## 4. Functional Requirements

### 4.1 Routine Definition (P0)

**REQ-F001: The system SHALL locate a routine definition at `routines/<name>.yaml`, one file per routine, carrying no filename position number.**

*Status*: *pending*

*Rationale*: A routine holds no place in an order, so it carries no position. Activity discovery requires a numeric filename prefix, which is why routines need a directory and a discovery pass of their own rather than sharing `activities/`.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The definition; a routine lives at routines/<name>.yaml

**REQ-F002: A routine definition SHALL declare `id`, `version`, `name`, `description`, `inputs`, `outputs`, `internals` and `steps`.**

*Status*: *pending*

*Rationale*: These are the fields the signature and the body are read from. The three name categories together are what make the body checkable in isolation.

*Source*: SRC-DOC001 (Mike Clay) - The definition

**REQ-F003: A routine input SHALL be a named parameter carrying an optional default.**

*Status*: *pending*

*Rationale*: This is the shape a technique's inputs already take, so a routine's parameter list needs no new grammar.

*Source*: SRC-DOC001 (Mike Clay) - The definition

**REQ-F004: A routine output SHALL declare an id, a type and a description, and SHALL NOT declare a default.**

*Status*: *pending*

*Rationale*: A default is a seed applied at session creation — a property of the variable rather than of a run that writes it mid-flight. A routine declaring one claims to seed a variable it does not own, and the claim collides with the owner's the moment the two disagree. Simulated over the real workflow, declaring no default gives zero merge contradictions with every variable keeping its owner's default.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - The variable declaration

**REQ-F005: A routine internal SHALL declare an id and a description and nothing else, and SHALL NOT enter the workflow's variable set.**

*Status*: *pending*

*Rationale*: An internal is a name the body's steps pass between themselves and that never leaves. Nothing merges it, nothing seeds it and nothing holds one declaration against another, so a type would be a field with no reader. This is the standing the variable schema already gives a name written by an earlier step of the same activity, scoped to a run rather than an activity.

*Source*: SRC-DOC002, SRC-DOC003 (Mike Clay) - Gap 10; an internal declares an id and a description

**REQ-F006: A routine's `steps` SHALL admit technique, action, checkpoint, loop and routine steps.**

*Status*: *pending*

*Rationale*: A routine's body is the ordinary step list, so it presents the existing walks nothing they have not seen.

*Source*: SRC-DOC001 (Mike Clay) - The definition

**REQ-F007: A routine SHALL have no free variables — every name its body reads or writes SHALL be a declared input, output or internal, excepting an artifact filename template — and a body naming anything outside those categories SHALL fail the load.**

*Status*: *pending*

*Rationale*: No free variables is what makes the signature a contract, the body checkable on its own, and materialisation able to know which names to rewrite. The carve-out is required rather than convenient: an artifact filename template is interpolated by the worker at run time from the technique's own outputs, so a token in one names a value that does not exist until the step runs, and applying the rule to it would make the rule unimplementable.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - The definition; a routine has no free variables

**REQ-F008: An internal MAY serve as a loop's item variable and MAY hold a collection, and an internal that nothing writes, or that nothing reads, SHALL fail the load.**

*Status*: *pending*

*Rationale*: An internal is subject to the ordinary id-shape rules and serves as a loop item at four sites in the corpus. Unwritten and unread each fail the load, which is the treatment the signature check already gives an unwritten output and an unread input.

*Source*: SRC-DOC002, SRC-DOC003 (Mike Clay) - Gap 10; an internal declares an id and a description

**REQ-F009: A routine SHALL carry its own version, and changing it SHALL leave every referring activity's version unchanged.**

*Status*: *pending*

*Rationale*: Nothing relates a routine's version to the versions of the activities referring to it. This is the property the shared gate mechanism already has, with more content behind it.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Versioning

**REQ-F052: Every id a routine declares — input, output and internal alike — SHALL be a symbol id satisfying the identifier-shape rules the corpus applies to any other declared name, and an id whose shape those rules reject SHALL fail the load.**

*Status*: *pending*

*Rationale*: The three declaration categories are the routine's whole naming surface, and being declared inside a routine relaxes nothing about how a name is formed. The rule this obligation names already exists rather than arriving with the construct: the qualified-noun rule the identifier-qualification guard applies to technique markdown is the same one the variable-name schema applies on the YAML side, which is where a routine declares every one of its ids, so the schema is the enforcement path a routine's declarations take. The obligation is testable rather than editorial — two of the four output ids on the superseded conversion artifact are shapes the live catalogue names as defects, a boolean buried behind a `_flag` suffix and a collection behind a `_collection` suffix — so a routine re-derived from that artifact would carry two catalogued anti-patterns.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - The guard suite; the conversion artifacts descend from a deleted technique

**REQ-F053: A routine SHALL inherit no input or output from any container contract, its declared signature being the whole of what it consumes and produces.**

*Status*: *pending*

*Rationale*: A technique's signature accumulates the inputs and outputs its ancestor containers declare, which is how a technique body legitimately reads a name its own file never mentions. A routine has no free variables, so the same accumulation would put names into a routine that its signature does not carry and its body may not use. This property is load-bearing rather than incidental: the alternative of holding routines in the techniques namespace was rejected partly because it would need an opt-out from inherited inputs and outputs, and the guard auditing container-contract inheritance finds nothing to read in a routine, which deliberately does not have what that guard checks.

*Source*: SRC-DOC002, SRC-DOC003 (Mike Clay) - The guard classification is measured against a smaller suite; a technique body is delivered and a routine body is consumed

### 4.2 Reference Site (P0)

**REQ-F010: A `kind: routine` step SHALL name the routine, bind its inputs under `with` and its outputs under `outputs`, and SHALL carry the site gates every step kind carries and nothing about routing.**

*Status*: *pending*

*Rationale*: The reference site is where arguments are supplied and output names are chosen. Routing belongs to the activity's own exits and the workflow graph, not to a step.

*Source*: SRC-DOC001 (Mike Clay) - The reference site

**REQ-F011: A `with` binding SHALL admit the step binding's scalar union — string, number or boolean — a collection argument being carried as a JSON string.**

*Status*: *pending*

*Rationale*: A collection argument stays a JSON string because that is what every step binding in the corpus already does, so the corpus keeps one rule rather than two.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The reference site

**REQ-F012: A braced `with` value SHALL be read as a reference and a bare value SHALL be read as a literal.**

*Status*: *pending*

*Rationale*: A routine reference is a new binding site with no legacy, so it adopts this reading from the start rather than joining the 193-site migration settling it elsewhere.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The reference site

**REQ-F013: A `with` binding naming an undeclared input, and a declared input with no argument and no default, SHALL each fail the load.**

*Status*: *pending*

*Rationale*: An argument naming a parameter that exists, and every parameter having a value, are guarantees available only at load. Both are terminal states of the reference lifecycle and neither is a warning.

*Source*: SRC-DOC001 (Mike Clay) - The reference site; the lifecycle of one reference

**REQ-F014: An output a reference site does not bind SHALL be dropped from the materialised bindings, producing no write and contributing no variable.**

*Status*: *pending*

*Rationale*: Falling back to the output's own id — the rule a technique step's unremapped output follows — would put a routine's internal name into the session bag.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The reference site; an output the reference site does not bind

**REQ-F015: A routine output that may be left unbound SHALL declare so, and leaving an unmarked output unbound SHALL fail the load.**

*Status*: *pending*

*Rationale*: An output the routine expects to be consumed, silently dropped, is a write the author believed in and nothing performs. Declaring optionality makes the two cases distinguishable at load.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The reference site

**REQ-F016: A routine name SHALL resolve as `[workflow::]name` — qualified within that workflow only, bare against the referring workflow and then the shared home `meta` — and a borrowed activity SHALL resolve a routine reference against its source workflow rather than its borrower.**

*Status*: *pending*

*Rationale*: This is the resolution the existing shared gate reference and a bare technique path both already implement, and a bare technique path already falls back to `meta`. Referencing a routine the way the corpus references a shared technique gives the corpus one resolution rule rather than two. Measured independently: eight technique groups in `meta` are bound as steps and all eight by a workflow other than `meta`, so `meta` is already the shared library.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - The reference site; a routine name resolves exactly as a shared technique's does

**REQ-F017: A routine step SHALL be legal inside a routine, a reference cycle among routines SHALL fail the load, and reference depth SHALL be bounded by cycle detection rather than by a limit.**

*Status*: *pending*

*Rationale*: Nesting is load-bearing in the first version rather than merely available: the convergence run needs the same body both wrapped in a loop and alone, six sites wanting the loop and the seventh a single pass inside a loop its activity owns. The alternatives are two copies of one body, or one body behind a parameter that switches its loop off — the two shapes a routine exists to remove. Nesting is allowed; recursion is not.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - A routine may reference another routine; the four questions put to the owner

### 4.3 Materialisation (P0)

**REQ-F018: The loader SHALL materialise a referenced routine's steps into the referring activity at load, so that every downstream consumer sees ordinary steps.**

*Status*: *pending*

*Rationale*: The step manifest, artifact composition, the guard suite, the end-to-end walker and the delivery composer all see ordinary steps. This is the arrangement the fragment mechanism already uses, which is why that mechanism can be retired rather than layered over.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Where materialisation sits

**REQ-F019: Materialisation SHALL run after identifier resolution and before contract derivation.**

*Status*: *pending*

*Rationale*: After identifiers, so a prefix has something to attach to; before the derivation, so the derivation still meets the reference and can treat it as a boundary. Materialising after contract validation would erase the signature boundary the contract guarantee depends on.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Where materialisation sits

**REQ-F020: Materialisation SHALL substitute over every field of a routine body that can name a variable: site gates, condition blocks, a loop's `continueWhile`, `breakCondition`, collection and item variable, a checkpoint's identifier template and message, an option's effect names and values, a technique binding's input and output maps, an action's target, message and value, a body step's technique name, and a nested routine reference's own `with` and `outputs` maps.**

*Status*: *pending*

*Rationale*: A routine's input and output ids are the names in scope inside its body, so materialising it is a rename rather than a splice: a loop testing one name has to end up testing whatever the reference site bound that output to. The field list is exactly the set the contract derivation already walks, so the implementation is that traversal inverted — the cheapest way to keep the two from disagreeing. The nested-reference maps are easy to miss and expensive to miss: left unsubstituted, an inner routine's declarations are collected under names local to the outer one and leak into the host activity's variable declarations, observed as four routine-internal output ids injected as session variables at six sites. A body's `forEach` may carry an early exit, which is why `breakCondition` is in the list.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - Materialisation is a substitution; gap 4

**REQ-F021: The substitution SHALL be simultaneous, so that a binding mapping `a → b` and `b → c` renames each occurrence exactly once.**

*Status*: *pending*

*Rationale*: An iterative rewrite over such a binding renames some occurrences twice. Simultaneity is a requirement rather than a detail.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Materialisation is a substitution

**REQ-F022: Substitution SHALL rewrite whole binding values rather than the tokens inside them, resolving a body binding written as a braced input reference to a reference where the site supplied one, to a literal's characters where it supplied one, and to an omitted binding where the value is absent.**

*Status*: *pending*

*Rationale*: A body's brace syntax means *the value of this parameter*, and which kind of value that is cannot be known until the reference site is read. Executing the materialiser found that rewriting the token root turns literals into variable references — a literal argument emitted as a braced reference to a variable nothing writes. An absent argument omits the binding entirely rather than emitting an empty literal, which would override name-match resolution with nothing.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Materialisation is a substitution; substitution is kind-aware

**REQ-F023: Every identifier inside a materialised routine SHALL be prefixed with the reference step's identifier using a full stop as the separator, and prefixes SHALL compose through nesting.**

*Status*: *pending*

*Rationale*: A full stop is the only separator available: `#` is the per-iteration discriminator and the server splits a checkpoint id on the first one, so a prefix using it would swallow the discriminator; `::` is the technique-path separator. Prefixing makes two references to one routine in one activity collision-free by construction, a checkpoint response being keyed on the activity and the checkpoint together.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Identifier hygiene

**REQ-F024: An internal's materialised name SHALL be underscore-joined from the host activity and the reference site.**

*Status*: *pending*

*Rationale*: A step identifier need only be unique within its activity, but a variable name shares one flat namespace across the whole workflow. Prefixing an internal from the reference site alone put one internal name in four activities and produced four crossing findings when the guard suite was run over a converted corpus.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The definition; an internal's name carries the host activity

**REQ-F025: A `kind: routine` step SHALL exist between parsing and materialisation and nowhere else, and an exhaustiveness assertion over the step kinds SHALL fail to compile when a step kind is added.**

*Status*: *pending*

*Rationale*: The corpus's step kinds are tested in 57 places across 19 files, every one a positive comparison with no exhaustive switch anywhere, so a kind surviving materialisation would compile clean everywhere and be handled nowhere. The shared flattening traversal does not save it either: it recurses into a loop's body alone, so a compound kind it does not know is walked as a leaf, silently.

*Source*: SRC-DOC001 (Mike Clay) - How far the new step kind reaches

**REQ-F026: Load order SHALL be identifiers, then shared gate bodies, then routines, then the contract derivation; identifier population SHALL happen per definition, and identifier uniqueness SHALL be re-checked in the merged scope.**

*Status*: *pending*

*Rationale*: Identifiers first, so a prefix has something to attach to. Shared gate bodies next, so a routine body containing a reference step is whole before it is spliced. A routine's own body has its ids filled within the routine's scope before prefixing, and the merged scope is where a collision can appear.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Load order

### 4.4 Contract Boundary (P0)

**REQ-F027: The contract derivation SHALL treat a routine reference as a boundary, counting the routine's declared signature and never consulting its body.**

*Status*: *pending*

*Rationale*: This is the single change to the contract derivation and the whole of what a routine buys over any arrangement that shares a body without a signature. A technique step contributes a declared signature already, so the boundary itself is not new; what a routine adds is that the declared signature becomes checkable against the thing it describes, and that the boundary becomes tight — a technique's delivered prose leaks its tokens into the referring activity's reads, whereas a routine has no free variables and contributes only what it declares.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The contract boundary

**REQ-F028: The derivation SHALL count a routine's inputs, less those a `with` binding satisfies with a literal, as the referring activity's reads, and its outputs as that activity's writes.**

*Status*: *pending*

*Rationale*: An input satisfied by a literal at the site reads no variable, so counting it as a read would put a name in the contract that nothing supplies.

*Source*: SRC-DOC001 (Mike Clay) - The contract boundary

**REQ-F029: A routine's declared signature SHALL be held against its own body, an output nothing writes and an input nothing reads each failing the load.**

*Status*: *pending*

*Rationale*: An output nothing writes and an input nothing reads are findings only where the body is steps, so this guarantee arrives with the construct. A stale declaration is otherwise believed rather than caught.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - Checking a routine on its own

**REQ-F030: A routine's contract SHALL be derivable in isolation, seeded from its declared inputs.**

*Status*: *pending*

*Rationale*: A shared gate body is today only ever checked through whichever workflows happen to import it. With no routine binding a technique by parameter in the first version, this guarantee carries no exception.

*Source*: SRC-DOC001 (Mike Clay) - Guarantees that are newly possible; higher-order parameters

**REQ-F031: The loader SHALL inject a routine's output declarations into the referring activity's declared writes, and only where that activity declares nothing under the bound name.**

*Status*: *pending*

*Rationale*: The outputs are the routine's declaration and are contributed to the workflow variable set through the referring activity — the same path an activity's own writes already take — so one home holds the type and the meaning. Replacing an existing host declaration puts two defaults for one variable into the merge, which simulation showed produces a contradiction. Where an author has declared the name by hand the copy is a no-op; where nobody has, it is what makes an invisible write visible.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The variable declaration

**REQ-F032: The declaration merge SHALL treat an absent default as no opinion, and a declaration carrying a default SHALL win over one that does not.**

*Status*: *pending*

*Rationale*: Comparing an absent default as null reports a disagreement with any present one, so a no-default routine output would fail the load on contact with the corpus. Measured before deciding: 113 variables are declared at two or more sites and every one already agrees about whether a starting value is present, so the relaxation silences no existing finding.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The variable declaration; an absent default is no opinion

**REQ-F033: The declared-versus-derived write comparison SHALL run over copied declarations, a disagreement meaning the expansion produced something the signature did not promise.**

*Status*: *pending*

*Rationale*: The comparison looks circular and is not: the copy comes from the routine's signature and the derived side comes from walking the expanded steps and reading every technique they bind. Run over a converted activity it reported three real names — a fold technique's over-declaration — catching a corpus defect on its first run.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The variable declaration; the declared-versus-derived comparison

### 4.5 Placement (P0)

**REQ-F034: A routine's home SHALL be the workflow owning the files referring to it, or the shared home where two or more workflows own them, and placement SHALL be computed from the referring files and enforced by a guard rather than chosen by an author.**

*Status*: *pending*

*Rationale*: Counting the workflows whose graphs include the referring activities does not survive the corpus: 21 activities appear in more than one workflow's graph and one workflow borrows thirteen activities from another, including all four hosts of the assumption run, so graph membership would compute the shared home for the most workflow-specific run in the corpus.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Where a routine lives

**REQ-F035: A referrer SHALL be an activity file or another routine, and the referrer set SHALL be closed transitively.**

*Status*: *pending*

*Rationale*: Nesting makes the placement rule partial otherwise: a routine referred to only by other routines has no referring activity file, and the rule returns nothing rather than something wrong. The closure is the same walk cycle detection already performs, and the alternative is a guard with no verdict to give.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - Gap 11; a referrer is an activity file or another routine

**REQ-F036: A routine with no reference site anywhere SHALL fail the load.**

*Status*: *pending*

*Rationale*: This mirrors the finding an unreferenced shared gate body already produces, and it is what makes the retirement of the mechanism this construct replaces enforced rather than trusted.

*Source*: SRC-DOC001 (Mike Clay) - Guarantees that are newly possible

### 4.6 Artifacts (P0)

**REQ-F037: A routine SHALL own no artifact prefix, and an artifact written inside a routine SHALL land under the referring activity's prefix.**

*Status*: *pending*

*Rationale*: An artifact prefix is computed from an activity's filename position and a routine has none. The prefix is a property of where the work is being done, and the work is being done inside the host activity.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Artifact names; a routine has no artifact prefix

**REQ-F038: A routine whose body declares an artifact SHALL be referenced at most once per activity, a second reference failing the load, and whether a body declares an artifact SHALL be resolved through the same transitive closure as placement.**

*Status*: *pending*

*Rationale*: An artifact filename is the host activity's numeric prefix and the technique's bare filename, and identifier prefixing does not reach it, so two references to one artifact-declaring routine in one activity would write one filename twice. Read at one level the limit is evaded by wrapping: a routine declaring nothing itself, referencing one that declares an artifact, could be referenced twice.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - Artifact names; the same closure decides whether a routine declares an artifact

### 4.7 Prohibitions (P0)

**REQ-F039: A routine SHALL take no place in the workflow graph — it SHALL NOT be a transition destination nor a workflow's first or last node — and SHALL declare and return no outcome.**

*Status*: *pending*

*Rationale*: Every activity that would refer to a routine declares a single ending, so nothing in the corpus could receive an outcome. A routine's effect on control flow is through the variables it writes, which the referring activity's own gates and exits already read.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - What a routine is not allowed to do; a routine declares no outcome

**REQ-F040: A routine SHALL run inside the referring activity's existing dispatch and SHALL cost no additional hand-off.**

*Status*: *pending*

*Rationale*: This is the reason a routine is its own kind of definition rather than a way of reaching an existing activity. Promoting the shared run to an activity that four activities route through would cost four extra hand-offs whose only content is a gate and two record passes, and a guard already forbids an activity opening with a decision — which this run does.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - What a routine is not allowed to do; a routine takes no place in the graph

**REQ-F041: A routine SHALL NOT replace a child workflow.**

*Status*: *pending*

*Rationale*: A routine is the sub-activity construct. A child workflow exists to get a separate session, and that mechanism keeps its role.

*Source*: SRC-DOC001 (Mike Clay) - What a routine is not allowed to do

**REQ-F042: A routine SHALL vary its steps only by a declared input, a run needing to differ structurally between two sites being two routines.**

*Status*: *pending*

*Rationale*: A body behind a parameter that switches part of itself off is one of the two shapes the construct exists to remove.

*Source*: SRC-DOC001 (Mike Clay) - What a routine is not allowed to do

### 4.8 Delivery Representations and Tooling (P1)

**REQ-F043: The system SHALL perform materialisation on both the parsed object graph and the raw activity YAML text for as long as the server delivers activity text.**

*Status*: *pending*

*Rationale*: Two delivery paths need resolution: the parsed object graph, so tool payloads and the guards see a full step, and the raw YAML text, because activity delivery hands the worker the original file. This is the largest cost in the design and it is paid knowingly.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Two representations; the raw-text representation

**REQ-F044: The textual splicer SHALL replace a whole step block, nested steps included, at the correct indentation, and SHALL emit an explicit prefixed `id:` on every step it splices.**

*Status*: *pending*

*Rationale*: The textual path is line-oriented where the object path is not, and a step spliced at the wrong nesting depth is the failure such a splicer is most prone to. The explicit id is required because the textual id injector derives an id from a step line that carries none and knows nothing of a routine prefix, so a spliced step without an authored id would arrive unprefixed in the text and prefixed in the object graph.

*Source*: SRC-DOC001 (Mike Clay) - The raw-text representation

**REQ-F045: A differential test SHALL run both materialisation paths over every activity in the corpus on every run, comparing parsed objects field for field and comparing as text the fields a worker acts on directly — a checkpoint's `message` and `id`, an option's `label` and `effect`, a step's `when`, and a loop's `over` and `continueWhile`.**

*Status*: *pending*

*Rationale*: While both implementations live they have to agree on every generated identifier, and a disagreement shows up as a worker reading a step the server does not believe exists. The field-for-field comparison ignores layout, indentation and comment placement — the things the text path preserves on purpose — while catching structural and naming divergence; the text comparison covers the fields whose exact characters a reader acts on, where layout tolerance would be blind to a template taken differently.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The raw-text representation

**REQ-F046: Delivery SHALL be byte-identical for every activity that carries no routine.**

*Status*: *pending*

*Rationale*: The construct changes what an activity referring to a routine delivers and nothing else. A byte difference elsewhere is a defect in the splicer.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The raw-text representation

**REQ-F047: The textual materialisation implementation SHALL be deleted when the server stops delivering activity text.**

*Status*: *pending*

*Rationale*: It is written for a delivery arrangement that is ending, so it is written to be deleted rather than maintained.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Two representations

**REQ-F048: Routines SHALL have their own discovery pass, their own generated JSON schema and their own place in the workflow definition read model, and the schema generator SHALL have a verifying variant so that a forgotten regeneration fails continuous integration.**

*Status*: *pending*

*Rationale*: Activity discovery requires a numeric filename prefix and a routine has none. Without a verifying variant a forgotten regeneration passes continuous integration while authors see spurious errors on valid definitions, and this adds a third generated schema to forget.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Discovery and generation

**REQ-F049: A guard SHALL report any run of two or more consecutive steps appearing in two or more activity files with any difference between the copies, matching on step kind and binding, ignoring identifiers and site gates, and recursing into loop bodies.**

*Status*: *pending*

*Rationale*: Nothing anywhere in the guard suite compares a sequence of steps against another sequence, which is why ten differences across four copies of one run went unreported. Recursion into loop bodies is load-bearing: the corrected search finds 26 maximal shared windows, five of them nested, and the widest sharing in the corpus by activity count is one of the five.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - Delivery stages, stage 1; the second pass

**REQ-F050: A shared window contained in a longer shared window over the same file set SHALL NOT be reported separately, and the guard SHALL run from a baseline that can only fall.**

*Status*: *pending*

*Rationale*: A hard zero is wrong here: the duplication is what the migration stages remove, and the guard has to be useful before they do.

*Source*: SRC-DOC001 (Mike Clay) - Acceptance criteria, stage 1

**REQ-F051: The end-to-end walker SHALL gain a routine-level entry, walking a routine's steps against a variable set seeded from its declared inputs.**

*Status*: *pending*

*Rationale*: Gate coverage otherwise depends on which host activities a walk happens to reach.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The walker

## 5. Non-Functional Requirements

### 5.1 Guard Suite

**REQ-NF001: A guard SHALL read the form it audits — a guard checking how a definition is written SHALL read definition files as written and SHALL walk `routines/` as a second definition directory, and a guard checking how a run behaves SHALL take the loader's materialised activities.**

*Status*: *pending*

*Rationale*: Routing every authored-form guard through the loader does not survive: the loader materialises shared gate bodies, so the fragment guard would check nothing, and materialisation rewrites gate expressions and set values, so those guards would audit generated text and report clean over ground they never read. The forcing case in the other direction is the guard forbidding a checkpoint as an activity's first step, which a reference in first position would evade against unexpanded text. Walking a second directory is less work than routing a guard through the loader, not more.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - The guard suite; guards divide by what they audit

**REQ-NF002: A routine file SHALL be its own name scope for the variable-model guard: a declared output or internal SHALL satisfy the undeclared-set-variable rule and a workflow variable SHALL NOT, and the guard's remaining rules SHALL take the same scope — the two comparing a literal against a target's declared type or value set applying where the target is an output and staying silent on an internal, the default-type rule checking a routine input's default, and the exists-on-defaulted rule extending to an existence gate on a defaulted input.**

*Status*: *pending*

*Rationale*: The undeclared-set-variable rule is hard-zero and requires a checkpoint effect to name a declared workflow variable. Inside a routine an effect names an output id or an internal, neither of which is a bag name until materialisation, so every gate in every routine violates the rule as authored, by construction rather than by mistake. Routing the guard through the loader would have it audit generated names, which the classification rules out. An internal declares no type, so a type check has nothing to compare.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - Gap 8; a routine file is its own name scope

**REQ-NF003: The activity–technique overlap guard SHALL remain an authored-form guard and SHALL resolve a routine reference step to the routine's own step bindings, keeping its rule hard-zero.**

*Status*: *pending*

*Rationale*: The rule forbids an activity's top-level technique list from re-listing a technique any of its steps binds. A routine breaks it in a direction neither form shows: read as written the overlap is invisible, because the activity lists the technique and the routine binds it; read through the loader the guard would audit generated bindings. This is the one guard where the authored/materialised split is not by itself sufficient.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - The guard suite; the overlap guard gains routine awareness

**REQ-NF004: The loop-shape guard SHALL walk `routines/`.**

*Status*: *pending*

*Rationale*: A routine body holds loops, and an unbounded repeat loop in a shared definition propagates to every reference site. Materialisation rewrites a loop's field contents and never which fields are present, so the shape is the same in both forms and is what an author declared.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - The guard suite; gap 7

### 5.2 Load-Time Enforcement

**REQ-NF005: Every terminal state of the reference lifecycle other than a successfully checked reference SHALL fail the load with a message naming the routine, the reference site and the reason, and none SHALL be a warning.**

*Status*: *pending*

*Rationale*: A routine that half-resolves would deliver a worker a step nobody declared.

*Source*: SRC-DOC001 (Mike Clay) - The lifecycle of one reference

### 5.3 Runtime and Session Behaviour

**REQ-NF006: A worker SHALL receive ordinary steps and SHALL NOT be able to determine that a step came from a routine.**

*Status*: *pending*

*Rationale*: Nothing about how a definition was assembled should reach the agent executing it.

*Source*: SRC-DOC001 (Mike Clay) - The participants

**REQ-NF007: A session crossing the migration SHALL find no recorded answer for a renamed gate and SHALL ask again, orphaned responses remaining as dead data, and no key-mapping table SHALL be kept.**

*Status*: *pending*

*Rationale*: A checkpoint response is keyed on the activity and the checkpoint identifier together, and a session pins only the workflow's semantic version, so prefixed identifiers change every key the migration touches. A definition change is a definition change, and a mapping table would be permanent server cruft for a one-off rename.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Sessions in flight

**REQ-NF008: A variable a routine writes that nothing else declares SHALL be left unseeded.**

*Status*: *pending*

*Rationale*: The copied declaration is what puts the name in the workflow's namespace, which is the part that matters. A starting value is needed only where something reads before the routine has run, and the existing reachability check already fails a read no path reaches a write for. The corpus deliberately spells absence as a value nobody set, so an unset value is not a defect.

*Source*: SRC-DOC003 (Mike Clay) - A variable a routine writes that nothing else declares

### 5.4 Governance and Migration

**REQ-NF009: The construct SHALL carry no compatibility obligation toward a future typed definition language, and SHALL keep its signature declared rather than inferred, its materialisation free of run-time trace, and nothing about a routine positional.**

*Status*: *pending*

*Rationale*: No dual format and nothing held open, but it costs nothing to build the construct so that a later migration is a change of surface syntax rather than a redesign. Everything depending on the boundary reads the declaration and never the body; nothing downstream knows a routine existed, so the mechanism is deleted rather than adapted; and document order is a property of a text file.

*Source*: SRC-DOC001 (Mike Clay) - Designed for the typed language

**REQ-NF010: The shared-body fragment mechanism SHALL retire entirely with the migration, taking seven of its guard rules with it, and the duplicate-checkpoint rule SHALL be retained with its remedy naming a routine.**

*Status*: *pending*

*Rationale*: A shared gate that is not part of a larger run becomes a one-step routine rather than keeping a second mechanism alive for that case. The routine form is better for a lone gate on all three counts the fragment lacks: it carries a signature, its home is computed rather than inherited from whoever declared it first, and its identifiers are prefixed by the mechanism.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - The fragment mechanism retires entirely

## 6. Performance Requirements

**REQ-NF011: A routine SHALL add no dispatch hand-off, dispatch cost remaining unchanged by its use.**

*Status*: *pending*

*Rationale*: Establishing a fresh worker context is measured at 23,000 to 42,000 tokens, and re-dispatch accounted for about 31% of a measured 4.1-million-token run. A dispatch that only asks a question is the most expensive way to ask one.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - What it makes cheap

**REQ-NF012: Materialisation SHALL change the delivered payload by nothing of its own.**

*Status*: *pending*

*Rationale*: Materialisation puts the delivered form back, so no delivery saving should be expected from the mechanism. Measured on the four host activities, materialising the seven shared gate bodies takes 28,154 characters of source to 34,717 delivered — 6,563 more, at 23.3%. What moves the payload is a separate convergence decision about which site's gating the converged run adopts, and that is the drift decision's price rather than the routine's.

*Source*: SRC-DOC001 (Mike Clay) - Two representations, and the one that is temporary

**REQ-NF013: Materialised routine steps SHALL count against the per-activity eager-delivery budget as ordinary steps do, a routine referenced twice contributing its techniques twice, and the budget consequence SHALL be measured before any rule governing it is introduced.**

*Status*: *pending*

*Rationale*: There is no data and therefore no rule. The migrations land, the delivery baseline is re-recorded, and the change in bundled characters decides whether anything is needed.

*Source*: SRC-DOC001, SRC-DOC003 (Mike Clay) - Delivery budget

**REQ-NF014: Generated identifier lengths SHALL be measured and reported rather than bounded.**

*Status*: *pending*

*Rationale*: Measured rather than guessed: a generated step id reaches 105 characters in a loop body and a worst-case checkpoint response key 124, against a current corpus maximum of 58 and 76 — about 1.6 times the current maximum rather than an order of magnitude. Nothing bounds them, these being JSON keys in the session record and arguments to a technique fetch rather than filenames. The length is a legibility question where a runtime emits the key it generated and a correctness question while a worker composes one, and how it is settled is an open item.

*Source*: SRC-DOC001, SRC-DOC002, SRC-DOC003 (Mike Clay) - The identifier-length item; two things worth recording that are not gaps

## 7. Project and Process Requirements

**REQ-NF015: Delivery SHALL proceed in the seven defined stages, each useful alone and assuming nothing after it, under the stated inter-stage dependencies.**

*Status*: *pending*

*Rationale*: The stages are the continuation field (landed), the drift guard, settling the run's content, the construct, the boundary, migrating the assumption run, and converging the convergence loop. Stages 1 and 2 need no schema and no code path and are where the behavioural risk lives; stage 3 is the load-bearing one.

*Source*: SRC-DOC001 (Mike Clay) - Delivery stages

**REQ-NF016: Each delivery stage SHALL carry acceptance criteria.**

*Status*: *pending*

*Rationale*: Five of the seven stages carried none, and three of those five are the stages that change what happens at live sites. The delivery-budget measurement had no stage, no baseline named and no criterion saying what it would have to show for a rule to be needed.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - Acceptance criteria; gap 12

**REQ-NF017: A migration that changes behaviour at a live site SHALL be walked before merge, each changed site's observed outcome being compared against what its recorded disposition said would happen, and a green guard suite SHALL NOT be sufficient on its own.**

*Status*: *pending*

*Rationale*: The precedent is the landed continuation-field stage, where six repeat-until bodies that had never run in a recorded walk were required to be reviewed rather than accepted on a green suite. This is a judgement rather than a measurement, and it binds the three stages that change live behaviour.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - Acceptance criteria; gap 12

**REQ-NF018: The stage settling the run's content SHALL give each of the drift census's ten differences a recorded disposition, SHALL name the sites at which behaviour changes, and SHALL change no definition.**

*Status*: *pending*

*Rationale*: A disposition is either converged with no decision, converged by a decision naming what the run now does and which site changes, or already converged in the corpus. The migration otherwise does not know what it is converging on. Two of the ten are converged in the corpus already, and two more change behaviour at live sites while carrying no direction.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - Acceptance criteria, stage 2; gap 6

**REQ-NF019: Each migration stage SHALL re-record the delivery baseline and SHALL have the change in bundled characters at each site reviewed against the measured prediction rather than accepted by regeneration.**

*Status*: *pending*

*Rationale*: This gives the delivery-budget measurement the home it lacked, and it is the measurement the budget rule is waiting on.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - Acceptance criteria, stages 5 and 6; gap 12

**REQ-NF020: The two live corpus findings tracked as the migration's prerequisites SHALL be fixed before the migration stages.**

*Status*: *pending*

*Rationale*: One is four gate edits and the only finding in the register producing a wrong record in a real run rather than a wrong declaration; the other decides two of the census's windows and whether a 42-site count can be read as one constituency. Both were parked on a closed issue and are now raised on their own.

*Source*: SRC-DOC002 (Mike Clay) - Gap 2; what is left

**REQ-NF021: The two convergence routines SHALL be named, and the identifier-length measurements SHALL be re-taken against the re-derived signature.**

*Status*: *pending*

*Rationale*: The conversion artifacts descend from a technique that has since been deleted, and two of their four output ids are shapes the live catalogue names as defects. The re-derived signature is smaller — three inputs and four outputs against seven and four — which moves several measured figures down, and its composed prefix runs to four segments. The proposed names are not settled, and this is the one remaining open item a multiple choice does not fit.

*Source*: SRC-DOC002 (Mike Clay) - Gap 3; what is left

**REQ-NF022: The cost of moving each behaviour-checking guard onto the loader SHALL be stated separately from the description of where guards sit today.**

*Status*: *pending*

*Rationale*: The classification's materialised column named four guards that do not consume the loader, so it was a specification for moving four guards presented as a description. Six guards consume the loader today — audience, stealth isolation, activity variables, session contract, reference resolution and artifact guides — and none of the four is among them.

*Source*: SRC-DOC002 (Mike Clay) - Gap 9

**REQ-NF023: The two migration stages SHALL be sequenced against each other at the two activities where the assumption run and the convergence loop form one contiguous run.**

*Status*: *pending*

*Rationale*: At those two activities the two runs are one contiguous six-step run, so the order in which the stages touch them decides what each stage is converging.

*Source*: SRC-DOC001, SRC-DOC002 (Mike Clay) - Acceptance criteria, stage 6; what is left
