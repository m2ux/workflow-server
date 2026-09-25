# Identifier conventions

Every identifier in a workflow definition belongs to one of two namespaces, and which one it belongs to decides how it is spelled. This is not a house style: a symbol id is matched against a runtime variable by exact string, so the wrong alphabet does not bind.

These rules govern technique inputs and outputs, protocol variables, activity variables, exit predicates, session state and rule names. The [technique protocol specification](technique-protocol-specification.md) applies them to technique files; `check:identifiers` and `check:technique-template` enforce them corpus-wide.

## The symbol model

A technique has one namespace of **mutable symbols**. Direction is **structural** — carried by the section a symbol is declared under, never by its spelling:

- An **input** (`## Inputs`) is a symbol *populated on entry*, by the caller or by an upstream technique's output bound to it. An optional input may be absent and falls back to its `#### default`.
- An **output** (`## Outputs`) is a symbol *exposed at the technique's surface on completion*.
- A **protocol variable** (`{$name}`) is created and used within one protocol run, neither received nor exposed.

### A symbol declared on both sides

A symbol may be declared in **both** Inputs and Outputs. That is not a contradiction. It means the symbol arrives populated if the caller provides it, may be mutated or freshly computed during the protocol, and its final value is exposed on completion.

An idempotent resolver — receive or compute, then expose — is the canonical case. It is also why a value one technique produces and others consume can still be hoisted to a common ancestor: declare it as a shared input on the ancestor, and let the producing technique additionally declare it as an output.

## Symbol ids are snake_case; names are kebab-case

The two namespaces are distinct, and the split is the classical one. Evaluated identifiers are snake, because a `-` reads as the subtraction operator. Surface and slug tokens are kebab. Here it is also a binding requirement: a kebab symbol id would not match the snake variable the engine looks up.

### Why a symbol must match exactly

A symbol — an input, an output, or a protocol variable — becomes a runtime variable. The engine stores variables in a name-keyed bag and resolves references by exact string match (`getVariableValue`). The agent sets a variable under the name the prose dictates, and activity gates and exit predicates read it by that same name. So a symbol id must be the *same string* as the variable it binds to.

Activities, conditions and session state are authored in `snake_case` — `target_path`, `is_review_mode`, `planning_folder_path` — so symbol ids are `snake_case`, and protocol variables follow suit (`{$resolved_content}`). Case carries no meaning beyond this. In particular it does **not** distinguish input from output, direction being structural.

### Mirroring an external parameter

An id that mirrors an external tool, server or command-line parameter takes that tool's exact spelling, so it binds natively with no translation. That is usually already snake (`session_index`, `repo_path`) and occasionally camelCase (Atlassian's `cloudId`).

### What counts as a name

A name — a technique, operation or resource identity, and the file, hyperlink or `::` target that addresses it — is a slug, never an evaluated variable, and is `kebab-case`: `create-issue`, `resolve-cloud-id.md`.

#### Rule names are names too

A rule is never an evaluated variable. It is cited by its dotted symbol address, `[workflow.]technique.rule-name`, sitting beside the kebab technique name, so a rule name is `kebab-case` and the citation reads uniformly: `index.freshness-checked-first`.

## Grammatical shape encodes the kind

Case settles which alphabet an id uses. Structure settles which words it uses, and in what order, so a reader infers from the shape alone whether a value is a flag, a collection, a map or a scalar.

### Booleans

A boolean is an **affirmative predicate** — the statement that holds when the value is `true`, so a condition reads as an assertion: `squash_merge_supported`, `index_fresh`, `pr_merged`.

An `is_`, `has_`, `can_` or `should_` prefix is value-gated, added only where it sharpens the predicate rather than required. A bare affirmative noun phrase, or a past-participle result flag such as `worktree_created` or `review_passed`, already states the condition that holds and is conformant as written.

Non-conformant: a negated stem (`not_ready`), a generic-noun id that buries the predicate (`…_flag`, `…_status`, `…_check`), or an ambiguous noun.

### Collections and maps

A collection iterated as a whole is a **plural item noun** — `tasks`, `failures`, `open_assumptions` — with no `_list`, `_array`, `_collection` or `_set` representation suffix. A value addressed by key is **singular** and names the mapping: `domain_to_range`. Shape decides, not the underlying container type.

### Inputs and outputs

An input or output id is a **qualified noun phrase with the head noun last**. Adjectival and role qualifiers precede the head, and the rightmost token is the thing the value *is*: `reconciled_assumptions`, `lint_diagnostics`.

One concept carries one name corpus-wide — hoist it to the common ancestor rather than letting per-technique synonyms drift. The representation is never part of the id (`assumptions-log`, not `assumptions-log-path`), and direction is never encoded in it, direction being structural. A kind suffix that *is* the concept — `_mode` or `_type` for an enum or mode discriminator — is a head noun and stays.

## Rule names state the invariant

A rule name is a **positive declarative assertion of the invariant it guards**. It names the state that must hold, rather than a negation or a narration of process: `assumptions-resolved-before-review`, not `do-not-review-unresolved`. A grouped key with a qualifier stays positive too — `commit.signed`, not `commit.not-unsigned`.

The positive form is preferred only where it reads at least as clearly. A negation carrying irreplaceable clarity — `do-not-mask-flaky`, `never-resume` — is the right name and stays.

## Where the catalog is

The anti-pattern this page derives from is AP-60, in the [anti-pattern catalog](../corpus/canon/resources/anti-patterns.md), which carries the full authoring set.
