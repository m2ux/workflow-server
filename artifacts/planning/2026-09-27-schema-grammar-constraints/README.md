# Formal specification of the definition language

Requirements and proposed design for one formal statement of the definition language, meaning its
grammar and its constraints. A registry checks that each implementation which claims to follow the
spec actually does. Evidence is in [inventory.md](inventory.md).

## Problem

The rules a workflow definition must satisfy have no single home, and no formal one.

- **Grammar is fragmented.** Twenty-three micro-grammars (gate expressions, references, identifiers,
  interpolation tokens, bag paths, keys, markdown outlines) are defined by hand-written parsers,
  regexes and prose. Most are parsed in more than one place, and the copies disagree. Only three have
  a single definition.
- **Constraints are patchy.** Rules are enforced by Zod, loaders, the routine resolver, runtime tool
  checks and 56 guards, under six identity schemes. The same rule carries different severities in
  different mechanisms, metadata contradicts behaviour, and some rules are stated with no check at all.
- **Design-time information is scattered.** About 11 prose homes restate rules, and they drift from
  the code and from each other. Anti-pattern numbers cited from code have mostly shifted since.
- **Formal artifacts have rotted before.** The 2026-02-10 EBNF and Alloy files described an abandoned
  design for six months, because nothing bound them to the implementation.

## Goals

- **G1 Stated once, formally.** Every grammar and every constraint is stated once, in a formal
  notation, with a stable identifier.
- **G2 Succinct at design time.** An author or designing agent can read the complete syntax and rules
  for a construct in one place, generated from the formal source.
- **G3 Checkable.** Each implementation that claims to follow a rule is registered against it, and a
  build fails when the implementation disagrees with the spec, when a rule has no enforcer, or when
  an enforcer cites no rule.
- **G4 Fewer rules to enforce.** Each rule is dispositioned by the ladder from the 2026-08-24 mitigation
  plan: delete it, make it unrepresentable, state it once, guard it. Prose alone is never a home.

## Non-goals

- Re-specifying YAML structure in EBNF. JSON Schema, generated from Zod, is already the formal
  statement of structure. The 2026-02-10 EBNF restated it, and the restatement rotted.
- Changing definition syntax as part of building the spec. Where writing a rule down exposes a defect
  (see inventory), that defect is fixed in its own change.

## Design

Three layers. The spec is the source. The registry binds the spec to code. Design-time material is
generated from both.

### 1. Formal specification — the source

| Concern | Notation | Covers |
| --- | --- | --- |
| Structure | JSON Schema, generated from Zod (existing) | Fields, types, closed objects |
| Syntax inside values | W3C EBNF, `.ebnf` | `when`, technique and routine references, identifiers, `{token}` interpolation, bag paths, instance ids, keys, filenames, semver, session index |
| Document outline | W3C EBNF over heading tokens, `.ebnf` | Technique markdown: sections, `####` members, `#####` fields, protocol blocks |
| Static semantics | Alloy, `.als` | Uniqueness, reference resolution, graph and exit binding, fans (today's L1–L16), variable provenance, loop shape, routine signature closure, value sets |
| Runtime semantics | Alloy 6 temporal, `.als` | Session transitions: checkpoint gating, frontier and fan join, status |

The formats are the ones the 2026-02-10 experiment used, `grammar/*.ebnf` and `constraints/*.als`.
None of its content carries over: it specified a superseded model.

- **EBNF is executable.** The `ebnf` package (MIT, no dependencies, TypeScript types) builds a parser
  from a W3C EBNF grammar at runtime. The `.ebnf` file is therefore both the readable spec and the
  reference parser. Its last release is 2023, a maintenance risk weighed in open question 2.
- **Alloy covers both semantics.** Alloy 6 adds mutable state and temporal operators, so static and
  runtime semantics share one notation and one analyzer.

- **Every production and every fact carries a rule id** and a one-line statement in its own comment.
  The ids are semantic slugs such as `loop.repeat-with-break` and `when.mixed-chain`. Numbered ids
  drift, as the AP catalog shows.
- **JSON Schema points into the grammar.** A string field whose value has syntax carries the name of
  the production that defines it. That makes the join between the two notations explicit and
  generated.
- **The Alloy model is checked on its own terms.** The Analyzer confirms the facts are satisfiable and
  that the asserted properties hold within a bound, for example "every fan joins exactly once".

### 2. Conformance registry — binding the spec to code

A generated module exposes one typed constant per rule id. A hand-written registry maps each rule to
its enforcers:

```ts
rule('loop.repeat-with-break', {
  severity: 'error',
  enforcedBy: [guard('check-loop-shape')],   // or zod(...), loader(...), runtime(...), parser(...)
});
```

- **Coverage.** Every spec rule has at least one enforcer, or states why it has none. Every finding,
  loader error and refinement cites a registered rule by constant, so an unknown id is a compile
  error.
- **Severity agreement.** A rule has one severity. An enforcer that blocks a warn rule, or warns on an
  error rule, fails. This replaces the unchecked `enforcement.json` owner/strictness metadata.
- **Grammar conformance.** Sentences are generated from each production, together with near-miss
  negatives. Every registered implementation of that grammar must accept and reject exactly as the
  reference parser does, which is the `.ebnf` file run by the `ebnf` package. Hand-written parsers and regexes remain only while this differential test keeps them
  honest, and are retired in favour of the generated one.
- **Constraint conformance.** The Analyzer enumerates small instances that satisfy every fact but one.
  Each is rendered as a fixture corpus and run through the real loader and guards. The run must be
  rejected under that rule's id at its severity, and instances satisfying every fact must load clean.
  This is model-based testing, bounded by the small-scope hypothesis.
- **Drift.** A regeneration guard fails when generated constants, descriptions or reference pages
  differ from the spec, extending today's `check:schemas`.

### 3. Design-time surface — generated

- **Construct reference.** Each construct gets one page listing its structure, value syntax
  productions and rules. It is served as an MCP resource beside the schemas and rendered on the site.
  Each rule entry holds its id, a plain statement, a link to its formal source, and a minimal
  passing and failing example. The failing examples are the Analyzer-generated conformance fixtures,
  so every published example has been checked against the real loader and guards.
- **Validation entry point.** A draft definition, including one outside the corpus, runs through the
  loader and every registered check, with findings by rule id. It is exposed as an MCP tool and an
  npm script.
- **Pointers, not restatements.** Schema descriptions and prose homes cite rule ids and stop
  restating rules. The canon's mechanical anti-patterns become rule ids in the spec, and the catalog
  keeps the judgment-only entries.

### 4. Agent interpretation

The formal files are read by designing agents through a workflow-design skill
([#938](https://github.com/m2ux/workflow-server/issues/938)). Neither format is reliable on its
own.

- **EBNF.** Models read EBNF well, and the failures sit at the edges:
  - **Dialect:** W3C, ISO and ANTLR spellings get confused. Each `.ebnf` file opens with a header
    naming its dialect.
  - **Whitespace:** whether space is allowed between tokens. The header states the rule.
  - **Choice:** ordered or unordered alternatives. The header states which.
  - **Meaning:** a grammar says what parses, not what it means. Every production that carries meaning
    has a one-line meaning comment, a valid example and an invalid example. A rule that can be
    syntactic is a production.
- **Alloy.** Models are much less fluent here:
  - **Operators:** join direction, closure and multiplicities are misread. The `.als` files keep to a
    restricted subset, with named helper functions in place of long operator chains, and a one-page
    primer covers it.
  - **Facts versus checks:** whether a declaration constrains instances or asserts a property is not
    obvious. The primer states which is which.
  - **Mapping to files:** a signature does not name a file or field. A generated table maps each
    signature field to its schema path.
- **Reading order.** The skill sends an agent to the per-rule reference entry first, the formal file
  second as the authority, and the validation entry point last to confirm a draft.
- **Measured sufficiency.** An evaluation records the rule-violation rate of agents authoring from
  the skill under three conditions: formal files alone, with the reference entries, and with the
  validator.

## Rollout

Each layer works end to end before the next begins.

1. **Vertical slice.** The `when` grammar and the loop-shape rules, carried through spec, registry,
   both conformance checks and the generated page. The slice exercises every mechanism and fixes
   `when.mixed-chain` (nested `&&`/`||` mixing passes today).
2. **Value syntax.** References, identifiers, tokens, bag paths, keys and slugs, retiring the
   duplicate regexes and guard re-parsers as each gets a generated parser.
3. **Static semantics.** Graph, exits and fans; variables and provenance; routines. Loader `L` rules
   and runtime `T` rules move to rule ids.
4. **Technique outline.** One outline parser from the grammar; the guard re-parsers retire.
5. **Runtime semantics.** Session transitions.
6. **Prose homes.** Re-point the canon and corpus docs, and delete the restatements.

## Open questions

Each has a recommendation for discussion.

1. **Location.** Restore root `grammar/` and `constraints/`, or nest both under one `spec/` root? *Rec:
   restore the root folders, the layout the experiment established.*
2. **EBNF runtime.** Depend on the `ebnf` package, or keep a small W3C EBNF interpreter in-tree? *Rec:
   the package. It has no dependencies, and the conformance tests pin its behaviour, so a later swap
   is contained.*
3. **EBNF dialect.** W3C EBNF (`::=`, `?`, `*`, `+`, character classes), or ISO/IEC 14977 (`=`, `;`,
   `[ ]`, `{ }`)? *Rec: W3C. The experiment's files were written in it, although its README cited ISO,
   and it is the dialect the `ebnf` package runs.*
4. **Constraint conformance.** Analyzer-generated fixtures (needs a JVM in CI), or hand-written
   fixtures per rule? *Rec: generated. Hand-written fixtures are the coverage gap already observed.*
5. **Zod.** Keep it hand-written as a registered implementation, or generate it from the spec? *Rec:
   keep it. Zod is the implementation, and the registry checks it.*
6. **Gate languages.** Specify both `when` and `condition`, or retire `condition` and give checkpoints
   an explicit dismissibility marker (evaluation CON-07)? *Rec: retire it, and specify one gate
   language.*
7. **Severity model.** Two levels (error, warn), or keep the experiment's INFO? *Rec: two. INFO
   describes behaviour; it is not a rule.*
8. **Canon.** Should mechanical anti-patterns move into the spec as rule ids? *Rec: yes. The catalog
   keeps entries that need judgment, and cites rule ids by name.*
