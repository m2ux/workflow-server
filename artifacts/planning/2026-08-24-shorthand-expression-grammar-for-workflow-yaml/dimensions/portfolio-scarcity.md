# Portfolio lens — scarcity (08) · Feasibility

**Target:** `src/schema/`, `scripts/` (31-guard registry), `schemas/`, `grammar/`, `constraints/`, `workflows/**` (read from `origin/main` `b061faee`; corpus from working tree)
**Question the lens asks:** for each concrete problem, what does the current design assume will never run out — and what is conserved across every alternative.

---

## Step 1 — Concrete problems and the scarcity each exposes

### P1 — A predicate is `z.string()`, so no schema change can catch new syntax

`stepCommonFields.when` is `z.string()` (activity.schema.ts:74). The entire grammar — operator set, precedence, the parenthesization rule, fail-closed semantics, the checkpoint caveat — lives in a 700-character `.describe()` string. It survives into the generated JSON Schema unchanged, as `activity.schema.json:362-364`:

```json
"when": { "type": "string", "description": "Inline boolean expression that gates this step. Operators: ==, != … " }
```

Adding a presence operator, an emptiness form, or a set-membership form changes **nothing** in Zod, nothing in the generated JSON Schema, and nothing in the type system. `tsc` passes. `check:activities` and `check:workflow-yaml` — which prove "every activity file validates against the activity schema" — pass, because every string validates against `z.string()`.

**Scarcity assumed inexhaustible: reviewer attention.** The only mechanism that can notice a grammar change is a person reading a diff. The design has spent its entire syntax-checking budget on one guard script and banked the rest on human vigilance.

### P2 — Enforcement lives in `scripts/`, one hand-written guard at a time

`scripts/guards.ts` registers **31 guards**, each a separate TypeScript program with its own walker, its own finding shape, and its own preconditions recorded in a header comment. Four touch predicates:

| Guard | Proves | Predicate scope |
|---|---|---|
| `when-expression` | "every when: gate parses under the reference dialect and parenthesizes mixed &&/\|\|" | `steps[].when` only — see P5 |
| `variable-model` | "defaults, gates and setVariable effects are coherent with the seeded variable model" | condition trees only — by stated precondition |
| `set-action-values` | "every set action names where it writes, and braces a value that names a variable" | `target` under `action: set` only |
| `activity-variables` | "every activity declares the variables it reads and writes, and every read has a writer on every path" | reads/writes, not syntax |

**Scarcity assumed inexhaustible: guard-authoring discipline.** Every new rule about predicates costs a new walker or an edit to an existing one, and the walker must independently rediscover where predicates live. There are six positions (§P5), and no guard covers all six.

### P3 — Generated JSON Schemas with no regeneration or drift check

`scripts/generate-schemas.ts` is 30 lines. It writes five files. It has no `--check` mode, no comparison against what is committed, and **no entry in the 31-guard registry**. `package.json` has `build:schemas` and no `check:schemas`.

So `schemas/*.json` is a build artifact committed to the repo with nothing asserting it matches the Zod it was generated from. Change a `describe()` string — which is where the whole grammar lives (P1) — and the committed JSON Schema keeps serving the old grammar to every editor and every external consumer until someone remembers to rerun the build.

**Scarcity assumed inexhaustible: regeneration discipline.**

### P4 — The formal artifacts have drifted for six months with nothing noticing

`grammar/activity.ebnf` (129 lines) and `constraints/activity.als` (279 lines) are both stamped 3.0.0 / 2026-02-10 and are complete, internally coherent specifications of a design with `decisions:`, `flows:` and `skill:` bindings. The current schema has none of those constructs. `grammar/workflow.ebnf` and `constraints/workflow.als` do not exist.

Nothing in the guard registry references `grammar/` or `constraints/`. No test parses the EBNF. No Alloy run is wired to anything. The artifacts have described a superseded design for roughly six months, and the mechanism that would have caught it does not exist.

**Scarcity assumed inexhaustible: the memory that these files exist.** This is the strongest available evidence about the *next* pair: whatever `grammar/workflow.ebnf` and `constraints/workflow.als` say on the day they are written, nothing will notice when they stop being true. Generating them from a specification, rather than authoring them alongside one, is the only difference that changes this.

### P5 — Predicate rules are enforced at one position out of six — demonstrated

The `when-expression` guard's registry entry claims it proves "every when: gate parses under the reference dialect and parenthesizes mixed `&&`/`||`". Its implementation applies `checkStep` only to members of a `steps` array (`scripts/check-when-expression.ts`, `walk`/`checkStep`); it recurses into everything else but checks nothing there.

Tested directly against a probe corpus. Two deliberately invalid expressions placed on `exits[]`:

```yaml
exits:
  - id: broken-mixed-ops
    when: a == true || b == true && c == true      # violates the parenthesization rule
  - id: broken-unparseable
    when: "this is not (((a predicate"             # does not parse at all
```

Guard output:

```
when-expression: OK — all when: gates parse and honor mixed-ops parentheses
```

The identical two expressions moved onto steps:

```
when-expression: 2 invalid when: gate(s) — fix parse errors or parenthesize mixed &&/||:
  probe/activities/01-probe.yaml[mixed-ops-on-step] — mixed && and || at the same nesting depth require parentheses
  probe/activities/01-probe.yaml[unparseable-on-step] — trailing input at token 1
```

The gap is positional, not expressional. **54 `exits[].when` expressions in the live corpus are entirely unguarded**, as are the **38 `actions[].target` predicates in the validate sense** — `set-action-values` guards only the `set` sense, and its `proves` line says so.

Full enforcement map for the six predicate positions:

| Position | Corpus count | Syntax guard |
|---|---|---|
| `steps[].when` | 227 | `when-expression` |
| `exits[].when` | 54 | **none** (demonstrated) |
| checkpoint `condition` | 67 | schema-shape only |
| `actions[].condition` | 11 | schema-shape only |
| `actions[].target` (validate) | 38 | **none** |
| graph edge | 192 | n/a — no predicate permitted |

### P6 — `gate-liveness.ts` contradicts itself, and reading is the only thing keeping it honest

Two functions in one file disagree about whether absence answers a negative gate.

`unboundPositiveReads` (gate-liveness.ts:92-108) deliberately excludes them, with the reasoning in its own doc comment (lines 83-85): "Negative and presence forms are left out, because absence answers them: `x != true` and `notExists x` hold on a missing variable, which is how this corpus spells 'not in that mode'." Concretely: `cmp` with op `!=` is skipped (line 100), and `not` returns immediately (line 103).

`gateAnswer` (gate-liveness.ts:167-197) does not carry the exclusion for the string dialect. `collectWhenPaths` (lines 10-27) adds **every** path from `truthy` and `cmp` with no `!=` exemption and no `not` exemption, into `valuePaths`; line 190-191 then returns `reason: 'unbound'` for any `valuePath` absent from the bag.

For the tree dialect it *does* carry the exclusion: `collectConditionPaths` (lines 30-51) routes `exists`/`notExists` into a separate `presencePaths` set, and line 190 iterates `valuePaths` only — so `notExists x` on a missing `x` falls through to real evaluation and returns an answer.

The consequence is a delivery asymmetry between two spellings of one intent:

- `notExists x` (tree) on a missing `x` → **answered `true`** → the step is eagerly bundled.
- `x != true` (string) on a missing `x` → **`reason: 'unbound'`** → no answer → the step stays lazy.

**54 of 281 corpus `when` gates are purely negative** (16 distinct expressions, e.g. `is_review_mode != true`, `stealth_mode != true`, `!worker_agent_id`, `is_review_mode != true && needs_issue_creation != true && issue_skipped != true`). Every one takes the pessimistic path that its tree-spelled equivalent avoids, and the file's own comment says why it should not.

**Scarcity assumed inexhaustible: the attention of whoever reads both functions.** They are 80 lines apart in one file and were written to disagree.

### P7 — The migration surface, sized

What a settled grammar would actually have to touch:

| Population | Size | Mechanical? |
|---|---|---|
| Condition trees genuinely movable to `when` | **19** blocks | yes |
| Condition trees blocked by `exists`/`notExists` | 9 blocks | no — needs the presence question settled |
| Condition trees structurally forced (checkpoint dismissal, actions) | 78 blocks | **must not move** |
| `actions[].target` predicates needing a field, not grammar | 33 | yes, once a field exists |
| `actions[].target` predicates needing new syntax | 4 | needs presence + emptiness forms |
| `actions[].target` under `set` (name sense) | 84 entries / 53 distinct | scheduled for deletion — activity.schema.ts:27 |
| Rename-only technique bindings | 64 (2 identity) | 2 removable; 62 carry dataflow joins |
| Graph edges | 192 | **must not change** — §P8 |

The often-quoted "75 single-leaf condition blocks" resolves to 19 after removing the 78 forced by position and the 9 locked by capability.

### P8 — Predicate-free graph edges are load-bearing, and nothing tests that

`GraphSchema = z.record(z.record(z.string()))` (workflow.schema.ts:62). All 192 edges across 17 graphs and 106 nodes are bare strings; zero exceptions. The rationale is stated at workflow.schema.ts:78: "an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say."

Borrowability is a real, exercised property, and **no test asserts it**. It is protected today only because `z.record(z.string())` happens not to admit an object. Widen that type for any reason and the property is gone with no failing test.

**Scarcity assumed inexhaustible: the accident that the narrow type has not yet needed widening.**

---

## Step 2 — An alternative gambling on the opposite scarcities

The current design spends **machine effort** freely (31 separate guard programs, each re-walking the corpus) and hoards nothing, while treating **human attention** as free. Invert it: treat human attention as the scarce resource and spend generation infrastructure instead.

**Design: the grammar file becomes the source, and everything else is generated from it.**

1. `grammar/activity.ebnf` holds the string dialect — including the parenthesization rule, which **is** context-free-expressible and does not need an imperative check:

   ```ebnf
   when-expr   = and-chain | or-chain | unary ;
   and-chain   = unary , ( "&&" , unary )+ ;
   or-chain    = unary , ( "||" , unary )+ ;
   unary       = "!" , unary | primary ;
   primary     = comparison | path | "(" , when-expr , ")" ;
   ```

   A top-level `&&` chain cannot contain a top-level `||` by construction. The rule that today lives in `assertWhenAuthoring` (when-expression.ts:344-368) and is enforced at one of six positions becomes a property of the language, enforced wherever the language is parsed.

2. The parser in `src/schema/when-expression.ts` is generated from that EBNF, so the reference evaluator and the specification cannot disagree.

3. `constraints/activity.als` holds what EBNF cannot: cross-dialect agreement. The single most valuable assertion is the one that would have caught the coercion divergence —

   ```alloy
   assert DialectsAgreeOnCommonFragment {
     all e: Expr, b: Bag |
       inCommonFragment[e] implies evalString[e, b] = evalTree[lower[e], b]
   }
   ```

   The common fragment excludes truthiness (absent from `Condition`) and presence (absent from `when`), which is itself the statement that neither dialect contains the other.

4. `constraints/workflow.als` holds the invariant that has never been written down:

   ```alloy
   fact EdgesCarryNoPredicate { all e: Edge | no e.guard }
   fact ExitConditionsAreTheActivitys {
     all a: Activity, w: Workflow | a in w.activities implies a.exitPredicates in a.owned
   }
   ```

   This is the artifact that makes borrowability testable for the first time.

5. One guard replaces four: `check:formal-artifacts` regenerates the parser and the JSON Schemas and fails on any diff. It subsumes the missing drift check (P3), catches EBNF staleness (P4), and — because the parser is generated — cannot drift from the grammar (P1).

**Concrete result.** The `when-expression` guard's positional gap (P5) disappears, because checking moves from "a walker that must know where predicates live" to "the parser, invoked wherever a predicate is parsed". P3's missing drift check exists. P4's six-month staleness becomes a build failure. P1's grammar-invisible-to-Zod remains true — `when` is still a string — but ceases to matter, because the grammar now has an enforcing home.

**New trade-offs, stated honestly:**

- A build-time code-generation step enters a repo that currently has none for `src/`. The generated parser must be committed and diffable, or CI must run the generator.
- Alloy is a modelling language, not a test runner. `constraints/*.als` fails a build only if someone wires the Alloy Analyzer into CI — otherwise this design reproduces P4 one level up. **The Alloy assertions are worth writing only if the run also specifies how they are checked.**
- EBNF cannot express the parenthesization rule *and* keep the grammar in the natural precedence-cascade shape simultaneously; the production above trades a slightly less conventional grammar for a self-enforcing rule.
- Generation infrastructure is itself a thing that rots. The gamble is that one rotting generator is cheaper than 31 rotting walkers plus four undocumented preconditions.

---

## Step 3 — The conservation law

**The number of rules that must hold about a predicate is conserved across every design. Only their location moves — and only two of the four locations fail a build.**

Fifteen rules govern predicates in this system today. Their distribution:

| Location | Fails a build? | Rules held there |
|---|---|---|
| **Zod / type system** | yes | 1 — a graph edge is a string (and thus carries no predicate) |
| **Guard script** | yes | 4 — step-`when` parses; step-`when` parenthesizes; `exists`-on-defaulted; `set` names a target |
| **Prose `describe()` or code comment** | **no** | 7 — operator set; precedence; truthiness semantics; bare-word RHS is a string literal; fail-closed; checkpoint needs `condition` for dismissal; `condition` is legacy except on checkpoints |
| **Nowhere** | **no** | 3 — `exits[].when` validity; validate-sense `target` validity; numeric coercion agreement |

Ten of fifteen rules — two thirds — are held somewhere that cannot fail. Every proposal moves rules between these four columns; none reduces the count. A shorthand that adds a presence form and an emptiness form adds **two more rules**, and the default location for a new rule in this codebase is column three or four, because that is where the last seven went.

The corollary is the practical test for any design this run settles: **for each rule the target grammar states, name the column it lands in.** A grammar whose rules land in columns three and four is a longer `describe()` string.

---

## Step 4 — What remains unmovable in six months

**`the server never evaluates gates`** — activity.schema.ts:75, restated at gate-liveness.ts and inherent to the dispatch architecture, where the worker holds the variable bag and the server holds only the definition.

This is not a implementation detail awaiting cleanup; it is the load-bearing commitment that makes activities portable across harnesses and makes `dispatch_child` possible. It will not move.

Everything else in this analysis is downstream of it:

- Because no runtime evaluates two dialects together, cross-dialect agreement can only ever be a **static** property. There is no integration test that could find the 5-in-13 coercion divergence, because no component ever computes both answers. `gate-liveness.ts` is the closest thing, and it and-combines them (line 196), which masks divergence rather than surfacing it.
- Because the server never evaluates, `z.string()` is not a shortcut — it is honest. The server genuinely does not need the structure. Typing `when` more richly would buy authoring-time checking at the cost of a parser the server has no runtime use for, which is exactly why it has never been done.
- Because checking must be static, **the four formal artifacts are not documentation of the design; they are the only available enforcement surface for two thirds of its rules.** That is the strongest argument this lens produces for the run's deliverable, and it argues specifically for treating `constraints/*.als` as load-bearing rather than illustrative.

Six months from now the string dialect will still be a string, the server will still not evaluate it, and the question will still be whether a rule lives somewhere that fails a build. The 19-block migration will have happened or not; it is small either way. What will not have changed on its own is the ten rules in columns three and four.

---

## Findings summary

| # | Finding | Evidence |
|---|---|---|
| S1 | New predicate syntax is invisible to Zod, the generated JSON Schema, and `tsc` | `when: z.string()`, activity.schema.ts:74; activity.schema.json:362-364 |
| S2 | The `when-expression` guard covers 1 of 6 predicate positions; its registry claim is broader than its implementation | demonstrated — OK on invalid `exits[].when`, 2 findings on the same expressions on steps |
| S3 | 54 `exits[].when` and 38 validate-sense `target` predicates have no syntax guard at all | corpus counts; `set-action-values` guards only the `set` sense |
| S4 | No schema-drift check exists and none is registered | `generate-schemas.ts` (30 lines, no `--check`); absent from the 31-guard registry |
| S5 | The formal artifacts have described a superseded design for ~6 months with no mechanism to notice | `activity.ebnf` / `activity.als`, both 2026-02-10, `decisions:`/`flows:`/`skill:` |
| S6 | `gate-liveness.ts` contradicts itself; the string dialect's negative gates are penalised where the tree's are not | lines 83-85 and 92-108 vs 10-27 and 190-191; 54 purely-negative gates |
| S7 | The parenthesization rule is expressible as grammar but lives in an imperative check | `assertWhenAuthoring`, when-expression.ts:344 |
| S8 | Two thirds of predicate rules live somewhere that cannot fail a build | 15-rule distribution, §Step 3 |
| S9 | Borrowability is protected only by a narrow Zod type, with no test asserting it | workflow.schema.ts:62, :78 |
| S10 | The real migration is 19 blocks, not 75 | 78 forced by position, 9 locked by `exists`/`notExists` |

---

*Lens: scarcity (08). Dimension: Feasibility. Source revision: `origin/main` b061faee; `workflows/` from working tree. Guard-coverage claims verified by execution against a probe corpus in scratch, not by code reading alone.*
