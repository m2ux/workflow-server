---
Subject: workflow-server YAML definition grammar — the activity and workflow tiers
Evaluation Date: 2026-08-25
Scope: expressiveness, architecture and feasibility of a shorthand expression grammar for activity and workflow YAML, measured against `origin/main` (`b061faee`) with `workflows/` read from the working tree
---

# Workflow Definition Grammar — Evaluation Report

## Executive Summary

The definition language carries two predicate dialects — an inline `when:` string and a structured
`condition:` tree — spread across six positions with five different availability profiles, plus a
workflow-tier `graph:` that admits no predicate at all. This evaluation measures what a shorthand would
have to express, where it would have to sit, and what it would cost to land, across the corpus of 17
workflow definitions, 122 activity files and 390 authored predicates.

| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 8     |
| Medium   | 16    |
| Low      | 10    |
| Total    | 34    |

Core finding: the shortfall this grammar was commissioned to close is mostly not a grammar shortfall —
it is a missing field, a missing enforcement location, and at the workflow tier a deliberate absence
that must be specified rather than filled.

## Core Finding

Three measurements taken together relocate the problem. Of the 37 distinct predicates that migrated
into the unconstrained `actions[].target` field, 33 already parse as valid `when` expressions today, so
they moved for want of a slot rather than for want of syntax — an action has no `when` field. Of the 109
structured `condition` blocks, 78 sit where the tree is the only spelling available and 9 more use
operators the string dialect does not have, leaving 19 genuine restatements rather than 75. And where a
terse form is already legal, available, shorter and documented, authors choose the explicit boolean
comparison 272 times against 9 — 96.8 per cent — buying the stronger assertion with four extra
characters.

The one place a new predicate language is assumed to be needed is the place that most clearly does not
want one. All 192 graph edges across 17 workflows and 106 nodes are bare destination strings with zero
exceptions, and the reason is stated in the schema: an activity names its outcomes and the workflow
names destinations, so a borrowed activity sits in any graph without its borrower having a say. That
absence is a rule, and `grammar/workflow.ebnf` and `constraints/workflow.als` should state it as a
constraint rather than invent an edge predicate language.

What is genuinely scarce is not expressiveness but enforceable location. Fifteen rules govern predicates
today. Ten of them live in prose descriptions, code comments, or nowhere, and cannot fail a build.

Testable prediction: for every rule the settled grammar states, name the artifact that fails when it is
violated. If a design lands that reduces the fifteen-rule count rather than relocating rules between
those four homes, this account is wrong. On present evidence a shorthand adds two rules — a presence
form and an emptiness form — and the default home for a new rule in this codebase is prose, which is
where the last seven went.

## Critical Findings

None.

## High Findings

### EXP-01 — the workflow tier's predicate-free graph edges are a stated invariant

- **Severity:** High
- **Description:** `GraphSchema` is `z.record(z.record(z.string()))` and all 192 edges across 17 graphs and 106 nodes are bare strings with zero exceptions. The schema states the reason, that an activity names outcomes and the workflow names destinations so a borrowed activity sits in a graph without its lending workflow having a say. Adding an edge predicate repeals that rule, and no test asserts it.
- **Classification:** Invariant — specify the absence
- **Location:** `src/schema/workflow.schema.ts:62` and `:78`; `workflows/**/workflow.yaml` graph blocks

### EXP-02 — neither predicate dialect contains the other

- **Severity:** High
- **Description:** `Condition` carries `exists` and `notExists`, used on 17 corpus leaves, and the `when` dialect has no presence form. `when` carries bare-identifier truthiness and the `Condition` operator enum has no truthiness operator, with the nearest candidate diverging — for `x = false`, `x = 0` and `x = ""`, bare `x` is false while `exists` is true. Confirms CON-06 and extends it to the opposite direction.
- **Classification:** Structural
- **Location:** `src/schema/condition.schema.ts:3-5`; `src/schema/when-expression.ts:241`
- **Blast radius:** 6 direct callers, 5 execution flows, 5 modules

### EXP-03 — the presence form invalidates a hard-zero guard's stated precondition

- **Severity:** High
- **Description:** `check-variable-model.ts` walks only structured conditions, and its own comment gives the reason as the string dialect having no exists-shaped predicate. Its `exists-on-defaulted` rule is hard-zero and 350 of 657 variable declarations carry a `defaultValue`, so adding a string-dialect presence form leaves the guard silently blind to 53 per cent of its domain. This prices the presence production that the consistency evaluation recommends adding.
- **Classification:** Fixable — extend the guard with the syntax
- **Location:** `scripts/check-variable-model.ts:21-22`; `src/schema/variable.schema.ts:15`

### EXP-04 — authors reject the available terse form 96.8 per cent of the time

- **Severity:** High
- **Description:** Decomposed to leaves across all 281 `when` strings, explicit boolean comparison appears 272 times — 160 `== true`, 95 `!= true`, 17 `== false` — against 9 uses of the terse forms that have always been legal, 6 bare-identifier truthiness and 3 unary `!`. The explicit form fails closed on a string, a number or an array where the bare identifier asserts only JavaScript truthiness, and `Boolean([])` is true, so a terse gate on any of the 95 array-typed declarations holds when the array is empty.
- **Classification:** Structural — the premise a brevity-optimising grammar rests on
- **Location:** `workflows/**/activities/*.yaml`; `src/schema/when-expression.ts:241`

### ARC-01 — the server evaluates both dialects and the published contract denies it

- **Severity:** High
- **Description:** `gate-liveness.ts:194-195` calls `evaluateWhenExpression` and `evaluateCondition` against the server's own bag snapshot for every gated step at delivery time, to decide eager bundling. The field description published to every agent and into `schemas/activity.schema.json` states that the server never evaluates gates. A reader who believes it concludes that cross-dialect divergence cannot reach the server, and it can.
- **Classification:** Fixable — correct the contract
- **Location:** `src/utils/gate-liveness.ts:194-195` against `src/schema/activity.schema.ts:75`
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### ARC-02 — the two evaluators use different numeric coercion

- **Severity:** High
- **Description:** The string dialect coerces with `Number()` and the tree dialect with `toNumber()`, which accepts only `number` and `string`. Five of thirteen probe predicates expressing one intent in both spellings disagree, on `true`, `null`, `[]`, `[5]` and `false` reaching an ordering comparator. The single site holding both dialects combines them with `whenSays && conditionSays`, so a disagreement returns false and is indistinguishable from an ordinary negative. Confirms CON-05.
- **Classification:** Fixable — one shared coercion function
- **Location:** `src/schema/when-expression.ts:306-308`, `src/schema/condition.schema.ts:51-55`, `src/utils/gate-liveness.ts:196`
- **Blast radius:** 3 direct callers, 3 execution flows, 4 modules

### ARC-03 — the published workflow JSON Schema rejects a live definition file

- **Severity:** High
- **Description:** Zod validates the assembled runtime workflow object where activities are `Activity[]`, and the JSON Schema generated from it is published for definition files, where activities may be file-path strings. `workflows/remediate-vuln/workflow.yaml:208-212` lists them as strings and `schemas/workflow.schema.json` requires objects with `id`, `version` and `name`. The corpus carries 16 references to that schema.
- **Classification:** Fixable — publish a definition-file schema
- **Location:** `src/schema/workflow.schema.ts:79-84`; `schemas/workflow.schema.json`; `workflows/remediate-vuln/workflow.yaml:208-212`

### FEA-01 — 92 predicates at two positions have no syntax guard

- **Severity:** High
- **Description:** The `when-expression` guard applies its check only to members of a `steps` array, so an unparseable expression and a mixed-operator violation placed on `exits[]` both report OK while the identical two expressions on steps produce two findings. 54 live `exits[].when` expressions and the 38 validate-sense `actions[].target` predicates are unchecked, the latter because `set-action-values` guards only the `set` sense. Extends CON-20 from availability to enforcement.
- **Classification:** Fixable — check at the parse boundary rather than in a walker
- **Location:** `scripts/check-when-expression.ts`, `walk` and `checkStep`; `scripts/check-set-action-values.ts`

## Medium Findings

### EXP-05 — `actions[].target` holds two grammars whose value sets overlap completely

- **Severity:** Medium
- **Description:** Of 248 action entries, 122 carry `target` across 87 distinct values. Under `action: set` it is a variable name across 84 entries and 53 distinct values, and all 53 also parse as valid `when` expressions as bare-identifier truthiness, while under `action: validate` it is a boolean predicate across 38 entries. Only the sibling verb disambiguates, and `set` is already slated for removal at the next schema major. Confirms CON-09.
- **Classification:** Fixable — split into two keys
- **Location:** `src/schema/activity.schema.ts:26-33`

### EXP-06 — the condition-tree migration is 19 blocks rather than 75

- **Severity:** Medium
- **Description:** Of 109 `condition` blocks, 67 sit on checkpoints where only `condition` enables dismissal and 11 sit on actions that declare no `when` field, so 78 are structurally forced. Of the 31 elective blocks a further 9 use `exists` or `notExists`, leaving 19 that are elective, single-leaf and mechanically movable.
- **Classification:** Fixable — scope the migration to 19
- **Location:** `workflows/**/activities/*.yaml`; `src/schema/activity.schema.ts:26`, `:75`

### EXP-07 — a checkpoint's `condition` is a dismissal construct wearing a gate's name

- **Severity:** Medium
- **Description:** On a checkpoint step `condition` is what enables `respond_checkpoint condition_not_met` dismissal for 67 blocks and `when` does not, while everywhere else the same field is labelled legacy and `when` is preferred. Both fields are optional, so a checkpoint rewritten to `when` validates, loads, runs and is silently non-dismissible, and no guard in the 31-guard registry names this. Confirms CON-07.
- **Classification:** Structural — one name doing two jobs
- **Location:** `src/schema/activity.schema.ts:75` and `:77`

### EXP-08 — rename-only technique bindings carry the dataflow joins

- **Severity:** Medium
- **Description:** Of 208 structured technique bindings declaring inputs, 64 are rename-only and just 2 are identity passthroughs. The remaining 62 map 57 distinct input-to-source pairs such as `dispatch_concurrency` from `scanners_assigned` and `checkpoint_resolution` from `user_selection`, which are design decisions stated in the only place they are stated. Same-name binding already fires and these exist to override it, so no inference rule can recover them.
- **Classification:** Structural — 2 removable, 62 load-bearing
- **Location:** `workflows/**/activities/*.yaml`, `step.technique.inputs`

### EXP-09 — neither dialect can compare two bag variables

- **Severity:** Medium
- **Description:** A bare word on the right of a `when` comparison is taken as a string literal, so `a == b` compares `a` to the string `"b"` and never to the value of `b`, contributing `b` to no read set. The tree dialect's `value` is a union of string, number, boolean and null with no variable-reference variant. This is an unmet expressiveness need rather than a stylistic one.
- **Classification:** Fixable — add a variable-reference form to both
- **Location:** `src/schema/when-expression.ts:235-238`; `src/schema/condition.schema.ts:19`
- **Blast radius:** 7 direct callers, 6 execution flows, 5 modules

### ARC-04 — one predicate language, position-specific power and agent-side evaluation cannot all hold

- **Severity:** Medium
- **Description:** Checkpoint dismissal, exit routing, step gating and action guarding are four distinct powers the schema grants differently, because no runtime evaluates two dialects together, cross-dialect agreement can only ever be a static property, so a single language must either over-grant power — a `when` on a checkpoint that silently forfeits dismissal — or under-grant it, which is today's state and the cause of 33 misplaced predicates.
- **Classification:** Structural — the conserved quantity is powers, not syntaxes
- **Location:** `src/schema/activity.schema.ts:75`; `src/utils/gate-liveness.ts:196`

### ARC-05 — one file gives two answers on whether absence answers a negative gate

- **Severity:** Medium
- **Description:** `unboundPositiveReads` excludes `!=` comparisons and `not` subtrees because absence answers them, with the reasoning in its own doc comment, while `collectWhenPaths` 80 lines earlier adds every `truthy` and `cmp` path with no such exemption. The tree dialect does carry the exclusion, routing `exists` and `notExists` into a separate presence set. So `notExists x` on a missing `x` is answered true and eagerly bundled while `x != true` returns unbound and stays lazy, across 54 of 281 corpus gates. Confirms CON-14 and CON-15.
- **Classification:** Fixable — route `!=` and `not` into the presence set
- **Location:** `src/utils/gate-liveness.ts:10-27` against `:92-108`
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### ARC-06 — an unparseable expression reads no variables and shrinks the declared variable contract

- **Severity:** Medium
- **Description:** `expressionPaths` returns an empty array when parsing fails, and its consumer computes the reads backing the `activity-variables` guard, whose registry entry proves that every read has a writer on every path. A typo therefore converts a checked read into an unchecked absence, and the analysis reports no problem. Failing closed is safe in evaluation and is the failure mode in static analysis, and at `exits[].when` no earlier guard catches the malformed expression first.
- **Classification:** Fixable — surface a parse failure as a finding
- **Location:** `src/schema/when-expression.ts:261-285` into `src/utils/activity-variables.ts:206`
- **Blast radius:** 7 direct callers, 6 execution flows, 5 modules

### ARC-07 — the entire dialect grammar lives in prose that no validator reads

- **Severity:** Medium
- **Description:** `when` is typed `z.string()` and its operator set, precedence, parenthesization rule, truthiness semantics, bare-word literal rule, fail-closed behaviour and checkpoint caveat all live in a 700-character description that reaches `activity.schema.json:362-364` as a `description` next to a bare string type. The dialect is stated in five unlinked places, so adding a presence form changes nothing in Zod, nothing in the generated schema and nothing in the type system, and `tsc` passes.
- **Classification:** Structural — the only semantic channel upward carries English
- **Location:** `src/schema/activity.schema.ts:74-75` and `:254`; `src/schema/when-expression.ts:4-18`; `schemas/activity.schema.json:362-364`

### ARC-08 — `target` carries three roles across two modules that do not cite each other

- **Severity:** Medium
- **Description:** `target` is an entry in `EXEMPT_DATA_IDS` exempted from the qualified-noun-phrase rule as a dispatch-contract name, an action key holding a variable name, and an action key holding a predicate. The exemption list and the action schema live in different modules and neither references the other, and the field carries no description at all, reaching the generated schema as a bare string type. Related to CON-18.
- **Classification:** Fixable — name the two action keys distinctly
- **Location:** `src/utils/identifiers.ts` `EXEMPT_DATA_IDS`; `src/schema/activity.schema.ts:26-33`

### ARC-09 — a bare technique reference's meaning depends on filesystem state

- **Severity:** Medium
- **Description:** `composeActivityTechnique` resolves a bare op id against the activity-named group first and falls back to the reference as authored, so adding a file at `<workflow>/techniques/<activity-id>/<op>.md` silently re-targets every bare reference of that name in that activity with no diff to the referring YAML and no error. The interface is `technique: z.string()` and the resolution order is documented only in the loader's doc comment. This is the corpus's most visible terseness, at 427 bare-string bindings against 211 structured.
- **Classification:** Structural — safe only while op names stay unique
- **Location:** `src/loaders/technique-loader.ts:631-644`

### ARC-10 — four loader-level sugars are invisible to both schemas

- **Severity:** Medium
- **Description:** Zod runs after the loader, so activity-group technique shorthand, rule-fragment splicing, checkpoint-fragment refs and string activity references are transformations no schema can see by construction. The authored surface and the validated surface are different documents, and only the second has a published grammar.
- **Classification:** Structural — the authored surface is unschematised
- **Location:** `src/loaders/` (8 modules); `src/schema/workflow.schema.ts:22-23`

### FEA-02 — the parenthesization rule is expressible as grammar and lives in an imperative check

- **Severity:** Medium
- **Description:** The rule that mixed `&&` and `||` at one nesting depth require parentheses is enforced by a scan in `assertWhenAuthoring` invoked from one guard at one of six predicate positions. A grammar in which an and-chain and an or-chain are separate productions cannot admit a top-level mix by construction, so the rule would hold wherever the language is parsed. Relates to CON-12, where the same rule has no evaluator counterpart.
- **Classification:** Fixable — move the rule into the grammar
- **Location:** `src/schema/when-expression.ts:344-368`; `scripts/check-when-expression.ts`
- **Blast radius:** 2 direct callers, 6 execution flows, 5 modules

### FEA-03 — no schema-drift check exists and none is registered

- **Severity:** Medium
- **Description:** `scripts/generate-schemas.ts` is 30 lines, writes five files, has no check mode and no comparison against what is committed, `package.json` carries `build:schemas` and no `check:schemas`, and the 31-guard registry has no entry for it. The committed JSON Schemas are build artifacts with nothing asserting they match the Zod they came from, and the grammar they publish is exactly the prose most likely to be edited.
- **Classification:** Fixable — add a regeneration check to the registry
- **Location:** `scripts/generate-schemas.ts`; `scripts/guards.ts`; `package.json`

### FEA-04 — the formal artifacts have described a superseded design since 2026-02-10

- **Severity:** Medium
- **Description:** `grammar/activity.ebnf` at 129 lines and `constraints/activity.als` at 279 lines are both stamped 3.0.0 and dated 2026-02-10 and are complete, internally coherent specifications of a design with `decisions:`, `flows:` and `skill:` bindings that the current schema does not have. Nothing in the guard registry references either directory, no test parses the EBNF, and no Alloy run is wired to anything. `grammar/workflow.ebnf` and `constraints/workflow.als` do not exist.
- **Classification:** Structural — generation, not authoring, is what changes this
- **Location:** `grammar/activity.ebnf`; `constraints/activity.als`; `scripts/guards.ts`

### FEA-05 — ten of fifteen predicate rules live where they cannot fail a build

- **Severity:** Medium
- **Description:** One rule is held in the type system, four in guard scripts, seven in prose descriptions or code comments — operator set, precedence, truthiness semantics, the bare-word literal rule, fail-closed, the checkpoint dismissal caveat and the legacy label — and three nowhere at all: `exits[].when` validity, validate-sense `target` validity and numeric coercion agreement. Every proposal moves rules between these four homes and none reduces the count, and a shorthand adding a presence form and an emptiness form adds two more.
- **Classification:** Structural — location is the scarce resource
- **Location:** `src/schema/activity.schema.ts`; `scripts/guards.ts`; `src/schema/when-expression.ts`

## Low Findings

### EXP-10 — a presence form and an emptiness form take the target residue to zero

- **Severity:** Low
- **Description:** The four `actions[].target` values that parse under neither declared grammar are `target_path exists` and the three emptiness tests `broken_artifact_links == []`, `summary_budget_overruns == []` and `summary_completeness_findings == []`. A postfix presence form closes the first and an emptiness form closes the other three, leaving no residue. Confirms the consistency evaluation's core prediction exactly, with the cost recorded at EXP-03.
- **Classification:** Confirmed
- **Location:** `workflows/**/activities/*.yaml`, `actions[].target` under `action: validate`

### EXP-11 — a precondition satisfied by absence transfers as an assumption

- **Severity:** Low
- **Description:** Each sound piece of sugar in this corpus rests on a fact about what does not exist — bare-string technique binding on the structured form carrying only deviations, implicit same-name binding on resolution being closed over a declared signature, predicate-free edges on the activity owning its exit conditions, and the variable-model guard's tree-only walk on the string dialect having no presence form — and in every case the fact lives in a rule, a description or a comment rather than in a type. A later author sees the form and reproduces it without the fact.
- **Classification:** Design law — argues for Alloy as the primary workflow-tier deliverable
- **Location:** `src/schema/activity.schema.ts:91`; `src/schema/workflow.schema.ts:78`; `scripts/check-variable-model.ts:21-22`

### ARC-11 — every gate is parsed two to four times per delivery with no AST cached

- **Severity:** Low
- **Description:** `gateAnswer` parses each `when` string for path collection and discards the AST, then calls `evaluateWhenExpression`, which parses the same string again. `unboundPositiveReads` parses it a third time and `expressionPaths` a fourth when the activity read set is computed. The module exports `parseWhen` and a `WhenAst` type, so an evaluate-on-AST entry point is a small addition and does not exist.
- **Classification:** Fixable — parse once at load
- **Location:** `src/utils/gate-liveness.ts:179` and `:194`; `src/schema/when-expression.ts:333-337`
- **Blast radius:** 7 direct callers, 6 execution flows, 5 modules

### ARC-12 — `assertWhenAuthoring` tokenizes twice and its second failure branch is unreachable

- **Severity:** Low
- **Description:** The function calls `parseWhen`, which tokenizes internally, returns on failure, and then calls `tokenize` again and tests its result for a string error. `parseWhen` fails whenever `tokenize` fails, so the second failure branch cannot execute once the first has been passed.
- **Classification:** Fixable — dead branch and a redundant pass
- **Location:** `src/schema/when-expression.ts:344-352`
- **Blast radius:** 2 direct callers, 6 execution flows, 5 modules

### ARC-13 — an unbound verdict discards the variable name the same file computes elsewhere

- **Severity:** Low
- **Description:** `gateAnswer` finds a specific unbound path and returns a bare enum because `GateVerdict` has no slot for it, while `unboundPositiveReads` two functions earlier returns exactly those names as a string array. The diagnostic a maintainer wants is which variable deferred the gate, and it is computed and thrown away.
- **Classification:** Fixable — carry the path on the verdict
- **Location:** `src/utils/gate-liveness.ts:190-192` against `:86-131`
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### ARC-14 — decimal literals parse as a tree and fail as a string

- **Severity:** Low
- **Description:** The number branch of the tokenizer consumes an optional minus then digits only, so `x > 1.5` tokenizes the leading digit, then the decimal point matches no branch and tokenize reports an unexpected character. The tree dialect accepts `z.number()` and YAML parses `1.5` as a float. The gate then fails closed to false, and at four of six positions no guard reports it.
- **Classification:** Fixable — admit decimals in the tokenizer
- **Location:** `src/schema/when-expression.ts:122-133`
- **Blast radius:** 2 direct callers, 6 execution flows, 5 modules

### ARC-15 — an empty `when` silently disables a step and the guard skips it

- **Severity:** Low
- **Description:** `checkStep` returns immediately when the value is not a non-empty trimmed string, so an empty `when` is explicitly unchecked. At runtime `parseWhen` reports an empty expression, `evaluateWhenExpression` returns false and the step never runs, while `gateAnswer` reports it unparsed. The field carries no minimum-length constraint. Related to CON-08.
- **Classification:** Fixable — reject an empty string at the schema
- **Location:** `scripts/check-when-expression.ts`, `checkStep`; `src/schema/when-expression.ts:156`
- **Blast radius:** 7 direct callers, 6 execution flows, 5 modules

### ARC-16 — dotted-path resolution is triplicated across three modules

- **Severity:** Low
- **Description:** `getVar`, `getVariableValue` and `readPath` are three implementations that split on the dot separator, guard on null, undefined and non-object, and index. The third concedes the duplication in its own doc comment. All three support array indexing by numeric segment as an undocumented accident, and two live in `src/schema/` while the third lives in `src/utils/`, so no single import catches all three.
- **Classification:** Fixable — extract one resolver
- **Location:** `src/schema/when-expression.ts:287-294`; `src/schema/condition.schema.ts:41-49`; `src/utils/gate-liveness.ts:54-61`

### ARC-17 — malformed dotted paths tokenize as valid identifiers

- **Severity:** Low
- **Description:** The identifier branch consumes letters, digits, underscore and dot with no structure, so a doubled or trailing separator still yields a single valid token. The resolver then splits on the separator, looks up empty-string segments and returns undefined, producing a silent false rather than a parse error. The bag-name grammar used elsewhere is stricter and is not applied here. Same family as CON-19.
- **Classification:** Fixable — apply the bag-name grammar in the tokenizer
- **Location:** `src/schema/when-expression.ts:136`
- **Blast radius:** 2 direct callers, 6 execution flows, 5 modules

### ARC-18 — three name grammars across three modules with no shared constant

- **Severity:** Low
- **Description:** The rename-or-literal disambiguator, `QUALIFIED_DATA_ID_PATTERN` in the identifier utilities, and the `when` tokenizer each accept a different identifier shape for a related purpose, the third being the loosest. The terminal sentinel is likewise described in a doc comment and absent from `GraphSchema`, so nothing prevents an activity carrying the sentinel as its own id.
- **Classification:** Fixable — one shared constant
- **Location:** `src/utils/identifiers.ts`; `src/schema/when-expression.ts:136`; `src/schema/workflow.schema.ts:57-60`

## Corrections Required

1. EXP-01: specify the workflow tier's edge predicate absence as a constraint — an edge is a bare destination or the terminal sentinel in `grammar/workflow.ebnf`, and `constraints/workflow.als` carries a fact that no edge holds a guard and that exit predicates belong to the activity. Do not design an edge predicate language.
2. EXP-03, EXP-10: land the presence and emptiness productions together with an extension of `check-variable-model.ts` to walk the string dialect. The guard extension is a precondition of the syntax, not a follow-up.
3. EXP-05, ARC-08: make `ActionSchema` a discriminated union on the verb, give the validate-sense key a predicate type and the set-sense key a variable-name type, describe both, and apply strict object parsing.
4. ARC-04, EXP-06: add a `when` field to actions, which relocates 33 of the 37 misplaced predicates, then scope the condition-tree migration to the 19 elective single-leaf blocks and leave the 78 structurally forced ones untouched.
5. EXP-07: carry an explicit dismissibility marker on a checkpoint so the capability survives a change of syntax, and drop the legacy label from the dismissal construct.
6. ARC-02, ARC-16: extract one shared ordering-coercion function and one shared path resolver used by both evaluators, and land them before any predicate is rewritten in either direction.
7. ARC-01: correct the published contract to state that the server evaluates gates to decide delivery and never to drive control flow, and note that a new operator is a server-side change before delivery can answer a gate that uses it.
8. FEA-01, FEA-02: express the parenthesization rule as separate and-chain and or-chain productions and check at the parse boundary, which closes the `exits[].when` and validate-sense `target` gaps as a property of the language rather than of a walker.
9. FEA-03, FEA-04: register a regeneration-and-diff guard covering `schemas/*.json`, `grammar/` and `constraints/`, and name the mechanism that fails when an Alloy constraint is violated as part of this specification rather than after it.
10. ARC-03: publish a definition-file schema distinct from the assembled-object schema, so the 16 corpus references point at a document that accepts the files that cite it.
11. EXP-04, EXP-08: add no brevity sugar to the boolean case and elide no rename-only binding. 272 explicit comparisons and 62 dataflow joins are authored intent.
12. FEA-05: for every rule the settled grammar states, name the artifact that fails when it is violated, and reject any rule whose only home is a description string.

## Traceability

| Report ID | Source Artifact | Original ID | Original Severity |
|-----------|-----------------|-------------|-------------------|
| [EXP-01](DEFINITIVE-FINDINGS.md#exp-01--the-workflow-tiers-predicate-free-graph-edges-are-a-stated-invariant) | [portfolio-synthesis.md](portfolio-synthesis.md) | P1, C8, S9 | Unassigned |
| [EXP-02](DEFINITIVE-FINDINGS.md#exp-02--neither-predicate-dialect-contains-the-other) | [portfolio-synthesis.md](portfolio-synthesis.md) | P2, C6 | Unassigned |
| [EXP-03](DEFINITIVE-FINDINGS.md#exp-03--the-presence-form-invalidates-a-hard-zero-guards-stated-precondition) | [portfolio-synthesis.md](portfolio-synthesis.md) | P5, C7 | Unassigned |
| [EXP-04](DEFINITIVE-FINDINGS.md#exp-04--authors-reject-the-available-terse-form-968-per-cent-of-the-time) | [portfolio-claim.md](portfolio-claim.md) | C1 | Unassigned |
| [EXP-05](DEFINITIVE-FINDINGS.md#exp-05--actionstarget-holds-two-grammars-whose-value-sets-overlap-completely) | [portfolio-synthesis.md](portfolio-synthesis.md) | P3, C5, A4 | Unassigned |
| [EXP-06](DEFINITIVE-FINDINGS.md#exp-06--the-condition-tree-migration-is-19-blocks-rather-than-75) | [portfolio-synthesis.md](portfolio-synthesis.md) | C2, S10 | Unassigned |
| [EXP-07](DEFINITIVE-FINDINGS.md#exp-07--a-checkpoints-condition-is-a-dismissal-construct-wearing-a-gates-name) | [portfolio-synthesis.md](portfolio-synthesis.md) | C2, A6 | Unassigned |
| [EXP-08](DEFINITIVE-FINDINGS.md#exp-08--rename-only-technique-bindings-carry-the-dataflow-joins) | [portfolio-claim.md](portfolio-claim.md) | C3 | Unassigned |
| [EXP-09](DEFINITIVE-FINDINGS.md#exp-09--neither-dialect-can-compare-two-bag-variables) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D8 | Unassigned |
| [EXP-10](DEFINITIVE-FINDINGS.md#exp-10--a-presence-form-and-an-emptiness-form-take-the-target-residue-to-zero) | [portfolio-pedagogy.md](portfolio-pedagogy.md) | P4 | Unassigned |
| [EXP-11](DEFINITIVE-FINDINGS.md#exp-11--a-precondition-satisfied-by-absence-transfers-as-an-assumption) | [portfolio-pedagogy.md](portfolio-pedagogy.md) | pedagogy law | Unassigned |
| [ARC-01](DEFINITIVE-FINDINGS.md#arc-01--the-server-evaluates-both-dialects-and-the-published-contract-denies-it) | [portfolio-synthesis.md](portfolio-synthesis.md) | D1 | Unassigned |
| [ARC-02](DEFINITIVE-FINDINGS.md#arc-02--the-two-evaluators-use-different-numeric-coercion) | [portfolio-synthesis.md](portfolio-synthesis.md) | P8, C6, D4 | Unassigned |
| [ARC-03](DEFINITIVE-FINDINGS.md#arc-03--the-published-workflow-json-schema-rejects-a-live-definition-file) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A2 | Unassigned |
| [ARC-04](DEFINITIVE-FINDINGS.md#arc-04--one-predicate-language-position-specific-power-and-agent-side-evaluation-cannot-all-hold) | [portfolio-synthesis.md](portfolio-synthesis.md) | C-triad, D-law | Unassigned |
| [ARC-05](DEFINITIVE-FINDINGS.md#arc-05--one-file-gives-two-answers-on-whether-absence-answers-a-negative-gate) | [portfolio-synthesis.md](portfolio-synthesis.md) | S6, D7 | Unassigned |
| [ARC-06](DEFINITIVE-FINDINGS.md#arc-06--an-unparseable-expression-reads-no-variables-and-shrinks-the-declared-variable-contract) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D5 | Unassigned |
| [ARC-07](DEFINITIVE-FINDINGS.md#arc-07--the-entire-dialect-grammar-lives-in-prose-that-no-validator-reads) | [portfolio-synthesis.md](portfolio-synthesis.md) | S1, A8 | Unassigned |
| [ARC-08](DEFINITIVE-FINDINGS.md#arc-08--target-carries-three-roles-across-two-modules-that-do-not-cite-each-other) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A5 | Unassigned |
| [ARC-09](DEFINITIVE-FINDINGS.md#arc-09--a-bare-technique-references-meaning-depends-on-filesystem-state) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A7 | Unassigned |
| [ARC-10](DEFINITIVE-FINDINGS.md#arc-10--four-loader-level-sugars-are-invisible-to-both-schemas) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A3 | Unassigned |
| [ARC-11](DEFINITIVE-FINDINGS.md#arc-11--every-gate-is-parsed-two-to-four-times-per-delivery-with-no-ast-cached) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D2 | Unassigned |
| [ARC-12](DEFINITIVE-FINDINGS.md#arc-12--assertwhenauthoring-tokenizes-twice-and-its-second-failure-branch-is-unreachable) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D3 | Unassigned |
| [ARC-13](DEFINITIVE-FINDINGS.md#arc-13--an-unbound-verdict-discards-the-variable-name-the-same-file-computes-elsewhere) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D6 | Unassigned |
| [ARC-14](DEFINITIVE-FINDINGS.md#arc-14--decimal-literals-parse-as-a-tree-and-fail-as-a-string) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D9 | Unassigned |
| [ARC-15](DEFINITIVE-FINDINGS.md#arc-15--an-empty-when-silently-disables-a-step-and-the-guard-skips-it) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D10 | Unassigned |
| [ARC-16](DEFINITIVE-FINDINGS.md#arc-16--dotted-path-resolution-is-triplicated-across-three-modules) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D11 | Unassigned |
| [ARC-17](DEFINITIVE-FINDINGS.md#arc-17--malformed-dotted-paths-tokenize-as-valid-identifiers) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D12 | Unassigned |
| [ARC-18](DEFINITIVE-FINDINGS.md#arc-18--three-name-grammars-across-three-modules-with-no-shared-constant) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A9 | Unassigned |
| [FEA-01](DEFINITIVE-FINDINGS.md#fea-01--92-predicates-at-two-positions-have-no-syntax-guard) | [portfolio-synthesis.md](portfolio-synthesis.md) | P7, S2, S3 | Unassigned |
| [FEA-02](DEFINITIVE-FINDINGS.md#fea-02--the-parenthesization-rule-is-expressible-as-grammar-and-lives-in-an-imperative-check) | [portfolio-synthesis.md](portfolio-synthesis.md) | P6, S7, A10 | Unassigned |
| [FEA-03](DEFINITIVE-FINDINGS.md#fea-03--no-schema-drift-check-exists-and-none-is-registered) | [portfolio-synthesis.md](portfolio-synthesis.md) | S4, A8 | Unassigned |
| [FEA-04](DEFINITIVE-FINDINGS.md#fea-04--the-formal-artifacts-have-described-a-superseded-design-since-2026-02-10) | [portfolio-synthesis.md](portfolio-synthesis.md) | S5 | Unassigned |
| [FEA-05](DEFINITIVE-FINDINGS.md#fea-05--ten-of-fifteen-predicate-rules-live-where-they-cannot-fail-a-build) | [portfolio-scarcity.md](portfolio-scarcity.md) | S8 | Unassigned |
