# Polymorphism — which mechanisms the typed language should take

Companion to [README.md](./README.md), for the typed-execution epic
([#526](https://github.com/m2ux/workflow-server/issues/526)).

The design says a technique becomes a typed function, an activity's reads and writes become its
signature, and a routine becomes a typed function returning steps. That settles the shape of the
language and leaves open which of the polymorphism mechanisms a modern type system offers are worth
having. This surveys them against measured corpus problems and says, for each, adopt or refuse.

Measured on 2026-09-07 against the server at `f315b772` and `workflows` at `56977e2c`. The survey was
prompted by a narrower question — whether a routine's capability parameter needs a declared bound —
recorded under `2026-09-03-routines/decisions.md`, which this file generalises.

## The constraint that shapes every answer

[rejected-alternatives.md](./rejected-alternatives.md) §3 drops a schema-driven type layer over the
existing YAML: the constraints that matter are unification, dataflow and containment problems, none
expressible as a document schema, "at which point the YAML is a worse surface syntax for a language
that already exists". So nothing below is a YAML construct. Each is a proposal for the language, and
each is judged on the test routines pass: **does designing it now against real sites de-risk it, or
does it arrive free with the compiler?**

## The survey

| Mechanism | The corpus problem it answers | Verdict |
|---|---|---|
| Traits with declared satisfaction | A group contract is a trait whose membership is directory containment | **Adopt — design now** |
| Module visibility and exports | `meta` is the shared library and also a running workflow | **Adopt — design now** |
| Exhaustive sum types | 57 positive `kind` comparisons across 19 files, no exhaustive switch | Adopt — free with the compiler |
| Scopes | One flat variable namespace per workflow forces name mangling | Adopt — carried as an open item |
| Marker traits for effects | `check-stealth-isolation`, 280 lines | Adopted already, §3.2 |
| Union narrowing over a defaulted value | `check-decision-order`, 213 lines and five exemptions | Adopted already, §3.1 |
| Derived members | Server-computed fields the schema marks never-authored | Adopted already, in effect |
| Template literal types | The five id-shape conventions — not capability bounds | Adopt for the conventions |
| Newtype identifiers | Separator collisions are design decisions rather than type errors | Adopt — cheap, modest |
| Function overloads | — | **Refuse** — a guard already forbids the shape |
| Conditional and mapped output types | — | **Refuse** — the corpus tried it and produced a defect |
| Annotated lifetimes | — | Refuse — no aliasing or borrow semantics to describe |

## Adopt, and design now

### Traits whose satisfaction is declared rather than inherited by containment

A technique group's `TECHNIQUE.md` is already a trait. It declares shared inputs, outputs and domain
invariants, and `composeLoaded` merges them into every operation beneath it, delivering them
partitioned as `inherited_inputs` and `inherited_outputs` so a consumer can tell shared contract
scope from an operation's own. What the arrangement lacks is the half Rust spells `impl Trait for
Type`: an operation cannot declare that it satisfies a contract it does not live inside. Membership
is a fact about a directory.

Three problems are that one problem wearing different clothes.

- **A bound on a capability parameter.** Seven audit operations in `workflow-design` share a shape —
  a findings collection, a count, a path — and each prefixes all three with its own domain. Three
  follow it fully, two omit the count their callers' gates read, one declares something else
  entirely. A bound naming a group cannot span them, and a bound naming outputs cannot either while
  every member prefixes differently. A bound naming a *contract* can.
- **Where a shared definition lives.** The routine work computes a routine's home from the workflow
  owning the activity files referring to it, having tested and discarded the obvious
  reference-counting rule against a workflow that borrows fourteen activities from another. That
  rule exists because containment and reference disagree.
- **`duplicate-shared-capability`** (AP-110): two definitions claim one capability and nothing
  relates them. A declared contract is what relates them.

All three ask whether a contract's home constrains its implementers' homes. **Design it now**,
because the routine work has already had to answer it once against real sites, and one answer is
cheaper than two that must later agree.

### Module visibility

Eight technique groups in `meta` are bound as steps, and every one of the eight is bound by a
workflow other than `meta` — `verify-artifact-conforms` by fifteen workflows, `workflow-engine` and
`version-control` by seven each. Nothing in meta's technique layer squats there. What makes it
confusing to read is that `meta` also runs: five activity files of its own plus a patterns directory.

The routine work carries this as an open question about placement — whether the shared home is `meta`
or something new — and the placement framing forces a choice between reusing a fallback that already
serves eight groups and inventing a second root with a second resolution rule for authors to learn.
A workflow declaring which of its operations it exports answers it without either. It is `pub`, and
it is the smaller answer. **Design it now**, because it is the question already open.

## Adopt, arrives with the compiler

**Exhaustive sum types.** Step kinds are tested in 57 places across 19 files, every one a positive
comparison, with no exhaustive switch anywhere — so a kind nothing handles compiles clean and is
handled nowhere. `flattenActivitySteps` is documented as the single traversal every step consumer
routes through, and it recurses into exactly one thing, a loop's body; a compound kind it does not
know is walked as a leaf, silently, and eight further walks recurse independently with the same
limit. A discriminated union with a `never` exhaustiveness check is the mechanism. Nothing needs
designing; the corresponding assertion over today's kinds is worth adding as hardening whenever the
next kind lands.

**Scopes.** The variable bag is one flat namespace per workflow, and that is the root of a class of
workarounds: a routine internal's name carrying its host activity as well as its reference site, a
124-character worst-case checkpoint response key, a crossing check reporting an activity-level
production for a value that never leaves a loop body. A routine is already a lexical scope — its
inputs, outputs and internals are its declared bindings and it has no free variables — so the flat
bag is what forces the scope to be simulated in the spelling of a name. Carried as an open item in
the routine record; the language makes it structural.

**Marker traits, union narrowing, derived members.** Each is already in the design and named here
only so the survey is complete. Effect sets are marker traits checked for containment (§3.2, and
Rust's `Send`/`Sync` is the exact analogue). A defaulted variable is `T` and an undefaulted one is
`T | undefined`, which is definite-assignment analysis replacing a 213-line guard (§3.1). The
server-computed fields the technique schema marks "never authored in technique markdown" —
`source`, `destination`, `provenance_note`, the inherited partitions — are derived members.

## Adopt, but not where it looks like it belongs

**Template literal types.** The audit family's `<domain>_findings`, `<domain>_finding_count`,
`<domain>_findings_path` maps onto the mechanism exactly: TypeScript writes `` `${D}_findings` ``,
Rust reaches for an associated type. For that family it is the wrong tool anyway — neutral output
names plus the reference site's output remap is cheaper, and neutrality *exposes* the two operations
missing a count instead of admitting them under a permissive shape.

The mechanism's real constituency is the naming conventions. Five entries in the anti-pattern
catalogue are string-shape predicates policed by scripts: `snake-case-symbols` (AP-58),
`boolean-id-shape` (AP-64), `collection-id-shape` (AP-65), `io-id-shape` (AP-66) and `rule-slug-shape`
(AP-67), with `artifact-name-is-filename` alongside them. Those are what a template literal type
expresses, and they are a family of guards that becomes a family of type errors.

**Newtype identifiers.** Step ids, checkpoint response keys, bag names and technique paths are all
`string`, which is why the separator question — `#` taken by the iteration discriminator, `::` by the
technique path, leaving a full stop for a routine prefix — is a design decision rather than something
a compiler settles, and why one existing tool resolves an identifier collision silently to the wrong
step. Distinct newtypes are near-free in the language and the payoff is modest but real.

## Refuse

**Function overloads.** An operation with two signatures selected by a mode input is
`no-monolith-masking-steps` verbatim: "distinguished only by a sub-mode input → split into a group
with one named op per mode". The canon has already decided against ad-hoc overloading, and a language
offering overloads re-permits the shape a guard currently catches.

**Conditional and mapped output types.** This refusal rests on evidence rather than principle. The
convergence work found a fold operation declaring **ten outputs, seven of them domain-conditional by
prose annotation** — five marked *(when the concern kind is X)*, two *(when applicable)* — and since
a conditional annotation in prose is not a condition, anything binding that operation as a step is
credited with producing all ten. That is a conditional output type, authored in the only notation
available, and the prescribed remedy is not to make it checkable: it is one neutral document name the
caller binds, and four outputs instead of ten.

So the corpus has run the experiment. Adopting conditional and mapped types would make the ten-output
signature both expressible and checkable, which is the wrong outcome, because the signature should
not exist. The finding is B4 in `2026-09-03-routines/findings-register.md`.

**Annotated lifetimes.** Scopes are wanted; lifetimes are not. Nothing in the corpus has aliasing or
borrow semantics for an annotation to describe.

## The pattern worth carrying forward

The mechanisms that pay are the ones about **where a thing lives and who may see it** — traits,
visibility, scopes. The mechanisms that do not are the ones about **making an irregular shape
expressible** — overloads, conditional types, permissive bounds.

That is not a coincidence. This corpus's recurring defect is one fact with two homes, and the
principle that governs it is *One Authoritative Home* in `design-principles.md`. Polymorphism that
lets an irregularity be described precisely is polymorphism that lets it survive review.

The test to apply to any mechanism proposed later: does it help a definition say where something
belongs, or does it help a definition describe something that belongs in two places?
