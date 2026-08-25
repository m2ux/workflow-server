# Portfolio lens — claim (07) · Expressiveness

**Target:** `workflows/**/*.yaml` (disk), `src/schema/`, `src/utils/gate-liveness.ts`, `scripts/check-*.ts` (read from `origin/main` `b061faee`)
**Question the lens asks:** the empirical claims a shorthand-grammar proposal embeds about human behaviour, causality, timing and resources — each assumed false, with the resulting corruption traced.

Three claims were named in the pass brief. All three are testable against the corpus, and **all three fail**. That result reshapes what the target grammar should be, so this artifact spends its length on the measurements rather than on the reasoning.

---

## Step 1 — Every empirical claim the proposal embeds

| # | Claim | Kind | Verdict |
|---|---|---|---|
| K1 | Authors want terseness; verbosity is friction they would shed given a shorter legal form | human behaviour | **False** — 96.8% explicit |
| K2 | A single-leaf `condition` is restatement, not deliberate structure | causality | **False for 56 of 75** |
| K3 | A rename-only technique binding carries no intent | human behaviour | **False for 62 of 64** |
| K4 | Intent migrated to `actions[].target` because the enforced grammar could not hold it | causality | **True for 4 of 37; false for 33** |
| K5 | Adding syntax closes the residue at the cost of the syntax alone | timing/resources | **False** — one guard's stated precondition falls |
| K6 | A shorthand is semantically neutral: rewriting a tree as a string preserves meaning | causality | **False** — 5/13 probes diverge |
| K7 | The workflow tier lacks a predicate language because none was designed yet | causality | **False** — it is a stated invariant |

---

## Step 2 — Assume each is false; trace the corruption

### K1 — "Authors want terseness"

The corpus offers a direct test. The `when` dialect has, and has always had, a terse form for boolean gates: a bare identifier evaluates as truthiness (when-expression.ts:241), and unary `!` negates it. `is_review_mode` is legal and means the same as `is_review_mode == true` for a declared boolean. Authors are free to choose. Measured over all 281 `when` strings, decomposed to leaves:

| Form | Count |
|---|---|
| `x == true` | 160 |
| `x != true` | 95 |
| `x == false` | 17 |
| `x != false` | 0 |
| **explicit boolean comparison, total** | **272** |
| bare identifier truthiness | 6 |
| unary `!` | 3 |
| **terse form, total** | **9** |

**Authors choose the explicit form 96.8% of the time, with the terse form available, legal, shorter, and documented in the field's own `describe()` string.**

The corruption when the claim is assumed true: a grammar designed to reward brevity optimizes a quantity the authors have spent 272 decisions rejecting. Worse, the specific sugar most often proposed for a boolean gate — dropping `== true` — would, if encouraged, convert 272 sites from a form that is *exactly* checkable into one whose meaning depends on JavaScript truthiness. That is not neutral: `Boolean([])` is `true`, so a bare-identifier gate on an array variable is true when the array is **empty**. Corpus-relevant, because 95 of 657 variable declarations are `type: array`.

What the inversion reveals: the corpus's verbosity is not friction. `x == true` is an assertion that `x` is the boolean `true`, and it fails closed on a string, a number, or an array. `x` asserts only that `x` is JS-truthy. Authors have consistently bought the stronger assertion with four extra characters.

### K2 — "A single-leaf `condition` is restatement"

75 of 109 `condition` blocks are a single `type: simple` leaf. The inference drawn from that count is that they are verbose spellings of something `when` would say in one line. The inference does not survive cross-tabulation by **position**, because at several positions the tree is not a choice.

| Position | Blocks | Single-leaf | Is the tree elective? |
|---|---|---|---|
| checkpoint step | 67 | 42 | **No** — activity.schema.ts:75: "only `condition` (not `when`) enables condition_not_met dismissal" |
| `actions[].condition` | 11 | 11 | **No** — `ActionSchema` (activity.schema.ts:26) declares no `when` field at all |
| `kind: loop` | 19 | 17 | Yes |
| `kind: technique` | 6 | 2 | Yes |
| `kind: action` step | 5 | 3 | Yes |
| other | 1 | 0 | — |

**78 of 109 blocks sit where the structured tree is the only spelling available.** Of the 31 elective blocks, a further 9 use `exists` or `notExists` — operators the `when` dialect does not have — so they are locked by capability rather than by position.

Running it to ground: **elective, single-leaf, and free of `exists`/`notExists` — 19 blocks.** That is the genuine restatement population: 17% of the 109, not 69%.

The corruption when the claim is assumed true: a migration sized at 75 sites attempts 75 rewrites, 56 of which are either impossible (they would lose checkpoint dismissal, or have no `when` field to move to) or lossy (they would lose a presence test). A checkpoint whose `condition` is rewritten as `when` still runs — it simply stops being dismissible via `respond_checkpoint condition_not_met`, silently, because both fields are optional and neither the schema nor any guard requires that a checkpoint have one.

What the inversion reveals: `condition` on a checkpoint is not a legacy spelling of a gate. It is a **different construct wearing the same name** — the field that makes a decision dismissible. Calling it LEGACY (activity.schema.ts:77) in the same breath as excepting checkpoints from that judgement is the schema conceding the point. One name is doing two jobs, and the count of 75 is the artifact of conflating them.

### K3 — "A rename-only binding carries no intent"

Measured over the 208 structured technique bindings that declare inputs: **64 are rename-only** (every input a bare bag-name reference, no literal, no template). Of those 64, **2 are identity passthroughs** — the redundant case the `binding-carries-only-deviations` rule already prohibits. The remaining 62 map 57 distinct `(input id ← source name)` pairs. A sample:

```
dispatch_concurrency  ← scanners_assigned
expected_ids          ← worker_briefs
checkpoint_resolution ← user_selection
mutated_pages         ← wiki_pages.page_slugs
parent_session_index  ← meta_session_index
activity_id           ← current_activity
```

None of these is an alias. `dispatch_concurrency ← scanners_assigned` asserts that the number of assigned scanners *is* the concurrency to dispatch at — a design decision, stated in the only place it is stated. `checkpoint_resolution ← user_selection` records that the user's selection *is* the resolution. These are the joins of the dataflow graph, and deleting them deletes the join.

The corruption when the claim is assumed true: a shorthand that elides rename-only bindings — "if it's just a rename, infer it" — cannot infer them, because the two names differ by design. The only inference rule available is same-name binding, which already fires and which these bindings exist precisely to override. So the sugar would have to be a *positional* or *type-directed* match, and both silently pick the wrong source when two bag variables share a type.

The 2 identity passthroughs are the whole of the genuinely intent-free population, and a guard, not a grammar, is the instrument for them.

### K4 — "Intent migrated to `target` because the grammar could not hold it"

Split by evidence. Of 37 distinct validate-sense `target` values, **33 parse as valid `when` expressions today**. Those 33 did not migrate for want of expressiveness — the grammar holds them exactly. They migrated for want of a **slot**: there is no `when`-shaped field on a validate action, and `ActionSchema` (activity.schema.ts:26-33) offers only `condition`, the tree. An author with a one-line predicate and only a tree available put the line in `target`.

Only **4** migrated for want of expressiveness: `target_path exists`, and three emptiness tests `broken_artifact_links == []`, `summary_budget_overruns == []`, `summary_completeness_findings == []`.

The corruption when the claim is assumed true across all 37: the fix is scoped as "extend the grammar", when 89% of the population needs "add a field". Extending the grammar and not adding the field leaves 33 predicates still in `target`.

What the inversion reveals: **`actions[].target` is a slot problem wearing a grammar problem's clothes.** And the slot problem has a second half — under `action: set` the same key holds a variable name, across 84 entries and 53 distinct values, **53 of which also parse as valid `when` expressions** (as bare-identifier truthiness). The two grammars over one key are not merely different; their value sets overlap completely, and only the sibling `action:` verb disambiguates. Note also that `set` is already "slated for removal at the next workflow-schema major (#166 B7/B12)" per activity.schema.ts:27 — so half the ambiguity is scheduled for deletion, and a grammar that specifies `target` as a single construct will specify a construct that is about to be cut in half.

### K5 — "Adding syntax costs only the syntax"

Group 1's prediction is confirmed at the syntactic level: a postfix presence form covers `target_path exists`, an emptiness form covers the three `== []` tests, and the residue goes to zero. Tested directly; all four close.

The claim that fails is about **cost**. `scripts/check-variable-model.ts:21-22` states:

> "Only structured conditions are walked; the `when:` string dialect has no exists-shaped predicate (verified against the corpus during B7)."

The guard's `exists-on-defaulted` rule is hard-zero: an `exists`/`notExists` gate on a variable declaring a `defaultValue` is a constant, because the server seeds every default at session creation. Its correctness rests on a fact about the string dialect that the proposed syntax abolishes. Exposure: **350 of 657 variable declarations carry a `defaultValue`** — 53% of the population is in scope for a rule that would stop being enforced on the new spelling.

The corruption: the syntax lands, the guard keeps passing, and it is now blind to half its domain. Nothing fails. The comment is the only notice, and it is a comment.

### K6 — "A shorthand is semantically neutral"

The premise beneath any lowering of one dialect into the other. Measured across 13 probe predicates expressing one intent in both spellings, **5 disagree**:

| Bag value | intent | `when` | `Condition` |
|---|---|---|---|
| `true` | `x >= 0` | true | false |
| `null` | `x >= 0` | true | false |
| `[]` | `x >= 0` | true | false |
| `[5]` | `x > 3` | true | false |
| `false` | `x <= 0` | true | false |

Cause: `when` coerces with `Number()` (when-expression.ts:306-308), which maps `true → 1`, `null → 0`, `[] → 0`, `[5] → 5`. `Condition` coerces with `toNumber()` (condition.schema.ts:51-55), which accepts only `number` and `string` and yields `undefined` otherwise, failing the comparison.

And in the other direction, the dialects are not comparable at all:

- `Condition` has `exists` / `notExists`; `when` has no presence form. 17 corpus leaves use them.
- `when` has bare-identifier truthiness; `Condition` has no truthiness operator — its enum (condition.schema.ts:3-5) has none. Measured: for `x = false`, `x = 0`, `x = ""`, bare `x` is **false** while `exists` is **true**.

Neither dialect contains the other. "Lower `when` into `Condition`" requires adding a truthiness node to `Condition`; "raise `Condition` into `when`" requires adding presence operators to `when` — which is K5's problem.

### K7 — "The workflow tier lacks a predicate language because none was designed"

`GraphSchema` is `z.record(z.record(z.string()))` (workflow.schema.ts:62) and all 192 edges across 17 graphs and 106 nodes are bare strings, with zero exceptions. The reason is stated at workflow.schema.ts:78: "an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say."

The absence is an invariant protecting activity borrowability, not a vacancy. A workflow-tier grammar that adds edge predicates does not fill a gap; it repeals a design rule — and repeals it silently, since no test asserts borrowability.

---

## Step 3 — Three alternative designs, each inverting one claim

### Design A — invert K1: authors want *checkability*, not brevity

Add no sugar to the boolean case. Instead, give `actions` a `when` field (closing 33 of the 37 `target` predicates), and constrain `target` to `VariableNameSchema` under `set`. Add the emptiness form (3 sites) and skip the presence form, using `== []`-style value comparison instead — which `check-variable-model.ts` already sees, because it is a value comparison rather than a presence test.

**Concrete result:** residue drops from 4 to 1 (`target_path exists`), and that one is rewritten as a value comparison or moved to a tree. No guard precondition is broken. The 272 explicit boolean comparisons stay exactly as authors wrote them. Total new grammar: one production.

**Trade-off:** `target_path exists` must change spelling. **What it reveals:** most of the perceived grammar shortfall is a field shortfall, and the field is free.

### Design B — invert K2: the single leaf is deliberate, so split the construct

Stop treating `condition` as one field. Rename its checkpoint use to what it does — a dismissal predicate — and retire it everywhere `when` is available.

**Concrete result:** 67 checkpoint blocks keep a field whose name states its power; 11 action blocks move to a new `when` on actions (Design A's field); 19 elective single-leaf blocks migrate to `when`; 9 elective blocks blocked by `exists`/`notExists` stay trees until the presence question is settled. The migration is sized at **19 mechanical rewrites**, not 75, and no checkpoint loses dismissibility because no checkpoint is touched.

**Trade-off:** one schema rename, and the LEGACY label comes off `condition` because it is no longer legacy — it is the dismissal construct. **What it reveals:** the 75-site migration was an artifact of one name doing two jobs; naming the second job shrinks the work by 75%.

### Design C — invert K6: the dialects are different languages, so stop converging them

Accept two dialects permanently and specify each separately, with one shared coercion contract extracted into a single module both import.

**Concrete result:** the 5 divergent probes converge — the only code change is that both evaluators call one `coerceForOrdering()`. `grammar/activity.ebnf` specifies the string dialect; `constraints/activity.als` specifies the tree and asserts the two agree on their common fragment (the fragment excluding truthiness and presence). The Alloy `assert` is the artifact that would have caught the coercion divergence, and it is exactly the kind of statement Alloy is for.

**Trade-off:** two languages stay in the corpus forever, and authors keep having to know which positions take which. **What it reveals:** the four formal artifacts are not documentation of a settled grammar — they are the *instrument* that settles it, because the divergences at issue are cross-dialect agreement properties that no single schema can state.

---

## Step 4 — The core impossibility

**The system tries to give one predicate language uniform meaning across positions that have genuinely different powers, while no component ever evaluates two of them together.**

Three properties that cannot coexist here:

1. **One predicate language** across every position.
2. **Position-specific power** — checkpoint dismissal, exit routing, step gating, action guarding are not the same act.
3. **Agent-side evaluation** — activity.schema.ts:75: "the server never evaluates gates."

Any two are achievable. All three are not. Because (3) holds, there is no runtime that sees both dialects resolve the same intent, so cross-dialect agreement can only be established by a static artifact. Because (2) holds, a single language must either over-grant power (a `when` on a checkpoint that silently forfeits dismissal) or under-grant it (an action with no `when`, which is today's state and the cause of 33 misplaced predicates). The corpus has been paying for this in `actions[].target`, which is where intent goes when position and power disagree.

`src/utils/gate-liveness.ts` is the one module holding both dialects, and it does not resolve the impossibility — it inherits it. Line 196 returns `whenSays && conditionSays`, and an and-combination **masks** divergence: where the string says true and the tree says false, the result is false and looks like an ordinary negative.

---

## Step 5 — Prediction: the false claim causing the slowest, most invisible failure

**K6 — that a shorthand is semantically neutral.**

Not K5, though K5 is more severe: K5's failure has a written notice (check-variable-model.ts:21-22) sitting in the file a maintainer opens to make the change. Someone will read it.

K6 has no notice anywhere. The coercion contract is not documented as a contract; it is an implementation detail of two functions in two files that no one has reason to open together. And every property of the system conspires to hide a wrong answer:

1. **The divergent population is small and mostly non-numeric.** Ordering comparators are rare — 7 `>` leaves on condition trees against 81 `==` and 56 `!=` — and all 5 divergences need a non-numeric value at a numeric comparator.
2. **Both answers are plausible at a branch point.** No exception, no log, no `unparsed` verdict.
3. **Fail-closed is indistinguishable from a wrong `false`.** when-expression.ts:335 returns `false` for anything unparseable by design, so the system's normal behaviour is the failure's disguise.
4. **The and-combination masks it** (gate-liveness.ts:196).
5. **No component evaluates both**, so the divergence has no observation point even in principle.

The trigger is precisely the work this run authorizes: a migration that rewrites tree predicates as strings, or the reverse, over the 19-block restatement population and the 9 exists-blocked blocks. On any variable whose runtime type is looser than its comparator assumes — `array` for 95 declarations, `object` for 50 — the rewrite changes the answer. It will be diagnosed as a bug in the migration script, and the migration script will be correct.

**The counter-instrument is cheap and belongs in this run's output:** an Alloy assertion that the two dialects agree on their common fragment, plus one shared coercion function. Neither is expressible in Zod or JSON Schema, which is why the four formal artifacts matter beyond documentation.

---

## Findings summary

| # | Finding | Measurement |
|---|---|---|
| C1 | Authors reject the available terse form 96.8% of the time | 272 explicit boolean comparisons vs 9 terse |
| C2 | The single-leaf restatement population is 19 blocks, not 75 | 78 of 109 blocks sit where the tree is the only spelling; 9 more locked by `exists`/`notExists` |
| C3 | Rename-only bindings carry the dataflow joins; only 2 are intent-free | 64 rename-only bindings, 2 identity, 57 distinct pairs |
| C4 | `target` is 89% a missing-field problem, 11% a grammar problem | 33 of 37 validate-sense values already parse as `when` |
| C5 | `target`'s two grammars overlap totally; `action: set` is already slated for removal | 53/53 set-sense values also parse as predicates; activity.schema.ts:27 |
| C6 | Neither dialect contains the other, and they disagree on shared intent | 5/13 probes; 17 `exists`/`notExists` leaves; truthiness absent from `Condition` |
| C7 | The presence form breaks a hard-zero guard's stated precondition | check-variable-model.ts:21-22; 350/657 declarations defaulted |
| C8 | The workflow tier's predicate-freedom is an invariant, not a vacancy | workflow.schema.ts:62, :78; 192/192 edges bare strings |

---

*Lens: claim (07). Dimension: Expressiveness. Source revision: `origin/main` b061faee; `workflows/` from working tree.*
