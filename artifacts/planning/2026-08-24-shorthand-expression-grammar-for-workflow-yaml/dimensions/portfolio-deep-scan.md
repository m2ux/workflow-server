# Portfolio lens — deep-scan (12) · Architecture

**Target (code only):** `src/schema/when-expression.ts` (368 lines), `src/schema/condition.schema.ts` (72), `src/utils/gate-liveness.ts` (210), `src/utils/activity-variables.ts`, `scripts/check-when-expression.ts` — all read from `origin/main` `b061faee`.
**Question the lens asks:** the conserved quantity the two-dialect implementation is managing, where diagnostic information is destroyed, and the structural bugs in composition.

This lens reads source, not YAML. Corpus counts appear only where a code path's blast radius needs sizing.

---

## Step 1 — The conservation law

### The stated contract and the actual call graph disagree

`activity.schema.ts:75` states, in the field description delivered to every agent and published in `schemas/activity.schema.json`:

> "Evaluated by the executing agent against current variable state; **the server never evaluates gates.**"

The call graph says otherwise. Across all of `src/`, both evaluators are imported in exactly one module — `src/utils/gate-liveness.ts` — and both are invoked there:

```ts
// gate-liveness.ts:194-196
const whenSays = when === undefined ? true : evaluateWhenExpression(when, variables);
const conditionSays = condition === undefined ? true : evaluateCondition(condition, variables);
return { answer: whenSays && conditionSays };
```

The server evaluates gates. It does so against its own snapshot of the variable bag, for every gated step of every activity, at delivery time. What it does *not* do is let the result drive control flow — the result drives **eager bundling**: whether a step's technique body ships with `get_activity` or is fetched later.

That distinction is real and defensible. It appears nowhere. The published contract says "never evaluates", and a reader who believes it will conclude that cross-dialect semantic divergence cannot affect the server. It can, and this is the line where it does.

### The three properties that cannot coexist

1. **One predicate language** — a single spelling per intent, so the corpus has one thing to learn and one thing to check.
2. **Position-specific power** — checkpoint dismissal, exit routing, step gating and action guarding are different acts with different consequences, and the schema grants them differently.
3. **Delivery-time answerability** — the server must decide *now*, from a definition and a bag snapshot, whether a step's body is worth shipping.

Any two are achievable. All three are not.

- Hold (1) and (2): you get one language with position-indexed semantics, which the server cannot answer generically at delivery time — every position needs its own rule.
- Hold (1) and (3): you get today's `when` — uniform, answerable, and unable to express checkpoint dismissal, which is why `condition` survives with a LEGACY label and an exception carved out for the one position where it is not legacy.
- Hold (2) and (3): you get today's system in full — two languages, because the powers differ and both must be answerable.

**The conserved quantity is the number of distinct predicate *powers*, not the number of syntaxes.** There are four powers (gate, route, dismiss, guard-an-action). Merging the two syntaxes does not reduce them to three; it relocates the distinction from the syntax into the position. `gate-liveness.ts` is where that relocation is paid for, and it pays with an `&&`.

### Where the O(n) cost sits, and where it is paid twice

Delivery must answer every gate of every step. That is irreducibly O(steps). What is reducible — and is not reduced — is the constant.

`gateAnswer` parses each `when` expression, then throws the AST away and re-parses it:

```ts
// gate-liveness.ts:179 — parse #1, for path collection
const parsed = parseWhen(when);
if (!parsed.ok) return { answer: undefined, reason: 'unparsed' };
collectWhenPaths(parsed.ast, valuePaths);
...
// gate-liveness.ts:194 — parse #2, discarded again
const whenSays = evaluateWhenExpression(when, variables);
```

`evaluateWhenExpression` (when-expression.ts:333-337) begins by calling `parseWhen` a second time on the same string. `unboundPositiveReads` parses it a third time (line 110) when called on the same step. `expressionPaths` (line 262) parses it a fourth time when `activity-variables.ts:206` computes the read set.

Every gate is tokenized and parsed **two to four times per delivery**, and no AST is ever cached. The module exports `parseWhen` and a `WhenAst` type, so an `evalAst`-on-AST entry point is a two-line addition; it does not exist. This is the concrete cost of "the server never evaluates gates" being believed by the code's own structure — nobody optimized a path the documentation says is not taken.

`assertWhenAuthoring` (when-expression.ts:344-352) pays it a second way, and here the redundancy is provably dead:

```ts
const parsed = parseWhen(expr);          // tokenizes internally
if (!parsed.ok) return { ok: false, error: parsed.error };
const toks = tokenize(expr);             // tokenizes again
if (typeof toks === 'string') return { ok: false, error: toks };   // unreachable
```

`parseWhen` fails whenever `tokenize` fails, so line 349's second call cannot return a string once line 346 has been passed. **Line 350 is dead code**, and the second tokenize pass is pure waste.

### What the system pays to gain flexibility

It buys **harness portability** — activities run anywhere, because the runtime that evaluates gates is the worker's — and it pays in **unverifiable semantics**. No component ever computes both dialects' answer to the same intent and compares them. `gate-liveness.ts` is the only module holding both, and its combination operator destroys the comparison, as Step 2 shows.

---

## Step 2 — Information laundering

### L1 — A structured parse error becomes the boolean `false`

`parseWhen` is careful: it returns `{ ok: false, error: 'trailing input at token 3' }`, with position information.

`evaluateWhenExpression` discards all of it:

```ts
// when-expression.ts:333-337
export function evaluateWhenExpression(expr: string, vars: Record<string, unknown>): boolean {
  const parsed = parseWhen(expr);
  if (!parsed.ok) return false;
  return evalAst(parsed.ast, vars);
}
```

**Destroyed:** the error text, the position, and the distinction between "this expression is false" and "this expression is broken". **Propagated:** nothing. The documented rationale is fail-closed safety (line 331), which is a sound *policy* and an unsound *signature* — the policy needs the caller to be told, and a `boolean` return cannot tell it.

`gateAnswer` is the one caller that resists this, and it resists it by re-deriving the information rather than receiving it: it calls `parseWhen` itself (line 179) so that it can distinguish `unparsed` from `false`. The `GateUnanswered` union with its three reasons (`pending` / `unbound` / `unparsed`, lines 133-152) is the codebase's own commentary on this laundering, and its doc comment states the principle exactly:

> "The three are separate because they call for different responses, and one counter over all of them says only that something was deferred."

That principle is correct and is applied in exactly one place.

### L2 — `unbound` is reported without naming the variable

`gateAnswer` finds a specific unbound path and returns an enum:

```ts
// gate-liveness.ts:190-192
for (const path of valuePaths) {
  if (readPath(path, variables) === undefined) return { answer: undefined, reason: 'unbound' };
}
```

**Destroyed:** which variable. The `GateVerdict` type (lines 158-160) has no slot for it. This is the diagnostic a maintainer actually wants — "gate deferred because `analysis_target` is unbound" versus "gate deferred" — and the same file computes it two functions earlier: `unboundPositiveReads` (lines 86-131) returns `string[]` of exactly those names. One function collects the names and returns them; the other finds the same names and returns a bare enum.

### L3 — An unparseable expression reads no variables, silently shrinking the variable contract

`expressionPaths` (when-expression.ts:261-285) returns `[]` when parsing fails, documented at line 259 as "An unparseable expression reads nothing (fail-closed, as evaluation does)".

Its consumer is `src/utils/activity-variables.ts:206`, which computes the reads that back the `activity-variables` guard — the guard whose registry entry proves "every activity declares the variables it reads and writes, and every read has a writer on every path".

So a malformed `when` expression does not merely fail to gate: **its variable reads vanish from the activity's declared contract**, and the guard that checks reads-have-writers sees an activity that reads nothing there. A typo converts a checked read into an unchecked absence. Fail-closed on *evaluation* is safe; fail-closed on *static analysis* is the opposite of safe, because the analysis exists to find problems and returning "no problems" is the failure mode.

The mitigating fact is that `check-when-expression` would flag the malformed expression first — but only at one of six positions (see the `exits[].when` gap in the scarcity pass), so on an exit the laundering is unmitigated.

### L4 — The `&&` that masks cross-dialect disagreement

```ts
// gate-liveness.ts:196
return { answer: whenSays && conditionSays };
```

Where a step carries both a `when` and a `condition`, this is the only place in the system where both dialects evaluate the same bag. If they disagree — `whenSays === true`, `conditionSays === false` — the `&&` returns `false`, which is indistinguishable from ordinary agreement on a negative.

**Destroyed:** the disagreement itself, which is the single most valuable diagnostic the system could emit, because it is otherwise unobservable anywhere. **Propagated:** a plausible-looking `false`.

The disagreement is not hypothetical. The two evaluators coerce differently — `Number()` at when-expression.ts:306-307 against `toNumber()` at condition.schema.ts:51-55 — and diverge on every non-numeric value reaching an ordering comparator (`true`, `null`, `[]`, `[5]`, `false` all coerce under `Number()` and fail under `toNumber()`).

### L5 — `tokenize` uses `string` as its error channel

```ts
function tokenize(src: string): Tok[] | string
```

A `Tok[] | string` union forces every caller to `typeof toks === 'string'` before use, and makes an error indistinguishable from a result at the type level for any caller that forgets. Both current callers handle it; one of those handlers is dead code (Step 1). Contrast the sibling `ParseWhenResult` discriminated union three lines below, which does this correctly.

---

## Step 3 — Structural bugs

### A) Async state handoff — the delivery snapshot is not the evaluation state

There is no `async` in these three modules and no shared mutable state passed to an awaited call. The structural analogue is present and is worth naming precisely, because it is what the pattern is really about: **a decision computed against one state and consumed against another.**

`gateAnswer` decides eager bundling from `{ variables, writtenInActivity }` at `get_activity` time. The worker evaluates the same gate later, against a bag mutated by its own step outputs and checkpoint effects.

The design handles the in-activity case correctly and explicitly. `writtenInActivity` (built by `variablesWrittenIn`, lines 67-76, from technique outputs, remaps, checkpoint effects, `set` targets and loop variables) is consulted *before* the unbound check, and any path this activity will write yields `reason: 'pending'` rather than a stale answer:

```ts
// gate-liveness.ts:185-187
for (const path of [...valuePaths, ...presencePaths]) {
  if (writtenInActivity.has(rootOf(path))) return { answer: undefined, reason: 'pending' };
}
```

The ordering is the right one — `pending` is tested before `unbound`, so a variable this activity will produce is never misreported as missing. This is a correct handoff guard, and it is worth crediting because the same file gets the neighbouring case wrong (bug B2).

The residual gap is `rootOf`. A gate reading `current_unit.pipeline_mode` is matched against writers of `current_unit`; a producer that writes a *sibling* field of the same root marks the gate pending unnecessarily (conservative — safe), and a producer that writes only `current_unit.other_field` cannot be distinguished from one that writes the read field (also conservative). Root-granularity is a deliberate over-approximation in the safe direction, and the doc comment at line 5 says so.

### B) Priority inversion in search

**B1 — A bare word on the right of a comparison silently becomes a string literal.**

```ts
// when-expression.ts:235-238
if (rhs.t === 'id') {
  // Bare word on RHS is a string literal (matches walker: unquoted non-keyword text).
  return { kind: 'cmp', path, op, value: rhs.v };
}
```

First plausible interpretation wins over the better one. `a == b` compiles to "compare `a` to the string `"b"`" — never to "compare `a` to the value of `b`". Variable-to-variable comparison is therefore **not expressible in the dialect at all**, and an author who writes it gets a silent, always-false-in-practice gate rather than an error.

`expressionPaths` inherits the inversion and documents it (lines 255-259): "Only the left side — a right operand is a value, and an unquoted one is indistinguishable from an identifier by shape, so `analysis_type == completion` reads `analysis_type` alone." So `a == b` also contributes `b` to no read set, and the `activity-variables` guard will not notice that `b` is never written.

The tree dialect has the identical hole from the other direction: `SimpleConditionSchema.value` is `z.union([z.string(), z.number(), z.boolean(), z.null()])` (condition.schema.ts:19) — a literal only, with no variable-reference variant. **Neither dialect can compare two bag variables.** For a target grammar this is the clearest unmet need in the implementation, and unlike terseness it is a genuine expressiveness gap rather than a stylistic one.

**B2 — First unbound path wins, and the loop that finds it disagrees with its own file.**

`gateAnswer`'s `collectWhenPaths` (lines 10-27) adds every `truthy` and `cmp` path, walking *into* `not` subtrees and applying no `!=` exemption. `unboundPositiveReads`, 80 lines later, deliberately excludes exactly those cases:

```ts
// gate-liveness.ts:99-103
case 'cmp':
  if (ast.op !== '!=') paths.add(ast.path);
  return;
case 'not':
  return; // negation is satisfied by absence
```

with the reasoning stated at lines 83-85: "`x != true` and `notExists x` hold on a missing variable, which is how this corpus spells 'not in that mode'."

Both statements cannot be right. And the inconsistency is not symmetric across dialects: `collectConditionPaths` (lines 30-51) *does* separate presence operators into `presencePaths`, and line 190 iterates `valuePaths` only — so the tree spelling `notExists x` on a missing `x` reaches real evaluation and is answered `true`, while the string spelling `x != true` on a missing `x` returns `reason: 'unbound'` and no answer.

Two spellings of one intent, opposite delivery outcomes. Corpus exposure: **54 of 281 `when` gates are purely negative** (16 distinct forms — `is_review_mode != true`, `stealth_mode != true`, `!worker_agent_id`, and a three-clause conjunction of `!=` tests). Every one is denied eager bundling on a path where its tree equivalent would be answered.

The fix is small and local: route `!=` comparisons and `not` subtrees into `presencePaths` in `collectWhenPaths`, exactly as `collectConditionPaths` already routes `exists`/`notExists`. Both functions then agree, and the string dialect stops being penalised for spelling a negative.

**B3 — Set iteration order decides which `pending` path is reported.** `valuePaths` and `presencePaths` are `Set`s; the loops early-return on first match. Which specific path triggered the verdict depends on AST traversal order. Harmless today because the verdict carries no path (L2) — but it becomes a nondeterministic-message bug the moment L2 is fixed by attaching the path.

### C) Edge cases in composition

**C1 — Decimal literals do not parse.** The number branch (when-expression.ts:122-133) consumes an optional `-` then `/\d/` only. On `x > 1.5`, `1` tokenizes, then `.` matches no branch — not the operator branches, not `/[-\d]/`, not `/[A-Za-z_]/` — and tokenize returns `unexpected character '.' at 6`. The gate then fails closed to `false`, and at four of six positions no guard reports it.

The tree dialect has no such limit: `SimpleConditionSchema.value` accepts `z.number()`, and YAML parses `1.5` as a float. **So `x > 1.5` is expressible as a tree and inexpressible as a string** — one more asymmetry, and one no one has hit because ordering comparators are rare (7 `>` leaves across all condition trees).

**C2 — Identifier tokenization admits malformed dotted paths.** Line 136 consumes `/[A-Za-z0-9_.]/` with no structure: `a..b`, `a.`, and `a.b.` are all single valid `id` tokens. `getVar` then splits on `.` and looks up empty-string segments, returning `undefined` — a silent false rather than a parse error. The bag-name grammar used elsewhere (`^[a-z_][a-z0-9_]*(\.[a-z0-9_]+)*$`) is stricter than the tokenizer and is not applied here.

**C3 — An empty `when` disables a step, and the guard skips it by construction.** `check-when-expression.ts` opens `checkStep` with:

```ts
if (typeof when !== 'string' || !when.trim()) return;
```

so `when: ""` is explicitly not checked. At runtime `parseWhen('')` returns `{ ok: false, error: 'empty expression' }` (line 156), so `evaluateWhenExpression` returns **false** and the step never runs; `gateAnswer` reports `reason: 'unparsed'`. An empty string is thus a silent step-disable that the corpus guard is written to ignore. `z.string()` admits it, and no `.min(1)` is present on the field.

**C4 — Triplicated dotted-path resolution.** Three byte-identical implementations:

| Function | File | Lines |
|---|---|---|
| `getVar` | `src/schema/when-expression.ts` | 287-294 |
| `getVariableValue` | `src/schema/condition.schema.ts` | 41-49 |
| `readPath` | `src/utils/gate-liveness.ts` | 54-61 |

`gate-liveness.ts:53` concedes the duplication in its own doc comment: "Resolve a dotted bag path, **mirroring both reference evaluators' lookup**."

All three walk `path.split('.')`, guard on `null`/`undefined`/non-object, and index. All three therefore support array indexing by numeric segment (`items.0.name`) as an undocumented accident of `(obj as Record<string, unknown>)[part]` on an array. Any change to path semantics — array indexing, optional chaining, a stricter name grammar — must land in three places, and the two evaluators live in `src/schema/` while the third lives in `src/utils/`, so no single import would naturally catch all three.

---

## Answering the two architecture questions

### Should `when` lower into `Condition`, or stay parallel?

**Neither, as posed — because the lowering does not typecheck in either direction.** The two dialects are not in a subset relation:

| Capability | `when` | `Condition` |
|---|---|---|
| bare-identifier truthiness | yes (line 241) | **no operator exists** (enum, condition.schema.ts:3-5) |
| `exists` / `notExists` | **no form exists** | yes |
| decimal literals | **no** (C1) | yes |
| variable-to-variable comparison | no (B1) | no (`value` is a literal union) |
| n-ary `and`/`or` | binary, left-assoc | n-ary, `.min(2)` |
| numeric coercion | `Number()` | `toNumber()` — diverges |

Lowering `when` into `Condition` requires adding a truthiness node to `Condition` and reconciling coercion. Raising `Condition` into `when` requires adding presence operators to `when` — which invalidates the stated precondition of `check-variable-model.ts`. Each direction is a real change to the target language, not a mechanical projection.

What the code actually recommends is a third option the question does not offer: **converge the semantics, keep the surfaces.** Extract one `coerceForOrdering()` and one `resolvePath()` used by both evaluators — this alone eliminates C4's triplication and the coercion divergence, and it is a pure refactor with no schema, protocol, or corpus change. Then decide the surface question separately, on authoring grounds, having removed the semantic risk from it.

### Where does the parse boundary belong?

The question presumes the boundary is unsettled. It is not — **the server already parses and evaluates both dialects**, at gate-liveness.ts:179 and 194-195, on every delivery. The documentation says it does not (activity.schema.ts:75), and that mistaken belief is visible in the code as the two-to-four redundant parses per gate that nobody optimized.

Consequences for the target grammar:

1. **A dialect change is a server-side change today**, whether or not anyone intends it to be. Any new operator must be implemented in `when-expression.ts` before delivery can answer a gate that uses it; until then every such gate yields `reason: 'unparsed'` and its step silently stays lazy. That is the real cost of new syntax, and it is not mentioned in the schema.
2. **The parse boundary should be made explicit and moved up**, not sideways: `gateAnswer` should take a pre-parsed AST, and the AST should be produced once at load. This removes the redundant parses, gives `assertWhenAuthoring` a non-dead implementation, and — critically — creates the single place where an unknown operator can be reported as a definition error instead of silently becoming `unparsed`.
3. **The published contract needs correcting either way.** "The server never evaluates gates" is false as written; the true statement is "the server evaluates gates only to decide delivery, never to drive control flow." The distinction is what tells a reader whether cross-dialect divergence can affect the server, and the answer is yes.

---

## Findings summary

| # | Finding | Location |
|---|---|---|
| D1 | The server does evaluate both dialects; the published contract says it never does | gate-liveness.ts:194-195 vs activity.schema.ts:75 |
| D2 | Every gate is parsed 2-4× per delivery; no AST is cached though `parseWhen` and `WhenAst` are exported | gate-liveness.ts:179 + 194; when-expression.ts:334 |
| D3 | `assertWhenAuthoring` tokenizes twice; the second failure branch is unreachable | when-expression.ts:349-351 |
| D4 | The `&&` combination masks cross-dialect disagreement at the only site that could observe it | gate-liveness.ts:196 |
| D5 | An unparseable expression reads no variables, silently shrinking the activity variable contract | when-expression.ts:262-264 → activity-variables.ts:206 |
| D6 | `unbound` verdicts discard the variable name that the same file's other function returns | gate-liveness.ts:190-192 vs 86-131 |
| D7 | `collectWhenPaths` and `unboundPositiveReads` contradict each other on negatives; the tree spelling is privileged over the string spelling | gate-liveness.ts:10-27 vs 92-108; 54 corpus gates affected |
| D8 | Neither dialect can compare two bag variables; a bare RHS word is silently a string literal | when-expression.ts:235-238; condition.schema.ts:19 |
| D9 | Decimal literals parse as a tree and fail as a string | when-expression.ts:122-133 |
| D10 | `when: ""` silently disables a step and the guard is written to skip it | check-when-expression.ts `checkStep`; when-expression.ts:156 |
| D11 | Dotted-path resolution is triplicated, with the duplication acknowledged in a comment | when-expression.ts:287, condition.schema.ts:41, gate-liveness.ts:54 |
| D12 | Malformed dotted paths tokenize as valid identifiers and resolve to `undefined` | when-expression.ts:136 |

---

*Lens: deep-scan (12). Dimension: Architecture. Source revision: `origin/main` b061faee. Code-only pass; corpus counts cited solely to size blast radius.*
