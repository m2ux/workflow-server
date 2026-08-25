---
Subject: workflow-server activity and workflow YAML definition grammar
Evaluation Date: 2026-08-25
Scope: where the activity and workflow definition language can carry expressions in shorthand, and what a settled target grammar must specify. Measured against `origin/main` (`b061faee`), with `workflows/` read from the working tree at corpus revisions `5f17da01`, `7e5f5eae` and `fbd6f53b`.
---

# Evaluation Report: workflow-server Activity and Workflow Definition Grammar

## Executive Summary

This evaluation asks where activity and workflow YAML can carry expressions in shorthand, and settles
what a target grammar covering both tiers must state. The answer is partly negative: the corpus does
not want most of the brevity a shorthand would offer, and two of the four artifacts the specification
targets should record an absence rather than a new language.

### What was measured and what this run delivers

- **In scope:** the two predicate dialects (`when:` strings and `condition:` trees), `exits[].when`,
  checkpoint gating, `actions[].target`, workflow `graph` edges, technique bindings, the generated JSON
  Schemas, and the guard suite that enforces the language's static semantics.
- **This run specifies.** It does not write `grammar/activity.ebnf`, `constraints/activity.als`,
  `grammar/workflow.ebnf` or `constraints/workflow.als`. Those four files are the specification's
  consumers.
- **The two existing formal files carry no evidential weight.** `grammar/activity.ebnf` and
  `constraints/activity.als` are complete, coherent specifications of a superseded `decisions:` /
  `flows:` / `skill:` design dated 2026-02-10. The other two do not exist.
- **The mainline is the reference.** All behavioural claims were re-executed against `origin/main`. The
  checked-out branch is 42 commits behind and lacks `ExitSchema`, `variable.schema.ts` and the workflow
  `graph` construct, so it is not a valid drafting base.

| Dimension | Critical | High | Medium | Low | Total |
|-----------|----------|------|--------|-----|-------|
| Consistency | 0 | 2 | 3 | 9 | 14 |
| Expressiveness | 0 | 4 | 5 | 2 | 11 |
| Architecture | 0 | 2 | 7 | 8 | 17 |
| Feasibility | 0 | 1 | 4 | 0 | 5 |
| **Total** | **0** | **9** | **19** | **19** | **47** |

Fifty-four findings were raised across the two analyses. Seven are the same defect reported twice, and
appear once here under both originating IDs.

## Overall Assessment

### Verdict

The definition language has a real expressiveness gap, and it is much smaller than the commission
assumes. Two productions close the whole of the unparseable residue. Everything else the shorthand
premise reaches for is either already legal and declined, structurally forced, or an invariant that
should be written down as a constraint. The grammar's budget is better spent on where rules live than
on how short predicates are.

- **The four artifacts are not equally sized.** The activity tier needs a grammar and a constraint
  model. The workflow tier needs mostly a constraint model, because its predicate-free edges are the
  property to assert.
- **Two changes are prerequisites, not follow-ups.** One shared numeric coercion must land before any
  predicate is rewritten in either direction. The hard-zero variable guard must learn the string
  dialect in the same commit that adds a presence form.
- **The headline risk is a migration that looks correct.** A predicate rewritten between dialects can
  silently change its answer, and no component computes both answers, so there is no observation point.
- **Nothing here is Critical.** The corpus validates cleanly at all three revisions measured — 122 of
  122 activity files accept, with a census delta of zero across six commits.

### Where the risk sits

Risk concentrates in what is stated but not enforced. Ten of the fifteen rules governing predicates
today live in prose descriptions, code comments, or nowhere at all. A rule in those homes cannot fail a
build, and the two formal artifacts that already exist have been describing a design the schema
abandoned six months ago with nothing noticing. A grammar whose new rules land in the same homes is a
longer description string.

## The Core Finding

The predicates that escaped the enforced grammar needed a field, not a syntax — and where a terse form
is already available, authors reject it 96.8 per cent of the time.

### The escaped predicates already parse

Of the 37 distinct predicates that migrated into the unconstrained `actions[].target` field, 33 parse
as valid `when` expressions today. **They moved because an action has no `when` field.** That is a
missing slot, not missing syntax. Only four values parse under neither declared grammar.

### The migration is a fifth of its assumed size

Of 109 structured `condition` blocks, 78 sit where the tree is the only spelling available — 67 on
checkpoints, where only `condition` enables dismissal, and 11 on actions, whose schema declares no
`when` field. Nine more use `exists` or `notExists`, which the string dialect lacks. **That leaves 19
elective single-leaf blocks, not 75.** A migration sized at 75 attempts 56 rewrites that are impossible
or lossy.

### Authors have already decided against brevity

Across all 281 `when` strings decomposed to leaves, explicit boolean comparison appears 272 times
against 9 uses of the terse forms. The terse form has always been legal, is shorter, and is documented
in the field's own description. **A grammar that rewards brevity optimises a quantity authors have
spent 272 decisions rejecting.** `x == true` also fails closed on a string, a number or an array, where
a bare `x` asserts only JavaScript truthiness, and 95 of 657 declarations are array-typed.

### The workflow tier's blank is a rule

All 192 graph edges across 17 workflows and 106 nodes are bare destination strings, with zero
exceptions. The schema states the reason at `workflow.schema.ts:78`: an activity names its outcomes and
the workflow names destinations, so a borrowed activity sits in any graph without its lender having a
say. **`grammar/workflow.ebnf` and `constraints/workflow.als` should state that absence as a
constraint**, not fill it with an edge predicate language.

### The one confirmed syntax gap carries a price

A postfix presence form and an emptiness form take the four unparseable `actions[].target` values to
zero. This was tested directly and confirmed. The presence half is not free: it invalidates the stated
precondition of `check-variable-model.ts:21-22`, which walks only condition trees *because* the `when:`
dialect has no exists-shaped predicate. That guard's domain is 350 of 657 defaulted variable
declarations, and it keeps passing while going blind to them.

### What is actually scarce

Fifteen rules govern predicates. One is held in the type system, four in guard scripts, seven in prose
or comments, and three nowhere. **Enforceable location is the scarce resource, not expressiveness.**

### Testable prediction

For every rule the settled grammar states, name the artifact that fails when it is violated. If a
design lands that reduces the fifteen-rule count rather than relocating rules between those four homes,
this account is wrong. On present evidence a shorthand adds two rules, and the default home for a new
rule in this codebase is prose — which is where the last seven went.

## Findings Reported by Both Analyses

Seven findings were raised independently in both analyses. Each appears once below, under all its
originating IDs.

| Consolidated ID | Defect | Reported in |
|---|---|---|
| CON-05 / ARC-02 | The two evaluators coerce numbers differently | Consistency |
| CON-06 / EXP-02 | Neither dialect contains the other | Expressiveness |
| CON-07 / EXP-07 | Checkpoint dismissibility rides on field presence | Expressiveness |
| CON-09 / EXP-05 | `actions[].target` holds two grammars | Expressiveness |
| CON-12 / FEA-02 | The parenthesization rule sits in a walker | Feasibility |
| CON-14 / CON-15 / ARC-05 | One file gives two answers on negative gates | Architecture |

## Per-Dimension Findings

### Consistency

Whether one predicate intent is written and enforced alike across every position it may appear.

| ID | Severity | Title |
|----|----------|-------|
| CON-05 / ARC-02 | HIGH | The two evaluators coerce numbers differently |
| CON-20 | HIGH | One predicate intent has five availabilities by position |
| CON-16 | MEDIUM | A loop variable lands as a projection that drops the key its own gate reads |
| CON-18 | MEDIUM | The action object is open and its target field is undocumented |
| CON-19 | MEDIUM | `undefined` parses as a string literal |
| CON-01 | LOW | `variables` and `exits` are declared on the activity schema |
| CON-02 | LOW | Transition-legality validation |
| CON-03 | LOW | The routing vocabulary is read and enforced |
| CON-04 | LOW | The tree-to-string lowering |
| CON-08 | LOW | An unparseable gate fails closed without a diagnostic |
| CON-10 | LOW | Manifest warnings for unknown activities |
| CON-11 | LOW | CI validates the pinned corpus, not the submodule tip |
| CON-13 | LOW | Comparison-node fall-through in the evaluator |
| CON-17 | LOW | The checkpoint option object is open |

**CON-05 / ARC-02 — The two evaluators coerce numbers differently** (HIGH)
The string dialect coerces with `Number()` and the tree dialect with `toNumber()`. Five of thirteen
probe predicates expressing one intent in both spellings disagree — on `true`, `null`, `[]`, `[5]` and
`false`. Every disagreement is a non-numeric value reaching a numeric comparator, and the bag supplies
them: 95 array-typed and 50 object-typed declarations. This is the slowest failure in the system to
discover. The single site holding both dialects and-combines them, so a disagreement returns an
ordinary-looking false, and no component computes both answers, so there is no observation point even
in principle. Its trigger is exactly the migration this grammar would authorise, and it will be
diagnosed as a bug in the migration script.

**CON-20 — One predicate intent has five availabilities by position** (HIGH)
Five positions give five answers to which predicate may be written there.

| Position | Level | `when` | `condition` tree | Presence forms | Sites |
|---|---|---|---|---|---|
| step gate | activity | yes | yes | tree only | 281 / 108 |
| `exits[].when` | activity | yes | no | neither | 54 |
| checkpoint | activity | yes | required for dismissal | tree only | 113 / 67 |
| `actions[].target` | activity | undeclared | sibling `condition` | undeclared | 38 |
| `graph` edge | workflow | no | no | no | 192 |

An author who knows one position's rules cannot transfer that knowledge. A gate cannot move between
positions without being rewritten or losing capability.

**CON-16 — A loop variable lands as a projection that drops the key its own gate reads** (MEDIUM)
The `current_unit` loop variable lands as a four-key object without `pipeline_mode`. A step gate
reading `current_unit.pipeline_mode` evaluates false against the bag its own preceding activity wrote.
The step ran regardless, because no mechanical evaluator gates worker execution.

**CON-18 — The action object is open and its target field is undocumented** (MEDIUM)
`ActionSchema` is not strict, so an unknown key inside an action is stripped without a warning. Its
`target` field is the only one in the file carrying no description, and it is the field the escaped
predicates accumulated in.

**CON-19 — `undefined` parses as a string literal** (MEDIUM)
`parseWhen('x == undefined')` succeeds and compares against the string `"undefined"`. It is what an
author writes when reaching for a presence test, so the trap sits directly beside the gap that produces
it. Adding a presence production without reserving the word leaves the trap armed next to its own fix.

**CON-01 — `variables` and `exits` are declared on the activity schema** (LOW)
Both keys are declared on the mainline and all 122 activity files accept at every revision measured.
The rejection behaviour exists only on the checked-out branch, which is 42 commits behind. No schema
action is required; the drafting base is what must change.

**CON-02 — Transition-legality validation** (LOW)
`getValidTransitions` is absent from the mainline. Routing legality is enforced instead by failing the
workflow load on an unbound exit. No action.

**CON-03 — The routing vocabulary is read and enforced** (LOW)
`exits` occurs 22 times across the source tree with load-bearing reads, and the checkpoint option's
`effect` object is strict and declares `exit`. No action.

**CON-04 — The tree-to-string lowering** (LOW)
`conditionToString` is absent from the mainline. Where it existed, five of six forms failed to
re-parse. Retained as evidence that the two dialects were never mutually expressible.

**CON-08 — An unparseable gate fails closed without a diagnostic** (LOW)
`evaluateWhenExpression` returns false for a string it cannot parse, so a typo'd gate skips its step
with no signal. Zero of 281 corpus gates fail today, so the failure mode has no live producer.

**CON-10 — Manifest warnings for unknown activities** (LOW)
The warning path fires only on an empty activity id set, which does not occur on the mainline. No
action.

**CON-11 — CI validates the pinned corpus, not the submodule tip** (LOW)
The gitlink gap stands at six commits and the running container serves a corpus two ahead of its image
pin. All three pointers nonetheless validate 122 of 122 with a census delta of zero, so the grammar
consequence is nil. The pin is doing a job: it lets the corpus move at authoring cadence.

**CON-13 — Comparison-node fall-through in the evaluator** (LOW)
An unexpected comparison operator would fall through and throw. `evalAst` is not exported and every
caller routes through `parseWhen`, which emits six operators. No caller can construct the state.

**CON-17 — The checkpoint option object is open** (LOW)
`CheckpointOptionSchema` is not strict at the option level, though its inner `effect` object is. An
`exit` written one level too high is stripped without a warning.

**Most important insight:** the inconsistency is positional, not a count of dialects. One intent has
five different availabilities depending only on where it is written.

### Expressiveness

What authors can and cannot say, and what they choose to say when given the choice.

| ID | Severity | Title |
|----|----------|-------|
| EXP-01 | HIGH | The workflow tier's predicate-free graph edges are a stated invariant |
| CON-06 / EXP-02 | HIGH | Neither predicate dialect contains the other |
| EXP-03 | HIGH | The presence form invalidates a hard-zero guard's stated precondition |
| EXP-04 | HIGH | Authors reject the available terse form 96.8 per cent of the time |
| CON-09 / EXP-05 | MEDIUM | `actions[].target` holds two grammars whose value sets overlap completely |
| EXP-06 | MEDIUM | The condition-tree migration is 19 blocks rather than 75 |
| CON-07 / EXP-07 | MEDIUM | A checkpoint's `condition` is a dismissal construct wearing a gate's name |
| EXP-08 | MEDIUM | Rename-only technique bindings carry the dataflow joins |
| EXP-09 | MEDIUM | Neither dialect can compare two bag variables |
| EXP-10 | LOW | A presence form and an emptiness form take the target residue to zero |
| EXP-11 | LOW | A precondition satisfied by absence transfers as an assumption |

**EXP-01 — The workflow tier's predicate-free graph edges are a stated invariant** (HIGH)
`GraphSchema` is a record of records of strings, and all 192 edges across 17 graphs and 106 nodes are
bare strings with zero exceptions. Every one of the corpus's 390 predicates sits inside an activity.
The property is protected today only by the accident that a record of strings cannot hold an object. An
edge predicate production would parse, route, and quietly end activity borrowability, because a
borrowing workflow could then re-specify the lending activity's exit semantics. No test asserts
borrowability, so nothing would fail. Specify an edge as a bare destination identifier or the terminal
sentinel, with no guard production, and carry the invariant into Alloy as a fact.

**CON-06 / EXP-02 — Neither predicate dialect contains the other** (HIGH)
The tree carries `exists` and `notExists`, used at 17 corpus leaves, and the string dialect has no
presence form at all. In the other direction the string dialect carries bare-identifier truthiness,
used at 9 sites, and the tree operator enum has none. The nearest candidates diverge: for `x = false`,
`x = 0` and `x = ""` a bare `x` is false while `exists` is true. The dialects also differ on decimal
literals and on arity. Any grammar built on the assumption that the string is the no-deviation case of
the tree is wrong at the root, and the wrongness is invisible because both spellings parse.

**EXP-03 — The presence form invalidates a hard-zero guard's stated precondition** (HIGH)
`check-variable-model.ts` walks only structured conditions, and its own comment gives the reason as the
string dialect having no exists-shaped predicate. Its `exists-on-defaulted` rule is hard-zero: a
presence gate on a variable declaring a default is constant, because the server seeds every default at
session creation. Measured exposure is 350 of 657 declarations. The syntax lands, the guard keeps
passing, and it is silently blind to 53 per cent of its domain. Extend the guard in the same commit
that adds the syntax, as a precondition rather than a follow-up.

**EXP-04 — Authors reject the available terse form 96.8 per cent of the time** (HIGH)
Explicit boolean comparison appears 272 times — 160 `== true`, 95 `!= true`, 17 `== false`, 0
`!= false` — against 9 uses of the terse forms. Encouraging the drop of `== true` would convert 272
exactly checkable sites into sites whose meaning depends on JavaScript truthiness. For an array-typed
variable such a gate holds precisely when the array is empty. Add no brevity sugar to the boolean case.

**CON-09 / EXP-05 — `actions[].target` holds two grammars whose value sets overlap completely** (MEDIUM)
Of 248 action entries, 122 carry `target`. Under `action: set` it is a variable name across 84 entries
and 53 distinct values, and all 53 also parse as valid `when` expressions. Under `action: validate` it
is a boolean predicate across 38 entries and 37 distinct values. The field is an optional bare string
with no description, and only the sibling verb disambiguates. A validate-sense predicate mistyped as a
set-sense name produces no error in either sense. An EBNF production for one YAML key cannot be indexed
on a sibling key's value, so the honest grammar answer is two distinct keys.

**EXP-06 — The condition-tree migration is 19 blocks rather than 75** (MEDIUM)
Seventy-five of 109 blocks are a single simple leaf, and the inference that they are verbose spellings
of a one-line gate does not survive cross-tabulation by position. Sixty-seven sit on checkpoints and 11
on actions, giving 78 structurally forced. Nine of the 31 elective blocks use presence operators the
string dialect lacks. Nineteen remain — 17 per cent of the 109, not 69 per cent.

**CON-07 / EXP-07 — A checkpoint's `condition` is a dismissal construct wearing a gate's name** (MEDIUM)
On a checkpoint step, `condition` is what enables dismissal, and `when` does not. The contents of the
field do not affect the capability; its presence does. At the other four positions the same field is
labelled legacy in favour of `when`. A checkpoint carrying a `when` and no `condition` validates,
loads, runs, and is silently non-dismissible. Sixty-seven of 113 checkpoints depend on this today, and
no guard in the registry names the rule.

**EXP-08 — Rename-only technique bindings carry the dataflow joins** (MEDIUM)
Of 208 structured bindings that declare inputs, 64 are rename-only. Exactly 2 are identity
passthroughs. The remaining 62 map 57 distinct input-to-source pairs, each a design decision stated in
the only place it is stated — `dispatch_concurrency` bound from `scanners_assigned` asserts that the
assigned scanner count is the dispatch concurrency. A shorthand cannot infer these, because the names
differ by design. Deleting the binding deletes the join in the dataflow graph.

**EXP-09 — Neither dialect can compare two bag variables** (MEDIUM)
A bare word on the right of a comparison is taken as a string literal, so `a == b` compares `a` against
the string `"b"`. The tree dialect has the identical hole: its value union has no variable-reference
variant. The author gets a silent, effectively always-false gate rather than an error, and the
reads-have-writers guard cannot notice that `b` is never written. This is the clearest genuine
expressiveness gap the implementation exposes.

**EXP-10 — A presence form and an emptiness form take the target residue to zero** (LOW)
The four unparseable values are one presence test, `target_path exists`, and three emptiness tests of
the form `x == []`. A postfix presence form closes the first and an emptiness form the other three.
Tested directly; all four close. Postfix order is fixed by the one authored instance. This closes the
syntax question without closing the field question behind the other 33 migrated predicates.

**EXP-11 — A precondition satisfied by absence transfers as an assumption** (LOW)
Every sound piece of sugar in this corpus rests on a precondition invisible in the sugar itself, and in
each case that precondition is a fact about what does not exist. Bare-string technique binding is sound
because the structured form carries only deviations. Predicate-free graph edges are sound because the
activity owns its exit conditions. The variable guard's tree-only walk is sound because the string
dialect has no presence form. The fact lives in a rule, a description, or a comment — never in a type.
A later author reproduces the form without the fact.

**Most important insight:** the corpus is not short of ways to say things. It is short of one field, one
comparison form, and a place to record the absences its existing sugar depends on.

### Architecture

How the grammar is structured across schemas, evaluators, loaders and published contracts.

| ID | Severity | Title |
|----|----------|-------|
| ARC-01 | HIGH | The server evaluates both dialects and the published contract denies it |
| ARC-03 | HIGH | The published workflow JSON Schema rejects a live definition file |
| ARC-04 | MEDIUM | One language, position-specific power and agent-side evaluation cannot all hold |
| CON-14 / CON-15 / ARC-05 | MEDIUM | One file gives two answers on whether absence answers a negative gate |
| ARC-06 | MEDIUM | An unparseable expression reads no variables and shrinks the declared contract |
| ARC-07 | MEDIUM | The entire dialect grammar lives in prose that no validator reads |
| ARC-08 | MEDIUM | `target` carries three roles across two modules that do not cite each other |
| ARC-09 | MEDIUM | A bare technique reference's meaning depends on filesystem state |
| ARC-10 | MEDIUM | Four loader-level sugars are invisible to both schemas |
| ARC-11 | LOW | Every gate is parsed two to four times per delivery with no AST cached |
| ARC-12 | LOW | `assertWhenAuthoring` tokenizes twice and its second failure branch is unreachable |
| ARC-13 | LOW | An unbound verdict discards the variable name the same file computes elsewhere |
| ARC-14 | LOW | Decimal literals parse as a tree and fail as a string |
| ARC-15 | LOW | An empty `when` silently disables a step and the guard skips it |
| ARC-16 | LOW | Dotted-path resolution is triplicated across three modules |
| ARC-17 | LOW | Malformed dotted paths tokenize as valid identifiers |
| ARC-18 | LOW | Three name grammars across three modules with no shared constant |

**ARC-01 — The server evaluates both dialects and the published contract denies it** (HIGH)
`gate-liveness.ts:194-195` calls both evaluators against the server's snapshot of the variable bag and
combines the results. The result drives eager bundling — whether a step's technique body ships with the
delivery — rather than control flow. The field description published to every agent, and into the
generated JSON Schema, states that the server never evaluates gates. That distinction between deciding
delivery and driving control flow is real and defensible, and it appears nowhere. A reader who believes
the contract concludes that cross-dialect divergence cannot affect the server. It can, at exactly that
line. The belief is visible in the code as redundant parses nobody optimised.

**ARC-03 — The published workflow JSON Schema rejects a live definition file** (HIGH)
Zod validates the assembled runtime workflow object, in which activities are objects. The JSON Schema
generated from it is published for definition files, in which activities may be file-path strings.
`workflows/remediate-vuln/workflow.yaml` lists them as strings, and the published schema declares the
array items to be objects requiring `id`, `version` and `name`. The schema file's own comment names the
intended union; the declared type contains no string variant, so the union never reaches the generated
artifact. Sixteen corpus references point at a document that rejects the files citing it.

**ARC-04 — One language, position-specific power and agent-side evaluation cannot all hold** (MEDIUM)
Three properties are in tension: one predicate language across every position; position-specific power,
since checkpoint dismissal, exit routing, step gating and guarding an action are four different acts;
and evaluation by the executing agent, which makes activities portable across harnesses. Any two are
achievable. Holding the first two gives a language the server cannot answer generically at delivery.
Holding the first and third gives today's uniform dialect, unable to express checkpoint dismissal.
Merging the two syntaxes relocates the distinction into the position rather than removing it. Treat
agent-side evaluation as fixed; it is load-bearing.

**CON-14 / CON-15 / ARC-05 — One file gives two answers on whether absence answers a negative gate** (MEDIUM)
`unboundPositiveReads` deliberately excludes `!=` comparisons and `not` subtrees, its doc comment
giving the reason: those forms hold on a missing variable, which is how this corpus spells "not in that
mode". `collectWhenPaths`, in the same file, adds every comparison path with no such exemption. The
tree collector does carry the exclusion, routing presence operators into a separate set. Two spellings
of one intent therefore get opposite delivery outcomes: `notExists x` is answered and eagerly bundled,
while `x != true` returns an unbound verdict and its step stays lazy. Fifty-four corpus gates across 16
distinct expressions take the pessimistic path on every delivery, and the file's own comment says they
should not.

**ARC-06 — An unparseable expression reads no variables and shrinks the declared contract** (MEDIUM)
`expressionPaths` returns an empty array when parsing fails. Its consumer computes the reads backing
the guard that proves every activity declares what it reads and that every read has a writer. A
malformed expression therefore does not merely fail to gate — its reads vanish from the activity's
declared contract, and a typo converts a checked read into an unchecked absence. Failing closed on
evaluation is safe. Failing closed on static analysis is the opposite, because returning "no problems"
is the failure mode.

**ARC-07 — The entire dialect grammar lives in prose that no validator reads** (MEDIUM)
The `when` field is typed as a bare string. Its operator set, precedence, parenthesization rule,
truthiness semantics, bare-word literal rule, fail-closed behaviour and checkpoint caveat live in a
700-character description. The dialect is stated in five unlinked places, one of which is an
EBNF-shaped doc comment already incomplete relative to the implementation. Adding a production changes
nothing in Zod, nothing in the generated schema and nothing in the type system, and the compiler passes
along with 30 of 31 guards. The only mechanism that can catch a grammar change is a person reading a
diff.

**ARC-08 — `target` carries three roles across two modules that do not cite each other** (MEDIUM)
`target` is an exempt dispatch-contract name in the identifier utilities, an action key holding a
variable name, and an action key holding a boolean predicate. The exemption list and the action schema
live in different modules and neither cites the other. The naming exemption granted for the first role
silently covers the other two.

**ARC-09 — A bare technique reference's meaning depends on filesystem state** (MEDIUM)
Bare op ids resolve against the activity-named group first and fall back to the reference as authored.
The resolved meaning therefore depends on whether a file exists at the activity-group path, and the
interface exposes none of this. Adding a file silently re-targets every bare reference of that name in
that activity, with no diff to the referring YAML. At 427 bare-string bindings against 211 structured,
this is the corpus's most visible terseness and the precedent most at risk of being copied.

**ARC-10 — Four loader-level sugars are invisible to both schemas** (MEDIUM)
Zod runs after the loader, so every loader transformation is invisible to it by construction. Four
sugars exist only at that layer: activity-group technique shorthand, rule-fragment splicing,
checkpoint-fragment references, and string activity references. The authored surface and the validated
surface are different documents, and only the second has a published grammar. ARC-03 is where that gap
has already produced a live rejection.

**ARC-11 — Every gate is parsed two to four times per delivery with no AST cached** (LOW)
`gateAnswer` parses each string for path collection and discards the AST, then calls an evaluator that
parses it again. Two further call sites parse it a third and fourth time. The module already exports a
parse entry point and an AST type, so an evaluate-on-AST entry point is a small addition that does not
exist — the concrete cost of the published claim at ARC-01 being believed by the code's own structure.

**ARC-12 — `assertWhenAuthoring` tokenizes twice and its second failure branch is unreachable** (LOW)
The function parses, returns on failure, then tokenizes the same string again and tests for an error
the parse would already have caught. The waste is small. Its significance is that the rule worth moving
into the grammar sits in a function already known to be redundant.

**ARC-13 — An unbound verdict discards the variable name the same file computes elsewhere** (LOW)
`gateAnswer` finds the specific path absent from the bag and returns a bare enum reason, because the
verdict type has no slot for the path. A function two earlier in the same file computes exactly those
names. The diagnostic a maintainer wants is which variable deferred the gate, and it is computed and
thrown away.

**ARC-14 — Decimal literals parse as a tree and fail as a string** (LOW)
The tokenizer's number branch consumes an optional minus and then digits only, so a decimal comparison
reports an unexpected character. The tree dialect accepts it. The same comparison is expressible one
way and not the other. No live producer; ordering comparators are rare, at 7 leaves across all trees.

**ARC-15 — An empty `when` silently disables a step and the guard skips it** (LOW)
The field has no minimum-length constraint, and the corpus guard's per-step check returns immediately
unless the value is a non-empty trimmed string. At runtime the step never runs. An empty string is a
silent step-disable that the schema admits and the guard is written to ignore.

**ARC-16 — Dotted-path resolution is triplicated across three modules** (LOW)
`getVar`, `getVariableValue` and `readPath` are three implementations of one operation, the third
conceding the duplication in its own doc comment. All three support array indexing by numeric segment
as an undocumented accident. Two live under the schema directory and one under utilities, so no single
import would catch all three.

**ARC-17 — Malformed dotted paths tokenize as valid identifiers** (LOW)
The identifier branch consumes letters, digits, underscore and the separator with no structural
constraint, so a doubled or trailing separator still yields one valid token. The resolver then looks up
empty-string segments and returns undefined. A typo produces a silent false rather than a parse error.

**ARC-18 — Three name grammars across three modules with no shared constant** (LOW)
The binding contract's disambiguator, the qualified identifier pattern, and the expression tokenizer
each accept a different identifier shape for a related purpose. Separately, the terminal sentinel that
ends a run is described in a doc comment and absent from the type, so nothing prevents an activity
carrying the sentinel as its own id.

**Most important insight:** the authoritative statement and the published one have already diverged in
three places, and in each case nothing in the build notices.

### Feasibility

What it would cost to land a change to the grammar, and what would catch it if it were wrong.

| ID | Severity | Title |
|----|----------|-------|
| FEA-01 | HIGH | 92 predicates at two positions have no syntax guard |
| CON-12 / FEA-02 | MEDIUM | The parenthesization rule sits in a walker rather than the grammar |
| FEA-03 | MEDIUM | No schema-drift check exists and none is registered |
| FEA-04 | MEDIUM | The formal artifacts have described a superseded design since 2026-02-10 |
| FEA-05 | MEDIUM | Ten of fifteen predicate rules live where they cannot fail a build |

**FEA-01 — 92 predicates at two positions have no syntax guard** (HIGH)
The `when-expression` guard's registry entry claims it proves that every gate parses and parenthesizes
mixed operators. Its implementation applies that check only to members of a `steps` array. Two
deliberately invalid expressions placed on `exits[]` — one unparenthesized, one unparseable — produce
the output "OK, all when: gates parse". The identical two expressions on steps produce two findings. In
the live corpus 54 exit expressions are unguarded, as are the 38 validate-sense `target` predicates.
The registry claim is broader than the implementation, so the guard suite reports coverage it does not
have.

**CON-12 / FEA-02 — The parenthesization rule sits in a walker rather than the grammar** (MEDIUM)
The rule that mixed `&&` and `||` at one nesting depth require parentheses is enforced by an imperative
scan invoked from a single guard. The evaluator never calls that check, so it evaluates `a && b || c`
to true under fixed precedence while the authoring rule rejects it. The tree dialect has no counterpart
rule at all. The rule is context-free: separate and-chain and or-chain productions over a shared unary
term cannot admit a top-level mix by construction. Moving it into the grammar closes the exit-position
gap as a property of the language and removes the divergence in one step.

**FEA-03 — No schema-drift check exists and none is registered** (MEDIUM)
The schema generator is 30 lines and writes five files. It has no check mode, no comparison against
what is committed, and no entry in the guard registry. Since the dialect grammar lives in a description
string, editing that string leaves the committed schema serving the old grammar to every editor and
external consumer until someone reruns the build.

**FEA-04 — The formal artifacts have described a superseded design since 2026-02-10** (MEDIUM)
`grammar/activity.ebnf` at 129 lines and `constraints/activity.als` at 279 lines are both stamped 3.0.0
and dated 2026-02-10. Both are complete, internally coherent specifications of a design carrying
`decisions:`, `flows:` and `skill:` bindings that the current schema does not have. Nothing in the
guard registry references either directory, no test parses the grammar, and no constraint run is wired
to anything. This is the strongest available evidence about the next pair of artifacts: whatever they
say on the day they are written, nothing will notice when they stop being true.

**FEA-05 — Ten of fifteen predicate rules live where they cannot fail a build** (MEDIUM)
One rule is held in the type system: a graph edge is a string and so carries no predicate. Four are
held in guard scripts. Seven are held in prose descriptions or code comments — the operator set,
precedence, truthiness semantics, the bare-word literal rule, fail-closed evaluation, the checkpoint
dismissal caveat, and the legacy label on the tree. Three are held nowhere: exit-position validity,
validate-sense `target` validity, and numeric coercion agreement. Every proposal so far moves rules
between these four homes and none reduces the count.

**Most important insight:** a rule's home decides whether it survives, and this codebase's default home
for a new rule is prose.

## Cross-Cutting Patterns

**A construct is absorbed at the enforcer's current expressiveness, and the excess migrates**
- **Affected dimensions:** Consistency, Expressiveness, Architecture
- **Evidence:** Exit predicates were absorbed with the string dialect only and no presence form, across
  54 sites. Graph edges were absorbed with no predicate vocabulary at all, across 192 edges. Intent that
  did not fit was not deleted — it moved to the one field the schema does not constrain, where 37
  predicates now sit and four parse under no declared grammar. The residue moves; it does not shrink.

**Soundness resting on an absence transfers as a form without its precondition**
- **Affected dimensions:** Expressiveness, Architecture, Feasibility
- **Evidence:** Four sugars in the corpus are sound only because of something that does not exist, and
  in no case is that fact held in a type. The variable guard's tree-only walk is sound only while the
  string dialect has no presence form — which is precisely what a shorthand would add. Bare technique
  references are sound only while op names stay unique.

**Failing closed is safe at evaluation and unsafe at analysis**
- **Affected dimensions:** Consistency, Architecture, Feasibility
- **Evidence:** An unparseable gate returns false and skips its step, which is safe. The same
  unparseable expression returns an empty read set, shrinking the activity's declared variable contract
  to nothing at that position. The guard that would catch the malformed expression first reports "OK"
  on invalid exit predicates. An empty gate is explicitly skipped by the guard and silently disables its
  step.

**One intent, two spellings, opposite outcomes**
- **Affected dimensions:** Consistency, Architecture
- **Evidence:** Five of thirteen probe predicates written both ways disagree on numeric coercion. A
  negative gate spelled `notExists` is answered and eagerly bundled while `x != true` is not, across 54
  gates. A decimal comparison is expressible as a tree and unparseable as a string. Bare truthiness and
  `exists` disagree on `false`, `0` and `""`.

**The authoritative statement and the published one diverge with nothing to notice**
- **Affected dimensions:** Architecture, Feasibility
- **Evidence:** The field description says the server never evaluates gates, and the delivery path
  evaluates both dialects. The published workflow schema rejects a live definition file that 16 corpus
  references point at it for. The two formal artifacts have described an abandoned design for six
  months. No drift check exists and none is registered.

## Corrections and Recommendations

### Immediate

- Draft the specification against `origin/main`. The checked-out branch is 42 commits behind and lacks
  `ExitSchema`, `variable.schema.ts` and the workflow `graph` construct (CON-01, CON-02, CON-03,
  CON-04, CON-10).
- Restate the gate-evaluation contract: the server evaluates gates only to decide delivery, never to
  drive control flow. Record alongside it that a dialect change is a server-side change (ARC-01).
- Correct the `when-expression` guard's registry claim to the position it actually covers, until
  checking moves to the parse boundary (FEA-01).
- Extract one shared numeric coercion used by both evaluators, and land it before any predicate is
  rewritten in either direction (CON-05 / ARC-02).
- Scope the condition-tree migration to the 19 elective single-leaf blocks. Leave the 78 forced blocks
  untouched and hold the 9 presence-locked blocks until the guard question is settled (EXP-06).

### Short-term

- Specify the postfix presence form and the emptiness form, and extend `check-variable-model.ts` to
  walk the string dialect in the same commit. Treat the guard extension as a precondition of the
  syntax (EXP-10, EXP-03, CON-06 / EXP-02).
- Reserve `undefined` as a word that fails to parse, and apply the bag-name grammar in the tokenizer.
  Land both with the presence production (CON-19, ARC-17).
- Route `!=` comparisons and `not` subtrees into the presence set, matching the tree collector. This
  converts 54 gates from unanswered to answered (CON-14 / CON-15 / ARC-05).
- Split the action schema into a discriminated union on the verb, give each sense its own typed and
  described key, and apply strict object parsing (CON-09 / EXP-05, CON-18, ARC-08).
- Carry an explicit dismissibility marker on a checkpoint, so the capability survives a change of
  syntax, and drop the legacy label from the construct that is not legacy (CON-07 / EXP-07).
- Add an explicit variable-reference form to the right-hand side of a comparison in both dialects, and
  specify quoting so literals and references are separable at parse time (EXP-09).
- Add a regeneration guard that fails on any diff and register it. Extended to cover `grammar/` and
  `constraints/`, one guard subsumes schema drift, formal-artifact staleness, and parser-versus-
  specification divergence (FEA-03, FEA-04).
- Constrain `when` to a non-empty string at the schema, admit decimal literals in the tokenizer, parse
  once at load, extract one path resolver, define one shared identifier constant, carry the absent path
  on an unbound verdict, and delete the unreachable branch (ARC-15, ARC-14, ARC-11, ARC-16, ARC-18,
  ARC-13, ARC-12).
- Return a discriminated result from the path extractor so an unparseable expression is reported as a
  finding rather than as an absence of reads (ARC-06).
- Publish a definition-file schema distinct from the assembled-object schema, and state which of the two
  each formal artifact describes (ARC-03).

### Structural

- Add no brevity sugar to the boolean case. Treat the corpus's 272-to-9 verbosity as the assertion it
  is (EXP-04).
- Specify the workflow tier's edge-predicate absence as a constraint. Make `constraints/workflow.als`
  the primary workflow-tier deliverable and write each load-bearing absence into it as an explicit
  fact (EXP-01, EXP-11).
- Specify the four powers — checkpoint dismissal, exit routing, step gating, guarding an action — and
  let the surface follow, rather than specifying one surface and discovering the powers. Treat
  agent-side evaluation as fixed (ARC-04).
- Adopt as the acceptance test for the settled grammar: for every rule it states, name the artifact
  that fails when it is violated. Reject any rule whose only home is a description string (FEA-05,
  ARC-07).
- Make the grammar file the source and generate the parser and the schema descriptions from it, so the
  reference evaluator and the specification cannot disagree (ARC-07, FEA-04).
- Specify separate and-chain and or-chain productions, so the parenthesization rule holds by
  construction rather than by where a walker looks (CON-12 / FEA-02).
- Cover the loader-level sugars in the grammar for the authored surface. They are part of the concrete
  syntax whether or not a schema can see them (ARC-10).
- Elide no rename-only technique binding. Address the 2 identity passthroughs with a guard, which is
  the right instrument for a redundancy (EXP-08).
- State the bare-reference resolution order as a rule the specification carries, and guard ambiguous
  resolution so the precondition holds by check rather than by practice (ARC-09).
- Assert the positional availability table in both constraint models, including that a graph edge
  admits no expression (CON-20).

## Artifact Conformance

Three conformance exceptions are carried forward rather than corrected.

- **This report exceeds its template's line budget**, which is written for roughly twelve findings.
  Forty-seven are reported. Condensing to the budget would drop findings, so the overage stands.
- **Both supporting findings documents record the same overage** for the same reason, at 20 and 34
  findings. Their records are at `consistency/RUN-MANIFEST.json` and `dimensions/RUN-MANIFEST.json`.
- **The run manifest schema has no field for this.** Neither manifest can record a conformance verdict,
  so a consumer reading a manifest alone sees a clean `complete` for a run whose report overran its
  budget. Correcting this is a schema change outside the scope of any single run.

## Traceability

Full finding detail, including reachability, blast radius and per-finding evidence, is held in the
source documents.

| Consolidated ID | Source |
|---|---|
| CON-01 to CON-04, CON-08, CON-10, CON-11, CON-13, CON-16 to CON-20 | [consistency/DEFINITIVE-FINDINGS.md](consistency/DEFINITIVE-FINDINGS.md) |
| CON-05 / ARC-02, CON-06 / EXP-02, CON-07 / EXP-07, CON-09 / EXP-05, CON-12 / FEA-02, CON-14 / CON-15 / ARC-05 | [consistency/DEFINITIVE-FINDINGS.md](consistency/DEFINITIVE-FINDINGS.md) and [dimensions/DEFINITIVE-FINDINGS.md](dimensions/DEFINITIVE-FINDINGS.md) |
| EXP-01, EXP-03, EXP-04, EXP-06, EXP-08 to EXP-11 | [dimensions/DEFINITIVE-FINDINGS.md](dimensions/DEFINITIVE-FINDINGS.md) |
| ARC-01, ARC-03, ARC-04, ARC-06 to ARC-18 | [dimensions/DEFINITIVE-FINDINGS.md](dimensions/DEFINITIVE-FINDINGS.md) |
| FEA-01, FEA-03, FEA-04, FEA-05 | [dimensions/DEFINITIVE-FINDINGS.md](dimensions/DEFINITIVE-FINDINGS.md) |
