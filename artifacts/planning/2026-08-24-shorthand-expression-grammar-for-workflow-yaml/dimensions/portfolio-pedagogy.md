# Portfolio lens — pedagogy (06) · Expressiveness

**Target:** `workflows/**/*.yaml` (disk), `src/schema/`, `src/utils/gate-liveness.ts`, `scripts/check-*.ts`, `grammar/`, `constraints/` (read from `origin/main` `b061faee`)
**Question the lens asks:** every explicit choice the corpus makes about how a predicate is written, the alternative each invisibly rejects, and which of those choices a person who internalized the activity tier would unconsciously resurrect when writing the workflow tier.

The concrete "new artifact by someone who internalized this one's patterns" is not hypothetical here. `grammar/workflow.ebnf` and `constraints/workflow.als` are listed as TBD and do not exist. They will be written by whoever has just finished reading the activity tier. That is exactly the transfer this lens is built to intercept.

---

## Step 1 — The explicit choices, and the alternative each rejects

Each row is a decision the corpus visibly makes. The rejected column is what the decision silently forecloses.

| # | Explicit choice | Where it is made | Alternative invisibly rejected |
|---|---|---|---|
| C1 | A gate is a **string in a C-like dialect** | `stepCommonFields.when: z.string()`, activity.schema.ts:74 | A gate is structured data the schema can type |
| C2 | A gate is also a **structured tree** | `condition: ConditionSchema`, activity.schema.ts:77 | One spelling per intent |
| C3 | The tree spelling is **declared legacy but retained** | activity.schema.ts:77, "LEGACY: … Prefer the `when` inline expression … except on a checkpoint step" | Retire it, or promote it; the corpus does neither |
| C4 | **The server never evaluates a gate** | activity.schema.ts:75, "Evaluated by the executing agent … the server never evaluates gates" | Server-side evaluation, which would force one evaluator |
| C5 | Predicate **availability varies by position** | six positions, §Step 2 table | One predicate slot, uniformly available |
| C6 | A graph edge is a **bare destination string** | `GraphSchema = z.record(z.record(z.string()))`, workflow.schema.ts:62 | An edge that carries its own predicate |
| C7 | **The activity owns the condition; the workflow owns the destination** | workflow.schema.ts:78, "an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say" | Routing conditions authored at the call site |
| C8 | `actions[].target` is **left unconstrained** | `target: z.string().optional()`, activity.schema.ts:28 — no `.describe()`, emitted to JSON Schema as bare `{"type":"string"}` | Constrain it, or split it per verb |
| C9 | Numeric coercion is **evaluator-local** | `Number()` at when-expression.ts:306 vs `toNumber()` at condition.schema.ts:51 | One shared coercion contract |
| C10 | The authoring rule (mixed `&&`/`\|\|` needs parens) lives in **an imperative script** | `assertWhenAuthoring`, when-expression.ts:344; invoked from scripts/check-when-expression.ts | Encode it in the grammar, where it is expressible |
| C11 | A bare identifier means **truthiness** | when-expression.ts:241 `return { kind: 'truthy', path }` | Require an explicit comparison |
| C12 | A bare word on the right of a comparison is **a string literal** | when-expression.ts:236-237, "Bare word on RHS is a string literal" | Treat it as a variable reference |
| C13 | Invalid expressions **fail closed to false** | when-expression.ts:335, `if (!parsed.ok) return false` | Fail loudly at load |
| C14 | Sugar precedent: **bare-string technique binding** | `technique: z.union([z.string(), TechniqueBindingSchema])`, activity.schema.ts:91 | Always-structured binding |
| C15 | Sugar precedent: **implicit same-name variable binding** | variable-binding technique, "Else if the variable bag holds a variable named `I`, bind its value — the implicit same-name bind, which carries zero per-step data" | Always-explicit binding |

C14 and C15 are the two precedents the brief flags as most likely to be copied without their preconditions. They are treated at Step 3.

### The choice that is not a choice

C6 reads like an omission and is not. workflow.schema.ts:78 states the reasoning in the schema itself: an activity is **borrowable**, and borrowability requires that the borrowing workflow have no say over the conditions under which the borrowed activity exits. Put a predicate on an edge and the borrower re-specifies the lender's semantics. The measured corpus is consistent with the stated intent and shows no erosion: **17 graphs, 106 nodes, 192 edges, 0 edges whose value is anything but a bare string.** Every one of the corpus's 390 predicates (281 `when` strings + 109 `condition` trees) sits inside an activity.

This is the single most important input to the workflow-tier artifacts, and it points the opposite way from the obvious reading of "the workflow tier has no predicate language yet."

---

## Step 2 — Availability by position, measured

One predicate intent; six positions; five distinct availability profiles. Counts are from the corpus.

| Position | String dialect | Tree dialect | Corpus count | Enforced by |
|---|---|---|---|---|
| Step gate (`kind`-tagged step) | yes | yes (legacy) | 227 `when` | `stepCommonFields` on all four step kinds |
| `exits[].when` | yes | **no** | 54 | `ExitSchema` (activity.schema.ts:251) declares `when` only |
| Checkpoint `condition` | no (for dismissal) | **yes, exclusively** | 67 | activity.schema.ts:75, "only `condition` … enables condition_not_met dismissal" |
| `actions[].condition` | **no** | yes | 11 | `ActionSchema` (activity.schema.ts:26) declares `condition`, no `when` |
| `actions[].target` (validate sense) | undeclared | undeclared | 38 entries | nothing — `z.string().optional()` |
| Graph edge | **none** | **none** | 192 edges | `GraphSchema`, destination string only |

The 31 `condition` trees found on step kinds *other than* checkpoint — 7 on `kind: loop`, the rest on `kind: action` and `kind: technique` — are positions where `when` is available and the schema says to prefer it. That is legacy residue, not deliberate structure, and it is the population a migration would move.

---

## Step 3 — The transfer: what a workflow-tier author resurrects

Take an author who has just specified the activity tier and turns to `grammar/workflow.ebnf` and `constraints/workflow.als`. Concretely, here is what they produce.

### Resurrection R1 — an edge predicate, because the activity tier taught that gates go where branching happens

Having spent the whole activity tier writing `when` on every branch point, the natural workflow-tier production is:

```ebnf
(* what the transfer produces *)
graph-entry  = activity-id , ":" , { exit-id , ":" , edge } ;
edge         = destination | ( destination , "when" , when-expr ) ;
```

This resurrects the alternative C7 rejected. The failure is **not** a parse error; it is that a borrowed activity's routing becomes re-specifiable by the borrower, and the property workflow.schema.ts:78 exists to protect is gone. Nothing in the activity tier's own EBNF or Alloy records that this property is being protected — the reasoning lives in a Zod `describe()` string and a source comment, neither of which is an input to a grammar generator. **The constraint is transferred as an assumption exactly because it was never written down as a constraint.**

### Resurrection R2 — `z.string()` as the shape of a predicate

C1 is the activity tier's most visible habit: a predicate is a string, and its grammar lives in prose. The generated JSON Schema shows the end state — `activity.schema.json:362-364` is `{"type": "string", "description": "<the entire grammar, 700 characters of prose>"}`. A workflow-tier author copies the shape because the shape is what is visible. The prose grammar is then duplicated, and the two copies drift. There is no regeneration or drift check to catch it: `scripts/generate-schemas.ts` is 30 lines, writes five files, and has no `--check` mode and no comparison against what is committed.

### Resurrection R3 — bare-string sugar without its precondition (C14)

Bare-string technique binding is sound because of a precondition stated in the `binding-carries-only-deviations` rule: the structured form carries **only** what differs from the default, so the bare string is the well-defined "no deviations" case. The sugar is a projection of a total function onto its identity element.

Transferred to a predicate, the same shape gives: "a bare string is the no-deviation case of a structured condition." That is false, and measurably so — the two dialects are **not** in a subset relation in either direction:

- `Condition` has `exists` / `notExists`; `when` has no presence form at all. Corpus use: **17 leaves** (10 `exists`, 7 `notExists`).
- `when` has bare-identifier truthiness (C11); `Condition` has **no truthiness operator**. Its operator enum (condition.schema.ts:3-5) is `==, !=, >, <, >=, <=, exists, notExists`. The closest, `exists`, is not truthiness — measured: for `x = false`, `x = 0`, `x = ""`, `when`'s bare `x` is **false** while `exists` is **true**.

So "the bare string is the simple case of the tree" cannot be made true by adding sugar. Each dialect can express something the other cannot. Any generated grammar built on the subset assumption is wrong at the root, and the wrongness is invisible because both spellings parse.

### Resurrection R4 — implicit same-name binding as disambiguation-by-shape (C15)

The implicit same-name bind is safe because binding resolution is a **closed** lookup: the input id is either in the bag or it is not, and the technique's declared signature bounds the name set.

The corpus already shows this precedent eroding under transfer. Measured over 410 technique input entries: **235 are shaped like a bag name** and are therefore rename-or-literal ambiguous, resolvable only at runtime against the bag, per the disambiguation rule ("a string that matches the bag-name grammar AND resolves in the variable bag is a rename reference … otherwise it is a literal"). 16 of those are identity passthroughs. The shape does not carry the answer; the runtime bag does.

Now the same habit reaches `actions[].target` (C8), and the erosion is total. Measured:

- 248 action entries; 122 carry `target`; 87 distinct values.
- Under `action: set` — 84 entries, 53 distinct — **53 of 53 match the bag-name grammar, and 53 of 53 also parse as a valid `when` expression** (as bare-identifier truthiness, C11).
- Under `action: validate` — 38 entries, 37 distinct — 33 parse as `when`.

The two grammars over the one key do not merely differ; **their value sets overlap completely**. `target: analysis_complete` is a valid variable name and a valid predicate, and nothing in the value distinguishes them. Only the sibling `action:` verb decides. A generated grammar for `target` must therefore be verb-indexed, which no EBNF production for a single YAML key naturally is.

### Which transfers fail visibly, which fail silently

**Visible failures** (something breaks loudly, quickly):

- R2's drift is visible the first time someone diffs the prose grammars.
- Adding a presence form to `when` breaks `scripts/check-variable-model.ts` — see below — and that guard is hard-zero, so it fails the build.

**Silent failures** (the artifact keeps working and means the wrong thing):

- R1: a predicated edge parses, routes, and quietly ends borrowability. No test asserts borrowability, because it is a property of the schema's shape rather than of any run.
- R3: a grammar asserting `when ⊂ Condition` generates and validates. It is wrong only for the 17 `exists`/`notExists` leaves and for truthiness, both of which are rare enough to survive review.
- R4: `target`'s dual grammar produces no error in either sense. A validate-sense predicate mistyped as a set-sense name simply sets a variable named after a predicate.

---

## Step 4 — The transferred constraint that is already load-bearing

The sharpest instance is not hypothetical. `scripts/check-variable-model.ts:21-22` states its own precondition:

> "Only structured conditions are walked; the `when:` string dialect has no exists-shaped predicate (verified against the corpus during B7)."

The guard enforces `exists-on-defaulted`: an `exists`/`notExists` gate on a variable that declares a `defaultValue` is constant, because the server seeds every default at session creation. It is a hard-zero rule.

Group 1's falsifiable prediction was that a postfix presence form plus an emptiness form takes the `actions[].target` residue to zero. **Tested, and it holds exactly**: the 4 non-parsing values are `target_path exists`, `broken_artifact_links == []`, `summary_budget_overruns == []`, `summary_completeness_findings == []`; a postfix presence form covers the first and an emptiness form covers the other three. Residue zero, confirmed.

But the cheapest form that closes it is the one the guard's comment declares cannot exist. Adding `x exists` to the string dialect means `check-variable-model.ts` — which walks only condition trees — silently stops seeing a whole category of the thing it exists to catch. Measured exposure: **350 of 657 variable declarations carry a `defaultValue`**, so 53% of the variable population is in scope for the rule the guard would stop enforcing on the new syntax.

This is the pedagogy law in its purest form: a constraint that was true of the corpus at the time a guard was written ("the string dialect has no presence form") got encoded as an assumption about the guard's scope, and the guard is correct only while the assumption holds. The comment is the notice, and it is the only notice.

---

## The pedagogy law

**A precondition that is satisfied by absence is transferred as an assumption, because absence leaves nothing to copy.**

Every sound piece of sugar in this corpus rests on a precondition that is invisible in the sugar itself:

- Bare-string technique binding is sound because the structured form carries only deviations — visible in a rule, not in the syntax.
- Implicit same-name binding is sound because resolution is closed over a declared signature — visible in the technique contract, not in the binding.
- Predicate-free graph edges are sound because the activity owns its own exit conditions — visible in a `describe()` string, not in `GraphSchema`.
- `check-variable-model`'s tree-only walk is sound because the string dialect has no presence form — visible in a comment, not in any type.

In each case the thing that makes the sugar safe is a **fact about what does not exist**. A later author sees the sugar, does not see the absence, and reproduces the form without the fact. The four formal artifacts this run must specify are precisely the instruments that could make these absences writable — an Alloy `fact` can assert "no edge carries a predicate" in a way a Zod `describe()` cannot — which is the strongest available argument for treating `constraints/workflow.als` as the primary workflow-tier deliverable rather than the secondary one.

---

## Step 5 — Prediction: first to fail, slowest to be discovered

**Fails first:** the presence form against `check-variable-model.ts`. It is a hard-zero guard in the repo's own check suite, so it fails at the next `check:all` after the syntax lands — assuming the guard is extended to walk the string dialect. If it is *not* extended, it does not fail at all, which is the next entry.

**Slowest to be discovered — the prediction:** *`when`'s numeric coercion divergence from `Condition`, inherited by any generated grammar that treats the two dialects as one language.*

Reasoning. C9 puts `Number()` in one evaluator and `toNumber()` in the other. Measured over 13 probe predicates covering the same intent in both spellings, **5 disagree**:

| Bag value | `x >= 0` as `when` | same as `Condition` |
|---|---|---|
| `true` | true | false |
| `null` | true | false |
| `[]` | true | false |
| `[5]` (`x > 3`) | true | false |
| `false` (`x <= 0`) | true | false |

`Number()` coerces booleans, `null` and single-element arrays to finite numbers; `toNumber()` accepts only `number` and `string` and returns `undefined` for everything else. Every disagreement is on a **non-numeric** value reaching a **numeric** comparator.

It is slowest to discover for four compounding reasons:

1. **The comparators are rare.** Corpus-wide, `>` appears on 7 condition leaves; the string dialect's 281 expressions decompose into 428 comparisons of which the overwhelming majority are `==` (81 on tree leaves) and `!=` (56). Ordering comparators against a possibly-non-numeric bag entry are a thin slice of a thin slice.
2. **Both answers are plausible.** Neither `true` nor `false` looks like a bug at a branch point. There is no exception, no log line, no `unparsed` verdict.
3. **Fail-closed hides it (C13).** The whole system is built to treat a gate it cannot answer as `false`, so a wrong `false` is indistinguishable from the designed behaviour.
4. **The server never evaluates gates (C4).** No central component ever sees both dialects evaluate the same intent, so there is no place the divergence could be observed even in principle. `gate-liveness.ts` is the one module that holds both, and it combines them with `whenSays && conditionSays` (gate-liveness.ts:196) — an and-combination, which *masks* divergence rather than surfacing it: where the string dialect says true and the tree says false, the and returns false and looks like an ordinary negative.

The failure surfaces only when a migration rewrites a tree predicate into the string dialect, or the reverse, on a variable whose type is looser than its comparator assumes — precisely the migration this run's grammar would authorize. It will be attributed to the migration script, not to a coercion contract that has differed since both evaluators were written.

---

## Findings summary

| # | Finding | Evidence |
|---|---|---|
| P1 | Predicate-free graph edges are a deliberate, reasoned choice protecting activity borrowability, not a gap to be filled | workflow.schema.ts:62, :78; 192/192 edges bare strings |
| P2 | Neither dialect is a subset of the other; `when` lacks presence, `Condition` lacks truthiness | condition.schema.ts:3-5; when-expression.ts:241; 17 exists/notExists leaves; truthiness/exists diverge on `false`, `0`, `""` |
| P3 | `actions[].target`'s two grammars overlap completely — 53/53 set-sense values also parse as predicates | measured; activity.schema.ts:28 |
| P4 | Group 1's residue prediction confirmed exactly: presence + emptiness forms close all 4 | the 4 values enumerated at §4 |
| P5 | …but the presence form invalidates a stated precondition of a hard-zero guard covering 53% of variables | check-variable-model.ts:21-22; 350/657 declarations carry defaultValue |
| P6 | The authoring rule lives in an imperative script though it is expressible as grammar | when-expression.ts:344; scripts/check-when-expression.ts |
| P7 | `check-when-expression.ts` walks only `steps[]` members, so 54 `exits[].when` and 38 `actions[].target` are never authoring-checked | scripts/check-when-expression.ts `walk`/`checkStep` |
| P8 | Coercion divergence is real and masked by and-combination | 5/13 probes; gate-liveness.ts:196 |

---

*Lens: pedagogy (06). Dimension: Expressiveness. Source revision: `origin/main` b061faee; `workflows/` from working tree.*
