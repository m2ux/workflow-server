---
target: /home/mike1/projects/dev/workflow-server
analysed_region: "workflows/**/*.yaml at three corpus revisions (5f17da01 pinned, 7e5f5eae served, fbd6f53b tip), src/schema/, src/utils/, src/loaders/, tests/e2e/ at origin/main (b061faee)"
analysis_date: 2026-08-25
lens: "L12 synthesis — reconciliation of structural and adversarial passes"
analysis_unit: "api-surface (risk: high)"
analysis_focus: consistency of the parallel predicate grammars in the activity/workflow definition language
pipeline_mode: full-prism
synthesises:
  - consistency/01-structural-analysis.md
  - consistency/02-adversarial-analysis.md
---

# L12 Synthesis — The Definitive Reading

## How this pass adjudicated

Every contested claim was re-executed against `origin/main` (`b061faee`), not re-read. Where the two
passes disagreed on a fact, the disagreement was settled by running the code. Where they agreed, the
agreement was re-measured, because both passes measured the same corpus commit and a shared baseline
is a shared blind spot.

Three things changed between the adversarial pass and this one, and all three matter:

| | Structural pass | Adversarial pass | This pass |
|---|---|---|---|
| Superproject HEAD | `80e4d876` `refactor/lean-test-suite` | same | `21ce0af6`, same branch, 42 behind `origin/main` |
| Corpus working tree | `7e5f5eae` | `7e5f5eae` | **`fbd6f53b`** — 4 commits later |
| Corpus revisions measured | 1 | 2 | **3** (pinned `5f17da01`, served `7e5f5eae`, tip `fbd6f53b`) |

The adversarial pass's baseline correction **verifies**:

```
git merge-base --is-ancestor 1a47556a origin/main   -> YES
git merge-base --is-ancestor 1a47556a HEAD          -> NO
1a47556a  "An activity names its outcomes; the workflow names their destinations"

git ls-tree HEAD workflows        -> 7f37a2bd    (the structural pass's pin)
git ls-tree origin/main workflows -> 5f17da01    (the adversarial pass's pin)
```

The structural pass measured a superseded branch and attributed the result to "the system". That is
established, and this pass does not relitigate it. What this pass adds is that the adversarial pass,
having corrected the baseline, then drew conclusions from it that its own evidence does not support —
and that both passes missed the workflow half of the language entirely.

### A methodological correction that invalidates a shared measurement

Both passes measured `parseWhen` as a **throwing** function ("ERROR — trailing input at token 3",
"0 of 281 fail parseWhen"). On `origin/main` it does not throw:

```ts
// src/schema/when-expression.ts:249
export function parseWhen(expr: string): ParseWhenResult   // { ok: true, ast } | { ok: false, error }
```

`gateAnswer` reads `if (!parsed.ok)`. Every `parseWhen` result in both prior passes came from the
branch's throwing API. Re-measured against main's result-object API, the corpus figures survive
(0 of 281 fail), but the adversarial pass's U7 — the claim that `exists` is *inexpressible by
construction* — was built on a probe that cannot distinguish "rejected" from "accepted", and it
reverses under correct measurement. That is adjudicated in full below.

### Census: stable across six commits of corpus drift

Every census figure both passes agreed on reproduces **exactly**, and reproduces identically at all
three corpus revisions — including the tip that is six commits past the pin:

```
                              pin 5f17da01   served 7e5f5eae   tip fbd6f53b
activity files                        122            122            122
ACCEPTED by origin/main schema         122            122            122
REJECTED                                 0              0              0
when: strings                          281            281            281
condition: trees                       108            108            108   (+1 in a non-activity file = 109)
actions[].target                       122            122            122   (22 predicate-shaped)
actions[].condition                     11             11             11
variables.reads (all bare strings)     618            618            618
variables.writes (all objects)         525            525            525
exits[] entries / files            163 / 93       163 / 93       163 / 93
exits[].when                            54             54             54
checkpoints / with condition       113 / 67       113 / 67       113 / 67
checkpoint options / effect.exit   266 / 34       266 / 34       266 / 34
```

The `109` both passes reported is 108 conditions in activity files plus one in a checkpoint-fragment
file; the reconciliation is arithmetic, not a discrepancy.

**This single table settles the structural pass's headline and narrows the adversarial pass's.**
122/122 accept, at every pointer. And six commits of corpus movement produced a census delta of
exactly zero — no new construct, no new spelling, no new dialect.

---

## REFINED CONSERVATION LAW

### Why the original was incomplete

The structural pass proposed the **Enforcement–Expression Conservation Law**: across the
server/agent boundary, enforceability and expressiveness are conserved; moving a construct toward
enforcement moves its meaning toward the unvalidated channel. It then declared its own law falsified
by a ledger of nine unmatched producer classes and five clearers with no producers.

The adversarial pass rejected both the law and its falsification, on the grounds that `b061faee`
moved `exits`, `effect.exit`, `immediate` and the variable contract *onto* the enforcement side while
moving nothing off it: *"Governed surface increased. Nothing was traded away. A conservation law with
a counter-example in the deployed artifact is an implementation choice described as physics."*

Both readings are wrong, and they are wrong in the same place: **neither asked what happened to the
expressiveness that did not fit through the absorption.**

Measured on `origin/main` and the tip corpus, this is what absorption did to each construct's
expressive range:

| Construct | Enforcement status | Predicate vocabulary it admits | Sites |
|---|---|---|---|
| `graph` edges | **Enforced** — unbound exit fails the load (`workflow-loader.ts:577`) | **none.** 192 edges, all bare destination strings | 192 |
| `exits[].when` | **Enforced** — `ExitSchema` `.strict()`, `when: z.string()` | `when` **only**. 0 exits carry a `condition` tree | 54 of 163 |
| step `when` / `condition` | Enforced shape, agent-evaluated, walker-executed | both dialects, and-combined | 281 / 108 |
| checkpoint `condition` | Enforced shape; **presence is a capability switch** | tree only — `when` cannot carry dismissibility | 67 of 113 |
| `actions[].target` | **Unenforced** — `z.string().optional()`, no `.describe()`, `ActionSchema` not `.strict()` | **undeclared**; holds forms no declared grammar can express | 38 validate / 84 set |

The pattern is exact. Every construct that moved onto the enforcement side was absorbed **at the
expressiveness the enforcer already had**, and never above it. `graph` gained enforcement and admits
no predicate at all. `exits[]` gained enforcement and admits the string dialect only — the tree
dialect's `exists`/`notExists`, seventeen uses elsewhere in the corpus, cannot be written on an exit.

The expressiveness that did not fit was not deleted. It went somewhere. Here is where:

```
=== validate-targets that origin/main `when` CANNOT parse ===
  [validate] "target_path exists"                     error=trailing input at token 1
  [validate] "summary_budget_overruns == []"          error=unexpected character '[' at 27
  [validate] "summary_completeness_findings == []"    error=unexpected character '[' at 33
  [validate] "broken_artifact_links == []"            error=unexpected character '[' at 25
```

Four sites, in the one field the schema does not constrain. They are **not arbitrary**. They are a
presence test and three emptiness tests — precisely, and only, the two forms that neither declared
grammar can express. Of the 38 `validate` targets, **34 already parse as valid `when` expressions**.
The undeclared dialect is not a third language. It is the enforced language plus exactly two missing
productions.

### The corrected law

> ### The Expressive Residue Law
>
> **Absorbing a construct into the enforced core fixes its grammar at the enforcer's current
> expressiveness. Authoring intent exceeding that expressiveness is not eliminated by the absorption —
> it migrates to the nearest field the schema does not constrain. The residue is conserved: it moves,
> it does not shrink, and it goes on accumulating until the enforced grammar grows the forms the
> residue is made of.**

This holds where the structural pass's law failed and where the adversarial pass's refutation
overshot.

**Against the structural pass.** Its ledger counted "unenforced surface accumulating without bound"
and read nine unmatched producer classes as permanent. Five of those nine were absorbed one commit
later. They were not unbounded accumulation; they were constructs in flight. The conserved quantity
is not the authored predicate site — sites are absorbed wholesale, as `exits` was. The conserved
quantity is the **inexpressible fraction**.

**Against the adversarial pass.** "Governed surface increased, nothing was traded away" is true of
site counts and false of expressiveness. `b061faee` bought the enforcement of 163 exits by giving
exits a vocabulary strictly narrower than the one steps have, and bought the enforcement of 192
routing edges by giving them no vocabulary at all. Nothing was *deleted*, which is what the
adversarial pass checked; the capability was *never granted*, which is what it did not. The trade is
visible only in the residue, and the residue is in the field neither pass instrumented.

**Falsifiable prediction, cheap to test.** Add a presence form and an emptiness form to the `when`
dialect. The residue in `actions[].target` goes from 4 to 0 — every one of the 38 validate targets
becomes a parseable expression in the declared grammar. If any validate target still fails to parse
after those two productions land, the law is wrong about what the residue is made of.

**Second prediction, already measurable.** Because the residue is conserved rather than destroyed, the
same two forms must be visible under pressure elsewhere. They are:

```
purely-negative when gates (every clause != or !):  54
  evaluateWhenExpression on an empty bag says TRUE: 54
  gateAnswer says unanswered for:                   54
  same intent written as a tree {notExists}:        {"answer": true}  <- ANSWERED
```

Fifty-four gates spell "not in that mode" as `x != true` because the `when` dialect has no presence
form, and pay for the workaround at delivery. The missing production and the delivery penalty are the
same fact measured twice.

---

## REFINED META-LAW

### Why the original was incomplete

The structural pass proposed **The Pin Sets the Grammar**: *"The definition language's operative
specification is not `activity.schema.json` — it is the gitlink."* The adversarial pass narrowed it
to a guarded two-commit gap, noting `.github/actions/workflows-corpus/action.yml:38-52` fails a PR on
gitlink drift.

This pass can settle it, because it measured three pointers instead of one, and because the gap has
since grown:

```
image / origin/main pin      workflows -> 5f17da01
container bind mount         /home/mike1/.local/share/workflow-server/workflows @ 7e5f5eae   (rw=true)
superproject working tree    workflows -> fbd6f53b

5f17da01..7e5f5eae = 2 commits      5f17da01..fbd6f53b = 6 commits
```

The gap the adversarial pass measured as "2 commits, both of which validate" is now **6 commits**, and
the running container serves a corpus **two commits ahead of what its own image pins**, from a mount
the gitlink guard cannot see, because that guard compares gitlink to gitlink.

On the structural pass's framing this is the meta-law vindicated and worsening: three pointers, no
single authority, drift tripled in a day. **The measurement refutes it.** All six of those commits,
and all three pointers, validate identically:

```
ACCEPTED by origin/main ActivitySchema:  pin 122/122   served 122/122   tip 122/122
census delta across all three:           zero, every construct
```

Six commits of unpinned corpus movement changed the grammar in force by nothing at all. The pointer
selects *which text is read*. It has never selected *which grammar is enforced*, because validity is
decided by a module that ships with the server binary and is identical for all three.

### The corrected meta-law

> ### The Schema Sets the Grammar; the Pin Only Sets the Text
>
> **A grammar decision binds exactly when it lands in the server's schema module. A corpus pointer
> bump changes what gets validated, never what validity means. Consistency work recorded in
> `workflows/` — as prose, a README, a technique rule, an authoring convention — is a description of
> the grammar; the same decision recorded in `src/schema/` is the grammar.**

Note what this preserves and what it inverts. The structural pass's **advice** was: *"A grammar
decision recorded only in `workflows/` is a description; the same decision recorded in
`ActivitySchema` in the same commit as its corpus uses is a rule."* That advice is correct and is the
single most important operational instruction either prior pass produced. Its **reasoning** — that the
gitlink is the operative specification — is false, and this pass falsified it by measurement.

The correction matters practically, because the two readings prescribe opposite things. Under "the pin
sets the grammar", the specification this run produces is hostage to release coordination and cannot
bind until pointers are unified — the structural pass says so explicitly, predicting that *"whichever
grammar the next gitlink bump happens to carry becomes the operative one regardless of what the
specification says."* Under the corrected law, the specification binds the moment it lands in
`src/schema/`, and the six-commit pointer gap is irrelevant to it. **The commissioning run is not
blocked on release hygiene.** It is blocked on nothing.

The structural pass's meta-law also asserted an "empty intersection" between the work that fixes the
visible failure and the work that fixes the actual inconsistency. The adversarial pass refuted this
with `b061faee`. Adjudicated: the refutation stands, and the intersection is non-empty in the
direction that matters for this run — the commit that took the rejection count to zero is the same
commit that gave `exits[]` a `when` field, which is the commit that created the residue this
specification must clear. Fixing the visible failure *authored* the actual inconsistency.

---

## STRUCTURAL vs FIXABLE — DEFINITIVE

Classification: **fixed** = resolved in `origin/main`; **fixable** = the corrected conservation law
permits resolution; **structural** = the law predicts recurrence; **non-issue** = no reachable path.
Every row re-executed against `origin/main` + corpus tip `fbd6f53b`.

| # | Location | Verdict | Class | Evidence from re-execution |
|---|---|---|---|---|
| 1 | `activity.schema.ts:274,289` | `variables` and `exits` are declared | **fixed** | 122/122 accept at all three corpus revisions. Adversarial correct; structural measured a superseded branch |
| 2 | `getValidTransitions` fail-open | symbol does not exist | **fixed** | `grep -rn getValidTransitions src/` → 0 files on main |
| 3 | `exits` unread; `effect.exit` stripped | both false on main | **fixed** | `exits` = 22 occurrences in `src/`; `effect` is `.strict()` at `activity.schema.ts:52` and declares `exit` |
| 4 | `conditionToString` lowering | symbol deleted | **non-issue** | 0 occurrences in `src/` on main. Retain only as *evidence* the dialects were never mutually expressible |
| 5 | `Number()` vs `toNumber()` | **upheld and widened** | **fixable** | **5 of 13 probes diverge** on main (structural said 2 of 7; adversarial 4 of 11). New case `{n:[0]}`: `when` true, tree false. `gateAnswer:196` and-combines, so runtime-low / **migration-high** |
| 6 | `exists`/`notExists` absent from `when` | **upheld as a defect, RECLASSIFIED** | **fixable — was structural in both passes** | See below. This is the central re-classification of the synthesis |
| 7 | `condition` presence = capability switch | upheld | **structural** | 67 of 113 checkpoints. Schema text identical on main. Syntax does not encode the capability, so no purely syntactic unification preserves it |
| 8 | unparseable `when` fails closed silently | latent | **fixable (latent)** | 0 of 281 fail under main's `parseWhen(...).ok`. Guard holds; no producer |
| 9 | `actions[].target` undeclared dialect | **upheld and sharpened** | **fixable** | Not a third dialect: a field whose *type depends on the sibling `action` verb*. `set` → 84 lvalues; `validate` → 38 predicates, **34 already `when`-parseable** |
| 10 | manifest "unknown activity" warnings | consequence of #1 | **fixed** | |
| 11 | CI validates gitlink, not tip | **narrowed further** | **fixable, benign** | Gap grew 2 → 6 commits; census delta zero; tip validates 122/122. Real mechanism, no grammar consequence |
| 12 | `assertWhenAuthoring` has no evaluator counterpart | upheld | **fixable** | On main: `a && b || c` evaluates `true`, authoring rejects it. 0 corpus violations — guard-only enforcement |
| 13 | `evalAst` `cmp` fall-through | no reachable door | **non-issue** | `evalAst` not exported on main; exports are `assertWhenAuthoring, evaluateWhenExpression, expressionPaths, parseWhen` |
| 14 | `gate-liveness.ts` self-contradiction | **confirmed on main** | **fixable** | `unboundPositiveReads('x != true')` → `[]` (absence answers it); `gateAnswer(when:'x != true')` → `{"reason":"unbound"}`. Both live: walker imports the first at `:490`, delivery the second |
| 15 | 54 negative gates never eagerly bundled | **confirmed on main** | **fixable** | 54 gates / 54 evaluate true / 54 unanswered. Mechanism precisely located — see below |
| 16 | `current_unit` lossy projection | **confirmed live in this session** | **fixable** | Read from `inspect_session` this pass: `{lens_name, risk, role, target}`, no `pipeline_mode`. This activity's own gate `current_unit.pipeline_mode == 'full-prism'` is false against its own bag |
| 17 | `CheckpointOptionSchema` outer not strict | **confirmed on main** | **fixable** | `activity.schema.ts:45-53` — inner `effect` is `.strict()`, the enclosing option object is not |
| **18** | `ActionSchema` (`activity.schema.ts:26-33`) | **new** | **fixable** | The object is **not `.strict()`** on main, and `target: z.string().optional()` is the only field in the schema carrying no `.describe()`. Unknown action keys strip silently |
| **19** | `undefined` in the `when` dialect | **new** | **fixable** | `parseWhen('x == undefined')` → `ok:true, {kind:'cmp', op:'==', value:"undefined"}`. The word parses as a **string literal**, so the expression silently means `x == "undefined"`. No guard catches it; it is exactly what an author reaching for a presence test writes |
| **20** | Positional dialect availability | **new — the consistency defect proper** | **structural until the grammar unifies** | One predicate intent, five different availabilities by position: steps (both), exits (`when` only), checkpoints (tree needed for dismissal), graph edges (none), `actions[].target` (undeclared) |

### The re-classification: bug #6 is fixable, not structural

Both passes called this structural, by different arguments, and both arguments fail.

The **structural pass** argued no total lowering exists in either direction, so unification is a
language extension rather than a translation. Correct, and it is the reason to extend the language —
not a reason it cannot be extended. "Requires a new production" is the definition of fixable for a
grammar.

The **adversarial pass** went further (U7) and argued *inexpressibility by construction*: *"the `when`
dialect cannot name the value that distinguishes 'absent' from 'null', so `exists` is inexpressible in
it by construction, not by omission."* Re-executed on `origin/main`:

```
parseWhen("x exists")        -> ok=false  "trailing input at token 1"
parseWhen("x != undefined")  -> ok=true   {kind:'cmp', path:'x', op:'!=', value:"undefined"}
evaluateWhenExpression("x != undefined", {})  -> true
```

The dialect *does* accept `x != undefined` — by parsing `undefined` as the **string** `"undefined"`,
which happens to return `true` for an absent variable for entirely the wrong reason. The adversarial
pass reached the right verdict on a probe that could not tell acceptance from rejection (it used the
branch's throwing API against main's result-object API). "By construction" is not established. What is
established is worse and more useful: the dialect **silently mis-parses** the expression an author
reaches for, which is bug #19 above.

A grammar missing a production is fixable by adding the production. The corpus has already written the
production it wants, in the only field that would accept it: `target_path exists`.

### The mechanism behind #14 and #15, located exactly

The delivery planner recognises a semantic category the string dialect cannot express. From
`src/utils/gate-liveness.ts` on `origin/main`:

- `collectWhenPaths` (lines 10-27) folds `truthy` and `cmp` into one bucket: `case 'truthy': case 'cmp': out.add(ast.path)` — **every** comparison path, whatever the operator.
- `collectConditionPaths` (lines 29-50) splits them: `exists`/`notExists` go to `presence`, everything else to `value`. Its comment states the rule — *"`exists` / `notExists` answer on a missing variable; the rest need a value."*
- The unbound check (lines 185-190) iterates `valuePaths` **only**. Presence paths are never checked.

So the carve-out is not "tree beats string", as the adversarial pass framed it. Measured:

```
gateAnswer(cond  notExists is_review_mode, {})  -> {"answer": true}     ANSWERED
gateAnswer(cond  is_review_mode != true,   {})  -> {"reason":"unbound"} UNANSWERED
gateAnswer(when  "is_review_mode != true", {})  -> {"reason":"unbound"} UNANSWERED
```

The tree's `!=` is penalised identically to `when`'s. **The carve-out is for presence operators, and
`when` has none** — so 100% of the string dialect's vocabulary sits on the unanswerable side for an
absent variable, while the tree has an escape hatch. That is why 54 of 54 purely-negative gates go
unanswered, and it is a grammar deficiency expressing itself as a delivery cost.

Meanwhile `unboundPositiveReads`, 60 lines up the same file and imported by the walker at
`walker.ts:490`, documents and implements the opposite rule (`if (ast.op !== '!=') paths.add(...)`).
Two functions, one file, contradictory readings of the corpus's most common idiom — the walker holds
one, delivery holds the other.

### What the walker settles

The adversarial pass's O2 is confirmed on `origin/main`. `tests/e2e/walker.ts` is a mechanical
executor of both grammars:

```
:493  if (step.condition && !evaluateCondition(step.condition, variables)) continue;
:494  if (step.when && !evaluateWhen(step.when, variables)) continue;
:264  if (evaluateWhenExpression(e.when, variables)) return at(e.id);     // exits[].when
:300  if (evaluateWhenExpression(e.when, variables)) return to;           // exit -> graph destination
:693  if (cp.condition && !evaluateCondition(cp.condition, variables)) continue;
```

The structural pass's Structural Invariant — *"validation is advisory by construction, in every
variant considered"* — is refuted: line 264 is a mechanical evaluator selecting an exit, and the walk
is snapshot-ratcheted in CI. **The enforcement point exists, and a shorthand the walker can evaluate
is an enforced shorthand.** This is the single most important correction the adversarial pass made,
and it survives intact.

---

## DEEPEST FINDING

### What neither pass could see alone

The structural pass measured a tree where the **corpus led the schema**: activities declared
`variables` and `exits`, the schema knew neither, the guard was red, and 289 sites of predicate-
bearing surface had no consumer. It concluded the language accumulates unenforced surface without
bound and has no authority to be consistent at.

The adversarial pass measured a tree where the **schema had caught up**: `variables` and `exits`
declared, `exits` load-validated at 22 sites, the dead `transitions`/`decisions` clearers deleted,
122/122 accepting. It concluded the law was an implementation choice described as physics, and that
governed surface simply increased.

Both are accurate. They are **the same migration observed at two phases**, and each pass mistook its
phase for the system's nature. Composed, with the third measurement this pass adds, the phases form a
cycle:

1. **Authoring outruns the schema.** The corpus invents a construct in the field that will take it.
   Guard goes red. (Structural pass's tree: `variables`, `exits`.)
2. **The schema absorbs it — at its own expressiveness.** Guard goes green, sites become enforced,
   and the absorbed construct is granted strictly less vocabulary than the intent it captured.
   (Adversarial pass's tree: `exits[]` gets `when` only; `graph` gets no predicate at all.)
3. **The excluded expressiveness re-accumulates in the nearest unconstrained field.** (This pass's
   measurement: `actions[].target`, `z.string()`, non-strict parent, no description — now holding one
   `exists` and three `== []`.)

The property visible only from all three:

> **The undeclared field is not an oversight in the design. It is load-bearing — the pressure-relief
> valve that lets authoring continue while the schema catches up. And because it relieves precisely the
> pressure the enforced grammar cannot hold, its contents are a specification oracle: the residue in
> `actions[].target` is a measured, ranked list of exactly which productions the declared grammar is
> missing.**

The structural pass saw the valve and called it a leak — bug #9, "an undeclared third dialect", a
thing to be closed. The adversarial pass saw the schema catch up and called the leak fixed, listing
bug #9 as "the natural target of this run" without asking why *those particular* four strings were in
it. Only both together, plus the residue measurement, show the valve refilling with the two forms the
enforced grammar lacks — which is what converts it from a defect into an instrument.

This is the finding that justifies three passes, and it changes the method of the commissioning run.
**The target shorthand should not be designed from taste, from precedent, or from what looks tidy in
EBNF. It should be read off the residue.** The corpus has already written its own requirements
specification, four sites long, in the one field that would accept it.

### The consequence: the specification is small, and the window is now

Composed across all three measurements, the entire predicate vocabulary the corpus actually uses is:

```
when dialect (281 gates):     ==  265   !=  147   >  14   <  2
                              bare truthiness 6   ! 3
                              && in 95 gates   || in 7   parens in 4   dotted paths 22
                              literals: boolean 272, string 129, number 25, null 2
condition trees (109):        simple 161   and 31   or 3   not 0
                              ==  81    !=  56    >  7    exists 10    notExists 7
                              max nesting depth: 2
residue (4):                  exists 1    == []  3
```

Neither `>=` nor `<=` appears in the corpus. No `not` node appears in any tree. Nothing nests deeper
than two levels. This is a very small language, and the union of everything the corpus needs is the
`when` grammar plus **two productions**.

The window is now for a reason the cycle makes precise: the residue is currently 4 sites. It was
smaller before `exits` was absorbed and will be larger after the next absorption. Closing it costs two
grammar productions today; the same closure after the next cycle costs those two plus whatever the
next absorption excludes.

---

## What the specification must contain

The commissioning run settles a target grammar precise enough to generate `grammar/activity.ebnf`,
`constraints/activity.als`, `grammar/workflow.ebnf` and `constraints/workflow.als`. This pass does not
write those four files. What follows is what the evidence obliges them to say.

### 1. One expression language, two missing productions

The target is the `when` dialect as it stands on `origin/main`, plus a presence form and an emptiness
form. Productions, stated so the EBNF can be generated directly:

```ebnf
expression  = orExpr ;
orExpr      = andExpr { "||" andExpr } ;
andExpr     = unary { "&&" unary } ;
unary       = "!" unary | primary ;
primary     = comparison | presence | emptiness | path | "(" orExpr ")" ;
comparison  = path ( "==" | "!=" | ">" | "<" | ">=" | "<=" ) literal ;
presence    = path ( "exists" | "notExists" ) ;                (* NEW *)
emptiness   = path ( "==" | "!=" ) "[]" ;                      (* NEW *)
path        = ident { "." ident } ;
literal     = "true" | "false" | "null" | string | number ;
```

Two constraints the evidence imposes on those new productions:

- **`presence` is postfix**, matching what the corpus already wrote (`target_path exists`), not
  prefix. The one authored instance settles the syntax question.
- **`undefined` must become a reserved word that fails to parse**, not a bare identifier. Bug #19 is
  live on main and is the trap an author falls into when reaching for `presence`. Adding `presence`
  without reserving `undefined` leaves the trap armed next to its own fix.

### 2. The delivery reading is part of the grammar, not a consequence of it

Bugs #14 and #15 make this non-negotiable. `gateAnswer` must treat the new `presence` production as a
presence path — routed to `presencePaths`, exempt from the unbound check — exactly as
`collectConditionPaths` already routes tree `exists`/`notExists`. Two further obligations follow:

- `collectWhenPaths` must adopt the rule `unboundPositiveReads` already documents and implements
  (`if (ast.op !== '!=')`), resolving the same-file contradiction. This alone converts 54 gates from
  unanswered to answered.
- The specification must state, for every production, whether it is answerable on an absent variable.
  A grammar specified without its delivery reading is, in the adversarial pass's phrase, correct and
  slow — and the measurement puts a number on "slow": 54 gates, each costing a `get_technique` round
  trip per activity open.

### 3. Coercion is chosen once, before any migration

Bug #5, widened to 5 of 13 probes on main. `when` coerces with `Number()` and accepts booleans,
`null`, and any array whose coercion is finite (`[]` → 0, `[0]` → 0, `[2]` → 2); `condition` uses
`toNumber()` and accepts numbers and finite strings only. The corpus bag holds arrays routinely — this
session's own `all_artifact_paths` and `analysis_units` among them. One shared coercion must be chosen
deliberately and land **before** any gate is rewritten, or every rewrite is a silent behaviour change
on non-scalar values.

### 4. Unification is not purely syntactic

Bug #7 stands, unchallenged by either pass and re-verified here: on a checkpoint, the **presence** of
`condition` is what enables `condition_not_met` dismissal, for 67 of 113 checkpoints. The capability
is carried by the field, not by the expression inside it. Any migration that replaces `condition:`
with `when:` on a checkpoint silently removes dismissibility, and nothing in the repo would report it.
The specification must carry an explicit dismissibility marker so the capability survives the syntax
change — this is the one place where the target grammar needs a construct the expression language
cannot supply.

### 5. `actions[].target` resolves by discrimination, and partly by deletion

Not "an undeclared dialect" but a field whose type depends on a sibling key:

```
verb=set       total=84   predicate-shaped=0    (lvalues: variable names)
verb=validate  total=38   predicate-shaped=22   parseWhen-ok=34 of 38
```

`ActionSchema.action` already notes `set` is *"slated for removal at the next workflow-schema major
(#166 B7/B12)"*. Removing `set` leaves `target` with a single reading — an expression — at which point
it types as one, and 34 of its 38 sites already validate. The remaining 4 are closed by the two new
productions. The schema work is a discriminated union on `action`, plus `.strict()` on `ActionSchema`
(bug #18) and a `.describe()` on `target`, which is currently the only undocumented field in the file.

### 6. The workflow level: what both passes missed

Neither prior pass measured `workflow.yaml`, though the commissioning brief names it and two of the
four artifacts to be generated are `workflow.ebnf` and `workflow.als`. Measured across 19 workflow
files at the corpus tip:

```
files with graph:            17          graph edges: 192
graph edge shapes:           {"string": 192}      — every edge is a bare destination id
graph edges with when:       0           with condition: 0
workflow-level variables:    136 entries, 136 objects, 0 bare strings
workflow.yaml when strings:  11          condition trees: 2
workflow-level when failing parseWhen: 0 of 11
```

Two findings, pulling in opposite directions:

**The graph is the one place the language is already consistent, and it is consistent by containing no
expressions at all.** 192 edges, every one a bare string. The division is clean and worth stating as
the design it is: an activity names its outcomes and may use a predicate to choose among them
(`exits[].when`, 54 uses); the workflow names destinations and never uses a predicate. `workflow.ebnf`
therefore needs **no expression grammar for `graph`** — a constraint the Alloy model should assert
rather than merely permit, because it is the property that lets a borrowed activity sit in two
workflows without editing either.

**Where workflow files do carry predicates, they carry them in the same dialect, correctly.** All 11
workflow-level `when` gates parse; several use dotted paths and parenthesised mixed operators
(`worker_result.result_type == "activity_complete" && (!worker_result.batch_may_continue || !worker_result.next_activity_id)`).
So the expression language is genuinely level-independent already, and the specification should say so
once rather than defining it twice. The two levels differ in *where expressions may appear*, not in
what an expression is.

This yields the positional table the two Alloy models must encode — the definitive statement of bug
#20, and the consistency defect the brief set out to characterise:

| Position | Level | `when` | `condition` tree | Presence forms | Sites |
|---|---|---|---|---|---|
| step gate | activity | yes | yes (and-combined) | tree only | 281 / 108 |
| `exits[].when` | activity | yes | **no** | **neither** | 54 |
| checkpoint | activity | yes | **required for dismissal** | tree only | 113 / 67 |
| `actions[].target` | activity | **undeclared** | sibling `condition`, 11 uses | **residue lives here** | 38 |
| `graph` edge | workflow | **no** | no | no | 192 |

Five positions, five different answers to "which predicate may I write here". That is the
inconsistency, stated positionally rather than as a count of dialects — and it is the form in which
`activity.als` and `workflow.als` can actually assert it.

### 7. The reads/writes asymmetry is justified, and is still the largest shorthand opportunity

The brief names it and neither pass adjudicated it. Measured:

```
reads:   618   shapes {"bare-string": 618}                          — 100% shorthand already
writes:  525   shapes {defaultValue+description+name+type: 302,
                       description+name+type: 217,
                       description+name+required+type: 6}           — 100% longhand
distinct read names 195   distinct write names 339   names appearing on both sides: 155
```

The asymmetry is **deliberate and documented**, in `variable.schema.ts:21-28`: *"A read is a name: the
activity needs the value and does not own it. A write is a full declaration, because the writing
activity is where the variable is owned."* Any proposal to make the two spellings symmetric is
therefore wrong, and the specification should say why, once — a read is a reference, a write is a
declaration, and collapsing them would lose the ownership fact the loader uses to fail a workflow whose
two declarations of one name disagree.

What survives as a genuine opportunity is narrower and larger than "make them symmetric": **217 of 525
writes carry only `{name, type, description}`** — no default, no `required`. Those are declarations
with nothing declared beyond a type, spelled across four lines of YAML. That is 217 sites where a
one-line declaration form would remove three lines each, against a language whose stated concern is
that only `when` is optimised for shorthand. `required` appears 6 times in 525 writes and carries no
server behaviour at all (*"Authoring metadata; the server does not check that the variable is ever
set"*) — a candidate for removal rather than shorthand.

### 8. The specification must land in `src/schema/`

The refined meta-law's operative clause. The grammar productions, the delivery reading, the coercion
choice, the discriminated `ActionSchema` and the positional table bind when they are in the server's
schema module and not before. A version of this specification that lives only in `workflows/` will be
accurate, will be cited, and will not be the grammar.

---

## Verification note

All figures above were produced this pass by executing `origin/main` (`b061faee`) modules against
corpus revisions `5f17da01`, `7e5f5eae` and `fbd6f53b`, via a scratchpad harness. The repository
working tree was left as found: branch `refactor/lean-test-suite` at `21ce0af6`, submodules
unchanged, no checkout performed. The pre-existing `.worktrees/main-current` worktree at `b061faee`
was read but not modified.

One measurement is self-referential and worth recording as such. This activity's only step is gated
`when: current_unit.pipeline_mode == 'full-prism'`. Read from the live session bag this pass,
`current_unit` is `{lens_name, risk, role, target}` — the projection drops `pipeline_mode`, which
`analysis_units[0]` carries. The gate is false against its own bag; the step ran because no mechanical
evaluator gates worker execution. Bug #16 is confirmed live, in the run that commissioned its own
diagnosis.
