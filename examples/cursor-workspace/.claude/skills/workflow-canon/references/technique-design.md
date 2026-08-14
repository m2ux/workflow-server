# Technique Design

How to decide the **shape** of a technique or an operation group, and how to review one for more than compliance.

**This reference holds no criteria.** Every judgement below resolves to an entry in the anti-pattern catalog, a principle title, or an inventory row — cited by name, never restated. Open the entry before acting on it; the Detect wording carries the carve-outs. A design question that has no entry is called out as such, and the fix for that is a new entry (`operative-criteria-need-a-home`), not a criterion carried here.

Read [canon-map.md](canon-map.md) for where the homes are and how to fetch them. This file answers the questions that come *before* the walk: what should exist, how big should it be, and where does each piece live.

## The correspondence

Techniques are an object system. Reading them as one makes the placement rules fall out instead of having to be memorised.

| Workflow-server | Object system | What carries over |
|---|---|---|
| workflow-root `TECHNIQUE.md` | root base class | contract every operation in the workflow inherits |
| group `TECHNIQUE.md` | abstract base class | shared Inputs / Outputs / Rules; no work of its own |
| leaf `<op>.md` | concrete method | one capability, one produce path |
| `## Capability` | the declaration's doc comment | what it contributes — never how |
| `## Inputs` | parameter list | `#### default` is a default argument; a description opening *optional* is a nullable slot |
| `## Outputs` | return type | `#### artifact` is the named side effect; `#### audience` is its serialization |
| `#### <member>` | a field of the returned structure | shape for the reader; the consumer still binds the whole entry by id |
| `## Protocol` | the method body | ordered outcomes only |
| `{$name}` / `{name}` | `let name = …` then `name` | one binding, scoped to a single run |
| `## Rules` | class invariants | inherited by descendants; a local entry overrides by name |
| container `Initial` / `Final` | template method around-advice | ancestors wrap descendants outermost-first |
| I/O merge, local wins by id | field and method override | the leaf's entry shadows the ancestor's |
| `::` | a call | invokes |
| `.` | member access | names a symbol without invoking it |
| `(arg: value)` | argument list | parentheses call; braces name |
| activity `steps[]` | the caller / composition root | the only place operations are sequenced |
| workflow `variables[]` | module-level state | the bag both sides read by exact name |
| a group's uniform output shape | an interface its operations implement | what lets one caller fold any of them |

Where the analogy stops — and these are the parts that catch people:

- **Siblings do not call each other.** Composition happens at the activity, not inside a body, so a group is closer to a stateless service module than to a class whose methods collaborate. `pass-orchestration-in-technique`; principles *Bind Sibling Operations as Steps* and *Atomic Techniques; Compose at Activities*.
- **Binding is by name, not by position.** The engine resolves against a name-keyed bag by exact string match, so a symbol id *is* the wire. Renaming one is renaming a global, not renaming a parameter. `snake-case-symbols`, `io-id-shape`.
- **Nothing type-checks a `####` member at runtime.** The declaration is the contract and the reader is the compiler. The guard suite is the only static check there is — run it.
- **Dispatch is authorial.** There is no vtable; a caller selects an operation by binding it. Polymorphism shows up as *substitutability at a bind site*, not as a runtime lookup.

## SOLID, mapped

### Single responsibility

One capability per operation; one reason to change. The test is the bind test: if two callers would want different halves, they are two operations. A `## Capability` that has to enumerate what it does is a Capability with more than one job.

Judged by `no-monolith-masking-steps`, `capability-as-op-inventory`, `numbered-protocol-phases` (where the phase boundary is really an operation boundary), `artifact-name-is-filename` (a filename selected by a mode means one operation per mode).

### Open–closed

A group is extended by adding a file. Folder contents are the membership set, so a new operation joins with no edit to the container and no edit to a sibling — the container is the extension point, and anything hoisted there reaches every future operation as well as every present one.

When a new caller needs a *variant*, add an operation. When it needs the same operation with one more knob, add an optional input with a `#### default` and keep existing callers working. What you do not do is fork a near-miss: an existing shared operation that almost fits still owns the capability.

Judged by `duplicate-shared-capability` (read its near-miss carve-out), `hoist-shared-inputs`, `alternate-ops-as-protocol-sequence` (modes multiplexed inside one Protocol are the closed form; separate operations are the open one); principle *Prefer Shared Capability*.

### Liskov substitution

The operations of a group are substitutable at a bind site when each honours the container's contract. `meta/techniques/cargo-operations/` is the worked case: `check`, `clippy`, `test`, and `fmt-check` each emit `{ check_id, passed, diagnostics }`, so a caller can fold any of them without knowing which ran.

Two ways to break it:

- **Silent narrowing** — an operation inherits an input it cannot spend and ignores it. `fmt-check` shows the honest form instead: it declares that `{features}` does not apply, because formatting does not compile. Declared narrowing is a contract; silent narrowing is a trap.
- **Shape drift** — two operations emit differently-shaped values under the same id, so a caller that folds one cannot fold the other.

A related note on redeclaration: a leaf may restate a container slot to narrow it, as `fmt-check` does. A leaf whose declaration is byte-identical to the container's is carrying no meaning and is the redundant form `hoist-shared-inputs` names.

Judged by `io-id-shape`, `hoist-shared-inputs`, `declared-input-never-read`, `output-without-destination`.

### Interface segregation

No consumer should be made to receive what it does not read. This bites on two surfaces:

- **The contract.** Declare narrow. A caller binding an operation should not have to supply values it never spends, and facets of one document belong as `####` members of one output rather than as sibling `###` entries. `declared-input-never-read`, `no-opaque-artifact-path-array`, `output-without-destination`.
- **The delivery.** A citation is a delivery instruction — what it resolves to is what the server loads into the consumer's context. Cite the section, not the file, and split a resource so its sections *are* deliverable. `whole-resource-for-one-section`, `framing-outside-any-section`; principles *Cite Resources at Section Grain* and *Resources at the Abstract Level; Split for Section Delivery*.

### Dependency inversion

An operation depends on its declared contract, never on who calls it. The bag is the injection point: a value arrives because a name matched, not because a named producer ran. Every form of naming the caller is the same defect wearing different clothes:

| The inversion | Entry |
|---|---|
| I/O prose naming a producer or consumer | `io-agnostic-contract`, `technique-ref-in-io-contract` |
| Reaching a raw harness tool a wrapping operation owns | `canonical-technique-reference`, `unowned-harness-capability` |
| Naming the surrounding activity, stage, or gate | `technique-stage-agnostic`; principle *Keep Orchestration in Structure* |
| Requiring a human on the other end | `session-interaction-in-technique`; principle *Keep Session Interaction in Activities* |

### The forces underneath

Cohesion and coupling are what the five principles trade against, and the entry that judges the resulting locus is `capability-group-placement` — a reusable primitive trapped in a client workflow, or a cross-consumer capability named for one activity, is a cohesion failure that every other check will pass.

## Distribution of functionality

Two questions place any sentence you are about to write: **what kind of thing is it**, and **what is the smallest scope that covers everything it governs**.

| The thing | Its construct | Smallest scope | Fires when misplaced |
|---|---|---|---|
| what a value *is* | Inputs / Outputs entry | the operation that receives or exposes it | `procedure-in-io-contract`, `technique-ref-in-io-contract` |
| what the operation contributes | `## Capability` | the operation | `procedure-in-capability`, `capability-as-op-inventory`, `deployment-path-in-capability` |
| an ordered outcome | Protocol phase | the operation | `rule-as-protocol-step`, `numbered-protocol-phases` |
| a branch on one instruction | `>` note under that bullet | that step | `constraint-as-blockquote`, `local-rule-as-note`; principle *Isolate Conditional Branches as Notes* |
| an invariant over the whole operation | `## Rules` entry | the operation | `no-one-step-rules`, `rule-binds-beyond-its-operation` |
| an invariant over sibling operations | container `## Rules` | the group | `single-rule-authority`, `inherited-rules-re-enumerated` |
| a vocabulary, criteria table, or policy matrix | a resource, cited by section | the workflow | `operative-criteria-need-a-home`, `resource-fills-not-does` |
| a document's layout | creation-guide `## Template` | the workflow | `no-template-creation-guide` |
| the order two operations run in | activity `steps[]` | the activity | `pass-orchestration-in-technique`, `bind-site-is-orchestration-truth` |
| a gate, a question, a loop | activity checkpoint / `when` / loop step | the activity | `checkpoint-not-prose`, `loop-not-prose`, `technique-stage-agnostic` |
| a fact of session state | one workflow variable | the workflow | `no-derived-state-shadow`; principle *Single Source of Truth* |

### Hoist and sink

Both moves read the same rule in opposite directions, but the *test* differs by kind, and conflating the two is the common mistake:

- **Inputs hoist on concept identity.** One concept carries one id corpus-wide, so a value several operations share belongs on their smallest common container even where a leaf never spends it. `hoist-shared-inputs` — note its carve-out for a slot only two or three operations share, which does not earn a trip to the root.
- **Rules hoist on governance reach.** A rule lives at the smallest container covering everything it governs, and no higher. A rule on a container reaches every operation in the folder present and future — that reach is its cost as well as its benefit, because an operation that cannot honour it is a substitution break the loader will never catch. `rule-binds-beyond-its-operation`, `single-rule-authority`, `no-one-step-rules`.

When in doubt, sink. Hoisting is the move that binds readers who never asked.

### How big is an operation

| Test | Question | What it settles |
|---|---|---|
| Bind | would two callers bind different halves? | split into two operations |
| Product | does it yield one coherent thing? | several files means several outputs; a name chosen by a mode means one operation per mode (`artifact-name-is-filename`) |
| Reorder | does the order of these phases matter? | ordered outcomes are phases; alternatives a caller picks one of are operations or rules (`alternate-ops-as-protocol-sequence`; principle *Phase by Sequenced Outcome*) |
| Substitution | can a caller fold any sibling's answer without knowing which ran? | if not, the group has no interface yet |
| Floor | is the second member hypothetical? | do not invent a group for it (`capability-group-placement` carve-out) |

### The aggregate member

A group whose operations share an output shape earns one more member: the one that runs the useful combination and folds the results into a single gateable value. `run-suite` is that member for the cargo group — its contribution is not a new capability but an aggregate shape (`failed_checks`, `first_failure`, `validation_passed`) that lets a caller gate on one value and still reach every diagnostic.

The reusable lesson is the fold surface. **How** the combination runs is a separate question, and it is the one `pass-orchestration-in-technique` judges: sequencing siblings inside a Protocol is what that entry forbids, and the composition layer is the activity. Read the entry before writing an aggregate — a fold over statuses the activity already produced is the shape that is never in doubt.

## Designing a group

1. **Enumerate the domain's real surface.** Read the tool, not your memory of it — a CLI's subcommand list and the flags that change its product, an MCP server's tool schemas and resources. Every operation you write is a promise the surface can keep, and this is the step that stops an operation set from being a guess.
2. **Cut the surface to what a caller would bind.** The surface is not the operation set. Keep what a step would name; drop what no workflow would ask for, and everything that mutates state outside the working tree (`no-user-env-mutation`).
3. **Find the shared contract.** What every operation needs — the scope, the target, the credentials — becomes container Inputs. What every operation must honour — a budget, a freshness precondition, a channel restriction — becomes container Rules. This is the constructor and the invariant set.
4. **Fix one output shape.** Decide what a caller gets back and make every operation's answer wear it. This is the group's interface, and it is what makes an aggregate possible later.
5. **Write the leaves.** One capability each. Phases only for ordered outcomes. A failure is handled in the step that raises it.
6. **Name everything once.** One concept, one id, corpus-wide, in the shape its kind requires.
7. **Place the group.** `meta` when it is reusable across workflows; the workflow root when it is intrinsic; an activity-named group only when the set is genuinely an activity seam. `capability-group-placement`.
8. **Self-check, then guards.** Route through the file-kind row in [canon-map.md](canon-map.md#file-kind-routing), then run the guard registry.

### Worked: the cargo group

The group in `meta/techniques/cargo-operations/` is the reference for every step above.

**Surface, then cut.** `cargo` exposes far more subcommands than a workflow would ever bind. The ones that change a Rust project's *product* are few, and the cut asks what a step actually needs: a validation gate needs a verdict, an inner test loop needs the *cheapest* verdict, a release step needs the artifact. That yields the cheapest verdict (`check`), the lint verdict (`clippy`), the behaviour verdict (`test`), the style verdict and its fixer (`fmt-check`, `fmt-fix`), the two builds that genuinely differ in product (`build-dev`, `build-release`), documentation as a compile check (`doc`), and the environment probe that makes the rest fail fast (`preflight`). `cargo publish`, `cargo install`, and `cargo add` are on the surface and stay off the operation set — they mutate outside the working tree, and availability is not a reason to wrap.

**Why the fixer is its own operation.** `fmt-check` returns a verdict; `fmt-fix` rewrites the tree. One operation with a boolean input would return a different *kind* of thing depending on an argument — the shape that fails the product test, and a substitution break for any caller folding verdicts.

**Why dev and release are two operations, not one with a profile input.** They differ in product — the release build is the only one that emits the runtime wasm artifact — and in budget, since it is the only one that omits the skip flag. The distinction is load-bearing enough to carry its own rule (`keeps-wasm-artifact`), and a rule that governs one arm of an input branch is a rule whose scope has nowhere to sit.

**Shared contract.** `{build_scope}` and `{features}` sit on the container because every compiling operation takes them — constructor parameters, not per-operation ones. The formatting operations narrow by declaration, stating that `{features}` does not apply.

**Shared invariant.** The resource budget is one rule on the container, not a paragraph repeated on each leaf: every invocation carries the env caps and no operation calls bare `cargo`. Nine copies of that paragraph would be nine places to drift.

**The uniform verdict.** `{ check_id, passed, diagnostics }` costs a leaf nothing and buys the aggregate everything.

## Reviewing a technique

Three lenses past compliance. Each names what to observe; the entry named beside it decides.

### Ontological soundness

Does each construct hold the kind of thing that construct is for, and does each name denote what the thing is?

- **Kind fit** — read each section and name the kind of statement in it. A how in Inputs, a what in Protocol, an invariant standing as a step. `procedure-in-io-contract`, `contract-not-procedure`, `procedure-in-capability`, `rule-as-protocol-step`, `no-one-step-rules`.
- **Denotation** — does the id name the thing, in the shape its kind requires? `boolean-id-shape`, `collection-id-shape`, `io-id-shape`, `rule-slug-shape`, `resource-id-names-its-content`; principle *Name Symbols Affirmatively*.
- **Ownership** — for every claim, name the surface that owns its subject. `rule-binds-beyond-its-operation`, `cited-home-owns-claim`, `canonical-fact-home`, `operative-criteria-need-a-home`.
- **Reachability** — every read has a producer and every product has a reader. `bind-protocol-locals`, `declared-input-never-read`, `output-without-destination`, `unproduced-value-read`. The `binding-fidelity` guard settles most of this mechanically; run it before reading for it.

### Stylistic elegance

Elegance here is not decoration. It is the property that a reader can predict the next line.

- **Symmetry** — sibling operations share section order, slot names for the same concept, and output shape. Asymmetry that carries no meaning is noise. The baseline is the sibling file, not this reference; principle *Convention Over Invention*, and the convention-conformance unit.
- **Economy** — every sentence earns its line. `no-rationale-in-description`, `no-duplicated-guidance`, `omit-null-sections`, `cut-comment-jsdoc-verbosity`.
- **Voice** — imperative in Protocol, declarative present elsewhere, addressed to the reader. `avoidance-voice-in-definitions`, `instruction-narrates-an-actor`, `no-delivery-mechanism-narration`; principle *Document in Positive Present*.
- **Form** — the typographic namespaces stay separate: braces name values, parentheses carry arguments, backticks mark code, dots address rules. `backtick-code-tokens`, `brace-declared-ids`, `paren-invocation-args`, `dotted-rule-address`, `anchored-protocol-references`; principle *Distinguish Designators from Parameters*.

### Efficiency

Three costs, and they trade against each other.

- **Authoring cost** — how many places change when one fact changes. One is the target. `canonical-fact-home`, `single-rule-authority`, `stale-restatement-after-change`, `factor-repeated-paths`, `bag-value-as-literal`.
- **Delivery cost** — how many bytes reach the agent to do one step. An operation's bundle carries its ancestors' merged contract, so everything on a container is paid for by every operation in the folder — which is the counterweight to hoisting, and the reason a citation names a section. `whole-resource-for-one-section`, `framing-outside-any-section`, `hoist-shared-inputs` read in the other direction.
- **Runtime cost** — whether a caller can pick the cheapest operation that answers the question. Where a group's operations differ materially in cost, the corpus states that in Capability so the choice is visible at the bind site: `check` is described as the cheapest validation pass, and the group's `scope-narrow-then-wide` rule says when to spend more.

### What a review owes

Findings go through the Audit path and the shapes in [reporting.md](reporting.md) — a design lens does not get its own report format. A judgement with no entry behind it is not a finding: say what would have to change and which entry would then fire. Where a real defect genuinely has no home in the catalog, propose the entry — `operative-criteria-need-a-home` is the migration, and carrying the criterion in a review instead is how a second home starts.

## Where this reference stops

- **No Detect bodies.** Every judgement above resolves to a named entry; open it.
- **Field-level schema truth** is `schemas/`. **Loader composition** — inheritance merge, `Initial` / `Final` wrapping, renumbering — is `docs/technique-protocol-specification.md` and the meta workflow-canonical resource.
- **Conventions** are the live sibling files. This reference says which questions to ask about them; it is not the baseline.
