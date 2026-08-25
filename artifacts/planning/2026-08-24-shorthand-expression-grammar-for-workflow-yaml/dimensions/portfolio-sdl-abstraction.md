# Portfolio lens — sdl-abstraction (15) · Architecture

**Target:** `src/schema/` (Zod), `schemas/*.json` (generated), `grammar/*.ebnf`, `constraints/*.als`, `src/loaders/` — read from `origin/main` `b061faee`; corpus from working tree.
**Question the lens asks:** what leaks across the claimed four-way single source of truth, and whether the settled grammar is expressible in EBNF and constrainable in Alloy at all.

---

## Step 1 — Name the abstraction layers

Six layers stand between a YAML file and a formal statement of what it means.

| # | Layer | Claims to hide | Actually exposes |
|---|---|---|---|
| L1 | YAML definition file | — | the authored surface, including loader sugar |
| L2 | Loaders (`src/loaders/`, ~110 KB across 8 modules) | file layout, fragment splicing, reference resolution | nothing to any schema — its transformations are invisible below |
| L3 | Zod (`src/schema/`) | validation | the **post-loader assembled object** |
| L4 | Generated JSON Schema (`schemas/*.json`) | validation for external consumers | the post-loader shape, **published for pre-loader files** |
| L5 | EBNF (`grammar/*.ebnf`) | the concrete syntax | a design superseded on 2026-02-10 |
| L6 | Alloy (`constraints/*.als`) | the semantic invariants | the same superseded design |

### The four-way single source of truth does not hold at the first hop

The claim is that Zod is the source, JSON Schema is generated from it, and EBNF and Alloy formalize the same language. The generation arrow is real — `scripts/generate-schemas.ts` runs `zodToJsonSchema` over five schemas. The *equivalence* is not, and the schema file says so itself:

```ts
// workflow.schema.ts:79-84
// JSON Schema validates individual definition files where activities are separate files.
// Zod validates the full assembled runtime workflow object, so activities are included here.
// The shorthand string references are resolved into fully typed Activity objects during load,
// but we allow strings in the intermediate raw schema before transformation.
// However, the final Workflow type expects Activity[] to avoid type errors across the codebase.
activities: z.array(ActivitySchema).min(1).optional()
```

Two different documents, one schema. Zod describes the assembled runtime object; the JSON Schema generated from it is published for definition files, which have a different shape. The comment names the intended union ("we allow strings in the intermediate raw schema") — and the declared type contains no string variant, so the union does not reach the generated artifact.

**Demonstrated.** `workflows/remediate-vuln/workflow.yaml:208-212` is a live definition file listing activities as strings:

```yaml
activities:
  - 01-start.yaml
  - work-package/02-design-philosophy.yaml
  - work-package/03-requirements-elicitation.yaml
```

The published `schemas/workflow.schema.json` says of those items:

```
activities.type: array | items.type: object | items.required: ['id', 'version', 'name']
```

The JSON Schema **rejects a valid, live definition file**. This is not a latent risk: the corpus carries 16 references to `schemas/workflow.schema.json`, so files point at a schema that cannot validate the form some of them use.

**Asymmetric concealment, precisely:** the abstraction is complete for the *runtime* caller (the server, which only ever sees assembled objects) and leaks for the *authoring* caller (an editor, a contributor, any external consumer), who is handed a schema for a document they never write.

### What crosses each boundary, in each direction

**L2 → L3, downward: nothing.** Zod runs after the loader, so every loader transformation is invisible to it by construction. Four pieces of sugar exist only at L2:

1. **Activity-group technique shorthand.** `composeActivityTechnique` (technique-loader.ts:631-644) resolves a bare op id against `<activity-id>::<op>` **first**, falling back to as-authored. To Zod this is `technique: z.string()`.
2. **Rule-fragment splicing.** `{ ref }` entries in `rules` resolve at load; workflow.schema.ts:22-23 notes "delivered rules are always plain strings".
3. **Checkpoint-fragment refs.** A `kind: checkpoint` step carries `ref` instead of a body.
4. **String activity references**, above.

**L3 → L4, upward: prose.** The single channel that carries semantics from Zod into the generated artifact is `.describe()`, and it carries English. The entire `when` grammar crosses this way, arriving in `activity.schema.json:362-364` as:

```json
"when": { "type": "string",
          "description": "Inline boolean expression that gates this step. Operators: ==, !=, >, <, >=, <=, bare identifier truthiness, unary !, &&, ||, and parentheses. Precedence (C-style, tightest first): () > ! > comparisons > && > || …" }
```

A JSON Schema validator reads `"type": "string"` and ignores the rest. Every rule about the dialect is decoration.

**L4 → L5/L6: nothing at all.** No generator, no guard, no test. `grammar/activity.ebnf` (129 lines) and `constraints/activity.als` (279 lines) are hand-written, both stamped 3.0.0 / 2026-02-10, and both specify `decisions:`, `flows:` and `skill:` bindings that the current schema does not have. They are downstream of nothing and checked by nothing; the 31-guard registry in `scripts/guards.ts` names neither directory.

So of four claimed sources of truth, one is authoritative (Zod), one is generated-then-misapplied (JSON Schema), and two are authoritative for nothing.

---

## Step 2 — Abstraction inversions

### I1 — `action:` is a mode string that selects the grammar of its sibling

`ActionSchema` (activity.schema.ts:26-33) declares:

```ts
action: z.enum(['log', 'validate', 'set', 'emit', 'message']),
target: z.string().optional(),
```

`target` has no `.describe()` at all — it reaches `activity.schema.json` as bare `{"type": "string"}`. Its grammar is chosen by the value of a **sibling key**:

- under `action: set` — a variable name (84 entries, 53 distinct)
- under `action: validate` — a boolean predicate (38 entries, 37 distinct)

This is the textbook inversion: the caller supplies a mode string that selects an internal interpretation, and the interface reveals none of it. Worse, the two grammars are not distinguishable by inspection — **all 53 set-sense values also parse as valid `when` expressions**, as bare-identifier truthiness. A reader holding only the value cannot recover the grammar; a reader holding only the schema cannot learn that there are two.

The naming compounds it. `target` is also an entry in `EXEMPT_DATA_IDS` (identifiers.ts), exempted from the qualified-noun-phrase rule under reason (b′), "cross-workflow dispatch-contract names — the `passContext` handoff owns the spelling." So one token carries three roles: an exempt bare-word *variable name*, an action key holding a *variable name*, and an action key holding a *predicate*. The exemption list and the action schema are in different modules and neither cites the other.

### I2 — `condition` returns different power depending on the step kind it sits on

`stepCommonFields` (activity.schema.ts:73-79) puts `when` and `condition` on every step kind uniformly. Their powers are not uniform:

- On a `kind: checkpoint` step, `condition` is what enables dismissal via `respond_checkpoint condition_not_met`. `when` does not.
- Everywhere else, `condition` is LEGACY and `when` is preferred.

The same field name means "a gate" at four positions and "a gate **plus** a dismissal capability" at one. A caller must know the step kind to know what the field does. The schema encodes the field identically in all five cases; the distinction lives entirely in the `.describe()` prose of a *different* field (`when`'s, at line 75: "On a checkpoint step, only `condition` (not `when`) enables condition_not_met dismissal").

Nothing enforces it. A checkpoint step with a `when` and no `condition` validates, loads, runs, and is silently non-dismissible. No guard in the 31-guard registry names this.

### I3 — Filesystem state decides what a bare technique reference means

```ts
// technique-loader.ts:631-644
if (!techniqueRef.includes('::') && activityId) {
  const viaGroup = await composeTechniqueWithSource(`${activityId}::${techniqueRef}`, …);
  if (viaGroup.success) return ok({ techniqueId: `${activityId}::${techniqueRef}`, … });
}
const composed = await composeTechniqueWithSource(techniqueRef, …);
```

Try-and-fallback. The resolved meaning of `technique: analyze` depends on whether a file exists at `<workflow>/techniques/<activity-id>/analyze.md`. **Adding a file silently re-targets every bare reference of that name in that activity**, with no diff to the referring YAML and no error. The interface (`technique: z.string()`) exposes none of this, and the resolution order — activity group first, as-authored second — is documented only in the loader's own doc comment.

This is the precedent most at risk of being copied into a predicate shorthand, because it is the corpus's most visible piece of terseness (427 bare-string technique bindings against 211 structured ones). It is safe today only because op names are unique enough in practice.

### I4 — `artifactPrefix` is a field the schema admits and the loader forbids

```ts
artifactPrefix: z.string().optional().describe('… Server-computed — do not set in definition files.')
```

The prohibition is in prose. The generated JSON Schema publishes `artifactPrefix` as an ordinary optional string property, so any editor validating a definition file will accept it. The corpus honours the rule — the 7 corpus mentions are all in markdown technique prose, none is a YAML field — but the honouring is by convention, not by type.

---

## Step 3 — Abstraction leak bugs

### B1 — The grammar is duplicated across layers with no shared contract

The `when` dialect is stated in five places, none of which is generated from another:

| Statement | Location | Authoritative? |
|---|---|---|
| the implementation | `when-expression.ts` tokenizer + parser | yes, de facto |
| the doc-comment grammar | `when-expression.ts:4-18` (an EBNF-ish sketch) | no |
| the field description | `activity.schema.ts:75` | published as authoritative |
| the exit field description | `activity.schema.ts:254` — "in the `when` dialect the step gates use" | by reference |
| the generated JSON Schema | `activity.schema.json:362-364` | published, unversioned |

Any change must land in four hand-maintained places. There is **no drift check**: `generate-schemas.ts` has no `--check` mode, `package.json` has `build:schemas` and no `check:schemas`, and no guard covers it. The doc-comment grammar at when-expression.ts:4-18 is already incomplete relative to the implementation — it omits that a bare word on the right of a comparison becomes a string literal (line 236), and it does not state that decimal literals are unsupported.

### B2 — Callers depend on collection ordering the interface does not promise

`gateAnswer` (gate-liveness.ts:185-192) iterates `Set`s and early-returns on first match:

```ts
for (const path of [...valuePaths, ...presencePaths]) {
  if (writtenInActivity.has(rootOf(path))) return { answer: undefined, reason: 'pending' };
}
```

Set iteration order is insertion order, and insertion order is AST traversal order, which is a function of how the author wrote the expression. The two-loop structure makes the `pending`-over-`unbound` priority deterministic — which is correct — but *which* path produced the verdict is not. Harmless while the verdict carries no path; a nondeterministic-message bug the moment one is added.

### B3 — Magic strings duplicated across layers with no shared definition

- `'__terminal__'` (TERMINAL_SENTINEL) is described in `GraphSchema`'s doc comment (workflow.schema.ts:57-60) as the destination that ends a run. `GraphSchema` itself is `z.record(z.record(z.string()))` — the sentinel is not in the type, so nothing prevents an activity literally named `__terminal__`, and nothing validates that a non-sentinel destination names a real activity at the type level.
- The bag-name grammar `^[a-z_][a-z0-9_]*(\.[a-z0-9_]+)*$` appears in the `variable-binding` technique's prose as the rename/literal disambiguator. `QUALIFIED_DATA_ID_PATTERN` in identifiers.ts is `^[a-z][a-z0-9]*(_[a-z0-9]+)+$` — a *different* pattern for a related purpose. The `when` tokenizer accepts a third, looser shape: `/[A-Za-z0-9_.]/` with no structure, so `a..b` and `a.` tokenize as valid identifiers (when-expression.ts:136). Three name grammars, three modules, no shared constant.

### B4 — Behaviours documented in comments, invisible to the compiler and to every caller

Ranked by consequence:

1. "the server never evaluates gates" (activity.schema.ts:75) — **false**; `gate-liveness.ts:194-195` evaluates both dialects. Published to every agent and every external schema consumer.
2. "an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say" (workflow.schema.ts:78) — the borrowability invariant, protected only by the accident that `z.record(z.string())` cannot hold an object. No test asserts it.
3. "Only structured conditions are walked; the `when:` string dialect has no exists-shaped predicate" (check-variable-model.ts:21-22) — a guard's correctness precondition, held in a comment, invalidated by the presence form this run is considering.
4. "Do not gate a defaulted variable with exists/notExists" (variable.schema.ts:15) — this one *is* enforced, by `check-variable-model`. The exception that shows the pattern is a choice.

---

## Is the settled grammar expressible in EBNF and constrainable in Alloy?

### EBNF: yes, and more than is currently there

The parenthesization rule — today an imperative scan in `assertWhenAuthoring` (when-expression.ts:344-368) applied at one of six positions — is context-free and belongs in the grammar:

```ebnf
when-expr  = and-chain | or-chain | unary ;
and-chain  = unary , ( "&&" , unary )+ ;
or-chain   = unary , ( "||" , unary )+ ;
unary      = "!" , unary | primary ;
primary    = comparison | path | "(" , when-expr , ")" ;
comparison = path , cmp-op , literal ;
```

A top-level `&&` chain cannot contain a top-level `||` by construction, so the rule is enforced wherever the language is parsed rather than wherever a walker remembers to look. This directly closes the demonstrated `exits[].when` gap, because the gap is a property of the walker, not of the grammar.

What EBNF **cannot** carry, and must not be asked to:

- The `target` dual grammar (I1) — a production for a YAML key cannot be indexed on a sibling key's value. This is a schema-shape problem, and the honest EBNF answer is to specify two distinct keys.
- The rename/literal disambiguation, which is resolved against runtime bag contents.
- The activity-group resolution order (I3), which depends on filesystem state.

Each of those is a signal that the construct is under-specified at the schema level, not that EBNF is inadequate.

### Alloy: yes, and it is the only layer that can state the things currently held in comments

The invariants at B4 are exactly Alloy's register. `constraints/workflow.als` — which does not exist — is the natural and only home for:

```alloy
// the borrowability invariant, currently a doc comment
fact EdgesCarryNoPredicate { all e: Edge | no e.guard }
fact ExitPredicatesBelongToTheActivity {
  all a: Activity, w: Workflow | a in w.activities implies a.exitPredicates in a.owns
}

// the checkpoint dismissal power, currently prose in a different field's description
fact DismissibleCheckpointsCarryCondition {
  all c: CheckpointStep | c.dismissible implies some c.condition
}

// cross-dialect agreement — the property no runtime can observe
assert DialectsAgreeOnCommonFragment {
  all e: Expr, b: Bag |
    inCommonFragment[e] implies evalString[e, b] = evalTree[lower[e], b]
}
```

The last one is the highest-value statement available anywhere in this analysis, because it is the one property that **no test could establish**: the server evaluates both dialects only at `gate-liveness.ts:196`, where it and-combines them, and the `&&` destroys the comparison. A model checker is the only instrument that sees both.

Defining `inCommonFragment` also forces the fragment to be named — and naming it forces the admission that `when` has truthiness `Condition` lacks and `Condition` has presence `when` lacks, so the common fragment is a proper subset of both.

**The caveat that decides whether any of this is worth writing:** Alloy fails a build only if the Analyzer is wired into CI. It is not, today, and `activity.als` has consequently described a superseded design for six months. Specifying `constraints/workflow.als` without also specifying how it is checked reproduces exactly that failure one level up. **The specification this run produces should name the checking mechanism as part of the deliverable, not as a follow-up.**

---

## The leak law

**The widest blast radius belongs to the `.describe()` boundary — the only channel that carries semantics from the type system into the published artifact, and it carries prose.**

A rule placed in a `.describe()` string is simultaneously:

- **invisible to the compiler** — no `tsc` error, no Zod failure, no test;
- **published as authoritative** — it is the text every external consumer of `schemas/*.json` reads, and the text every agent receives in `get_activity`;
- **unversioned and undrift-checked** — no `check:schemas` exists, so the committed JSON Schema can disagree with the Zod it was generated from indefinitely.

The `when` grammar lives there in its entirety. So does the false claim that the server never evaluates gates. So does the borrowability rationale, the checkpoint-dismissal rule, and the `artifactPrefix` prohibition.

Counting callers broken by a single internal change: modify the `when` dialect and you invalidate the description in `activity.schema.ts:75`, its by-reference restatement at `activity.schema.ts:254`, the doc-comment grammar at `when-expression.ts:4-18`, the committed `activity.schema.json`, every editor validating against it, every agent that received the old text in a delivered bundle, and both formal artifacts — while `tsc`, Zod, and 30 of 31 guards stay green. The one guard that would notice covers one of six positions.

**The corrective the four artifacts offer is not documentation. It is moving rules out of column three — prose that cannot fail — into a column that can.** That is the strongest architectural argument for the run's deliverable, and it is also the test that deliverable should be held to: for every rule the settled grammar states, name the artifact that fails when it is violated.

---

## Findings summary

| # | Finding | Evidence |
|---|---|---|
| A1 | Zod validates assembled objects; the JSON Schema generated from it is published for definition files — different documents | workflow.schema.ts:79-84 |
| A2 | The published JSON Schema rejects a live definition file | `remediate-vuln/workflow.yaml:208-212` strings vs `items.required: ['id','version','name']`; 16 corpus references to that schema |
| A3 | Four loader-level sugars are invisible to both schemas | technique-loader.ts:631-644; fragment splicing; string activity refs |
| A4 | `action:` is a mode string selecting the grammar of `target`, whose two value sets overlap completely | activity.schema.ts:26-33; 53/53 set-sense values parse as predicates |
| A5 | `target` carries three roles across two modules that do not cite each other | identifiers.ts `EXEMPT_DATA_IDS`; ActionSchema |
| A6 | `condition` has a different power on checkpoints than elsewhere, enforced by nothing | activity.schema.ts:75, :77; no guard in the 31-guard registry |
| A7 | A bare technique reference's meaning depends on filesystem state; adding a file re-targets it silently | technique-loader.ts:631-644; 427 bare-string bindings |
| A8 | The grammar is stated in 5 unlinked places with no drift check | §B1; `generate-schemas.ts` has no `--check` |
| A9 | Three different name grammars across three modules, no shared constant | variable-binding prose; identifiers.ts; when-expression.ts:136 |
| A10 | EBNF can carry the parenthesization rule; it cannot carry `target`'s sibling-indexed grammar | §EBNF |
| A11 | Alloy is the only layer that can state cross-dialect agreement — and is checked by nothing today | §Alloy; gate-liveness.ts:196 |

---

*Lens: sdl-abstraction (15). Dimension: Architecture. Source revision: `origin/main` b061faee; `workflows/` from working tree. Schema-rejection claim verified by inspecting the generated schema against a live definition file.*
