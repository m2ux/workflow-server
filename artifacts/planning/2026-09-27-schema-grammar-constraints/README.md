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

## Reliability review

The initiative ([#936](https://github.com/m2ux/workflow-server/issues/936)) was reviewed against
its goal: an agent working from the workflow-design skill produces a workflow that loads, passes
every check, fits what can be delivered, runs correctly, and is well designed. Fifteen gaps were
found and each is now owned. Owners use the epic numbering in the next section.

| # | Gap | Owner |
| --- | --- | --- |
| 1 | Published schemas carry server-built fields; rules differ between authored and materialised forms | E01 W03 (#937) |
| 2 | Ten convention guards fail changes against rules no stated set contains | E01 W06 |
| 3 | Resource files and cross-references have no grammar | E01 W08 |
| 4 | The execution model and delivery limits are absent from the set | E03 (#939) |
| 5 | No catalogue of existing reusable parts | E05 W02 (#938) |
| 6 | Nothing proves the spec complete; the loader skips misnamed files silently | E01 W10 |
| 7 | The canon contradicts itself and the code; citations drifted | E02 (#940) |
| 8 | Every check is static, and none runs on a draft | E04 (#941) |
| 9 | Rule entries carry no fix | E01, every rule and reference entry |
| 10 | Principles and anti-patterns are not indexed by construct | E02 W03 |
| 11 | "Reliable" has no definition, target or quality measure | E06 (#942) |
| 12 | Whether the skill needs a design method | E06 W06, which adds the method to the skill |
| 13 | Skill, reference, server and corpus can disagree on version | E00 W02, E01 AC17, E05 W05 |
| 14 | In-flight language changes (#709, #750, I00 E07, I06) | Initiative sequencing: spec-first, with the server's declared version |
| 15 | The `ebnf` package does not generate sentences | E01 W01 |

Decisions taken with the review:

- Convention rules join the registry.
- The execution model is a sixth member of the set.
- A design method enters the skill only on E06's evidence.
- The spec describes the language as it stands, and moves spec-first (see Home).

## Home

The language moves to its own orphan `language` branch
([#943](https://github.com/m2ux/workflow-server/issues/943)), separate from the server and the
corpus. `workflows` and `engineering` already set this pattern, provisioned as worktrees.

**Why.** The language is a contract:

- it has several implementers: the loader and guards, the walker, the I00 runner and the I03 typed
  language;
- it has several consumers: corpus authors and the workflow-design skill;
- a registry that checks an implementation against a spec needs the spec upstream of every
  implementation.

**Split.**

| Home | Holds |
| --- | --- |
| `language` | `grammar/*.ebnf`, `constraints/*.als`, the rule catalogue, the definition-file JSON Schemas, the canon (principles, anti-patterns, convention conformance, construct inventory), notation primers, the generated reference, its own CI |
| `main` | Zod as the implementation; the rule-to-enforcer map; conformance tests; draft verification; the assembled-object and session-file schemas |
| `workflows` | Workflows only |
| `workspace` | The workflow-design skill, linking into the language worktree |

**Decisions.**

- **Canon:** moves to the language branch.
- **Skill:** stays on `workspace`.
- **Change flow:** the server declares the spec version it implements. Conformance runs at that
  version and reports newer rules as pending, so a language change never reddens `main`. This
  replaces "update the spec in the same change", which two branches cannot honour.

**Order.** The move comes first. Existing artifacts move unchanged, consumers are rewired, and the
originals are deleted, so the structure can be tested before any spec is written into it.

**Epic numbering.** Epics are numbered in the order they run:

| Epic | Work | Issue |
| --- | --- | --- |
| E00 | Language branch | #943 |
| E01 | Formal specification | #937 |
| E02 | Canon | #940 |
| E03 | Execution model | #939 |
| E04 | Draft verification | #941 |
| E05 | Workflow-design skill | #938 |
| E06 | Reliability evaluation | #942 |

**Cost.** The rewiring costs:

- a second namespace root for `canon` in the server;
- `SCHEMAS_DIR` pointed at the language worktree;
- `check:schemas` comparing against the language copy;
- a CI checkout beside `workflows`;
- provisioning and sandbox roots;
- a small Node project on the branch.

## Second review

A second review of the initiative and its seven epics found sixteen problems. All are folded into
the issues.

| # | Problem | Resolution |
| --- | --- | --- |
| 1 | Deployed image copies `schemas/` from `main`; hosts refresh only `workflows`, so deletion strips deployed servers | E00 W03: the image build checks out the declared language tag; originals deleted only after it ships (W05) |
| 2 | `workspace` consumers (the `workflow-canon` skill) name moved canon paths | E00 W02: a sweep of every branch repoints each reference |
| 3 | `main` would turn red between the rewire and the declared version | The declared tag arrives with the rewire (E00 W02); E01 W02 adds per-rule pending reports |
| 4 | "Spec version" was undefined | A `language/vX.Y.Z` tag, checked out by CI, provisioning and the image; the head is read only for pending rules |
| 5 | A release adding several rules blocks the server's bump | Each release adds one rule family |
| 6 | "Serves the same resources" had no baseline | Snapshot at `main/v0.29.0` and `workflows/v0.33.0`, reproduced exactly (E00 AC3) |
| 7 | E01 AC2 contradicted AC15 | AC2: an Alloy fact or a registered convention rule |
| 8 | Binding resolution owned by E01 W03 and E03 W02 | E01 W05 owns binding and provenance; E03 keeps visibility, audience, inheritance and size |
| 9 | Specifying `condition` ahead of its retirement | E01 W01 covers `when` only; #750 before E01 W05 (AC18) |
| 10 | Skill links to worktree paths fail on a deployed setup | The skill links MCP resources served at the declared tag (E05 AC7) |
| 11 | E06 baseline measures homes the migration deletes | Baseline at the pre-migration tags (E06 W04) |
| 12 | Quality audit instrument unnamed and uncalibrated | Named, calibrated on seeded faults, independent of the skill (E06 AC7) |
| 13 | Brief outcomes not checkable by a walk | Outcomes written as walk assertions (E06 W01) |
| 14 | I03 E00 W09 overlaps E01 | #535 W09 starts from I07 E01 |
| 15 | "Corpus design principles" after the canon moves | Wording corrected in #936 |
| 16 | Issue links point at this unmerged planning branch | Repointed to `engineering` once #935 merges |

Decisions taken with the review:

- **Deployment:** the image includes the declared language tag.
- **Version:** a `language/vX.Y.Z` tag, one rule family per release.
- **Skill links:** MCP resources.

## Ordering review

A third pass checked every task's dependencies as a graph. It confirmed there are no cycles and
that every dependency names a real task. It then renumbered so that epics run in number order,
and so that tasks within each epic are numbered in the order they can start.

**Moved or removed.**

- **Pending-rules report:** moves from E00 to E01 W02. It needs the rule catalogue, and it made E00
  depend on a later epic.
- **E05's design-method task:** removed. It duplicated E06 W06, which adds the method, and made
  E05 depend on a later epic.
- **E02's contradiction list:** narrows to the canon itself. Non-canon homes are E05 W03's to repoint
  or delete.

**Dependencies corrected.**

- **E01 W01:** also waits on the language branch CI (E00 W04), which it extends.
- **E01 W03 (definition-file schemas):** comes before the rule families, so each rule is written
  against authored fields with its form tag.
- **E01 W10 (completeness):** waits on every rule family, and W11 (`enforcement.json`) waits on W10.
- **E02 W04 (mechanical anti-patterns):** waits on E01 W10. It needs every family, not just the first
  slice.
- **E03 W03 (contract inheritance):** also waits on the technique outline (E01 W07).
- **E05 W03 (prose homes):** needs the moved canon and the first reference, not the skill, so it runs
  earlier.
- **E06 W03 (harness):** waits on the draft walker (E04 W02), because fitness is measured by walking
  a draft.
- **E06 skill runs:** wait on the distributed skill and the complete validator.

**Longest chains.** A full enumeration by the dependency checker finds twelve chains tied at nine
steps. A hand count first reported two, running through E01 W05 and W09. All twelve start with the
language move (E00 W01), and ten pass through E01's vertical slice (W01), so those two set the pace.
The chains end in the canon guard (E02 W05) or the design-method verdict (E06 W06). Three show the
range:

- E00 W01 → W02 → E01 W01 → W03 → W04 → W07 → W10 → E02 W04 → W05
- E00 W01 → W02 → E01 W01 → E04 W01 → W02 → E06 W03 → W04 → W05 → W06
- E00 W01 → W02 → W05 → E02 W01 → W03 → E05 W04 → W05 → E06 W05 → W06

## Outcomes mapping

Every Work Breakdown row now ends with the acceptance criteria it delivers: each epic's tasks cite
the epic's criteria, and the initiative's epics cite the initiative's. A criterion that binds
several tasks, such as E01's EBNF conventions (AC11) on every grammar task, is cited on each. Epic
tables put the PR column last.

Mapping every row to a criterion found four gaps:

| Gap | Resolution |
| --- | --- |
| E00 W04 (language branch CI) delivered no criterion | E00 AC10: the branch runs its own verify job on every change |
| E01 W09 (session transitions) delivered no criterion | E01 AC20: transitions stated in Alloy 6 temporal logic, checked by the Analyzer |
| E01 W11 (`enforcement.json`) delivered no criterion | E01 AC21: severity stated once, in the registry |
| E05 AC11 (ships meeting the thresholds) was delivered by no E05 task, and duplicated E06 AC6 | Removed; E05's Non-goals name E06 as the owner |

The initiative's first ten criteria restated its epics' criteria almost word for word. They are
replaced by five SMART Goals, each bounded by a milestone and made true by the epics' criteria
together, so goals are not ticked and the initiative closes when every epic has:

| Goal | Milestone | Delivered by |
| --- | --- | --- |
| G1. Agents working from the skill meet every threshold E06 sets across the held-out briefs | E06 W06 | E05, E06 |
| G2. Every rule has one formal statement under a rule id, bound to its enforcer; the build fails on disagreement, and nothing lacks a rule id or disposition | E01 W10 | E01, E03 |
| G3. A draft outside the corpus is checked, walked, costed and model-checked through one MCP tool | E04 W04 | E03, E04 |
| G4. Every member of the set and the catalogue is reachable from the skill as a resource from its single source, and no prose home restates a rule | E05 W05 | E02, E05 |
| G5. The language lives only on its branch, versioned by tag, and a deployed server serves the tag it declares | E00 W05 | E00 |

## Tables as the statement of order

The issue bodies no longer narrate order or its reasons: #936's Sequencing section and its
paragraphs after the table are gone, and its one design rule (spec-first language changes) is a
Solution bullet. The chains above stay here.

- **Initiative Depends on** names epics only: the other epics each epic's tasks depend on, less
  those another named epic already depends on, as derived by the dependency checker. It replaces
  prose such as "W01 at once; the skill (W04) on …" and task-level references. E01 on E00; E02 and
  E03 on E01; E04 on E03; E05 on E02 and E04; E06 on E05. The task-level detail lives in each
  epic's table.
- **Implied dependencies removed:** E01 W10 waits on W06–W09 (W04 and W05 are implied), E05 W04
  drops E01:W01 (implied by E04:W01), and E05 W05 drops E00:W02 (implied by W04).
- **Join made two-way** in E00 (W01–W04), E02 (W02–W03) and E04 (W03–W04).
- The longest chains are unchanged: twelve, nine steps each, all starting at E00 W01.

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

1. **Location.** *Settled:* `grammar/` and `constraints/` at the root of the `language` branch (see
   Home).
2. **EBNF runtime.** Depend on the `ebnf` package, or keep a small W3C EBNF interpreter in-tree? *Rec:
   the package. It has no dependencies, and the conformance tests pin its behaviour, so a later swap
   is contained.*
3. **EBNF dialect.** W3C EBNF (`::=`, `?`, `*`, `+`, character classes), or ISO/IEC 14977 (`=`, `;`,
   `[ ]`, `{ }`)? *Rec: W3C. The experiment's files were written in it, although its README cited ISO,
   and it is the dialect the `ebnf` package runs.*
4. **Constraint conformance.** Analyzer-generated fixtures (needs a JVM in CI), or hand-written
   fixtures per rule? *Rec: generated. Hand-written fixtures are the coverage gap already observed.*
5. **Zod.** *Settled:* hand-written on `main` as the implementation. The registry checks its rendering
   against the language branch's definition-file schemas.
6. **Gate languages.** Specify both `when` and `condition`, or retire `condition` and give checkpoints
   an explicit dismissibility marker (evaluation CON-07)? *Rec: retire it, and specify one gate
   language.*
7. **Severity model.** Two levels (error, warn), or keep the experiment's INFO? *Rec: two. INFO
   describes behaviour; it is not a rule.*
8. **Canon.** Should mechanical anti-patterns move into the spec as rule ids? *Rec: yes. The catalog
   keeps entries that need judgment, and cites rule ids by name.*
