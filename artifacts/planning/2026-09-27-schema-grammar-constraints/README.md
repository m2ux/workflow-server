# Schema grammar and constraints specification

Requirements record for the rules a definition must satisfy that JSON Schema cannot state. Follows
[#933](https://github.com/m2ux/workflow-server/pull/933), which limits schema descriptions to short,
author-facing notes on each value.

## Problem

A schema description is a hover hint: what the value is, and the one constraint an author is most
likely to break. Two kinds of rule do not fit there, and JSON Schema cannot express either:

- **The `when` expression language.** Step gates and exit selectors are strings in a recursive
  grammar. A `pattern` is a single regular expression and cannot match balanced parentheses, so the
  schema types the field as `string` and nothing more. The grammar is written only in the header
  comment of `src/schema/when-expression.ts`, which authors never see.
- **Rules that span fields or files.** Loop shape, exactly one default exit, every exit bound in the
  graph, a default inside its value set, a fan's members and ceiling. These live in Zod refinements,
  loader checks and guards. An author finds each one by breaking it.

## Current state

| Where a rule lives | Count | Identifier |
| --- | --- | --- |
| Guard findings (`guards/check-*.ts`) | 106 distinct check ids across 59 guard programs | String literal, e.g. `check: 'repeat-loop-with-break'` |
| Loader graph checks (`src/loaders/workflow-loader.ts`) | 15 | Comment only, `// L2` … `// L13` |
| Zod refinements (`src/schema/`) | 3, plus regex messages | None |
| Field ownership and strictness | Every annotated field | Generated into `schemas/enforcement.json` |

`guards/guards.ts` already registers every guard *program*, so a new guard runs without anyone
having to remember it. `enforcement()` already attaches metadata to schema fields, and the build
collects it. Nothing registers individual *rules*.

### Observed in the `when` implementation

- The rule against mixing `&&` and `||` is only checked outside parentheses: `assertWhenAuthoring`
  tracks `&&` and `||` at depth 0 alone, so `(a && b || c)` passes despite the documented rule.
- An unquoted word on the right of a comparison is a string literal (`kind == review`), and so is a
  dotted one (`a == b.c`).
- Numbers are integers only; `1.5` is a tokenizer error. Ordering comparisons coerce both sides with
  `Number()` and are false when either is not finite. `==` and `!=` compare strictly.
- `x == null` is false for an absent variable, which reads as `undefined`.
- An expression that fails to parse evaluates to false.
- The structured `condition` object (`condition.schema.json`) is a second language for the same job.
  On a checkpoint, `condition` is what makes the gate dismissible, which `when` cannot do.

## Draft requirements

- **R1** An author can read the complete `when` grammar and its evaluation rules without reading
  source.
- **R2** The grammar spec and the parser cannot disagree unnoticed: a test fails when they diverge.
- **R3** The `when` field's schema description links to the grammar spec.
- **R4** Every rule on an authored field has a stable id, the field path it governs, one plain
  statement, what enforces it (schema, loader or guard) and whether a failure blocks.
- **R5** An author can list the rules that apply to a given field from published material, meaning
  the schema reference page or an MCP resource.
- **R6** A check cannot emit an unregistered id, and a registered rule cannot go unenforced: a guard
  fails in both cases.
- **R7** Corpus conventions that govern no schema field (citation form, harness maps, prose homes)
  are outside the published spec.

## Proposed shape

- **Grammar.** `docs/when-expression.md` holds the EBNF, the literal and identifier forms, evaluation
  (truthiness, coercion, fail-closed) and the authoring rule. A test parses every example in the doc
  with `parseWhen` and checks its stated result.
- **Constraints.** A catalog in `src/schema/constraints.ts` declares each rule once as a typed
  constant (`id`, `applies`, `statement`, `enforcedBy`, `blocks`). Guards emit
  `check: RULE.id`, loader errors cite the id, and refinements attach rules through a wrapper like
  `enforcement()`. `build:schemas` writes `schemas/constraints.json` keyed by field path, and the
  schema reference page lists each field's rules. Guards import the catalog, never the reverse.
- **Rollout.** Grammar first. Then the constraints catalog with the loop, exit and graph rules,
  followed by one guard at a time.

## Open questions

1. **One gate language or two?** Should `condition` go, with `when` gaining whatever checkpoint
   dismissal needs? That would leave one grammar to specify rather than two.
2. **Nested mixing.** Should the `&&`/`||` mixing rule apply at every depth, as documented? Or should
   the spec narrow to top level to match the checker?
3. **Grammar source of truth.** Should the doc be hand-written and pinned by an example test, or
   generated from a grammar constant exported by `when-expression.ts`?
4. **Constraint catalog.** Should the catalog be generated as proposed, or be a hand-written
   `docs/constraints.md` kept accurate by review?
5. **Catalog placement.** Should the catalog be a single file, or declared per schema module
   (`activity`, `workflow`, `routine`, …)?
6. **Delivery.** Should `constraints.json` be served as an MCP resource beside the schemas, or only
   rendered on the site?
7. **Link form.** Editors do not resolve relative links in a JSON Schema description. Should the
   `when` description carry an absolute site URL?
