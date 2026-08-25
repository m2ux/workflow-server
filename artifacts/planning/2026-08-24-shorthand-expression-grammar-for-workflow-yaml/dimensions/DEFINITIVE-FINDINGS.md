---
Subject: workflow-server YAML definition grammar — the activity and workflow tiers
Evaluation Date: 2026-08-25
Scope: expressiveness, architecture and feasibility of a shorthand expression grammar for activity and workflow YAML, measured against `origin/main` (`b061faee`) with `workflows/` read from the working tree
---

# Workflow Definition Grammar — Definitive Findings

## Core Finding

Three measurements taken together relocate the problem. Of the 37 distinct predicates that migrated
into the unconstrained `actions[].target` field, 33 already parse as valid `when` expressions today, so
they moved for want of a slot rather than for want of syntax — an action has no `when` field. Of the 109
structured `condition` blocks, 78 sit where the tree is the only spelling available and 9 more use
operators the string dialect does not have, leaving 19 genuine restatements rather than 75. And where a
terse form is already legal, available, shorter and documented, authors choose the explicit boolean
comparison 272 times against 9 — 96.8 per cent.

The one place a new predicate language is assumed to be needed is the place that most clearly does not
want one. All 192 graph edges across 17 workflows and 106 nodes are bare destination strings with zero
exceptions, and the schema states the reason: an activity names its outcomes and the workflow names
destinations, so a borrowed activity sits in any graph without its borrower having a say. That absence
is a rule. `grammar/workflow.ebnf` and `constraints/workflow.als` should state it as a constraint
rather than invent an edge predicate language.

What is genuinely scarce is not expressiveness but enforceable location. Fifteen rules govern
predicates today. Ten of them live in prose descriptions, code comments, or nowhere, and cannot fail a
build.

Testable prediction: for every rule the settled grammar states, name the artifact that fails when it is
violated. If a design lands that reduces the fifteen-rule count rather than relocating rules between
those four homes, this account is wrong. On present evidence a shorthand adds two rules — a presence
form and an emptiness form — and the default home for a new rule in this codebase is prose, which is
where the last seven went.

## Findings

Findings are ordered by severity (Critical, High, Medium, Low). Finding IDs match REPORT.md exactly.
No Critical findings were raised.

### EXP-01 — the workflow tier's predicate-free graph edges are a stated invariant

- **Severity:** High
- **Classification:** Invariant — specify the absence
- **Reachability:** reachable — `grammar/workflow.ebnf` and `constraints/workflow.als` are listed TBD and do not exist, so the next author of the workflow tier decides this
- **Description:** `GraphSchema` is `z.record(z.record(z.string()))` and all 192 edges across 17 graphs and 106 nodes are bare strings with zero exceptions. The schema states the reason in its own description: an activity names outcomes and the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say. Every one of the corpus's 390 predicates sits inside an activity. The property is protected today only by the accident that `z.record(z.string())` cannot hold an object.
- **Impact:** An edge predicate production in the workflow grammar parses, routes, and quietly ends activity borrowability, because a borrowing workflow can then re-specify the lending activity's exit semantics. No test asserts borrowability, so nothing fails.
- **Location:** `src/schema/workflow.schema.ts:62` and `:78`; `workflows/**/workflow.yaml` graph blocks
- **Recommendation:** Specify an edge in `grammar/workflow.ebnf` as a bare destination identifier or the terminal sentinel, with no guard production. Carry the invariant into `constraints/workflow.als` as a fact that no edge holds a guard, plus a fact that an activity's exit predicates belong to that activity. This makes borrowability testable for the first time. Group 1's correction 7 asks for the same assertion. This finding supplies the reason it is an invariant rather than a convenience.

### EXP-02 — neither predicate dialect contains the other

- **Severity:** High
- **Classification:** Structural
- **Reachability:** reachable — 17 corpus leaves use `exists` or `notExists` and 9 sites use string-dialect truthiness or negation
- **Description:** `Condition` carries `exists` and `notExists` and the `when` dialect has no presence form at all. In the other direction `when` carries bare-identifier truthiness and the `Condition` operator enum has none. The nearest candidate diverges, since for `x = false`, `x = 0` and `x = ""` a bare `x` is false while `exists` is true. The dialects also differ on decimal literals and on arity, `when` being binary and left-associative where the tree is n-ary with a minimum of two children. Confirms CON-06 and extends it to the reverse direction.
- **Impact:** Any grammar built on the assumption that the bare string is the no-deviation case of the structured tree is wrong at the root, and the wrongness is invisible because both spellings parse. Lowering `when` into `Condition` requires adding a truthiness node. Raising `Condition` into `when` requires adding presence operators, which is EXP-03.
- **Location:** `src/schema/condition.schema.ts:3-5` and `:19`; `src/schema/when-expression.ts:241`
- **Recommendation:** Specify the two dialects separately and name their common fragment explicitly, excluding truthiness and presence. Assert in Alloy that the two agree on that fragment. Do not specify either as sugar for the other.
- **Blast radius:** 6 direct callers, 5 execution flows, 5 modules

### EXP-03 — the presence form invalidates a hard-zero guard's stated precondition

- **Severity:** High
- **Classification:** Fixable — extend the guard with the syntax
- **Reachability:** conditional — triggers the moment a presence form lands in the string dialect, which is what closing the target residue requires
- **Description:** `check-variable-model.ts` walks only structured conditions, and its own comment gives the reason as the `when:` string dialect having no exists-shaped predicate, verified against the corpus. Its `exists-on-defaulted` rule is hard-zero: an `exists` or `notExists` gate on a variable declaring a `defaultValue` is constant, because the server seeds every default at session creation. Measured exposure is 350 of 657 variable declarations carrying a `defaultValue`.
- **Impact:** The syntax lands, the guard keeps passing, and it is silently blind to 53 per cent of its domain. Nothing fails, and the comment is the only notice. This is the price of the presence production that the consistency evaluation recommends as its first correction.
- **Location:** `scripts/check-variable-model.ts:21-22`; `src/schema/variable.schema.ts:15`
- **Recommendation:** Extend `check-variable-model.ts` to walk the string dialect in the same commit that adds the presence form, and treat that extension as a precondition of the syntax rather than a follow-up. Where the presence form can be avoided, an emptiness or value comparison is already visible to the guard, since it is a value comparison rather than a presence test.

### EXP-04 — authors reject the available terse form 96.8 per cent of the time

- **Severity:** High
- **Classification:** Structural — the premise a brevity-optimising grammar rests on
- **Reachability:** reachable — 272 authored sites in the live corpus
- **Description:** Decomposed to leaves across all 281 `when` strings, explicit boolean comparison appears 272 times — 160 `== true`, 95 `!= true`, 17 `== false`, 0 `!= false` — against 9 uses of the terse forms, being 6 bare-identifier truthiness and 3 unary `!`. The terse form has always been legal, is shorter, and is documented in the field's own description. `x == true` asserts that `x` is the boolean `true` and fails closed on a string, a number or an array. A bare `x` asserts only JavaScript truthiness, and `Boolean([])` is true.
- **Impact:** A grammar that rewards brevity optimises a quantity authors have spent 272 decisions rejecting. Encouraging the drop of `== true` would convert 272 exactly checkable sites into sites whose meaning depends on JavaScript truthiness, and 95 of 657 declarations are array-typed, so such a gate holds precisely when the array is empty.
- **Location:** `workflows/**/activities/*.yaml`; `src/schema/when-expression.ts:241`
- **Recommendation:** Add no brevity sugar to the boolean case. Spend the grammar's budget on the missing field and the missing enforcement location instead, and treat the corpus's verbosity as the stronger assertion it is.

### ARC-01 — the server evaluates both dialects and the published contract denies it

- **Severity:** High
- **Classification:** Fixable — correct the contract
- **Reachability:** reachable — executed on every `get_activity` delivery, for every gated step of every activity
- **Description:** `gate-liveness.ts:194-195` calls `evaluateWhenExpression` and `evaluateCondition` against the server's own snapshot of the variable bag and combines them. The result drives eager bundling — whether a step's technique body ships with the delivery or is fetched later — rather than control flow. The field description published to every agent and into `schemas/activity.schema.json` states that the server never evaluates gates. That distinction between deciding delivery and driving control flow is real and defensible, and it appears nowhere.
- **Impact:** A reader who believes the published contract concludes that cross-dialect semantic divergence cannot affect the server, and it can, at exactly this line. The same mistaken belief is visible in the code as two to four redundant parses per gate that nobody optimised, since no one optimises a path the documentation says is not taken. It also hides the real cost of new syntax: a new operator is a server-side change, and until it is implemented every gate using it yields an unparsed verdict and its step silently stays lazy.
- **Location:** `src/utils/gate-liveness.ts:194-195` against `src/schema/activity.schema.ts:75`
- **Recommendation:** Restate the contract as: the server evaluates gates only to decide delivery, never to drive control flow. Record alongside it that a dialect change is a server-side change before delivery can answer a gate that uses it.
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### ARC-02 — the two evaluators use different numeric coercion

- **Severity:** High
- **Classification:** Fixable — one shared coercion function
- **Reachability:** conditional — requires a non-numeric bag value at an ordering comparator. 7 `>` leaves exist on condition trees, and 95 array-typed and 50 object-typed declarations supply the loose values
- **Description:** The string dialect coerces with `Number()`, which maps `true` to 1, `null` to 0, `[]` to 0 and `[5]` to 5. The tree dialect coerces with `toNumber()`, which accepts only `number` and `string` and yields undefined otherwise, failing the comparison. Five of thirteen probe predicates expressing one intent in both spellings disagree, on `true`, `null`, `[]`, `[5]` and `false`. Every disagreement is a non-numeric value reaching a numeric comparator. Confirms CON-05.
- **Impact:** This is the slowest failure in the system to discover and the one the run's own output would trigger. Ordering comparators are rare, both answers are plausible at a branch point, the system's designed fail-closed behaviour is indistinguishable from a wrong false, the single site holding both dialects and-combines them so a disagreement returns an ordinary-looking false, and because no component computes both answers there is no observation point even in principle. The trigger is a migration that rewrites a tree predicate as a string or the reverse — precisely the 19-block migration this grammar would authorise. It will be diagnosed as a bug in the migration script, and the migration script will be correct.
- **Location:** `src/schema/when-expression.ts:306-308`, `src/schema/condition.schema.ts:51-55`, `src/utils/gate-liveness.ts:196`
- **Recommendation:** Extract one `coerceForOrdering` used by both evaluators and land it before any predicate is rewritten in either direction. Add the Alloy assertion that the two dialects agree on their common fragment. It is the only instrument that can establish this, since no test could.
- **Blast radius:** 3 direct callers, 3 execution flows, 4 modules

### ARC-03 — the published workflow JSON Schema rejects a live definition file

- **Severity:** High
- **Classification:** Fixable — publish a definition-file schema
- **Reachability:** reachable — the file is live and the corpus carries 16 references to the schema that rejects it
- **Description:** Zod validates the full assembled runtime workflow object, in which activities are `Activity[]`. The JSON Schema generated from it is published for definition files, in which activities may be file-path strings. `workflows/remediate-vuln/workflow.yaml:208-212` lists them as strings, and `schemas/workflow.schema.json` declares the array items to be objects requiring `id`, `version` and `name`. The schema file's own comment names the intended union and says strings are allowed in the intermediate raw schema, and the declared type contains no string variant, so the union never reaches the generated artifact.
- **Impact:** The abstraction is complete for the runtime caller, which only ever sees assembled objects, and leaks for the authoring caller — an editor, a contributor, any external consumer — who is handed a schema for a document they never write. This is the concrete proof that the four-way single source of truth is one authoritative source, one generated and misapplied, and two authoritative for nothing.
- **Location:** `src/schema/workflow.schema.ts:79-84`; `schemas/workflow.schema.json`; `workflows/remediate-vuln/workflow.yaml:208-212`
- **Recommendation:** Generate and publish a definition-file schema distinct from the assembled-object schema, so the 16 corpus references point at a document that accepts the files citing it. Specify which of the two the EBNF and Alloy artifacts describe.

### FEA-01 — 92 predicates at two positions have no syntax guard

- **Severity:** High
- **Classification:** Fixable — check at the parse boundary rather than in a walker
- **Reachability:** reachable — demonstrated by execution against a probe corpus, not by code reading
- **Description:** The `when-expression` guard's registry entry claims it proves that every `when:` gate parses and parenthesizes mixed operators. Its implementation applies its check only to members of a `steps` array, recursing into everything else and checking nothing there. Two deliberately invalid expressions placed on `exits[]` — one violating the parenthesization rule, one unparseable — produce the output "OK, all when: gates parse". The identical two expressions moved onto steps produce two findings. In the live corpus 54 `exits[].when` expressions are unguarded, as are the 38 validate-sense `actions[].target` predicates, since `set-action-values` guards only the `set` sense and its proves line says so. Extends CON-20 from availability to enforcement.
- **Impact:** The registry claim is broader than the implementation, so the guard suite reports coverage it does not have. An invalid exit predicate reaches the corpus, fails closed at runtime, and is additionally laundered by ARC-06 into an activity that appears to read nothing there.
- **Location:** `scripts/check-when-expression.ts`, `walk` and `checkStep`; `scripts/check-set-action-values.ts`; `scripts/guards.ts`
- **Recommendation:** Move checking from a walker that must know where predicates live to the parser, invoked wherever a predicate is parsed. Until that lands, correct the registry `proves` line to state the position it actually covers, so the coverage claim matches the implementation.

### EXP-05 — `actions[].target` holds two grammars whose value sets overlap completely

- **Severity:** Medium
- **Classification:** Fixable — split into two keys
- **Reachability:** reachable — 122 live entries across 87 distinct values
- **Description:** Of 248 action entries, 122 carry `target`. Under `action: set` it is a variable name across 84 entries and 53 distinct values, and all 53 of those also parse as valid `when` expressions as bare-identifier truthiness. Under `action: validate` it is a boolean predicate across 38 entries and 37 distinct values. The field is `z.string().optional()` with no description, reaching the generated JSON Schema as a bare string type. Only the sibling `action:` verb disambiguates, and `set` is already slated for removal at the next workflow-schema major. Confirms CON-09.
- **Impact:** A reader holding only the value cannot recover which grammar applies, and a reader holding only the schema cannot learn there are two. A validate-sense predicate mistyped as a set-sense name produces no error in either sense — it simply sets a variable named after a predicate. A grammar that specifies `target` as one construct will be wrong about the other half, and will specify a construct that is about to be cut in half.
- **Location:** `src/schema/activity.schema.ts:26-33`
- **Recommendation:** Make `ActionSchema` a discriminated union on the verb, give the validate-sense key a predicate type and the set-sense key a variable-name type, describe both, and apply strict object parsing. An EBNF production for a single YAML key cannot be indexed on a sibling key's value, so the honest grammar answer is two distinct keys.

### EXP-06 — the condition-tree migration is 19 blocks rather than 75

- **Severity:** Medium
- **Classification:** Fixable — scope the migration to 19
- **Reachability:** conditional — realised when a migration is attempted
- **Description:** 75 of 109 `condition` blocks are a single `type: simple` leaf, and the inference that they are verbose spellings of a one-line `when` does not survive cross-tabulation by position. 67 blocks sit on checkpoint steps where only `condition` enables dismissal, and 11 sit on actions whose schema declares no `when` field at all — 78 structurally forced. Of the 31 elective blocks a further 9 use `exists` or `notExists`, operators the string dialect lacks, so they are locked by capability. Elective, single-leaf and free of presence operators leaves 19 blocks, 17 per cent of the 109 rather than 69 per cent.
- **Impact:** A migration sized at 75 attempts 56 rewrites that are either impossible or lossy. A checkpoint whose `condition` is rewritten as `when` still runs. It simply stops being dismissible, silently, because both fields are optional and nothing requires a checkpoint to have either.
- **Location:** `workflows/**/activities/*.yaml`; `src/schema/activity.schema.ts:26` and `:75`
- **Recommendation:** Scope the migration to the 19 elective single-leaf blocks. Leave the 78 forced blocks untouched, and hold the 9 presence-locked blocks until EXP-03 is settled.

### EXP-07 — a checkpoint's `condition` is a dismissal construct wearing a gate's name

- **Severity:** Medium
- **Classification:** Structural — one name doing two jobs
- **Reachability:** reachable — 67 checkpoint blocks depend on the field's presence today
- **Description:** On a `kind: checkpoint` step, `condition` is what enables dismissal through `respond_checkpoint condition_not_met`, and `when` does not. At the other four positions the same field is labelled legacy and `when` is preferred. The schema labels `condition` legacy and carves out the checkpoint exception in the same breath, which concedes the point. The distinction lives entirely in the description prose of a different field, and no guard in the 31-guard registry names it. Confirms CON-07.
- **Impact:** A checkpoint step carrying a `when` and no `condition` validates, loads, runs, and is silently non-dismissible. The count of 75 restatements is itself an artifact of conflating the two jobs. Naming the second job shrinks that work by three quarters.
- **Location:** `src/schema/activity.schema.ts:75` and `:77`
- **Recommendation:** Carry an explicit dismissibility marker on a checkpoint so the capability survives a change of syntax, name the dismissal construct for what it does, and drop the legacy label from it, since it is not legacy.

### EXP-08 — rename-only technique bindings carry the dataflow joins

- **Severity:** Medium
- **Classification:** Structural — 2 removable, 62 load-bearing
- **Reachability:** conditional — realised by any shorthand that elides rename-only bindings
- **Description:** Of the 208 structured technique bindings that declare inputs, 64 are rename-only, meaning every input is a bare bag-name reference with no literal and no template. Of those 64, exactly 2 are identity passthroughs — the redundant case the binding rule already prohibits. The remaining 62 map 57 distinct input-to-source pairs. `dispatch_concurrency` bound from `scanners_assigned` asserts that the number of assigned scanners is the concurrency to dispatch at, and `checkpoint_resolution` bound from `user_selection` records that the user's selection is the resolution. These are design decisions stated in the only place they are stated.
- **Impact:** A shorthand that infers a rename cannot infer these, because the two names differ by design. The only inference rule available is same-name binding, which already fires and which these bindings exist precisely to override, so the sugar would have to be positional or type-directed, and both silently pick the wrong source when two bag variables share a type. Deleting the binding deletes the join in the dataflow graph.
- **Location:** `workflows/**/activities/*.yaml`, `step.technique.inputs`
- **Recommendation:** Elide no rename-only binding. Address the 2 identity passthroughs with a guard, which is the right instrument for a redundancy, rather than with a grammar.

### EXP-09 — neither dialect can compare two bag variables

- **Severity:** Medium
- **Classification:** Fixable — add a variable-reference form to both
- **Reachability:** reachable — an author writing a variable-to-variable comparison today gets a silent string comparison
- **Description:** A bare word on the right of a `when` comparison is taken as a string literal, so `a == b` compiles to a comparison of `a` against the string `"b"` and never against the value of `b`. The path collector inherits the inversion and documents it, so `b` contributes to no read set either. The tree dialect has the identical hole from the other side: its `value` is a union of string, number, boolean and null with no variable-reference variant.
- **Impact:** Variable-to-variable comparison is inexpressible in either dialect, and an author who writes it gets a silent, effectively always-false gate rather than an error, with the guard that checks reads-have-writers unable to notice that `b` is never written. Unlike terseness this is a genuine expressiveness gap, and it is the clearest one the implementation exposes.
- **Location:** `src/schema/when-expression.ts:235-238` and `:255-259`; `src/schema/condition.schema.ts:19`
- **Recommendation:** Specify an explicit variable-reference form on the right-hand side of a comparison in both dialects, distinguished by syntax rather than by shape, and specify quoting for string literals so the two are separable at parse time.
- **Blast radius:** 7 direct callers, 6 execution flows, 5 modules

### ARC-04 — one predicate language, position-specific power and agent-side evaluation cannot all hold

- **Severity:** Medium
- **Classification:** Structural — the conserved quantity is powers, not syntaxes
- **Reachability:** reachable — the trade-off governs the system as it stands
- **Description:** Three properties are in tension. One predicate language across every position. Position-specific power, since checkpoint dismissal, exit routing, step gating and guarding an action are four different acts the schema grants differently, and evaluation by the executing agent, which makes activities portable across harnesses and makes child dispatch possible. Any two are achievable and all three are not. Holding the first two gives a language the server cannot answer generically at delivery time. Holding the first and third gives today's `when`, uniform and answerable and unable to express checkpoint dismissal, which is why the tree survives with a legacy label and one carved-out exception. Holding the last two gives today's system in full.
- **Impact:** Because evaluation is agent-side, no runtime sees both dialects resolve one intent, so cross-dialect agreement can only ever be a static property and the four formal artifacts are the only available instrument for it. Because powers differ, a single language must either over-grant power — a `when` on a checkpoint that silently forfeits dismissal — or under-grant it, which is today's state and the cause of 33 misplaced predicates. `actions[].target` is where intent goes when position and power disagree, and merging the two syntaxes relocates the distinction into the position rather than removing it.
- **Location:** `src/schema/activity.schema.ts:75`; `src/utils/gate-liveness.ts:196`
- **Recommendation:** Specify the four powers explicitly and let the surface follow, rather than specifying one surface and discovering the powers. Treat agent-side evaluation as fixed. It is load-bearing and will not move.

### ARC-05 — one file gives two answers on whether absence answers a negative gate

- **Severity:** Medium
- **Classification:** Fixable — route `!=` and `not` into the presence set
- **Reachability:** reachable — 54 of 281 corpus gates take the pessimistic path on every delivery
- **Description:** `unboundPositiveReads` deliberately excludes `!=` comparisons and `not` subtrees, with the reasoning in its own doc comment: `x != true` and `notExists x` hold on a missing variable, which is how this corpus spells "not in that mode". `collectWhenPaths`, 80 lines earlier in the same file, adds every truthy and comparison path with no such exemption, walking into negation subtrees. The tree dialect does carry the exclusion, since its path collector routes `exists` and `notExists` into a separate presence set that the unbound loop does not iterate. Confirms CON-14 and CON-15.
- **Impact:** Two spellings of one intent get opposite delivery outcomes. `notExists x` on a missing `x` is answered true and its step is eagerly bundled. `x != true` on a missing `x` returns an unbound verdict, no answer, and its step stays lazy. 54 gates across 16 distinct expressions are affected, and the file's own comment says they should not be.
- **Location:** `src/utils/gate-liveness.ts:10-27` against `:92-108`, with the unbound loop at `:190-191`
- **Recommendation:** Route `!=` comparisons and `not` subtrees into the presence set in `collectWhenPaths`, exactly as the tree collector already routes presence operators. The two functions then agree and the string dialect stops being penalised for spelling a negative. Land this together with the presence production, which must reach the same bucket.
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### ARC-06 — an unparseable expression reads no variables and shrinks the declared variable contract

- **Severity:** Medium
- **Classification:** Fixable — surface a parse failure as a finding
- **Reachability:** conditional — requires a malformed expression, and is unmitigated at `exits[].when` where no guard checks first
- **Description:** `expressionPaths` returns an empty array when parsing fails, documented as an unparseable expression reading nothing, fail-closed as evaluation does. Its consumer computes the reads that back the `activity-variables` guard, whose registry entry proves that every activity declares the variables it reads and writes and that every read has a writer on every path.
- **Impact:** A malformed expression does not merely fail to gate. Its variable reads vanish from the activity's declared contract, and the guard that checks reads-have-writers sees an activity that reads nothing there. A typo converts a checked read into an unchecked absence. Failing closed on evaluation is safe. Failing closed on static analysis is the opposite, because the analysis exists to find problems and returning "no problems" is the failure mode. At the four positions FEA-01 leaves unguarded, nothing catches the malformed expression first.
- **Location:** `src/schema/when-expression.ts:261-285` into `src/utils/activity-variables.ts:206`
- **Recommendation:** Return a discriminated result from `expressionPaths` rather than an empty array, and have the variable guard report an unparseable expression as a finding rather than as an absence of reads.
- **Blast radius:** 7 direct callers, 6 execution flows, 5 modules

### ARC-07 — the entire dialect grammar lives in prose that no validator reads

- **Severity:** Medium
- **Classification:** Structural — the only semantic channel upward carries English
- **Reachability:** reachable — every change to the dialect lands here
- **Description:** `when` is typed `z.string()`, and its operator set, precedence, parenthesization rule, truthiness semantics, bare-word literal rule, fail-closed behaviour and checkpoint caveat live in a 700-character description string. That string survives into `activity.schema.json:362-364` beside a bare string type, where a JSON Schema validator reads the type and ignores the rest. The dialect is stated in five unlinked places: the implementation, an EBNF-ish doc-comment sketch already incomplete relative to the implementation, the field description, its by-reference restatement on the exit field, and the generated schema.
- **Impact:** Adding a presence form, an emptiness form or a set-membership form changes nothing in Zod, nothing in the generated JSON Schema and nothing in the type system, and `tsc` passes along with the schema-validation guards, because every string validates against a string type. Modifying the dialect invalidates four hand-maintained statements, the committed JSON Schema, every editor validating against it and both formal artifacts, while 30 of 31 guards stay green and the one that would notice covers one position of six. The only mechanism that can catch a grammar change is a person reading a diff.
- **Location:** `src/schema/activity.schema.ts:74-75` and `:254`; `src/schema/when-expression.ts:4-18`; `schemas/activity.schema.json:362-364`
- **Recommendation:** Make the grammar file the source and generate the parser and the schema descriptions from it, so the reference evaluator and the specification cannot disagree. Where that is not taken, at minimum give every rule in the settled grammar a named home that fails a build.

### ARC-08 — `target` carries three roles across two modules that do not cite each other

- **Severity:** Medium
- **Classification:** Fixable — name the two action keys distinctly
- **Reachability:** reachable — all three roles are live
- **Description:** `target` is an entry in `EXEMPT_DATA_IDS`, exempted from the qualified-noun-phrase rule as a cross-workflow dispatch-contract name whose spelling the context handoff owns. It is also an action key holding a variable name, and an action key holding a boolean predicate. The exemption list and the action schema live in different modules and neither cites the other. The field is the only one in its file carrying no description. Related to CON-18.
- **Impact:** One token carries three meanings with no cross-reference, so a change to any one of them has no discoverable relationship to the others, and the naming exemption granted for the dispatch-contract role silently covers the two action roles as well.
- **Location:** `src/utils/identifiers.ts` `EXEMPT_DATA_IDS`; `src/schema/activity.schema.ts:26-33`
- **Recommendation:** Name the two action keys for what they hold when the verb union is split under EXP-05, which leaves `target` with its single dispatch-contract role and makes the exemption accurate.

### ARC-09 — a bare technique reference's meaning depends on filesystem state

- **Severity:** Medium
- **Classification:** Structural — safe only while op names stay unique
- **Reachability:** conditional — triggered by adding a file whose name collides with an existing bare reference
- **Description:** `composeActivityTechnique` resolves a bare op id against the activity-named group first and falls back to the reference as authored. The resolved meaning of a bare technique reference therefore depends on whether a file exists at the activity-group path. The interface is `technique: z.string()` and exposes none of this. The resolution order is documented only in the loader's own doc comment. This is the corpus's most visible piece of terseness, at 427 bare-string bindings against 211 structured.
- **Impact:** Adding a file silently re-targets every bare reference of that name in that activity, with no diff to the referring YAML and no error. It is the precedent most at risk of being copied into a predicate shorthand, because it is the most visible and its precondition — that op names are unique enough in practice — is invisible in the form itself.
- **Location:** `src/loaders/technique-loader.ts:631-644`
- **Recommendation:** State the resolution order as a rule the settled specification carries, and add a guard that fails when a bare reference resolves ambiguously, so the precondition holds by check rather than by practice.

### ARC-10 — four loader-level sugars are invisible to both schemas

- **Severity:** Medium
- **Classification:** Structural — the authored surface is unschematised
- **Reachability:** reachable — all four are exercised by the live corpus
- **Description:** Zod runs after the loader, so every loader transformation is invisible to it by construction. Four pieces of sugar exist only at that layer: activity-group technique shorthand, rule-fragment splicing where reference entries resolve at load and delivered rules are always plain strings, checkpoint-fragment references where a checkpoint step carries a reference instead of a body, and string activity references.
- **Impact:** The authored surface and the validated surface are different documents, and only the second has a published grammar. An EBNF that describes the validated surface does not describe what an author writes, and one that describes the authored surface has no schema to be checked against. ARC-03 is the case where that gap has already produced a live rejection.
- **Location:** `src/loaders/` (8 modules); `src/schema/workflow.schema.ts:22-23`; `src/loaders/technique-loader.ts:631-644`
- **Recommendation:** State in the specification which surface each formal artifact describes, and cover the loader sugars in the EBNF for the authored surface, since they are part of the concrete syntax whether or not a schema can see them.

### FEA-02 — the parenthesization rule is expressible as grammar and lives in an imperative check

- **Severity:** Medium
- **Classification:** Fixable — move the rule into the grammar
- **Reachability:** reachable — enforced at one of six positions today
- **Description:** The rule that mixed `&&` and `||` at one nesting depth require parentheses is enforced by an imperative scan in `assertWhenAuthoring`, invoked from a single guard. The rule is context-free: a grammar in which an and-chain and an or-chain are separate productions over a shared unary term cannot admit a top-level mix by construction. Relates to CON-12, where the same rule is shown to have no evaluator counterpart, the evaluator happily evaluating what the authoring check rejects.
- **Impact:** Because the rule lives in a walker rather than in the language, it holds only where the walker looks, which is the `steps` array. Moving it into the grammar closes the `exits[].when` gap as a property of the language rather than of any walker, and removes the divergence between what the authoring check rejects and what the evaluator accepts.
- **Location:** `src/schema/when-expression.ts:344-368`; `scripts/check-when-expression.ts`
- **Recommendation:** Specify separate and-chain and or-chain productions in `grammar/activity.ebnf`, accepting a slightly less conventional precedence cascade in exchange for a self-enforcing rule, and generate or align the parser with it.
- **Blast radius:** 2 direct callers, 6 execution flows, 5 modules

### FEA-03 — no schema-drift check exists and none is registered

- **Severity:** Medium
- **Classification:** Fixable — add a regeneration check to the registry
- **Reachability:** reachable — any edit to a description string opens the drift
- **Description:** `scripts/generate-schemas.ts` is 30 lines and writes five files. It has no check mode, no comparison against what is committed, and no entry in the 31-guard registry. `package.json` carries a build target for schemas and no check target.
- **Impact:** The committed JSON Schemas are build artifacts with nothing asserting they match the Zod they were generated from. Since the entire dialect grammar lives in a description string, changing that string leaves the committed schema serving the old grammar to every editor and every external consumer until someone remembers to rerun the build.
- **Location:** `scripts/generate-schemas.ts`; `scripts/guards.ts`; `package.json`
- **Recommendation:** Add a guard that regenerates and fails on any diff, and register it. Extended to cover `grammar/` and `constraints/`, one guard subsumes this finding, FEA-04's staleness, and the parser-versus-specification divergence.

### FEA-04 — the formal artifacts have described a superseded design since 2026-02-10

- **Severity:** Medium
- **Classification:** Structural — generation, not authoring, is what changes this
- **Reachability:** reachable — the drift is present now and has been for roughly six months
- **Description:** `grammar/activity.ebnf` at 129 lines and `constraints/activity.als` at 279 lines are both stamped 3.0.0 and dated 2026-02-10, and both are complete, internally coherent specifications of a design carrying `decisions:`, `flows:` and `skill:` bindings that the current schema does not have. Nothing in the guard registry references either directory, no test parses the EBNF, and no Alloy run is wired to anything. `grammar/workflow.ebnf` and `constraints/workflow.als` do not exist, so the workflow half is specification from nothing rather than revision.
- **Impact:** This is the strongest available evidence about the next pair of artifacts: whatever they say on the day they are written, nothing will notice when they stop being true. Alloy in particular fails a build only if the Analyzer is wired into CI, so specifying `constraints/workflow.als` without also specifying how it is checked reproduces this failure one level up.
- **Location:** `grammar/activity.ebnf`; `constraints/activity.als`; `scripts/guards.ts`
- **Recommendation:** Generate the artifacts from the specification rather than authoring them alongside it, and name the checking mechanism as part of this run's deliverable rather than as a follow-up. An Alloy assertion is worth writing only if the run also specifies how it is run.

### FEA-05 — ten of fifteen predicate rules live where they cannot fail a build

- **Severity:** Medium
- **Classification:** Structural — location is the scarce resource
- **Reachability:** reachable — the distribution holds today
- **Description:** Fifteen rules govern predicates in this system. One is held in the type system, that a graph edge is a string and so carries no predicate. Four are held in guard scripts: step-`when` parses, step-`when` parenthesizes, `exists`-on-defaulted, and a `set` action names its target. Seven are held in prose descriptions or code comments: the operator set, precedence, truthiness semantics, the bare-word right-hand literal rule, fail-closed evaluation, the checkpoint dismissal caveat, and the legacy label on the tree. Three are held nowhere: `exits[].when` validity, validate-sense `target` validity, and numeric coercion agreement.
- **Impact:** Every proposal moves rules between these four homes and none reduces the count. A shorthand that adds a presence form and an emptiness form adds two more rules, and the default home for a new rule in this codebase is prose or nowhere, because that is where the last seven went. A grammar whose rules land in those two columns is a longer description string.
- **Location:** `src/schema/activity.schema.ts`; `src/schema/when-expression.ts`; `scripts/guards.ts`; `src/schema/workflow.schema.ts:62`
- **Recommendation:** Adopt as the acceptance test for the settled grammar: for every rule it states, name the artifact that fails when it is violated. Reject any rule whose only home is a description string.

### EXP-10 — a presence form and an emptiness form take the target residue to zero

- **Severity:** Low
- **Classification:** Confirmed
- **Reachability:** reachable — the four values are live in the corpus
- **Description:** The four `actions[].target` values that parse under neither declared grammar are one presence test, `target_path exists`, and three emptiness tests, `broken_artifact_links == []`, `summary_budget_overruns == []` and `summary_completeness_findings == []`. A postfix presence form closes the first and an emptiness form closes the other three, leaving no residue. Tested directly. All four close. Confirms the consistency evaluation's core prediction exactly.
- **Impact:** The two missing productions are settled and need not be rediscovered, and postfix order is fixed by the one authored instance. The cost of the presence half is recorded separately at EXP-03, and the slot problem behind the other 33 misplaced predicates is recorded at ARC-04, so this closes the syntax question without closing the field question.
- **Location:** `workflows/**/activities/*.yaml`, `actions[].target` under `action: validate`
- **Recommendation:** Specify both productions in `grammar/activity.ebnf`. Where the presence form can be avoided in favour of a value comparison, prefer it, since a value comparison is already visible to the guard that EXP-03 puts at risk.

### EXP-11 — a precondition satisfied by absence transfers as an assumption

- **Severity:** Low
- **Classification:** Design law — argues for Alloy as the primary workflow-tier deliverable
- **Reachability:** reachable — four instances are present in the corpus today
- **Description:** Every sound piece of sugar in this corpus rests on a precondition that is invisible in the sugar itself, and in each case that precondition is a fact about what does not exist. Bare-string technique binding is sound because the structured form carries only deviations, so the bare string is the well-defined no-deviation case. Implicit same-name binding is sound because resolution is closed over a declared signature. Predicate-free graph edges are sound because the activity owns its own exit conditions. The variable-model guard's tree-only walk is sound because the string dialect has no presence form. The fact lives in a rule, a description, or a comment. Never in a type.
- **Impact:** A later author sees the form, does not see the absence, and reproduces the form without the fact. This is the generative rule behind EXP-01, EXP-02, EXP-03 and ARC-09, each of which is an instance of it. It is also the argument for the artifact this run must specify: an Alloy fact can assert that no edge carries a predicate in a way a Zod description cannot.
- **Location:** `src/schema/activity.schema.ts:91`; `src/schema/workflow.schema.ts:78`; `scripts/check-variable-model.ts:21-22`
- **Recommendation:** Treat `constraints/workflow.als` as the primary workflow-tier deliverable rather than the secondary one, and write each of the four absences into it as an explicit fact.

### ARC-11 — every gate is parsed two to four times per delivery with no AST cached

- **Severity:** Low
- **Classification:** Fixable — parse once at load
- **Reachability:** reachable — executed on every delivery, for every gated step
- **Description:** `gateAnswer` parses each `when` string for path collection and discards the AST, then calls `evaluateWhenExpression`, which begins by parsing the same string again. `unboundPositiveReads` parses it a third time when called on the same step, and `expressionPaths` a fourth when the activity read set is computed. Answering every gate of every step is irreducibly linear in step count. The constant is what is reducible and is not reduced.
- **Impact:** The module already exports `parseWhen` and a `WhenAst` type, so an evaluate-on-AST entry point is a small addition and does not exist — the concrete cost of the published claim at ARC-01 being believed by the code's own structure, since nobody optimises a path the documentation says is not taken.
- **Location:** `src/utils/gate-liveness.ts:179` and `:194`; `src/schema/when-expression.ts:333-337`, `:261-285`
- **Recommendation:** Produce the AST once at load and have `gateAnswer` take a pre-parsed AST. This also creates the single place where an unknown operator can be reported as a definition error rather than silently becoming an unparsed verdict.
- **Blast radius:** 7 direct callers, 6 execution flows, 5 modules

### ARC-12 — `assertWhenAuthoring` tokenizes twice and its second failure branch is unreachable

- **Severity:** Low
- **Classification:** Fixable — dead branch and a redundant pass
- **Reachability:** unreachable — the second failure branch cannot execute
- **Description:** The function calls `parseWhen`, which tokenizes internally, and returns on failure. It then calls `tokenize` again on the same string and tests the result for a string error. `parseWhen` fails whenever `tokenize` fails, so the second test cannot succeed once the first has been passed.
- **Impact:** One dead branch and one wasted tokenization pass in the function that holds the parenthesization rule. The waste is small. Its significance is that the rule FEA-02 wants moved into the grammar sits in a function whose implementation is already known-redundant.
- **Location:** `src/schema/when-expression.ts:344-352`
- **Recommendation:** Reuse the tokens `parseWhen` already produced, or expose them on the parse result, and delete the unreachable branch.
- **Blast radius:** 2 direct callers, 6 execution flows, 5 modules

### ARC-13 — an unbound verdict discards the variable name the same file computes elsewhere

- **Severity:** Low
- **Classification:** Fixable — carry the path on the verdict
- **Reachability:** reachable — every unbound verdict discards it
- **Description:** `gateAnswer` iterates value paths, finds the specific path absent from the bag, and returns a bare enum reason, because the verdict type has no slot for the path. `unboundPositiveReads`, two functions earlier in the same file, computes exactly those names and returns them as a string array. The verdict union's own doc comment states the governing principle — that the three reasons are separate because they call for different responses — and that principle is applied in one place.
- **Impact:** The diagnostic a maintainer wants is which variable deferred the gate rather than that one did, and it is computed and thrown away. Set iteration order also decides which path triggers the verdict, which is harmless while no path is carried and becomes a nondeterministic-message defect the moment one is.
- **Location:** `src/utils/gate-liveness.ts:190-192` against `:86-131`
- **Recommendation:** Add the path to the verdict, and make the selection deterministic at the same time so the message does not depend on AST traversal order.
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### ARC-14 — decimal literals parse as a tree and fail as a string

- **Severity:** Low
- **Classification:** Fixable — admit decimals in the tokenizer
- **Reachability:** conditional — requires an author to write a decimal in a `when`. No live producer in the corpus
- **Description:** The tokenizer's number branch consumes an optional minus sign and then digits only. On a comparison against a decimal the leading digit tokenizes, the separator matches no branch, and tokenize reports an unexpected character. The tree dialect accepts a number value and YAML parses a decimal as a float, so the same comparison is expressible as a tree and inexpressible as a string.
- **Impact:** The gate fails closed to false, and at four of six positions no guard reports it. One more asymmetry between the dialects, unhit so far only because ordering comparators are rare — 7 `>` leaves across all condition trees.
- **Location:** `src/schema/when-expression.ts:122-133`
- **Recommendation:** Admit decimal literals in the tokenizer and state the numeric literal grammar in `grammar/activity.ebnf`, so the two dialects accept the same literal set.
- **Blast radius:** 2 direct callers, 6 execution flows, 5 modules

### ARC-15 — an empty `when` silently disables a step and the guard skips it

- **Severity:** Low
- **Classification:** Fixable — reject an empty string at the schema
- **Reachability:** conditional — requires an author to write an empty gate. No live producer in the corpus
- **Description:** The corpus guard's per-step check returns immediately unless the value is a non-empty trimmed string, so an empty gate is explicitly unchecked. At runtime the parser reports an empty expression, the evaluator returns false and the step never runs, and delivery reports the gate unparsed. The field is `z.string()` with no minimum-length constraint. Related to CON-08, where an unparseable gate fails closed without a diagnostic and has no live producer either.
- **Impact:** An empty string is a silent step-disable that the schema admits and the guard is written to ignore.
- **Location:** `scripts/check-when-expression.ts`, `checkStep`; `src/schema/when-expression.ts:156`; `src/schema/activity.schema.ts:74`
- **Recommendation:** Constrain the field to a non-empty string at the schema, which fails at load rather than silently at delivery, and remove the guard's skip.
- **Blast radius:** 7 direct callers, 6 execution flows, 5 modules

### ARC-16 — dotted-path resolution is triplicated across three modules

- **Severity:** Low
- **Classification:** Fixable — extract one resolver
- **Reachability:** reachable — any change to path semantics must land in three places
- **Description:** `getVar`, `getVariableValue` and `readPath` are three implementations of one operation: split the path on its separator, guard on null, undefined and non-object, and index. The third concedes the duplication in its own doc comment, describing itself as mirroring both reference evaluators' lookup. All three consequently support array indexing by numeric segment as an undocumented accident of indexing an array with a string key.
- **Impact:** Array indexing, optional chaining, or a stricter name grammar must land in three places, and two of them live under `src/schema/` while the third lives under `src/utils/`, so no single import would naturally catch all three.
- **Location:** `src/schema/when-expression.ts:287-294`; `src/schema/condition.schema.ts:41-49`; `src/utils/gate-liveness.ts:54-61`
- **Recommendation:** Extract one `resolvePath` imported by all three call sites, and state the path grammar — including whether numeric-segment array indexing is supported — in the specification. This is a pure refactor with no schema, protocol or corpus change, and it pairs with the shared coercion function ARC-02 requires.

### ARC-17 — malformed dotted paths tokenize as valid identifiers

- **Severity:** Low
- **Classification:** Fixable — apply the bag-name grammar in the tokenizer
- **Reachability:** conditional — requires a mistyped path. Produces no error when it occurs
- **Description:** The identifier branch consumes letters, digits, underscore and the path separator with no structural constraint, so a doubled separator, a trailing separator, or both still yield a single valid identifier token. The resolver then splits on the separator, looks up empty-string segments and returns undefined. The bag-name grammar used elsewhere in the system is stricter and is not applied here. Same family as CON-19, where a bare `undefined` likewise parses as a string literal instead of failing.
- **Impact:** A typo produces a silent false rather than a parse error, at four of six positions with no guard to report it.
- **Location:** `src/schema/when-expression.ts:136`
- **Recommendation:** Apply the bag-name grammar in the tokenizer and state it once in the specification, landed together with the reserved-word treatment CON-19 asks for.
- **Blast radius:** 2 direct callers, 6 execution flows, 5 modules

### ARC-18 — three name grammars across three modules with no shared constant

- **Severity:** Low
- **Classification:** Fixable — one shared constant
- **Reachability:** reachable — all three are live and independently maintained
- **Description:** The rename-or-literal disambiguator in the binding contract, `QUALIFIED_DATA_ID_PATTERN` in the identifier utilities, and the `when` tokenizer each accept a different identifier shape for a related purpose, the third being much the loosest. Separately, the terminal sentinel that ends a run is described in the graph schema's doc comment and is absent from the type, which is a record of strings, so nothing prevents an activity carrying the sentinel as its own id and nothing validates at the type level that a non-sentinel destination names a real activity.
- **Impact:** Three grammars for one concept drift independently, and the specification this run produces would have to choose one without any of the three being authoritative.
- **Location:** `src/utils/identifiers.ts`; `src/schema/when-expression.ts:136`; `src/schema/workflow.schema.ts:57-60`
- **Recommendation:** Define one shared identifier constant and one shared sentinel constant, cite them from all sites, and state both in the specification so the EBNF and the implementation draw on the same definition.

## Traceability

| Report ID | Source Artifact | Original ID | Original Severity |
|-----------|-----------------|-------------|-------------------|
| [EXP-01](#exp-01--the-workflow-tiers-predicate-free-graph-edges-are-a-stated-invariant) | [portfolio-synthesis.md](portfolio-synthesis.md) | P1, C8, S9 | Unassigned |
| [EXP-02](#exp-02--neither-predicate-dialect-contains-the-other) | [portfolio-synthesis.md](portfolio-synthesis.md) | P2, C6 | Unassigned |
| [EXP-03](#exp-03--the-presence-form-invalidates-a-hard-zero-guards-stated-precondition) | [portfolio-synthesis.md](portfolio-synthesis.md) | P5, C7 | Unassigned |
| [EXP-04](#exp-04--authors-reject-the-available-terse-form-968-per-cent-of-the-time) | [portfolio-claim.md](portfolio-claim.md) | C1 | Unassigned |
| [EXP-05](#exp-05--actionstarget-holds-two-grammars-whose-value-sets-overlap-completely) | [portfolio-synthesis.md](portfolio-synthesis.md) | P3, C5, A4 | Unassigned |
| [EXP-06](#exp-06--the-condition-tree-migration-is-19-blocks-rather-than-75) | [portfolio-synthesis.md](portfolio-synthesis.md) | C2, S10 | Unassigned |
| [EXP-07](#exp-07--a-checkpoints-condition-is-a-dismissal-construct-wearing-a-gates-name) | [portfolio-synthesis.md](portfolio-synthesis.md) | C2, A6 | Unassigned |
| [EXP-08](#exp-08--rename-only-technique-bindings-carry-the-dataflow-joins) | [portfolio-claim.md](portfolio-claim.md) | C3 | Unassigned |
| [EXP-09](#exp-09--neither-dialect-can-compare-two-bag-variables) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D8 | Unassigned |
| [EXP-10](#exp-10--a-presence-form-and-an-emptiness-form-take-the-target-residue-to-zero) | [portfolio-pedagogy.md](portfolio-pedagogy.md) | P4 | Unassigned |
| [EXP-11](#exp-11--a-precondition-satisfied-by-absence-transfers-as-an-assumption) | [portfolio-pedagogy.md](portfolio-pedagogy.md) | pedagogy law | Unassigned |
| [ARC-01](#arc-01--the-server-evaluates-both-dialects-and-the-published-contract-denies-it) | [portfolio-synthesis.md](portfolio-synthesis.md) | D1 | Unassigned |
| [ARC-02](#arc-02--the-two-evaluators-use-different-numeric-coercion) | [portfolio-synthesis.md](portfolio-synthesis.md) | P8, C6, D4 | Unassigned |
| [ARC-03](#arc-03--the-published-workflow-json-schema-rejects-a-live-definition-file) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A2 | Unassigned |
| [ARC-04](#arc-04--one-predicate-language-position-specific-power-and-agent-side-evaluation-cannot-all-hold) | [portfolio-synthesis.md](portfolio-synthesis.md) | C-triad, D-law | Unassigned |
| [ARC-05](#arc-05--one-file-gives-two-answers-on-whether-absence-answers-a-negative-gate) | [portfolio-synthesis.md](portfolio-synthesis.md) | S6, D7 | Unassigned |
| [ARC-06](#arc-06--an-unparseable-expression-reads-no-variables-and-shrinks-the-declared-variable-contract) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D5 | Unassigned |
| [ARC-07](#arc-07--the-entire-dialect-grammar-lives-in-prose-that-no-validator-reads) | [portfolio-synthesis.md](portfolio-synthesis.md) | S1, A8 | Unassigned |
| [ARC-08](#arc-08--target-carries-three-roles-across-two-modules-that-do-not-cite-each-other) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A5 | Unassigned |
| [ARC-09](#arc-09--a-bare-technique-references-meaning-depends-on-filesystem-state) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A7 | Unassigned |
| [ARC-10](#arc-10--four-loader-level-sugars-are-invisible-to-both-schemas) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A3 | Unassigned |
| [ARC-11](#arc-11--every-gate-is-parsed-two-to-four-times-per-delivery-with-no-ast-cached) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D2 | Unassigned |
| [ARC-12](#arc-12--assertwhenauthoring-tokenizes-twice-and-its-second-failure-branch-is-unreachable) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D3 | Unassigned |
| [ARC-13](#arc-13--an-unbound-verdict-discards-the-variable-name-the-same-file-computes-elsewhere) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D6 | Unassigned |
| [ARC-14](#arc-14--decimal-literals-parse-as-a-tree-and-fail-as-a-string) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D9 | Unassigned |
| [ARC-15](#arc-15--an-empty-when-silently-disables-a-step-and-the-guard-skips-it) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D10 | Unassigned |
| [ARC-16](#arc-16--dotted-path-resolution-is-triplicated-across-three-modules) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D11 | Unassigned |
| [ARC-17](#arc-17--malformed-dotted-paths-tokenize-as-valid-identifiers) | [portfolio-deep-scan.md](portfolio-deep-scan.md) | D12 | Unassigned |
| [ARC-18](#arc-18--three-name-grammars-across-three-modules-with-no-shared-constant) | [portfolio-sdl-abstraction.md](portfolio-sdl-abstraction.md) | A9 | Unassigned |
| [FEA-01](#fea-01--92-predicates-at-two-positions-have-no-syntax-guard) | [portfolio-synthesis.md](portfolio-synthesis.md) | P7, S2, S3 | Unassigned |
| [FEA-02](#fea-02--the-parenthesization-rule-is-expressible-as-grammar-and-lives-in-an-imperative-check) | [portfolio-synthesis.md](portfolio-synthesis.md) | P6, S7, A10 | Unassigned |
| [FEA-03](#fea-03--no-schema-drift-check-exists-and-none-is-registered) | [portfolio-synthesis.md](portfolio-synthesis.md) | S4, A8 | Unassigned |
| [FEA-04](#fea-04--the-formal-artifacts-have-described-a-superseded-design-since-2026-02-10) | [portfolio-synthesis.md](portfolio-synthesis.md) | S5 | Unassigned |
| [FEA-05](#fea-05--ten-of-fifteen-predicate-rules-live-where-they-cannot-fail-a-build) | [portfolio-scarcity.md](portfolio-scarcity.md) | S8 | Unassigned |
