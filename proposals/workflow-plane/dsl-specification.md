# Score — The Workflow Plane TypeScript Authoring DSL

**Version:** 0.1
**Status:** Draft
**Date:** 2026-06-12
**Sources:** Workflow Plane design specification (`.engineering/proposals/workflow-plane/design-specification.md`, v0.4) · legacy Orchestra specification (`docs/orchestra-specification.md`, v1.0.0) · technique protocol specification (`docs/technique-protocol-specification.md`).

---

## 1. Header, status, and naming

### 1.1 What this document is

This is the normative language-design specification for **Score**, the TypeScript authoring surface of the Workflow Plane. It plays the same role for the TS surface that the Orchestra specification plays for the legacy activity language: it defines the authoring constructs, the validation rules with severities, the formal grammar of the compilation target, and the semantic constraints — and it does so in three mutually consistent layers (locked decision 3):

- **L1** — the normative TypeScript declarations (`.d.ts`) for the authoring surface (§3) and the generated technique contracts (§4).
- **L2** — an EBNF grammar over the canonical JSON serialization of the intermediate representation (§6).
- **L3** — an Alloy module expressing semantic constraints over the IR (§7).

Every construct in §3 lowers to a production in §6; every production in §6 has a corresponding signature in §7 (over constraint-relevant structure — §7.1 enumerates the deliberately abstracted metadata fields); every retained validation rule has an Alloy fact or predicate **or** is explicitly listed validator-only in §7.1's closing note (rules needing cross-file, lexical, or dangling-reference context the resolved-ref model cannot exhibit). §7.2 carries the cross-reference table that demonstrates this closure.

### 1.2 The name

**Proposal: "Score".** Orchestra is the surface-independent semantic model — the meaning of workflows, activities, techniques, and their constraint families, independent of concrete syntax (design spec §5.2). An orchestra plays from a *score*: the score is the authored, notated plan; the performance is the execution. The TypeScript artifact is the score; the canonical IR is the engraved, immutable edition the runtime performs from; the legacy TOON corpus is an earlier edition of the same music. The name keeps the system's one metaphor coherent and gives the package family obvious slots: `@workflow-plane/score` (authoring surface), `score-compile` (pipeline), `score://` (diagnostics namespace prefix is *not* used — rule IDs are bare, §5.5).

*Alternative considered:* **"Chart"** (jazz ensembles improvise from charts — apt for the agent-improvises-within-structure model). Rejected as the primary because "chart" collides with data-visualization vocabulary in every codebase that will host this DSL, and because the improvisational connotation undersells the determinism guarantee (P2): a score is played as written.

Throughout this document, "Score" names the authoring surface; "Orchestra" names the semantic model; "wp-ir" names the IR layer; "the compiler" names the `score-compile` pipeline (§5).

### 1.3 Locked decisions honored

1. **Executed builder.** The `.ts` artifact runs **once** at compile time inside a deterministic sandbox (no IO, no wall clock, no random source, no ambient nondeterminism). Constructor calls build a plain value graph; the compiler lowers it to canonical IR. The runtime executes IR only; the model never interprets TypeScript at execution time (§5.1, DET rules).
2. **Techniques stay markdown** (Capability / Inputs / Outputs / Protocol / Rules; `::` addressing; current-workflow-then-meta resolution; Initial/Final ancestor wrapping; snake_case symbol ids; kebab-case names) and gain **generated** TypeScript contract declarations so `tsc` type-checks step bindings end-to-end (§4).
3. **Tri-layer formal definition** as in §1.1.

### 1.4 Provenance of this draft

Synthesized from three candidate designs (A: maximal static safety; B: maximal agent writability; C: maximal migration fidelity) under three judge reviews (parity lens, type-feasibility lens, agent-ergonomics lens). Where judges conflicted, the resolution and its rationale are recorded in §2.5. All nine critical issues raised across the verdicts are addressed explicitly; §2.6 indexes them.

---

## 2. Design rationale and topology

### 2.1 Tenets

1. **Declarative pure values.** Every constructor is a pure function returning a frozen, tagged, plain-data value. Constructors **eagerly deep-copy their arguments at call time** into frozen, null-prototype plain values — post-call mutation of an argument, accessor properties, and Proxy handlers are all neutralized at the call boundary (see DET-003). There is no ambient registration, no mutable builder state, no fluent chaining, no side-effecting callbacks-that-register. The artifact's default export *is* the definition. (Adopted from design B; C's imperative `(wf) => void` builder style rejected — order-sensitive hidden state, poor diffability, heavier determinism proof.)
2. **The body reads as the execution order.** An activity's `run:` array is the legacy `main` flow. A reviewer reads the diff top-to-bottom as a checklist; nothing requires jumping to a separate `flows:` section.
3. **One canonical spelling per concept, plus a fenced migration tier.** The core vocabulary is small (R-X-4, LLM first-try writability). Constructs that exist only because the legacy corpus can express them — `route()`, `whileLoop()`/`doWhile()`, `block()`, `byId.*`, `passThrough()`, raw `NN.step.symbol` strings — are first-class and fully specified, but emit MIG-001 (WARN) outside the `--parity` diagnostic profile. The surface is therefore *complete* over both legacy lineages (a hard requirement for transpile-once, §9.3) without taxing new authoring.
4. **Types check the name algebra; compile passes check semantics.** `tsc` proves what string-literal inference proves reliably: technique addresses, bind-key membership (fresh object literals), checkpoint auto-advance coupling. Everything requiring scope-chain analysis, transitive closure, or cross-file resolution is a severity-graded compile pass with a rule ID. No *bespoke* type-level machinery whose failure mode is `not assignable to never` (rejected from design A: `ERR_DEC002` conditional return types, `ExhaustiveOrDefault`, `KebabCaseId` in parameter position, terminal-tail tuple typing). Scope note: discriminated-union option types (CheckpointOpts) still surface coupling violations as `not assignable to type 'undefined'` on the offending property — that residue is accepted; the union arms carry JSDoc explaining the coupling so hover context states the rule (§3.7), and the compile stage re-checks the coupling with a named rule.
5. **Symbols are bytes.** Symbol ids bind to runtime variables by exact string match. Score never renames a symbol — not in the transpiler, not in the generator, not in canonicalization. AP-60 snake_case is enforced for newly authored symbols only (ID-002, profile-gated); symbols originating in technique contracts are spelled verbatim as the markdown spells them. The kebab→snake corpus rename, if ever performed, is a separate, audited, simultaneous DSL + technique-markdown migration (§11, OQ-S2).
6. **Stable, author-controlled ids.** Every trace-visible node takes an explicit id as its first argument, preserved verbatim into IR `NodeId`s, manifests, and trace events (R-PAR-3). Value reuse at N sites lowers to one node + N references, exactly the legacy declare-once/reference-many graph.
7. **Determinism by sandbox, verified twice.** The compiler executes the artifact in a sealed realm, walks the result for surviving closures, runs it a second time, and byte-compares the canonical IR (§5.1).
8. **Markdown is the only contract truth.** The generated registry's contract *data* is types only (the module's sole runtime statements are the constructor destructure and the digest const, §4.2/§4.5); the compiler re-derives contracts from technique markdown for every semantic pass and treats the `.gen` module as a typed mirror gated by a corpus digest (CTR-001).

### 2.2 What changed from legacy, and why

| Legacy construct | Score disposition | Why |
|---|---|---|
| `flows:` section + by-name `- flow:` refs | **Dissolved** into the `run:` array, host `const` fragments, and value reuse; **`block(id, …)`** retained (migration tier) so legacy flow ids survive into IR `Block` ids | FLOW-001/003 and LOOP-001 become unrepresentable for values; FLOW-002 keeps exact WARN parity over declared blocks; round-trip and trace tooling keep flow identity |
| `main` flow | `run:` required property | FLOW-001 discharged by the type system |
| Structurally discriminated decision (`message:`/`variable:`/`condition:`) | **Split constructors**: `ask()`, `match()`, `ifElse()` | DEC-003/DEC-004 unrepresentable; three obvious names beat one constructor with a mode discriminant |
| `default:` magic branch key | `otherwise:` option on `match` | any literal case value (including `"default"`) becomes expressible; one fewer magic string |
| `- flow: continue` | empty branch `[]`; `passThrough()` (migration tier) preserves authored intent under transpile | SPEC:292 declares them functionally equivalent |
| `skill:` field | `technique:` property | OQ-4 resolved at the surface; the TOON reader maps `skill:` to the same IR slot (`technique_ref`); parity is parity of IR and semantics (R-PAR-2) |
| Implicit name-coupled bindings | **Kept as the default**, plus optional `bind:` map | Legacy steps author no wiring; mandatory bindings (design A) would force the transpiler to fabricate IR content legacy never authored, and pre-composed workflow-root contracts (six required inputs in `work-package`'s root `TECHNIQUE.md`) make required binding keys ergonomically unusable. PROV-001 stays a compile pass |
| `technique_args` | `bind:` with literal values when the key is a contract input (lowers to the `technique_args` IR slot); migration-tier `args:` passthrough for keys that are **not** contract inputs (free-form deviation map, BIND-005 WARN) | one wiring concept for contract-conformant keys; TOON `technique_args` is a free-form record, so an untyped escape is required for transpile-once; canonical-rename-over-args policy preserved as BIND-003 WARN |
| String boolean algebra; structured `condition`; inline `when` strings | **Expression builders** (`eq/ne/gt/lt/gte/lte/exists/notExists/and/or/not`) | one typed expression surface lowering to IR `BoolExpr`/Guard; the three string grammars survive only in the TOON reader |
| `- break` | `breakLoop()` dynamic-innermost sentinel **and** loop-bound `it.break` token | the sentinel is mandatory: a shared fragment containing a break may be reachable from two loops (legal under LOOP-002, innermost resolved at runtime); the token is the new-authoring idiom that discharges LOOP-002 by construction |
| `- loop: <id>` re-entry | `rerun(id)` token; `it.restart` inside the owning loop | value composition cannot express the cycle |
| `- decision: <self>` retry | `retry(decisionId)` token, legal in branches of **all three** decision kinds | while-like behavior is exclusively decision self-reference (SPEC:231); restricting retry to interactive decisions (design A) leaves grammar-legal programmatic self-retry unrepresentable |
| Forward / mutual decision references | `byId.decision(id)` etc. (migration tier), resolved at compile | grammar-legal legacy shapes; without an escape, transpile-once is permanently foreclosed |
| `- activity:` terminal | `goTo(activityId)` | unchanged layered-terminal semantics (TERM-001) |
| implicit end / TOON terminal route branch | `end()` explicit `Terminate` constructor | R-IR-2 row 9 demands an authoring form |
| TOON automated `decisions[]` (branch id/label/transitionTo/isDefault) | `route()` constructor (migration tier) | branch id and label feed `state.schema` `decisionOutcomes.branchId` and traces; dissolving into `match`+`goTo` is lossy |
| TOON `while`/`doWhile`/`breakCondition`/`activities[]` loop bodies | `whileLoop()`/`doWhile()` (migration tier); `breakWhen?:` on all loops; `{ activities: […] }` body form | `activity.schema.json` constructs the DSL must express if it is ever the sole surviving source |
| Step-level `checkpoint`/`required`/`actions`/`triggers` | kept, full option set on `step()` | same reason; `checkpoint:` lowers to a preceding inline Checkpoint node (one IR mechanism) |
| Qualified `NN.step.symbol` strings | `outputOf(activityId, stepId, symbol)` is the **primary**, activity-identity-anchored form, lowered to the ordinal form at compile; raw qualified strings remain a parity escape (shape-typed) | ordinal-anchored strings are refactor-fragile: inserting an activity renumbers `NN` and the existence check (ID-006) cannot catch a coincidental re-resolution |
| `executionModel` | **first-class and required** at the workflow level | resolves the schema/README drift; Phase-2 role substantiation keys off it (R-GOV-2); the reader synthesizes the **pinned** default single-`agent` role literal (§9.1) with a WARN for the live corpus |
| `artifactPrefix` | excluded from authoring; recomputed from the activity ordinal at compile | server-computed/readOnly today |
| Checkpoint `blocking`/`defaultOption`/`autoAdvanceMs` coupling | discriminated-union options type on a single `checkpoint()` constructor: `autoAdvanceMs` requires `blocking:false` **and** `defaultOption` (CKPT-002 unrepresentable); `blocking:false` *without* `defaultOption` stays representable (corpus-legal: `prism-update/05-verify`); `defaultOption`/`autoAdvanceMs` on a blocking checkpoint is unrepresentable at the surface and **normalized with CKPT-006 WARN** by the reader/transpiler | CKPT-002 unrepresentable while keeping one constructor name; the schema marks the fields optional and independent, so the union must not narrow legal corpus shapes (P10) |
| Workflow metadata (`variables`, `modes`, `artifactLocations`, `initialActivity`, `rules`, `techniques`) | kept, typed literal fields | R-X-5 parity |

### 2.3 Constraint-disposition analysis (centerpiece)

Stages: **DbC** = discharged by construction (the defect is unrepresentable in the surface); **tsc** = TypeScript compile error at editor time; **compile** = deterministic diagnostic from the sandboxed build + semantic passes (severity preserved); **IR** = constraint over canonical IR (L3 Alloy) and/or runtime-enforced semantics. A rule may span stages; the *authoritative* stage — the one whose verdict is final — is listed first.

| Legacy rule | Sev | Disposition | Mechanism |
|---|---|---|---|
| PROV-001 (required technique inputs resolvable) | ERROR | **compile** (+ partial tsc) | scope-chain pass over lowered IR using contracts re-derived from markdown; tsc half: explicit `bind` keys must be contract inputs (BIND-001). Required-key coverage is deliberately *not* tsc — implicit name resolution may satisfy it (legacy semantics; see §2.5 item 4) |
| PROV-002 (qualified cross-activity refs) | ERROR | **DbC (outputOf) + compile** | `outputOf()` derives `NN.step.symbol` at lowering; raw qualified strings are shape- and existence-checked at compile (ID-006). The `QualifiedRef` template-literal type checks shape only in the generated `qualifiedSource` position — in every authoring position it is unioned with plain-string aliases and proves nothing (§3.2) |
| SYM-001..004 (id uniqueness) | ERROR | **compile** (ID-001) | ids stay author-supplied strings (R-PAR-3), so collisions are representable; identity-aware: one value at N sites is one declaration |
| FLOW-001 (`main` exists) | ERROR | **DbC (tsc)** | `run:` is a required property |
| FLOW-002 (no orphan flows) | WARN | **compile** | declared `blocks:` entry unreachable from `run`/loop bodies ⇒ WARN; host `const` fragments fall to `noUnusedLocals` |
| FLOW-003 (flow refs resolve) | ERROR | **DbC** + compile residue | values cannot dangle; `byId.*`, `retry`, `rerun`, `goTo`, transition targets are REF-001/RET-001/TRN-001 |
| LOOP-001 (loop flow exists) | ERROR | **DbC** | body is an inline value |
| LOOP-002 (break only in loop scope) | ERROR | **compile** (containment walk, both forms) | both forms lower to `LoopExit`; the token form is DbC *against accidental misplacement only* — a token can leak through builder-time closure capture (assignment to an outer binding), so the compile containment walk covers tokens and the sentinel alike |
| LOOP-003 (break = innermost) | INFO | **carried** | token is statically bound to its loop (and LOOP-101 forbids cross-nesting use); sentinel keeps dynamic-innermost runtime semantics |
| DEC-001 (match should have default) | WARN | **compile WARN** | `match` without `otherwise:`; runtime unmatched ⇒ pass-through unchanged. Exhaustiveness over closed unions is an opt-in lint (DEC-101), never the default — hoisting it to tsc silently retires a legacy WARN (severity-parity violation, §2.5 item 6) |
| DEC-002 (retry has non-recursive exit) | ERROR | **compile** | transitive closure over branch values + `retry` tokens + `byId` edges |
| DEC-003 (interactive form purity) | ERROR | **DbC** | `ask()` has no variable/condition parameter |
| DEC-004 (programmatic form exactly-one) | ERROR | **DbC** | `match`/`ifElse` are distinct constructors |
| TERM-001 (`- activity:` layered terminal) | INFO | **IR** | `goTo` typed `TerminalItem`; semantics fixed in lowering/runtime |
| TERM-002 (rejoin unless terminal) | ERROR | **DbC** + NEW TERM-101 | array sequencing *is* rejoin; TERM-101 (WARN) flags unreachable items after a terminal — WARN, not ERROR, because legacy does not reject dead items |
| SCOPE-001 (4-level resolution order) | INFO | **IR/runtime** | preserved verbatim; the compile resolver implements the same order for static passes |
| SCOPE-002 (expression operands resolvable) | ERROR | **DbC** (structure) / **compile** (names) | builders eliminate string parsing; `VarPath` operands resolved through the scope chain at compile |

New rule families introduced by this surface (ADDR, BIND, CTR, ID, REF/RET, CKPT, TRN, RTE, LOOP-101, TERM-101, INT, ART, WF, EXPR, DET, GEN, GOV, MIG) are cataloged with severities in §7.3.

### 2.4 What `tsc` proves (and what it deliberately does not)

Proven at editor time:

1. **Technique addresses** — `technique:` literals must index the per-workflow generated registry (`keyof R`); an unresolved address is unrepresentable, discharging the runtime `unresolved` bundle bucket for Score-authored artifacts (ADDR-001). `techniques.primary` is checked the same way; `techniques.supporting` entries are checked only on their technique base — rule-segment/group suffixes are ADDR-002 compile checks (§4.7).
2. **Bind keys** — `bind:` keys are constrained to the contract's input ids (excess-property error naming the key, BIND-001). The tsc half covers **fresh object literals only** (excess-property checking does not apply to aliased/factored objects); the compile-stage contract-verification pass re-checks every bind key (BIND-001 is staged `tsc + compile`, like ADDR-001).
3. **Checkpoint coupling** — `autoAdvanceMs ⇒ blocking:false ∧ defaultOption` by discriminated union (CKPT-002 unrepresentable).
4. **Required structure** — `run:` present; `executionModel` present with ≥1 role; `options` non-empty; `and`/`or` arity ≥ 2 (tuple types).

*Deleted claim (repair):* an earlier draft claimed raw qualified-ref strings are "shape-proved by the template-literal type". That claim was vacuous: `QualifiedRef` never appears alone in an authoring position — every union with `VarPath`/`SymbolId` (plain-`string` aliases) collapses to `string`, so tsc checks nothing there (verified by probe). Qualified-ref shape is a **compile** check (ID-006 regex `^\d+\.[a-z][a-z0-9-]*\..+$`, PROV-002); the template type genuinely checks only the generated `ContractInput.qualifiedSource` position (§4.3).

Deliberately *not* proven at editor time (each is a named compile rule): required-input coverage (PROV-001), scope-chain resolvability (SCOPE-002 names), transition/goTo target existence (REF-001/TRN-001), break containment for the sentinel (LOOP-002), retry termination (DEC-002), id uniqueness (ID-001), id grammar (ID-002/ID-003). Rationale: these require analyses `tsc` cannot perform reliably through inference (the type-feasibility review found three "looks typed, checks nothing" failures and two `never`-type failure modes among the candidates), and several would narrow legacy semantics (P10). Every tsc-hoisted check ships with an **error-message acceptance fixture** (GEN-002): an intentionally wrong artifact asserting both that the error fires and what it says. These fixtures are part of the L1 normative layer.

### 2.5 Adjudication record (judge conflicts, decided)

1. **Artifact shape — B's declarative literals vs C's builder callbacks.** All three judges converge on B's pure-value style; C's coverage constructs are grafted *as pure value constructors*. Adopted. Flow registration becomes the explicit `blocks:` field plus reachability (retains FLOW-002 parity without eager side-effecting registration).
2. **Surfacing TOON-lineage constructs (`route`, `whileLoop`/`doWhile`, `byId`, `block`).** Parity judge: required at the surface (critical — without them the DSL cannot be the sole surviving source). Types/agents judges: reader-only, to protect LLM recall — but both *conditioned* that rejection on OQ-3 resolving to a permanent reader. §9.3 resolves OQ-3 to transpile-once-after-parity-proof, which makes surface representability load-bearing. **Decision: surface them, fenced as the migration tier** (MIG-001 WARN outside `--parity`). This satisfies the parity judge's coverage requirement and the agents judge's one-canonical-spelling requirement simultaneously.
3. **Cross-activity references.** Types judge adopted A's `activityIds()` branded-union module; agents judge rejected it as ceremony. **Decision: no mandatory ids module.** The primary form is `outputOf(activityId, stepId, symbol)` — activity-identity-anchored, late-ordinal-bound (the agents judge's own prescription), zero ceremony, refactor-safe. `goTo`/transition targets are plain strings checked by REF-001/TRN-001; editor-time target membership is ceded for surface economy. Recorded as a conscious trade.
4. **Binding model.** A's mandatory `BindingsFor` required keys rejected (all judges): legacy authors no wiring; pre-composed root contracts would force ~6 explicit keys per invoke; mechanical transpile breaks. **Implicit-by-name is the norm; `bind:` is optional.** An opt-in strict profile may later require explicit binds for new authoring (OQ-S5) but the L1 d.ts carries exactly one posture.
5. **Loop body and break.** Hybrid adopted per the types judge: callback body `(it) => Seq` returning a plain array (loop-bound `it.break`/`it.restart`, type-trivial), **plus** the module-level `breakLoop()`/`rerun(id)` dynamic forms (parity judge's shared-fragment proof makes the sentinel mandatory; transpiler emits only the sentinel — zero graph analysis).
6. **Severity parity under type-hoisting.** A's exhaustive-match-by-default rejected: it silently suppresses DEC-001's WARN (observable in A's own port). Any rule promoted to tsc must preserve legacy severity; DEC-001 remains an emittable WARN in the canonical `match`; unreachable-after-terminal is TERM-101 WARN, not A's DEAD-001 ERROR.
7. **Contract values vs types-only.** Parity judge adopted A's GEN-002 value-brand check; types and agents judges adopted B's types-only registry with compiler re-derivation. **Types-only wins** (stronger argument: only the out-of-artifact compiler needs contract data, keeping the sandbox module graph minimal and markdown singular). GEN-002's *intent* survives as the expect-error fixture gate (renamed GEN-002, §5.4); the value-brand check dissolves with the values.
8. **Checkpoint options: record vs array.** Types judge favored record + `keyof` defaultOption; agents judge favored arrays (presentation order is user-visible; avoids the integer-key enumeration hazard). **Arrays win**: option order is semantic (schema parity), the `defaultOption ∈ options` check is a cheap compile pass (CKPT-001), and the ID-004 numeric-key guard's surface area shrinks.
9. **Source spans.** A's transformer-injected `(file,line,col)` spans adopted (engine-independent); C's stack introspection demoted to a diagnostics-only fallback. Spans never enter canonical bytes.
10. **Symbol case.** Single rule (all judges' critical issue): byte-verbatim preservation everywhere; ID-002 enforces snake_case only for symbols *authored in the artifact* of a non-parity build; contract-sourced symbols are exempt at use sites (the markdown lint owns them). Designs A/B/C took three postures; this is the synthesis posture.
11. **Tagged-template `msg` sugar.** Parity judge adopted it as optional sugar; agents judge rejected multiple template constructors for one `{token}` concept. **Rejected for 0.1** (one interpolation rule, INT-001, zero type machinery); logged as OQ-S6.

### 2.6 Critical-issue index

| Critical issue (from the judge verdicts) | Resolved at |
|---|---|
| Symbol-case policy as a single rule | §2.1 tenet 5, §4.4, ID-002 |
| Complete decision self-reference coverage (all kinds + forward/mutual escape) | §3.3.4, `retry()` + `byId` |
| Dynamic-innermost break beside loop tokens | §3.3.5, `breakLoop()` |
| Full TOON-lineage surface coverage | §2.5 item 2, §3.6 migration tier |
| Flow identity / named blocks / IR equality of dissolved flows | §3.6.1, §5.3, §9.2 |
| Severity parity through type-hoisting | §2.5 item 6 |
| Where qualified refs live (technique def vs caller) | §4.3 (`qualifiedSource`), BIND-004 |
| Unified sandbox determinism spec | §5.1 (DET-001..006) |
| Explicit `end()`/Terminate | §3.3.2 |
| Generated-contract trust boundary | §4.5, CTR-001 |
| Registry emission preserving literal keys (vacuity bug) | §4.2, GEN-002 fixtures |
| Required-input coverage semantics decided | §2.5 item 4 |
| Composed-inherited contract entries distinguished; regeneration fan-out | §4.3 (`origin`), §4.5 |
| Mutual-recursion corpus claim unverified | §11 OQ-S1 (byId keeps it representable either way) |
| Checkpoint option ordering guarantee | §2.5 item 8, §5.2 |
| Error-message acceptance tests for tsc-hoisted checks | §2.4, GEN-002 |
| Sandbox allowlist vs module topology | §5.1 DET-001 |
| Array-index record keys / insertion order | ID-004, §5.1 |
| Ordinal-anchored ref fragility | §2.2 (`outputOf` primary), ID-006 |
| Representability conditioned on OQ-3 | §9.3 |

---

## 3. The authoring surface

### 3.1 Narrative walk-through

A Score artifact is one TypeScript module per activity (or per workflow, for small workflows), importing pre-bound constructors from a single generated module and default-exporting the built definition:

```ts
import { activity, step, match, msg, goTo, end, on, otherwise,
         outputOf, v, eq } from '../score.gen';

export default activity('triage', {
  version: '1.0.0',
  describe: 'Classify and route the incoming report.',
  inputs: ['raw_report', outputOf('intake', 'capture-report', 'report_id')],
  run: [
    msg('Starting triage'),
    step('classify-report', {
      describe: 'Classify the report by severity and area.',
      technique: 'report-classification',           // tsc: must index the registry (ADDR-001)
      bind: { raw_report: v('raw_report') },        // tsc: keys ⊆ contract inputs (BIND-001)
    }),
    match('severity-routing', 'report_severity', {
      critical: [goTo('incident-response')],        // layered terminal (TERM-001)
      minor:    [],                                  // empty = pass-through
    }, { otherwise: [msg('Unknown severity, continuing.')] }),
    end(),                                           // explicit Terminate (optional at tail)
  ],
  next: [ on(eq('triage_complete', true), 'planning'), otherwise('intake') ],
});
```

Reading order of the rest of this section: references and expressions (§3.2), the item vocabulary (§3.3), steps and bindings (§3.3.1), decisions (§3.3.4), loops (§3.3.5), checkpoints/dispatch/artifacts (§3.3.6–3.3.8), activity and workflow shells (§3.4–3.5), the migration tier (§3.6), then the complete `.d.ts` (§3.7).

Conventions that hold everywhere:

- **First argument is the stable id** (kebab-case, ID-003), verbatim into the IR `NodeId`.
- **Second/last argument is one options object literal.** No fluent chains. No author-site generics.
- **Strings are references where the position is unambiguous** (`over:`, match operands, `goTo` targets, transition targets); the `v()` wrapper appears only in value positions where a literal and a reference would be confusable (`bind:` values, `setVariable` values).
- **Sequences are plain `readonly Item[]` arrays.** Factoring uses host `const` + spread. Reusing a node value at two sites is one declaration with two references (the legacy reference graph).
- **`{token}` interpolation** in messages, checkpoint messages, artifact names, and artifactLocation paths is an official, compile-checked feature (INT-001; specials `{n}` and `{decision-title}` whitelisted). Legacy had it by example only (SPEC:792). Token grammar (normative): a token is `{` + `[a-z_$][a-z0-9_.-]*` + `}` (plus the two specials); **brace text not matching the token grammar is literal** (JSON snippets, prose braces never fire INT-001); `{{`/`}}` escape a literal brace sequence that *would* match the token grammar. INT-001 is ERROR by default and **WARN under `--parity`** (legacy interpolation was unvalidated, so a corpus string must not hard-fail the parity compile).

### 3.2 References and expressions

Three reference forms, in order of preference:

1. **Bare `VarPath` strings** — `'elicitation_complete'`, `'validation_results.validation_passed'` (dotted member reads). Resolved through the unchanged 4-level scope chain (local flow → loop variable → activity → workflow) at compile (SCOPE-002) and at runtime (SCOPE-001).
2. **`outputOf(activityId, stepId, symbol)`** — the primary cross-activity form. Activity-identity-anchored; the compiler derives the qualified `NN.step.symbol` string from the producing activity's ordinal *at lowering*, so inserting or reordering activities re-derives every reference (no silent misresolution). PROV-002 discharged by construction.
3. **Raw qualified strings** — `'01.create-issue.issue_number'`. A parity escape (MIG-001 outside `--parity`); shape, existence, and intent checked at compile (PROV-002 residue, ID-006 — regex `^\d+\.[a-z][a-z0-9-]*\..+$`). **Disambiguation rule (normative):** in any position admitting both a `VarPath` and a qualified ref (operands, `inputs:`, `over:`, bind values), a string whose first dot-segment is all digits is classified as a `QualifiedRef`; consequently a `VarPath`'s first segment must not be all digits (ID-006 rejects the ambiguous spelling — matching the legacy `Id` grammar, which cannot start with a digit). The same rule governs the L2 serialization (§6.1).

Expressions are built, never parsed: `eq/ne` (any literal), `gt/lt/gte/lte` (numbers; EXPR-101 flags them under `--parity` **only in `ifElse()` conditions** — the Orchestra boolean-algebra lineage, which has no ordering comparators; they are always legal in `route()` guards, `next:` transitions, `when:` gates, and `breakWhen:`, all of `condition.schema.json` lineage, which supports `> < >= <=`), `exists/notExists`, `and/or` (arity ≥ 2 by tuple type), `not`. They lower to the IR `BoolExpr` production (§6) — `condition.schema.json` lineage, a superset of the Orchestra string algebra. The three legacy string grammars (Orchestra boolean algebra, structured `condition`, inline `when` strings) survive only in the TOON reader.

### 3.3 The item vocabulary

`Seq = readonly Item[]`. The `Item` union has exactly these members (each lowers to one IR node kind, §6.2):

| Constructor | IR node | Notes |
|---|---|---|
| `step()` | `Invoke` | trivial (no `technique:`) or technique-backed |
| `ask()` | `AwaitInput` | interactive decision; no-branches call = acknowledgment gate |
| `match()` | `BranchMatch` | programmatic multi-way |
| `ifElse()` | `BranchCond` | programmatic boolean |
| `route()` | `Route` | TOON automated decision (migration tier) |
| `forEach()` / `whileLoop()` / `doWhile()` | `Iterate` | latter two: migration tier |
| `checkpoint()` | `Checkpoint` | |
| `dispatch()` | `Dispatch` | sub-workflow trigger |
| `msg()` | `EmitMessage` | |
| `goTo()` | `GotoActivity` | layered terminal |
| `end()` | `Terminate` | explicit completion |
| `breakLoop()` / `it.break` | `LoopExit` | dynamic-innermost / statically bound |
| `rerun()` / `it.restart` | `LoopRestart` | loop re-entry |
| `retry()` | `ReEvaluate` | decision self-reference |
| `passThrough()` | `PassThrough` | migration tier; trace-invisible no-op |
| `byId.*()` | (reference) | migration tier; lazy id reference resolved at compile |
| `block()` | `Block` (+ `InvokeBlock` at use sites) | named reusable sequence (migration tier); a block value (or `byId.block(id)`) appearing as a sequence item lowers to an `InvokeBlock` node referencing the Block — the legacy inline `- flow: <id>` invocation |
| `approve()` / `gate()` / `delegate()` | reserved nodes | Phase 2+; GOV-001 rejects in Phase 1 |

#### 3.3.1 Steps and bindings

`step(id, opts)` has two overloads. Without `technique:` it is the legacy trivial step (description only, performed directly by the agent). With `technique:` the address literal is inferred against the per-workflow registry: a typo'd address fails to index `keyof R`; a typo'd `bind:` key fails excess-property checking with the key named (the two highest-frequency authoring errors, caught at editor time).

Binding semantics (unchanged from legacy, R-BIND):

- **Unbound inputs resolve implicitly by name** through the scope chain at runtime; PROV-001 verifies satisfiability at compile.
- **`bind:` entries with `v()`/`outputOf()` sources** lower to `Invoke.bindings`. A bind key whose source symbol differs from the input id is a deliberate rename — BIND-003 WARN (canonical-rename-over-args policy).
- **`bind:` entries with literal values** lower to the `technique_args` IR slot (the TOON `technique_args` lineage). `bind:` keys must be contract inputs (BIND-001, tsc + compile).
- **`args:` (MIGRATION TIER, MIG-001)** is the untyped passthrough for TOON `technique_args` keys that are **not** declared contract inputs (TOON's deviation map is free-form, so such keys are grammar-legal). `args:` entries lower verbatim to the `technique_args` slot; a key that is not a contract input is BIND-005 WARN (never an ERROR — the legacy runtime accepted it). The transpiler emits `bind:` when every key is a contract input (a per-key lookup, not an analysis), `args:` otherwise.
- **Inputs qualified in the technique definition itself** (the markdown declares `01.create-issue.issue_number`) are carried in the contract (`qualifiedSource`, §4.3) and lowered into `Invoke.bindings` identically by the reader and by Score — so reader-IR and Score-IR agree on bindings for the same activity. Authoring a `bind:` for the same input that *conflicts* with the technique-def qualification is BIND-004 ERROR.

The full legacy step option set is retained: `when?:` (inline gate; unifies legacy `when` strings and structured `condition`), `checkpoint?:` (yield-before-step), `required?:`, `actions?:`, `triggers?:`.

`checkpoint:` takes a **`CheckpointNode` value only** (no by-id string form — an id would need a declaration list the surface deliberately does not have, and a bare id carries no message/options to lower). Declare once as a host `const` for multi-step reuse: the checkpoint lowers to **one** `Checkpoint` envelope in the node table, and each referencing step's owning sequence gets the checkpoint's `NodeId` inserted immediately before the step's `NodeId` (one declaration, N yield sites — §6.3 note 2). The legacy TOON `checkpoint: <id>` string is resolved by the transpiler against the activity's `checkpoints[]` and rewritten to the node value (a map lookup, not an analysis).

#### 3.3.2 Messages and terminals

`msg(text)` emits an inline user-facing message (`{token}` interpolation, INT-001). `goTo(activityId)` is the layered terminal (TERM-001: exits loop + flow + activity). `end()` is the explicit `Terminate` (R-IR-2 row 9; also the lowering of a TOON route branch with omitted `transitionTo`). Items after a terminal in the same `Seq` are TERM-101 WARN (legacy permits dead items; ERROR would over-constrain the transpiled corpus).

#### 3.3.3 Inline gates

`when?:` on a step (and `when?:` on a checkpoint as the presentation gate) takes a `BoolExpr`. The legacy dual forms — inline `when` strings and structured `condition` objects — both read into this one surface via the TOON reader.

#### 3.3.4 Decisions

- **`ask(id, message, branches?)`** — interactive (legacy `message:`). Branch keys are the user's options; each value is a `Seq` (empty = pass-through; rejoin-unless-terminal). Omitting `branches` is the branchless acknowledgment gate (SPEC:116). DEC-003 is unrepresentable.
- **`match(id, operand, cases, opts?)`** — programmatic multi-way (legacy `variable:`). `operand` is a `VarPath`, qualified string, or `outputOf()`. Case keys are literal match values; `otherwise:` replaces the `default:` magic key. Missing `otherwise` ⇒ DEC-001 WARN; an unmatched value passes through at runtime; `match` requires ≥ 1 case (DEC-005 ERROR — the empty record is type-legal but has no lowering). Array-index case keys are ID-004 ERROR — normatively, a key `k` such that `k === String(n)` for some integer `0 ≤ n ≤ 2^32−2` (the ECMA-262 array-index class, the only keys whose enumeration order diverges from insertion order; authored order is unrecoverable once the engine reorders, which is why the rule is ERROR rather than auto-fix; the legacy grammar's `Id` branch keys can never collide with this rule). The key `'__proto__'` is **reserved** (ERROR in the reader and transpiler too): in an object literal it is a prototype-setter and the case would silently vanish before any rule could see it — the ordered-pairs case form (OQ-S9) is the escape for both hazards. Exhaustiveness over a closed variable union is the opt-in DEC-101 lint, never the default.
- **`ifElse(id, condition, then, otherwise?)`** — programmatic boolean (legacy `condition:`). `otherwise` optional, resolving the legacy spec-internal EBNF inconsistency in the permissive direction (the standalone grammar file wins).
- **`retry(decisionId)`** — decision self-reference, legal in branches of *all three* kinds (legacy while-like loops are exclusively decision self-reference, SPEC:231; restricting retry to interactive decisions would leave grammar-legal programmatic self-retry unrepresentable). RET-001: the named decision must enclose the occurrence site. DEC-002: ≥ 1 branch with no transitive retry (compile, transitive closure including `byId` edges).
- **Forward or mutual decision references** use `byId.decision(id)` (migration tier) — resolved at compile; dangling = REF-001 ERROR (the FLOW-003 class).

#### 3.3.5 Loops

`forEach(id, { each, over, max?, breakWhen? }, (it) => Seq)`:

- `each:` declares the iteration symbol (snake_case for new authoring, ID-002), bound per-iteration at scope level 2; `it.item` is its reference for expression/bind positions.
- `over:` names the collection (scope-chain resolved; dotted paths allowed, e.g. `'plan.tasks'`).
- `max?:` = `maxIterations` (default 100, schema parity); `breakWhen?:` = TOON `breakCondition` (early exit regardless of the main condition).
- The body callback returns a plain `Seq` (or `{ activities: [...] }`, migration tier). `it.break` exits **this** loop; `it.restart` re-enters it. LOOP-101 (ERROR) requires a bound token to occur **within its own loop's body and not within a nested loop's body** — the "outside any loop" case is included because a token can leak via builder-time closure capture (assignment to an outer binding survives the build run; the compile containment walk, not the type system, is authoritative). Multi-level break is a semantic extension legacy cannot express (P10).
- `breakLoop()` is the dynamic-innermost sentinel — exact legacy `- break` semantics, mandatory because a shared `const` fragment containing a break may be reachable from two loops (legal under LOOP-002; innermost resolved at runtime). LOOP-002 is a compile containment walk for the sentinel and tokens alike. The transpiler always emits the sentinel (zero graph analysis); `it.break` is the new-authoring idiom. Both lower to `LoopExit`.
- `rerun(loopId | loopNode)` is the by-reference re-entry (legacy `- loop: <id>` *inside the loop's own body*, SPEC:794-795), REF-001-checked **and containment-checked**: LOOP-102 (ERROR) requires a `rerun`/`it.restart` occurrence to lie within the named loop's reachable body — re-entry of a loop that is not active is undefined in the legacy model, where an out-of-body `- loop: <id>` flow item *runs* the loop instead. Running a loop from elsewhere is expressed as the loop node value itself (backward reference) or `byId.loop(id)` (forward) — one declaration, N run sites.
- Loops carry an optional display `name?:` (TOON `name` is required on loops; the transpiler preserves it verbatim, new authoring defaults it to the id at lowering) and `describe?:`; both lower into the `Iterate` production.

`whileLoop(id, { condition, counter?, max?, breakWhen? }, body)` and `doWhile(...)` cover the TOON loop kinds (migration tier; Orchestra's Phase-1 model defines only forEach).

#### 3.3.6 Checkpoints

One constructor, statically shaped:

```ts
checkpoint('classification-confirmed', 'This appears to be a {problem_type} with {complexity} complexity.', {
  options: [
    { id: 'confirm', label: 'Looks right' },
    { id: 'reclassify', label: 'Reclassify', effect: { setVariable: { problem_type: null } } },
  ],
  blocking: false, defaultOption: 'confirm', autoAdvanceMs: 30000,   // union arm: auto-advance
  when: exists('problem_type'),                                       // presentation gate
})
```

`options` is an ordered non-empty **array** (presentation order is user-visible; the order is preserved into IR and the checkpoint protocol). The options object is a discriminated union of three arms: the blocking arm forbids `defaultOption`/`autoAdvanceMs` (`?: never`); the non-blocking arm makes `defaultOption` **optional** (a `blocking:false` checkpoint without a default is schema-legal and exists in the corpus — `prism-update/05-verify`); the auto-advance arm requires `blocking:false` **and** `defaultOption`. CKPT-002 (`autoAdvanceMs ⇒ ¬blocking ∧ defaultOption`) is therefore unrepresentable; CKPT-001 (defaultOption ∈ option ids), CKPT-003 (effect targets exist), and CKPT-005 (`autoAdvanceMs` integer > 0) are compile checks; CKPT-004 (`condition_not_met` only when `when` present) is an IR/runtime invariant. A *legacy* checkpoint carrying `defaultOption`/`autoAdvanceMs` while blocking (prose-meaningless per `activity.schema.json`; zero corpus instances) is **normalized identically by the reader and the transpiler** — the meaningless fields are dropped with CKPT-006 WARN, so the two paths stay byte-equal (§9.2) and the IR/Alloy layers can forbid the combination outright. Effects carry the full legacy set: `setVariable`, `transitionTo`, `skipActivities`. `approve()` layers on this node shape in Phase 2 without reshaping (R-IR-4).

#### 3.3.7 Dispatch

`dispatch(id, { workflow, passContext?, describe? })` lowers to `Dispatch { workflow_id, pass_context }`. Usable inline in a `Seq` and in the activity-level `triggers:` list (legacy WorkflowTrigger parity). `delegate()` layers on this shape in Phase 2.

Scope and field ownership: `dispatch()` models the **WorkflowTrigger / child-session** semantics (the L0→L1-style `start_session({parent_planning_slug})` spawn in the dispatch model); the L1→L2 worker dispatch (shared `session_index`) is runtime-internal and never authored. `agent_id`/`planning_slug` are session-creation parameters supplied by the runtime at spawn time, never authored — the design spec's dispatch row (design-specification.md "Dispatch", §7) describes the 3-level *runtime* model and does not put those fields on the authoring surface; the newspec inventory's reading of R-RT-5 as "Dispatch authoring carries workflow_id/agent_id/planning_slug" over-reads the IR sketch (`Dispatch { workflow_id, agent_id, planning_slug }` describes what the *runtime* materializes, exactly as legacy `WorkflowTrigger` authors only `{workflow, description?, passContext?}`). `passContext` symbols must resolve in the dispatching scope — DSP-001 WARN when unresolvable (WARN, not ERROR: legacy never validated them).

#### 3.3.8 Artifacts and actions

`artifact(id, name, { location?, action?, describe? })` declares an activity artifact (`EmitArtifact`). `name` supports `{token}` interpolation incl. the whitelisted specials `{n}` (iteration count) and `{decision-title}`; a bare filename receives the server-computed `NN-` activity prefix at write time — the prefix is **not authorable** (recomputed from the ordinal, ART-002). `location` is either an `artifactLocations` key or an explicit path; the discrimination rule is normative (legacy left it implicit): **a location containing `/` or `.` is a path; any other value must be a declared `artifactLocations` key — ART-001 ERROR otherwise.** The same rule classifies the IR `EmitArtifact.location` string for the runtime.

Actions are closed object literals (no constructors — they are effects metadata, not nodes): `{ do: 'set' | 'log' | 'message' | 'validate' | 'emit', … }`, attachable at `entry:`, `exit:`, and `step.actions`. A `set` without `value` is the legacy declarative form (the description documents the expected assignment).

### 3.4 The activity shell

`activity(id, opts)` — one literal: `version`, `describe`, optional `name` (TOON requires a human-facing activity `name`; the transpiler preserves it verbatim, new authoring defaults it to the id at lowering), optional `problem`/`recognition`/`outcome`/`contextToPreserve`/`required`/`estimatedTime`/`rules`/`techniques`, `inputs:` (bare symbols, `outputOf()` refs, qualified strings — PROV-001/002 over these), the required **non-empty** `run:` Seq (ACT-001 ERROR on `[]` — the IR `nodes` table requires ≥ 1 envelope), optional `blocks:` (declared named blocks, FLOW-002 accounting), `next:` ordered transitions (`on(expr, target)` rows, optional `always(target)` rows — the migration-tier lowering of a legacy unconditioned, non-default transition row, which is schema-legal and always-true under first-match — + at most one trailing `otherwise(target)`; first-match-wins, R-RT-2; no match ⇒ terminal activity; rows after an `always()` or the default are TRN-003 WARN), `artifacts:`, `triggers:`, `entry:`/`exit:` actions.

### 3.5 The workflow shell

`workflow(id, opts)` — `version`, `title`, optional `describe`/`author`/`tags`/`rules`, **required `executionModel`** (≥ 1 role by tuple type; resolves the workflow.schema drift; the TOON reader synthesizes the pinned default single-`agent` role literal of §9.1 with a WARN), `vars:` (scalar shorthand or full `VarSpec`), `modes:` (a mode's `resource` slug + optional `#anchor` must resolve — RES-001 ERROR, honoring the legacy "unresolved refs surface explicitly, never dropped" rule), `artifactLocations:` (paths support `{variable}` interpolation, INT-001), `techniques:`, `initialActivity?:` (WF-001: required unless every activity declares `recognition`), and `activities:` — array order assigns the ordinal `NN` (artifact prefix, qualified-ref derivation); `{ ordinal, activity }` overrides for corpus parity (ID-005: dense/unique).

### 3.6 The migration tier

Constructs that exist for corpus completeness, fully specified and first-class, but emitting **MIG-001 (WARN)** when used outside the `--parity` diagnostic profile:

| Construct | Covers |
|---|---|
| `block(id, ...items)` + `blocks:` | legacy named flows; ids survive into IR `Block` ids (round-trip, FLOW-002) |
| `byId.step/decision/loop/block(id)` | forward and mutual references (incl. mutual decision recursion); resolved at compile; dangling = REF-001 ERROR |
| `route(id, { name, branches })` | TOON automated decisions; branch `{id, label, when?, to?, isDefault?}`; omitted `to` ⇒ Terminate; RTE-001: ≥ 2 branches |
| `whileLoop()` / `doWhile()` / `{ activities: […] }` bodies | TOON loop kinds and activity-list loop bodies |
| `passThrough()` | `- flow: continue` with authored intent preserved |
| `always(target)` | legacy unconditioned, non-default transition rows (`{to}` with no condition, `isDefault:false` — always-true under first-match) |
| `args:` on `step()` | TOON `technique_args` keys that are not contract inputs (free-form deviation map; BIND-005 WARN) |
| raw `'NN.step.symbol'` strings | legacy qualified refs verbatim |

#### 3.6.1 Flow identity

New authoring composes anonymously (arrays, consts); anonymous sequences get deterministic structural Block ids (`<owner-id>#<index>`, §5.3) that never appear in trace events (the 21-event vocabulary keys on activity/step/checkpoint/decision/loop only). The transpiler **never dissolves** a named flow — it always emits `block('<legacy-id>', …)` — so reader-IR and transpiled-Score-IR are byte-equal over Block ids (the §9.2 golden check). A declared block unreachable from `run:`/loop bodies is FLOW-002 WARN, exact legacy severity.

### 3.7 The normative `.d.ts` (L1)

Module `@workflow-plane/score`. All constructors are **pure**: they eagerly deep-copy their arguments into frozen, null-prototype, tagged, plain-data values at call time; the artifact's default export is the built definition; the module executes once in the compile sandbox (§5.1). Identifier-format rules (ID-002/ID-003) are compile-stage regex checks, never type-level string transforms — string-manipulating types in parameter positions block inference and degrade error messages (adjudication §2.5 item 4 of the type-feasibility review).

The item interfaces below are deliberately **payload-light** (tag + identity only): the full node payload is recorded by the constructor inside the returned value (string-keyed plain data — DET-003-safe), not promised by the public type. Structural typing therefore admits hand-forged item literals at tsc; the compiler rejects any sequence item not produced by a Score constructor with **DET-007 (ERROR, rule id + span)** — forging is representable but never compiles.

```ts
// ============================================================================
// @workflow-plane/score — L1 normative authoring surface. Version 0.1.
// ============================================================================

// ---------------------------------------------------------------- lexical ---
/** kebab-case node/activity/workflow/option id: ^[a-z][a-z0-9-]*$ (ID-003, compile).
 *  Preserved verbatim into the IR NodeId (R-PAR-3). */
export type KebabId = string;
/** Runtime symbol id. Binds to runtime variables by EXACT string match — never
 *  renamed by any tool (tenet 5). snake_case for newly authored symbols
 *  (ID-002, profile-gated); contract-sourced symbols are verbatim. */
export type SymbolId = string;
/** SymbolId with optional dotted member path: 'validation_results.validation_passed'. */
export type VarPath = string;
/** Cross-activity qualified ref 'NN.step-id.symbol' (PROV-002). NOTE: in every
 *  authoring position this type is unioned with a plain-string alias, so the
 *  union collapses to string and tsc proves NOTHING about shape here — shape,
 *  existence, and intent are compile checks (ID-006). The template type only
 *  genuinely checks the generated ContractInput.qualifiedSource position
 *  (zero-padded ordinals are assignable — probe-verified). Migration tier —
 *  prefer outputOf(). */
export type QualifiedRef = `${number}.${string}.${string}`;
/** Resource ref: 'slug' | '<workflow>/slug' | either + '#heading-anchor' (R-RT-7).
 *  Mode `resource` additionally accepts the legacy path form; the compiler
 *  normalizes it to this grammar. */
export type ResourceRef = string;
export type ActivityId = KebabId;
export type WorkflowId = KebabId;
export type RoleId = KebabId;
export type SemVer = `${number}.${number}.${number}`;
export type Lit = string | number | boolean | null;
export type Json = Lit | readonly Json[] | { readonly [k: string]: Json };

// ------------------------------------------------------------- references ---
/** Activity-identity-anchored cross-activity output reference (PRIMARY form).
 *  Lowered to the qualified 'NN.step.symbol' string at compile, deriving NN
 *  from the producing activity's ordinal — refactor-safe under activity
 *  insertion/reorder. PROV-002 discharged by construction. */
export interface OutputRef {
  readonly kind: 'output_ref';
  readonly activity: ActivityId;
  readonly step: KebabId;
  readonly symbol: SymbolId;
}
export declare function outputOf(activity: ActivityId, step: KebabId, symbol: SymbolId): OutputRef;

/** Explicit variable reference. Needed ONLY in value positions (bind values,
 *  setVariable values) where a bare string would read as a literal. */
export interface VarRef { readonly kind: 'var_ref'; readonly path: VarPath | QualifiedRef; }
export declare function v(path: VarPath | QualifiedRef): VarRef;

/** A bindable value: literal (lowers to the technique_args IR slot) or
 *  reference (lowers to Invoke.bindings). */
export type ValueRef = Lit | VarRef | OutputRef;
/** An expression / match operand. */
export type Operand = VarPath | QualifiedRef | OutputRef;

// ------------------------------------------------------------ expressions ---
/** Opaque condition node; lowers to IR BoolExpr (Guard-projectable, R-IR-5). */
export interface Expr { readonly kind: 'expr'; }
export declare function eq(operand: Operand, value: Lit): Expr;
export declare function ne(operand: Operand, value: Lit): Expr;
/** Ordering comparators: EXPR-101 (--parity profile) ONLY in ifElse()
 *  conditions (Orchestra boolean-algebra lineage — no ordering ops there);
 *  always legal in route() guards, next:/when:/checkpoint gates, and
 *  breakWhen: (condition.schema lineage supports > < >= <=). */
export declare function gt(operand: Operand, value: number): Expr;
export declare function lt(operand: Operand, value: number): Expr;
export declare function gte(operand: Operand, value: number): Expr;
export declare function lte(operand: Operand, value: number): Expr;
export declare function exists(operand: Operand): Expr;
export declare function notExists(operand: Operand): Expr;
/** Arity >= 2 by tuple type. */
export declare function and(...exprs: readonly [Expr, Expr, ...Expr[]]): Expr;
export declare function or(...exprs: readonly [Expr, Expr, ...Expr[]]): Expr;
export declare function not(expr: Expr): Expr;

// ------------------------------------------------------------------ items ---
/** Every member is a frozen tagged value; the union is closed (one IR node
 *  kind per member, §6.2). */
export type Item =
  | StepNode | AskNode | MatchNode | IfElseNode | RouteNode
  | ForEachNode | WhileNode | DoWhileNode
  | CheckpointNode | DispatchNode | MessageNode
  | GoToNode | EndNode | BreakItem | RerunItem | RetryItem
  | PassThroughItem | ByIdItem | FlowBlock
  | GovernanceNode;            // Phase 2+ reserved — GOV-001 rejects in Phase 1
export type Seq = readonly Item[];

export interface StepNode        { readonly kind: 'step';        readonly id: KebabId; }
export interface AskNode         { readonly kind: 'ask';         readonly id: KebabId; }
export interface MatchNode       { readonly kind: 'match';       readonly id: KebabId; }
export interface IfElseNode      { readonly kind: 'if_else';     readonly id: KebabId; }
export interface RouteNode       { readonly kind: 'route';       readonly id: KebabId; }
export interface ForEachNode     { readonly kind: 'for_each';    readonly id: KebabId; }
export interface WhileNode       { readonly kind: 'while';       readonly id: KebabId; }
export interface DoWhileNode     { readonly kind: 'do_while';    readonly id: KebabId; }
export interface CheckpointNode  { readonly kind: 'checkpoint';  readonly id: KebabId; }
export interface DispatchNode    { readonly kind: 'dispatch';    readonly id: KebabId; }
export interface MessageNode     { readonly kind: 'message'; }
export interface GoToNode        { readonly kind: 'goto';        readonly to: ActivityId; }
export interface EndNode         { readonly kind: 'end'; }
export interface BreakItem       { readonly kind: 'break';       readonly loop?: KebabId; }
export interface RerunItem       { readonly kind: 'rerun';       readonly loop: KebabId; }
export interface RetryItem       { readonly kind: 'retry';       readonly decision: KebabId; }
export interface PassThroughItem { readonly kind: 'pass_through'; }
export interface ByIdItem        { readonly kind: 'by_id';
                                   readonly ref: 'step' | 'decision' | 'loop' | 'block';
                                   readonly id: KebabId; }
export interface FlowBlock       { readonly kind: 'block';       readonly id: KebabId; }
export interface GovernanceNode  { readonly kind: 'governance';  readonly id: KebabId; }

// --------------------------------------------------- leaf / control items ---
/** Inline user-facing message ('- message:'). '{token}' interpolation resolved
 *  via the scope chain at compile (INT-001). Lowers to EmitMessage. */
export declare function msg(text: string): MessageNode;
/** Layered terminal (TERM-001): exits loop + flow + activity, transitions to
 *  the target activity. Target existence: REF-001 (compile). */
export declare function goTo(target: ActivityId): GoToNode;
/** Explicit completion — IR Terminate (R-IR-2 row 9). Also the lowering of a
 *  TOON route branch with omitted transitionTo. */
export declare function end(): EndNode;
/** Legacy '- break': exits the INNERMOST enclosing loop at runtime (LOOP-003).
 *  Compile ERROR if not contained in any loop's reachable body (LOOP-002).
 *  Required beside loop tokens: a shared fragment may be reachable from two
 *  loops. The transpiler always emits this form. */
export declare function breakLoop(): BreakItem;
/** Legacy in-body '- loop: <id>' re-entry/restart, by id or node value
 *  (REF-001). LOOP-102: must occur within the named loop's reachable body —
 *  running a loop from elsewhere is the loop node value / byId.loop(id). */
export declare function rerun(loop: KebabId | ForEachNode | WhileNode | DoWhileNode): RerunItem;
/** Decision self-reference (legacy '- decision: <self>'), legal in branches of
 *  ALL decision kinds. RET-001: the target must enclose the occurrence site.
 *  DEC-002: the target keeps >= 1 branch with no transitive retry. */
export declare function retry(decision: KebabId): RetryItem;
/** MIGRATION TIER (MIG-001). Legacy '- flow: continue' — intent-preserving
 *  no-op; trace-invisible; functionally equal to an empty branch (SPEC:292). */
export declare function passThrough(): PassThroughItem;
/** MIGRATION TIER (MIG-001). Named reusable block; the id survives into the IR
 *  Block id (FLOW-002/round-trip). Declare in ActivityOpts.blocks. */
export declare function block(id: KebabId, ...items: Seq): FlowBlock;
/** MIGRATION TIER (MIG-001). Lazy by-id references for forward/mutual graphs
 *  (incl. mutual decision recursion). Resolved at compile within the declaring
 *  activity; dangling = REF-001 ERROR. byId.block(id) as a sequence item
 *  lowers to InvokeBlock (the legacy inline '- flow: <id>'); byId.loop(id)
 *  as a sequence item runs the named loop (the legacy out-of-body
 *  '- loop: <id>'). */
export declare const byId: {
  step(id: KebabId): ByIdItem;
  decision(id: KebabId): ByIdItem;
  loop(id: KebabId): ByIdItem;
  block(id: KebabId): ByIdItem;
};

// -------------------------------------------------------------- decisions ---
/** Interactive decision (legacy 'message:'). Presents the message, offers
 *  branch keys as the user's options, blocks for a response. Branches rejoin
 *  unless terminal (TERM-002); empty Seq = pass-through. No branches argument
 *  = branchless acknowledgment gate (SPEC:116). DEC-003 unrepresentable. */
export declare function ask(id: KebabId, message: string,
  branches?: Readonly<Record<KebabId, Seq>>): AskNode;

/** Programmatic multi-way match (legacy 'variable:'). Case keys are literal
 *  match values (array-index keys: ID-004 ERROR; '__proto__' reserved: ERROR).
 *  >= 1 case required (DEC-005 ERROR — the empty record is type-legal but has
 *  no lowering). Missing otherwise => DEC-001 WARN; unmatched value passes
 *  through at runtime. DEC-004 unrepresentable. Opt-in exhaustiveness lint:
 *  DEC-101. */
export declare function match(id: KebabId, operand: Operand,
  cases: Readonly<Record<string, Seq>>,
  opts?: { readonly otherwise?: Seq }): MatchNode;

/** Programmatic boolean decision (legacy 'condition:'). otherwise optional
 *  (true-only form per grammar/activity.ebnf:65). */
export declare function ifElse(id: KebabId, condition: Expr,
  then: Seq, otherwise?: Seq): IfElseNode;

/** MIGRATION TIER (MIG-001). TOON automated decision (activity.schema
 *  decisions[]): branches are transition rows, not flow fragments. Branch ids
 *  and labels feed state.decisionOutcomes.branchId and traces. Omitted `to` =>
 *  Terminate. RTE-001: >= 2 branches (tuple-typed). */
export interface RouteBranch {
  readonly id: KebabId;
  readonly label: string;
  readonly when?: Expr;
  readonly to?: ActivityId;
  readonly isDefault?: boolean;
}
export declare function route(id: KebabId, opts: {
  readonly name: string;
  readonly describe?: string;
  readonly branches: readonly [RouteBranch, RouteBranch, ...RouteBranch[]];
}): RouteNode;

// ------------------------------------------------------------------ loops ---
/** Loop-bound tokens, obtainable only inside the body callback. LOOP-002
 *  discharged by construction; LOOP-101 forbids use inside a nested loop's
 *  body (no multi-level break — P10). */
export interface LoopTokens {
  /** Reference to the iteration symbol (scope level 2). */
  readonly item: VarRef;
  /** Exit THIS loop; resume the parent sequence after the loop. */
  readonly break: BreakItem;
  /** Re-enter THIS loop (legacy '- loop: <own-id>'). */
  readonly restart: RerunItem;
}
/** MIGRATION TIER body form: loop over activity ids instead of inline items. */
export interface LoopActivities { readonly activities: readonly ActivityId[]; }
export type LoopBody = (it: LoopTokens) => Seq | LoopActivities;

/** forEach over a collection in scope (the only Orchestra loop kind).
 *  `each` introduces the iteration symbol; `max` = maxIterations (default 100,
 *  integer > 0 — LOOP-004); `breakWhen` = TOON breakCondition; `name` = TOON
 *  loop display name (defaults to the id at lowering; the transpiler preserves
 *  the authored value verbatim). */
export declare function forEach(id: KebabId, opts: {
  readonly each: SymbolId;
  readonly over: VarPath | QualifiedRef | OutputRef;
  readonly max?: number;
  readonly breakWhen?: Expr;
  readonly name?: string;
  readonly describe?: string;
}, body: LoopBody): ForEachNode;

/** MIGRATION TIER (MIG-001). TOON while loop. */
export declare function whileLoop(id: KebabId, opts: {
  readonly condition: Expr;
  readonly counter?: SymbolId;
  readonly max?: number;
  readonly breakWhen?: Expr;
  readonly name?: string;
  readonly describe?: string;
}, body: LoopBody): WhileNode;
/** MIGRATION TIER (MIG-001). TOON doWhile loop. */
export declare function doWhile(id: KebabId, opts: {
  readonly condition: Expr;
  readonly counter?: SymbolId;
  readonly max?: number;
  readonly breakWhen?: Expr;
  readonly name?: string;
  readonly describe?: string;
}, body: LoopBody): DoWhileNode;

// ------------------------------------------------------------- checkpoint ---
export interface CheckpointEffect {
  readonly setVariable?: Readonly<Record<SymbolId, Json>>;
  readonly transitionTo?: ActivityId;
  readonly skipActivities?: readonly ActivityId[];
}
export interface CheckpointOption {
  readonly id: KebabId;
  readonly label: string;
  readonly describe?: string;
  readonly effect?: CheckpointEffect;
}
/** Discriminated union: autoAdvanceMs => blocking:false AND defaultOption,
 *  by construction (CKPT-002 unrepresentable); blocking:false WITHOUT a
 *  defaultOption stays representable (schema-legal; corpus-attested).
 *  Options are an ORDERED array — presentation order is user-visible and
 *  preserved into IR (§5.2). */
export type CheckpointOpts = {
  /** Display name; defaults to the id at lowering. */
  readonly name?: string;
  /** Ordered, non-empty. defaultOption must name one (CKPT-001, compile). */
  readonly options: readonly [CheckpointOption, ...CheckpointOption[]];
  /** Presentation gate; presence enables the condition_not_met response
   *  (CKPT-004, IR/runtime). */
  readonly when?: Expr;
  /** default true */
  readonly required?: boolean;
} & (
  /** Blocking (default). defaultOption/autoAdvanceMs are only meaningful on a
   *  non-blocking checkpoint — authoring them here is the CKPT-002 violation. */
  | { readonly blocking?: true;  readonly defaultOption?: never;  readonly autoAdvanceMs?: never }
  /** Non-blocking without auto-advance; a default is optional. */
  | { readonly blocking: false;  readonly defaultOption?: KebabId; readonly autoAdvanceMs?: never }
  /** Auto-advance: requires blocking:false AND a defaultOption to advance to;
   *  autoAdvanceMs is an integer > 0 (CKPT-005, compile). */
  | { readonly blocking: false;  readonly defaultOption: KebabId;  readonly autoAdvanceMs: number }
);
/** Checkpoint protocol: yield -> present -> respond -> resume (R-RT-4).
 *  Message supports '{token}' interpolation (INT-001). approve() layers on
 *  this node shape in Phase 2 (R-IR-4). */
export declare function checkpoint(id: KebabId, message: string, opts: CheckpointOpts): CheckpointNode;

// ---------------------------------------------------------------- dispatch ---
/** Sub-workflow trigger; lowers to IR Dispatch {workflow_id, pass_context}.
 *  agent_id / planning_slug are runtime-supplied, never authored (R-RT-5).
 *  delegate() layers on this node shape in Phase 2. */
export declare function dispatch(id: KebabId, opts: {
  readonly workflow: WorkflowId;
  readonly passContext?: readonly SymbolId[];
  readonly describe?: string;
}): DispatchNode;

// ---------------------------------------------------------------- artifact ---
export interface ArtifactDef { readonly kind: 'artifact'; readonly id: KebabId; }
/** Activity artifact declaration; lowers to EmitArtifact. `name` supports
 *  '{token}' interpolation incl. specials '{n}' and '{decision-title}'
 *  (INT-001). A bare filename receives the server-computed 'NN-' prefix at
 *  write time; the prefix is NOT authorable (ART-002). */
export declare function artifact(id: KebabId, name: string, opts?: {
  /** artifactLocations key or explicit path. Normative discrimination:
   *  contains '/' or '.' => path; otherwise must be a declared
   *  artifactLocations key (ART-001 ERROR). */
  readonly location?: KebabId | string;
  /** default 'create' */
  readonly action?: 'create' | 'update';
  readonly describe?: string;
}): ArtifactDef;

// -------------------------------------------------------------- transitions --
export interface TransitionDef { readonly kind: 'transition'; }
/** Conditional transition row. Evaluated in array order; first match wins
 *  (R-RT-2). Target existence: TRN-001. */
export declare function on(condition: Expr, target: ActivityId): TransitionDef;
/** MIGRATION TIER (MIG-001). Unconditioned, non-default transition row — the
 *  legacy `{to}` row with no condition and isDefault:false (always-true under
 *  first-match). Lowers to a Transition with no `when` and no `is_default`.
 *  Rows after it are TRN-003 WARN. */
export declare function always(target: ActivityId): TransitionDef;
/** Default transition (isDefault). Must be unique and last (TRN-002). */
export declare function otherwise(target: ActivityId): TransitionDef;

// ------------------------------------------------------------------ actions --
/** Closed object shapes (no constructors): effects metadata on entry/exit/
 *  step.actions. 'set' without value = legacy declarative assignment. */
export type ActionItem =
  | { readonly do: 'set';      readonly target: SymbolId; readonly value?: ValueRef; readonly describe?: string; readonly when?: Expr }
  | { readonly do: 'log';      readonly message: string;  readonly describe?: string; readonly when?: Expr }
  | { readonly do: 'message';  readonly message: string;  readonly describe?: string; readonly when?: Expr }
  | { readonly do: 'validate'; readonly target: Expr;     readonly message: string;  readonly describe?: string; readonly when?: Expr }
  | { readonly do: 'emit';     readonly target: string;   readonly value?: ValueRef; readonly describe?: string; readonly when?: Expr };

// ----------------------------------------------------------------- activity --
export interface ActivityDef { readonly kind: 'activity'; readonly id: ActivityId; }
/** A `techniques.supporting` entry: an invocable technique address, or a
 *  technique address + trailing rule/group segment(s). Only the technique
 *  BASE is tsc-proved; the trailing segment is ADDR-002 (compile) against the
 *  contract's rule-name sets (§4.7). `primary` is fully tsc-proved. */
export type SupportingRef<Addr extends string> = Addr | `${Addr}::${string}`;
export interface ActivityOpts<Addr extends string = string> {
  readonly version: SemVer;
  readonly describe: string;
  /** Human-facing display name (TOON requires it). Defaults to the id at
   *  lowering; the transpiler preserves the authored value verbatim. */
  readonly name?: string;
  readonly problem?: string;
  /** External data only — bare symbols, outputOf() refs, qualified strings.
   *  PROV-001/PROV-002 at compile. */
  readonly inputs?: readonly (SymbolId | QualifiedRef | OutputRef)[];
  /** Intent patterns for independent-entry activities. */
  readonly recognition?: readonly string[];
  readonly techniques?: { readonly primary?: Addr; readonly supporting?: readonly SupportingRef<Addr>[] };
  /** THE body — the legacy `main` flow. Required (FLOW-001 by construction);
   *  must be non-empty (ACT-001, compile). */
  readonly run: Seq;
  /** MIGRATION TIER. Declared named blocks; unreachable => FLOW-002 WARN. */
  readonly blocks?: readonly FlowBlock[];
  /** Ordered transitions; no matching row => terminal activity (R-RT-2). */
  readonly next?: readonly TransitionDef[];
  readonly artifacts?: readonly ArtifactDef[];
  /** Activity-level WorkflowTrigger parity. */
  readonly triggers?: readonly DispatchNode[];
  readonly entry?: readonly ActionItem[];
  readonly exit?: readonly ActionItem[];
  readonly outcome?: readonly string[];
  readonly contextToPreserve?: readonly string[];
  /** default true */
  readonly required?: boolean;
  /** Legacy pattern '^\d+(-\d+)?\s*(m|min|h|hr|hours?|d|days?)?$' (compile). */
  readonly estimatedTime?: string;
  readonly rules?: readonly string[];
}

// ----------------------------------------------------------------- workflow --
export interface WorkflowDef { readonly kind: 'workflow'; readonly id: WorkflowId; }
export interface VarSpec {
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly describe?: string;
  readonly default?: Json;
  /** default false */
  readonly required?: boolean;
}
/** Scalar shorthand infers {type, default}: vars: { mode: 'implement' }. */
export type VarInit = string | number | boolean | VarSpec;
export interface RoleDecl { readonly id: RoleId; readonly describe: string; }
export interface ModeDef {
  readonly id: KebabId;
  readonly name: string;
  readonly describe?: string;
  readonly activationVariable: SymbolId;
  readonly recognition?: readonly string[];
  readonly skipActivities?: readonly ActivityId[];
  readonly defaults?: Readonly<Record<SymbolId, Json>>;
  /** ResourceRef grammar; the legacy path form is accepted and normalized. */
  readonly resource?: ResourceRef;
}
export interface WorkflowOpts<Addr extends string = string> {
  readonly version: SemVer;
  readonly title: string;
  readonly describe?: string;
  readonly author?: string;
  readonly tags?: readonly string[];
  readonly rules?: readonly string[];
  /** First-class and REQUIRED (schema-drift fix; Phase-2 policy anchor,
   *  R-GOV-2). >= 1 role by tuple type; role-id uniqueness: WF-003 compile. */
  readonly executionModel: {
    readonly roles: readonly [RoleDecl, ...RoleDecl[]];
  };
  readonly vars?: Readonly<Record<SymbolId, VarInit>>;
  readonly modes?: readonly ModeDef[];
  readonly artifactLocations?: Readonly<Record<KebabId,
    string | { readonly path: string; readonly describe?: string; readonly gitignored?: boolean }>>;
  readonly techniques?: { readonly primary?: Addr; readonly supporting?: readonly SupportingRef<Addr>[] };
  /** WF-001: required unless every activity declares recognition. */
  readonly initialActivity?: ActivityId;
  /** Array order assigns ordinal NN (artifact prefix, qualified refs).
   *  Explicit ordinal override for corpus parity (ID-005: dense + unique). */
  readonly activities: readonly (ActivityDef | { readonly ordinal: number; readonly activity: ActivityDef })[];
}

// ============================================================================
// Generated technique contracts and the per-workflow bound surface (§4)
// ============================================================================
/** Where the contract entry came from along the composition chain — for
 *  diagnostics and tooling; 'workflow-root'/'container' entries are inherited
 *  (keyed-section union, local wins). */
export type ContractOrigin = 'local' | 'container' | 'workflow-root';
export interface ContractInput {
  readonly required: boolean;
  /** The '#### default' literal value, when declared (presence implies the
   *  input is satisfiable without binding). */
  readonly default?: Lit;
  readonly origin: ContractOrigin;
  /** Set when the technique markdown itself qualifies this input as
   *  'NN.step.symbol' (SPEC:730 lineage). Lowered into Invoke.bindings by
   *  both the reader and Score (BIND-004 guards caller conflicts). */
  readonly qualifiedSource?: QualifiedRef;
  /** '#### <member>' component names (documentary; not binding targets). */
  readonly components?: readonly SymbolId[];
}
export interface ContractArtifact {
  readonly name: string;
  readonly action: 'create' | 'update';
  /** '{token}' symbols extracted from the name template; each must resolve at
   *  the producing step's scope (INT-001). */
  readonly tokens: readonly SymbolId[];
}
export interface ContractOutput {
  readonly artifact?: ContractArtifact;
  readonly components?: readonly SymbolId[];
}
/** The typed mirror of one markdown technique, composed for the EXECUTING
 *  workflow. The same id may appear in inputs and outputs (idempotent
 *  resolver). NOTE: this interface is a generic CONSTRAINT only — generated
 *  registries are literal-keyed type aliases and must never extend an
 *  index-signature-bearing type (GEN-002; §4.2). */
export interface TechniqueContract {
  readonly address: string;        // canonical '::' literal
  readonly shape: 'standalone' | 'container' | 'nested' | 'workflow-root';
  readonly version: string;
  readonly inputs: Readonly<Record<SymbolId, ContractInput>>;
  readonly outputs: Readonly<Record<SymbolId, ContractOutput>>;
  /** Rule-name literals ('.'-citation set; group-* expansions materialized). */
  readonly rules: readonly string[];
}

/** The per-workflow bound surface. R is the generated literal-keyed registry;
 *  the `technique` property literal is the single inference point (no
 *  author-site generics). */
export interface Score<R extends Readonly<Record<string, TechniqueContract>>> {
  /** Trivial step (legacy description-only). */
  step(id: KebabId, opts: {
    readonly describe: string;
    readonly when?: Expr;
    /** Yield this checkpoint BEFORE executing the step. Node value ONLY (no
     *  by-id string): one declaration, N referencing steps — lowers to one
     *  Checkpoint envelope with the checkpoint's NodeId inserted before each
     *  referencing step (§3.3.1, §6.3 note 2). */
    readonly checkpoint?: CheckpointNode;
    readonly required?: boolean;
    readonly actions?: readonly ActionItem[];
    readonly triggers?: readonly DispatchNode[];
  }): StepNode;
  /** Technique-backed step. tsc proves: address indexes R (ADDR-001); bind
   *  keys ⊆ contract inputs (BIND-001 — excess-property on FRESH literals;
   *  the compile pass re-checks all bind keys). Required-input COVERAGE is
   *  the PROV-001 compile pass (implicit by-name resolution may satisfy it —
   *  legacy semantics). */
  step<T extends keyof R & string>(id: KebabId, opts: {
    readonly technique: T;
    readonly describe?: string;
    readonly bind?: { readonly [K in keyof R[T]['inputs'] & string]?: ValueRef };
    /** MIGRATION TIER (MIG-001). Free-form TOON technique_args passthrough
     *  for keys that are NOT contract inputs; lowers verbatim to the
     *  technique_args IR slot (BIND-005 WARN per non-input key). */
    readonly args?: Readonly<Record<string, string | number | boolean>>;
    readonly when?: Expr;
    readonly checkpoint?: CheckpointNode;
    readonly required?: boolean;
    readonly actions?: readonly ActionItem[];
    readonly triggers?: readonly DispatchNode[];
  }): StepNode;

  workflow(id: WorkflowId, opts: WorkflowOpts<keyof R & string>): WorkflowDef;
  activity(id: ActivityId, opts: ActivityOpts<keyof R & string>): ActivityDef;

  // Registry-independent constructors, re-exported for the one-import idiom:
  ask: typeof ask; match: typeof match; ifElse: typeof ifElse; route: typeof route;
  forEach: typeof forEach; whileLoop: typeof whileLoop; doWhile: typeof doWhile;
  checkpoint: typeof checkpoint; dispatch: typeof dispatch; artifact: typeof artifact;
  msg: typeof msg; goTo: typeof goTo; end: typeof end;
  breakLoop: typeof breakLoop; rerun: typeof rerun; retry: typeof retry;
  passThrough: typeof passThrough; block: typeof block; byId: typeof byId;
  on: typeof on; always: typeof always; otherwise: typeof otherwise;
  v: typeof v; outputOf: typeof outputOf;
  eq: typeof eq; ne: typeof ne; gt: typeof gt; lt: typeof lt; gte: typeof gte; lte: typeof lte;
  exists: typeof exists; notExists: typeof notExists; and: typeof and; or: typeof or; not: typeof not;
  approve: typeof approve; gate: typeof gate; delegate: typeof delegate;
}
/** Instantiated ONLY by generated modules (§4.2). */
export declare function makeScore<R extends Readonly<Record<string, TechniqueContract>>>(): Score<R>;

// ============================================================================
// RESERVED — Phase 2+ governance constructs (design spec §6.2/§8/§13; R-IR-4).
// Declared now so node shapes never reshape; the Phase-1 compiler rejects any
// occurrence with GOV-001 (ERROR naming the activation phase). Role ids key
// into workflow.executionModel.roles (compile-checked on activation).
// ============================================================================
/** @reserved Phase 2+. Layers on Checkpoint -> IR RequireApproval. */
export declare function approve(id: KebabId, opts: {
  readonly role: RoleId;
  readonly message: string;
  readonly options?: readonly CheckpointOption[];
  readonly onDeny?: 'fail_node' | 'fail_workflow' | 'escalate';
}): GovernanceNode;
/** @reserved Phase 2+. -> IR CapabilityGate over the enclosed sequence. */
export declare function gate(id: KebabId, opts: {
  readonly capabilityScope: readonly string[];
  readonly onViolation?: 'deny' | 'fail_node' | 'fail_workflow' | 'escalate' | 'nudge';
  readonly run: Seq;
}): GovernanceNode;
/** @reserved Phase 2+. Layers on Dispatch -> IR Delegate (task packet carries
 *  bounded context/tools/stop conditions — not authoring fields). */
export declare function delegate(id: KebabId, opts: {
  readonly role: RoleId;
  readonly workflow: WorkflowId;
  readonly passContext?: readonly SymbolId[];
}): GovernanceNode;
```

---

## 4. Technique contracts

Techniques remain markdown (locked decision 2). The contract layer is the **name algebra** extracted from that markdown — addresses, symbol ids, optionality, defaults, artifact tokens, rule names, and their workflow-relative composition — i.e., everything the engine resolves by exact string match. Everything the agent interprets as behavior (capability prose, protocol blocks, rule text, Initial/Final wrapping) stays markdown and rides into delivery as opaque prose.

### 4.1 Generation pipeline (markdown → registry)

The generator (`score-contracts gen <workflow>`) reuses the production loader semantics (`src/loaders/markdown-technique-loader.ts`): plural `## Inputs`/`## Outputs` headers (singular rejected), `### <id>` entries, the `*(optional)*` prose marker, reserved `#### default` (inputs) and `#### artifact` (outputs) subsections, `#### <member>` components, `### <rule-name>` under `## Rules`. Per workflow it:

1. Resolves the **workflow-relative namespace**: own techniques shadow `meta`; slash forms (`wf/technique`) normalized to `::`; the workflow-root `TECHNIQUE` is excluded from the addressable key set (not invocable) but composed into every entry.
2. **Pre-applies composition** per (executing-workflow × technique): keyed-section union, local wins, along the executing workflow's root + group-container chain. Inherited entries carry `origin: 'workflow-root' | 'container'` so diagnostics can distinguish composed entries from local ones and any future strict-binding profile can exclude them.
3. Makes optionality **structural**: `*(optional)*` and/or `#### default` presence ⇒ `required: false`; the `#### default` literal value is carried (never reduced to a boolean).
4. Records **technique-def qualifications**: an input whose markdown declaration is the qualified `NN.step.symbol` form carries `qualifiedSource` — the binding lives in the *contract*, exactly where legacy declared it (SPEC:730), and lowers into `Invoke.bindings` identically for the reader and for Score (BIND-004 guards a conflicting caller-side `bind:`).
5. Extracts **artifact name templates** and their `{token}` lists; materializes `group-*` rule expansions and rule-name literal sets.
6. Emits one generated module per workflow plus a corpus digest.

### 4.2 The generated module (normative emission pattern)

The registry **must** be emitted as a literal-keyed **type alias**, never as an `interface … extends Registry` and never via intersection with an index-signature-bearing type — both silently collapse `keyof` to `string` and void all address/bind checking while appearing to work (the vacuity bug found in two of three candidate designs). Conformance to `TechniqueContract` is asserted with a dead generic application, not inheritance:

```ts
// workflows/work-package/score.gen.ts — GENERATED from technique markdown. Do not edit.
import { makeScore, type TechniqueContract } from '@workflow-plane/score';

type WorkPackageRegistry = {
  'domain-question': {
    address: 'domain-question'; shape: 'standalone'; version: '1.2.0';
    inputs: {
      /** The domain currently being elicited. */
      'current-domain':  { required: true;  origin: 'local' };
      /** (optional) Accumulated Q/A log; empty on first iteration. */
      'elicitation-log': { required: false; origin: 'local' };
      /** Inherited from the workflow-root TECHNIQUE.md (local wins). */
      planning_folder_path: { required: true; origin: 'workflow-root' };
    };
    outputs: { 'question-text': {}; 'user-response': {} };
    rules: readonly [];
  };
  'jira-comment': {
    address: 'jira-comment'; shape: 'standalone'; version: '1.0.0';
    inputs: {
      'categorized-assumptions': { required: true; origin: 'local' };
      /** Markdown qualifies this input itself (SPEC:730). */
      'issue-number': { required: true; origin: 'local';
                        qualifiedSource: '01.create-issue.issue-number' };
    };
    outputs: { 'comment-posted': {} };
    rules: readonly ['comment-approval-before-post'];
  };
  'gitnexus-operations::impact': {
    address: 'gitnexus-operations::impact'; shape: 'nested'; version: '2.1.0';
    inputs: { /* container + root entries composed, local wins */ };
    outputs: { /* … */ };
    rules: readonly ['query-not-grep', 'detect-changes-after-edit',
                     'index-freshness-first', 'must-use-operations'];
  };
  // … every address resolvable from work-package (own first, then meta)
};

/** Conformance assertion WITHOUT index-signature inheritance (GEN-002).
 *  Exported so the module is clean under noUnusedLocals (§5.1 assumes
 *  strict + noUnusedLocals). */
type __AssertRegistry<T extends Readonly<Record<string, TechniqueContract>>> = T;
export type __Checked = __AssertRegistry<WorkPackageRegistry>;

/** sha256 over the source markdown set (§5.2 pins the digest inputs); the
 *  compiler re-derives and errors CTR-001 on mismatch. A REAL value export —
 *  `declare` would emit no runtime binding and any ESM import of it would be
 *  a link-time error; as pure frozen data it is also DET-003-clean. */
export const CONTRACT_DIGEST = 'sha256-1f3a…' as const;

export const {
  workflow, activity, step, ask, match, ifElse, route, forEach, whileLoop, doWhile,
  checkpoint, dispatch, artifact, msg, goTo, end, breakLoop, rerun, retry,
  passThrough, block, byId, on, always, otherwise, v, outputOf,
  eq, ne, gt, lt, gte, lte, exists, notExists, and, or, not,
  approve, gate, delegate,
} = makeScore<WorkPackageRegistry>();
```

The artifact has exactly one import line and zero visible generics, yet every `technique:` literal and every `bind:` key is tsc-checked against the executing workflow's composed, own-then-meta-resolved namespace.

The generated module is **not** "types only" in the erased sense: its contract **data** is types only (the registry type carries no values), but the module retains exactly **two runtime statements** — the `CONTRACT_DIGEST` const and the `makeScore` destructure — and both execute in the compile sandbox; every artifact imports its constructor *values* from here (DET-001 states the sandbox module-graph consequence precisely).

**GEN-002 (generator gate, normative):** the generator ships `@ts-expect-error` fixtures proving, for every emitted registry, that (a) a typo'd technique address fails to compile, (b) a typo'd bind key fails with an excess-property error naming the key, and (c) `keyof` over the registry and over each entry's `inputs` is a literal union (asserted via an `Equals`-style type test). The fixtures additionally assert the *text* of the two errors (error-message acceptance tests); they are part of the L1 normative layer, regenerated and run in CI alongside `gen --check`.

### 4.3 What is IN a contract

1. **Identity** — canonical `::` address (registry key), shape brand (`standalone`/`container`/`nested`/`workflow-root`), `version` literal.
2. **Inputs map** — verbatim symbol-id keys; structural `required`; the `#### default` **literal value**; `origin` provenance along the composition chain; `qualifiedSource` for technique-def-qualified inputs; component member names as documentary keys (descriptions ride as JSDoc).
3. **Outputs map** — same shape minus default; `artifact` = `{name, action, tokens[]}` with template tokens extracted.
4. **Shared symbol vocabulary** — inputs and outputs are separate keyed maps over one namespace, so the same id may appear in both (idempotent resolver: receive-or-compute, then expose).
5. **Rule names** — kebab-case literal sets per technique/container, serving `.`-citation validation, `::` rule-segment resolution, and materialized `group-*` expansion.
6. **The per-workflow registry** — keys exactly matching the bundle's `techniques` bucket keys; the runtime `unresolved` bucket becomes unrepresentable for Score-authored artifacts (ADDR-001 at tsc, re-verified at compile).

### 4.4 What is NOT in a contract

- Capability prose; I/O descriptions beyond JSDoc mirroring; protocol blocks, step notes, error-handling prose; Initial/Final block content and wrap ordering (delivery-time composition, no interface effect).
- **Protocol variables** `{$name}`/`{name}` — scoped to one protocol run; not inputs, not outputs, not deliverable, not addressable; never in a contract. Their lint (unbound-local/dead-binding) is a markdown concern.
- Rule **text**, scope-placement rationale, grouped key→value bodies.
- AP-60 conformance itself — a lint over the markdown ids, not a type. The contract **never** "fixes" a non-conformant id (external-tool mirrors like `cloudId` stay verbatim).
- Value types. Markdown declares no types; `bind:` values are `ValueRef` (opaque). AP-60 shape-derived refinement (predicate→boolean, plural→array, map-singular→record) is a flagged optional lint layer, not contract structure (OQ-S4).

### 4.5 Trust boundary and regeneration

The generated module's contract data is **types only** — no contract values exist inside the sandbox, and nothing semantics-load-bearing is imported from it. Its only runtime statements are the `makeScore` constructor destructure (a value-identity over `@workflow-plane/score`'s constructor set — the registry parameter is purely a type argument) and the `CONTRACT_DIGEST` literal. The compiler re-derives all contracts from the technique markdown for every semantic pass (PROV/BIND/ADDR/INT); `CONTRACT_DIGEST` keeps tsc's view and the compiler's view in lockstep — drift is CTR-001 ERROR ("regenerate"), extending the repository's existing binding-fidelity drift guard (commit ed514218). CTR-001 reads the digest from the generated module's source text (never via sandbox import). Markdown is the single source of truth; tsc's view is never authoritative over it.

Pre-composition fans workflow-root and container edits into every consuming workflow's registry: a `meta` technique edit requires regenerating each dependent `score.gen.ts`. CTR-001 makes staleness loud at the next compile; CI runs `score-contracts gen --check` across the corpus. (The generic late-composition encoding — inventory option (b) — is type-heavier but incremental; it is swappable later without authoring-surface change.)

### 4.6 snake_case / kebab-case discipline

- **kebab-case** (techniques, operations, resources, rule names, node ids, branch keys, option ids): slugs, never evaluated variables. They appear in address/rule literal types and `NodeId`s, never as symbol-map keys.
- **snake_case** (symbol ids): runtime variables, bound by exact string match. The protocol mandates snake_case (AP-60); the *Orchestra-era corpus* contains kebab symbols (`current-domain`). The single normative rule:
  1. Every tool in the pipeline preserves symbol bytes verbatim — generator, compiler, transpiler, reader. **No tool ever renames a symbol.**
  2. ID-002 enforces snake_case **only** for symbols authored in the artifact itself (`vars:` keys, `each:`, activity `inputs` bare symbols, action `set` targets) and only outside the `--parity` profile. Symbols used because a contract declares them are exempt at the use site — they are spelled exactly as the markdown spells them, and the markdown lint owns their conformance.
  3. A kebab→snake corpus normalization, if ever undertaken, is a separate, audited, *simultaneous* migration across Score artifacts and technique markdown (OQ-S2). A silent mapping table inside the transpiler is forbidden: any miss silently breaks technique input resolution — the worst fidelity hazard in this design space.

### 4.7 Addressing recap (unchanged from the technique protocol)

`[<workflow>::]<technique>[::<nested>…]`; unprefixed refs resolve current-workflow-first, then `meta`; slash form normalized; a trailing segment matching a rule name addresses the rule (bundle layer); `<technique>::<group>` expands to the `<group>-*` rule set (materialized at generation); `.`-dotted citations name rules without invoking. The registry's keys are the *invocable* technique addresses; `techniques.supporting` is typed `SupportingRef<Addr>` (`Addr | `` `${Addr}::${string}` ``) so rule-segment and group forms **pass tsc on a valid technique base** and the trailing segment is the ADDR-002 compile check against the contract's rule-name sets. Only `primary` (and step `technique:`) addresses are fully tsc-proved.

---

## 5. Compile pipeline

`score-compile` stages: **(1)** tsc type-check → **(2)** deterministic bundle → **(3)** sandboxed single-shot execution → **(4)** post-run determinism verification → **(5)** AST construction with source spans → **(6)** semantic passes (rule families, §7) → **(7)** lowering + canonicalization → **(8)** canonical IR bytes + content hash + diagnostics. The pipeline runs with no runtime present (Phase-1 shippable, R-PAR-4) and is exposable later as a governed `workflow_compile` MCP tool over the same entry point (R-GOV-4).

### 5.1 Deterministic sandbox (locked decision 1, operationalized)

The artifact's module graph is bundled deterministically and evaluated **exactly once** per compile (then once more for DET-004) in an isolated realm (SES / hardened `node:vm` class) with frozen intrinsics. The assumed authoring tsconfig is **`strict` + `noUnusedLocals`** (the FLOW-002 row in §2.3 and the generated-module emission both depend on it; stated here so the dependency is explicit).

**Canonical compile environment (normative).** A per-realm double run (DET-004) proves nothing across engines: ECMA-262 permits implementation-dependent results for `Math` transcendentals, and Unicode-sensitive operations track the engine's ICU version — an artifact can be DET-green on two machines yet hash differently, silently forking the signing/trace-parity story (R-PIPE-2, R-GOV-4). Canonical bytes are therefore **defined** as the output of a pinned `score-compile` toolchain version on a pinned engine + version (hence pinned Unicode/ICU version), recorded in the diagnostics header; compiles on other environments are advisory. CI additionally compiles the corpus on two distinct engines and byte-compares — closing the class, not enumerating it.

| Rule | Sev | Statement |
|---|---|---|
| **DET-001** | ERROR | Import allowlist: `@workflow-plane/score` (the constructor runtime — the only package-level runtime body in the sandbox), the workflow's generated `score.gen` module (contract **data** is types-only/erased; its only runtime statements are the `makeScore` destructure and the `CONTRACT_DIGEST` const, both of which execute in the sandbox), and relative sibling definition modules of the **same workflow**. Nothing else — no node builtins, no third-party packages, no dynamic `import()`. **Evaluation order** is the ESM resolution-order depth-first post-order from the entry module (the standard, deterministic ESM order — dependencies before dependents); lexicographic module-path order is used only for deterministic *enumeration* of entry modules and hash inputs, never as an evaluation order. Cross-activity imports are bounded to the workflow, and a node value reachable from two activities' definitions is ID-007 ERROR (ownership). |
| **DET-002** | ERROR | **Closed-allowlist realm**, not a poison enumeration: the realm exposes exactly the allowlisted intrinsics (`Object`, `Array`, `String`, `Number`, `Boolean`, `JSON`, `Map`/`Set`, `Math` minus `random` and the implementation-dependent transcendentals, structural `Reflect` subset); everything else is absent or a throwing stub naming the call site — including `Date`, `Math.random`, `crypto`, `performance`, timers, `process`, `fetch`, fs, **`Intl`** (timezone/locale leaks), locale-sensitive string methods (`localeCompare`, `toLocale*`), `String.prototype.normalize` (ICU-version-sensitive), **`Atomics`/`SharedArrayBuffer`** (timing channel), **`WeakRef`/`FinalizationRegistry`** (observable GC). `import.meta` is stubbed to a fixed value; `Error.prototype.stack` is stripped (host paths). Anything not allowlisted throws DET-002. |
| **DET-003** | ERROR | Constructors **eagerly deep-copy arguments into frozen, null-prototype plain values at call time** — neutralizing Proxies, accessor properties, and post-call mutation in one move. The post-run structural walk then verifies the exported definition value graph is pure data: any surviving function, closure, promise, symbol-keyed property, **own accessor property, non-plain prototype**, or class instance is rejected. All callbacks (loop bodies) execute during the single build run; nothing executable survives into IR (R-P2/R-P3). |
| **DET-004** | ERROR | In-compile double run: the builder executes twice, **each run in a fresh realm with a fresh module cache** (a shared cache would mask module-level state); the two canonical IR serializations are byte-compared. A mismatch aborts. (CI re-run hashing alone leaves a window where the first nondeterministic artifact ships locally.) |
| **DET-005** | ERROR | The default export must be a `WorkflowDef`, or an `ActivityDef` for a module imported by a workflow root. The canonical Document is always **workflow-rooted** (§6.1); a direct activity-only compile is a diagnostics-only mode with no canonical bytes. |
| **DET-006** | ERROR | The builder threw: reported with the in-realm stack mapped through the bundle's source map. |
| **DET-007** | ERROR | A sequence item, transition row, or option value was not produced by a Score constructor (hand-forged literal: structurally type-legal but carries no constructor-recorded payload). Named diagnostic + span, never an internal error. |

Insertion-order determinism: ECMA-262 enumerates string keys in insertion order **except** canonical array-index keys, which enumerate numerically. ID-004 (ERROR) therefore forbids array-index keys in `cases:`/`vars:`/branch/effect record literals — normatively, a key `k` with `k === String(n)` for some integer `0 ≤ n ≤ 2^32−2` (keys like `'01'`, `'1.5'`, `'-1'`, `'1e3'` are *not* in this class and are safe; `'4294967294'` is). Because the engine reorders before any compiler code can observe the object, ID-004 detects only the *presence* of such a key — the authored order is unrecoverable, which is why the rule is ERROR rather than an auto-fix. (The legacy grammar's `Id` keys cannot collide with this rule, so the transpiled corpus is unaffected.) The `'__proto__'` key is separately reserved (§3.3.4). Checkpoint options and transitions are arrays and carry their order structurally.

### 5.2 Lowering and canonicalization

Lowering follows the R-IR-2/R-IR-3 table verbatim (§3.3's construct→node mapping). Additional canonicalization rules:

- **Field order** is fixed per production by the L2 grammar (§6); serialization is compact JSON (no insignificant whitespace), UTF-8, JCS-style escaping, integers in decimal without leading zeros. **No Unicode normalization anywhere in the pipeline**: strings serialize as their exact authored code-point sequences. (An earlier draft mandated NFC; that rewrites bytes — for any SymbolId, NodeId, branch key, or address it is exactly the rename tenet 5 forbids, and it is Unicode-version-sensitive. Escaping alone guarantees valid bytes.)
- **Semantic order is authored order**: `run`/block items, branch arms and their sequences, checkpoint options, transitions, route branches, activity `inputs`, `activities[]`.
- **Non-semantic key sets sort by UTF-16 code unit** (the pinned meaning of "lexicographic" everywhere in this spec — it matches both JS default string comparison and RFC 8785): `vars`, `artifactLocations`, `Invoke.bindings`, `technique_args`, effect `setVariable` maps. (Serialized as pair-arrays, §6.2, so order is explicit in the bytes.)
- **Value reuse** lowers to one node + N id-references (the legacy declare-once/reference-many graph): nodes live in a per-activity node table; sequences hold `NodeId` strings.
- **Node-table order** is the depth-first first-occurrence walk of `run`, then declared `blocks` in authored order, **then `artifacts` in authored order, then activity-level `triggers` in authored order, then step-level triggers in first-referencing-step order** (artifact/trigger envelopes are referenced by NodeId from the activity productions, so their node-table position must be pinned or canonical bytes are underdetermined) — deterministic from canonical structure, independent of builder internals.
- **`CONTRACT_DIGEST` inputs (normative)**: sha256 over the concatenation of (relative POSIX path + `\0` + LF-normalized UTF-8 file content) for every source markdown file, paths sorted by UTF-16 code unit. The same LF normalization applies when the compiler re-derives contracts (git autocrlf must not fork the digest).
- **Envelope**: every node is wrapped `NodeEnvelope { id, node, policy }` with the inert Phase-1 `ExecutionPolicy` (R-IR-ENV). The envelope is present in the bytes so Phase-2 policy attachment never reshapes the IR.
- **Hash**: sha256 over the canonical bytes is the signable artifact identity (R-GOV-4, R-X-1).

### 5.3 Stable-id discipline

- Two id concepts, normatively distinct: the **canonical short id** — the authored id verbatim, or a structural id for anonymous items — is what the envelope/Block `"id"` bytes carry (§6.2); the **qualified node address** `<workflow>/<activity>/<kind>:<id>` is *derived* for diagnostics, manifests, and trace events (R-PAR-3) and **never appears in canonical bytes**. The `<kind>` segment is a fixed enumeration mapped from IR node kinds: `invoke→step`; `await_input`/`branch_match`/`branch_cond`/`route→decision`; `iterate→loop`; `checkpoint→checkpoint`; every other kind maps to its own kind string.
- Activity ordinals: `activities[]` position, or explicit `{ ordinal }` for corpus parity; ID-005 requires dense + unique. `NN` is normatively the decimal ordinal **zero-padded to two digits** (`02`); ordinals > 99 use natural width. `artifactPrefix` is recomputed as `NN` (ART-002, never authored); `outputOf()` lowering and the reader use the same `NN` format, so reader and Score bytes agree.
- Anonymous items (messages, terminals, pass-throughs, anonymous sequences) get deterministic **structural ids** `<owner-id>#<index>`, where `index` is the 0-based position **among all items of the owning sequence** and `owner-id` is the owning block's id for block items, `<decision-id>@<arm-key>` for items of a branch arm (`@then`/`@else` for `ifElse`, `@otherwise` for `match`), and the loop id for loop-body items. Identical for the TOON reader and Score by construction; **stable under edits in other sequences — any insertion, removal, or reorder within the owning sequence shifts later structural ids** (not just "local reorder"); absent from the trace-event vocabulary (legacy gives these no identity, so no parity loss). Phase-2 note: per-node policy (R-GOV-1) must key on *authored* ids — keying on a structural id pins the containing sequence's content.
- `outputOf()` refs lower to `NN.step.symbol` with `NN` derived at lowering — activity reorder re-derives instead of dangling. Raw qualified strings are checked by ID-006: shape (regex, §3.2) and existence (the ordinal names a preceding activity containing that step and output). Under `--strict-refs`, **every raw qualified ref is an ERROR** (forcing `outputOf()`), closing the silent-misresolution window **statelessly** — an earlier draft keyed this on "the last compile snapshot", which made diagnostics a function of mutable machine-local state, violating R-P2/R-PIPE-2.
- **Step indices (trace parity).** The live state vocabulary records steps by integer position (`completedSteps`, `triggeredFrom.stepIndex`, history `step ≥ 1`). Normatively: `stepIndex` = 1-based position of the `Invoke` envelope among `Invoke` envelopes in node-table order. The §9.1 synthesis rule places TOON `steps[]` first in declaration order, so reader-produced IR reproduces the legacy numbering; the golden trace-diff suite verifies it.
- **ID-008 (WARN default / ERROR under `--strict-refs`):** the id argument of every constructor call must be a string literal at the call site (enforced by the §5.4 span-injecting transformer, which already visits every constructor call). Computed ids — positional `` `check-${i}` `` ids especially — let an unrelated edit renumber untouched siblings' NodeIds and churn manifests/traces while compiling green. Content-derived ids are the sanctioned escape where genuinely needed (suppress per-site).

### 5.4 Source mapping

A small TS transformer injects `(file, line, col)` spans into constructor calls at bundle time — engine-independent, the only mechanism allowed to feed diagnostics in the canonical pipeline. Stack introspection is a diagnostics-only fallback (never canonical). Spans live in the AST sidecar (one of the three stored representations: Source, AST, IR — R-PIPE-2) and **never** in canonical IR: reformatting an artifact cannot change its IR hash.

### 5.5 Diagnostics model

One rule-id vocabulary across all stages, severity-graded (ERROR / WARN / INFO), source-spanned, emitted human-readable **and** as machine JSON (agents iterate on the JSON):

```json
{ "rule": "DEC-001", "severity": "WARN", "stage": "compile",
  "node": "work-package/requirements-elicitation/decision:platform-routing",
  "span": { "file": "activities/02-requirements-elicitation.ts", "line": 96, "col": 5 },
  "message": "match 'platform-routing' has no otherwise: branch; unmatched values pass through at runtime." }
```

- **tsc-stage** failures surface through the generated registry so they point at the offending literal. Realistic shape (probe-verified): overload resolution wraps both classes in **TS2769 "No overload matches this call"** with a multi-line elaboration — the salient line (the `Did you mean '"jira-comment"'?` suggestion for a bad address; the named excess property for a bad bind key) is the **last** line. The `score-compile` wrapper re-surfaces that salient line first in its own diagnostic. GEN-002 fixtures assert (a) the error fires and (b) the salient line **as a substring** — never whole-message equality, which is brittle across compiler versions.
- **Legacy rule ids are preserved** wherever the rule survives (PROV/SYM→ID mapping noted in §7.3); severity grading survives hoisting (P4).
- **Profiles**: default (new authoring — MIG-001/ID-002 active) and `--parity` (corpus equivalence — MIG-001/ID-002 silent; INT-001 demoted to WARN, legacy interpolation being unvalidated; EXPR-101 active, gating the one construct family with no TOON equivalent — ordering comparators in `ifElse()` conditions). Profiles change *severity routing only*, never semantics.

### 5.6 Compile passes (inventory)

In order: DET-007 constructor-provenance walk → ID family (uniqueness, grammar, ordinals, array-index-key guard, ID-008 literal ids) → REF/RET resolution (byId incl. block targets, retry, rerun, goTo, transitions) → block reachability (FLOW-002, incl. `InvokeBlock` references) → loop containment (LOOP-002 walk for sentinel **and** tokens, LOOP-101 token nesting, LOOP-102 rerun enclosure, LOOP-004 maxIterations > 0) → decision analyses (DEC-001 WARN, DEC-002 transitive closure, DEC-005 non-empty cases, ACT-001 non-empty run) → TERM-101 reachability → scope-chain resolution (SCOPE-002, PROV-001, **BIND-001 key re-check** (the tsc half covers fresh literals only), BIND-002/003/004, BIND-005 args keys, INT-001 tokens, ART-001 locations, DSP-001 passContext, RES-001 mode resources) → cross-activity resolution (PROV-002 residue, ID-006) → contract verification (ADDR-001 re-verify, ADDR-002 rule segments, CTR-001 digest) → workflow shape (WF-001..003, TRN-001..003, RTE-001, CKPT-001/003/005/006) → GOV-001 → lowering (VAL-001 number/array canonicalization) → DET-004 double-run compare.

---

## 6. Canonical IR and serialization (L2)

### 6.1 Profile

The canonical serialization is a restricted JSON profile: compact (no insignificant whitespace), UTF-8, **verbatim code-point strings (no Unicode normalization — §5.2)**, JCS-style minimal escaping, `true|false|null` literals.

**Base lexemes (normative):**

- `Str` — JSON string, RFC 8785 (JCS) minimal escaping, code points verbatim.
- `Int` — optional `-` then decimal digits without leading zeros; magnitude ≤ 2⁵³ − 1.
- `Num` — a JSON number serialized per RFC 8785 §3.2.2.3 (ECMA-262 `Number::toString`: shortest round-trip). Admitted **only** where a production says `Num`; `-0` serializes as `0`.
- `Bool` — `true | false`.
- `Json` — an arbitrary JSON subtree serialized per **RFC 8785 (JCS) wholesale**: member keys sorted by UTF-16 code unit recursively, numbers per `Num`. Floats are therefore representable inside opaque `Json` values (TOON value domains — `condition` values, variable `defaultValue`, `technique_args`, `setVariable` — are JSON numbers), while structural counters (`ordinal`, `max_iterations`, `auto_advance_ms`) remain `Int`.
- **VAL-001 (ERROR, lowering):** rejected outright in any walked value: non-finite numbers (`NaN`/`±Infinity` — `JSON.stringify` would silently nullify them), integers beyond ±(2⁵³ − 1) in `Int` positions, non-integers in `Int` positions, `undefined` values and array holes. `-0` canonicalizes to `0` (JCS).

**Field order is fixed by the productions below.** The commas written in the productions are **schematic, not literal**: a conforming serializer emits exactly the present fields in production order, joined by single commas (so an absent leading optional field never yields a dangling comma, and an all-optional production like `Effect`/`TechRefs` never derives `{}` — a field whose value would be the empty object is omitted entirely). Optional fields are omitted when absent, never `null`-filled unless the production says `null`.

**Default materialization (normative):** for optional fields with an authoring default, the serializer **omits the field iff its value equals the default** (explicit-default and omitted author spellings produce identical bytes): `Invoke.required` (true), `Checkpoint.required` is always materialized along with `blocking` (protocol-critical — deliberately always-present, like `EmitArtifact.action`), `Iterate.max_iterations` (100), `Transition.is_default` (false), `RouteArm.is_default` (false), `Block.declared` (false), `VarDecl.required` (false), `Location.gitignored` (false). The TOON reader applies the identical table.

**Operand disambiguation:** wherever a production admits `(VarPath | QualifiedRef)`, the classification is lexical and normative (§3.2): first dot-segment all digits ⇒ `QualifiedRef`; a `VarPath` whose first segment is all digits is unserializable (ID-006 rejects it upstream). `SymbolId` is otherwise verbatim bytes.

Map-like data is serialized as **pair arrays** so key order is explicit in the bytes (§5.2: semantic order authored, non-semantic sorted by UTF-16 code unit).

The grammar below uses the lexemes above and `[ X ]` for "field optional/omitted-when-absent". Every production is exhaustive: a canonical document contains nothing not derivable here. The canonical `Document` is always **workflow-rooted**: per-activity modules reach canonical bytes only through the workflow module that imports them (DET-005); there is no activity-rooted document form.

### 6.2 Grammar

```ebnf
(* ============ document ============ *)
Document     ::= '{' '"format":"wp-ir/0.1"' ',' '"workflow":' Workflow '}'

(* ============ identifiers ============ *)
KebabId      ::= Str            (* ^[a-z][a-z0-9-]*$ *)
SymbolId     ::= Str            (* verbatim symbol bytes *)
VarPath      ::= Str            (* SymbolId ('.' SymbolId)*; first segment NOT all digits (§6.1) *)
QualifiedRef ::= Str            (* DIGIT+ '.' KebabId '.' SymbolId — disjoint from VarPath by the
                                   leading-digit rule, so (VarPath | QualifiedRef) is unambiguous *)
NodeId       ::= Str            (* canonical SHORT id: authored KebabId, or structural
                                   '<owner>#<index>' / '<decision>@<arm-key>#<index>' (§5.3).
                                   The qualified '<workflow>/<activity>/<kind>:<id>' address is
                                   DERIVED for diagnostics/traces, never in canonical bytes. *)
SemVer       ::= Str            (* D+.D+.D+ *)

(* ============ workflow ============ *)
Workflow     ::= '{' '"id":' KebabId ',' '"version":' SemVer ',' '"title":' Str
                 [',' '"description":' Str] [',' '"author":' Str]
                 [',' '"tags":[' Str (',' Str)* ']']
                 [',' '"rules":[' Str (',' Str)* ']']
                 ',' '"execution_model":' ExecModel
                 [',' '"variables":[' VarDecl (',' VarDecl)* ']']        (* sorted by name *)
                 [',' '"modes":[' Mode (',' Mode)* ']']                  (* authored order *)
                 [',' '"artifact_locations":[' Location (',' Location)* ']']  (* sorted by key *)
                 [',' '"techniques":' TechRefs]
                 [',' '"initial_activity":' KebabId]
                 ',' '"activities":[' Activity (',' Activity)* ']'       (* ordinal order *)
                 '}'
ExecModel    ::= '{' '"roles":[' Role (',' Role)* ']' '}'
Role         ::= '{' '"id":' KebabId ',' '"description":' Str '}'
VarDecl      ::= '{' '"name":' SymbolId ',' '"type":' VarType
                 [',' '"description":' Str] [',' '"default":' Json]
                 [',' '"required":' Bool] '}'
VarType      ::= '"string"' | '"number"' | '"boolean"' | '"array"' | '"object"'
Mode         ::= '{' '"id":' KebabId ',' '"name":' Str [',' '"description":' Str]
                 ',' '"activation_variable":' SymbolId
                 [',' '"recognition":[' Str (',' Str)* ']']
                 [',' '"skip_activities":[' KebabId (',' KebabId)* ']']
                 [',' '"defaults":[' Pair (',' Pair)* ']']               (* sorted by key *)
                 [',' '"resource":' Str] '}'
Location     ::= '{' '"key":' KebabId ',' '"path":' Str
                 [',' '"description":' Str] [',' '"gitignored":' Bool] '}'
TechRefs     ::= '{' ['"primary":' Str] [',' '"supporting":[' Str (',' Str)* ']'] '}'
Pair         ::= '{' '"key":' Str ',' '"value":' Json '}'

(* ============ activity ============ *)
Activity     ::= '{' '"id":' KebabId ',' '"ordinal":' Int ',' '"version":' SemVer
                 ',' '"artifact_prefix":' Str                            (* recomputed, e.g. "02" *)
                 [',' '"name":' Str]                                     (* TOON activity name; omitted iff = id *)
                 ',' '"description":' Str [',' '"problem":' Str]
                 [',' '"recognition":[' Str (',' Str)* ']']
                 [',' '"techniques":' TechRefs]
                 [',' '"inputs":[' InputRef (',' InputRef)* ']']         (* authored order *)
                 ',' '"nodes":[' NodeEnvelope (',' NodeEnvelope)* ']'    (* first-occurrence walk *)
                 ',' '"blocks":[' Block (',' Block)* ']'                 (* 'main' first, then declared *)
                 ',' '"entry":"main"'
                 [',' '"transitions":[' Transition (',' Transition)* ']'](* authored order *)
                 [',' '"artifacts":[' NodeId (',' NodeId)* ']']          (* EmitArtifact node ids *)
                 [',' '"triggers":[' NodeId (',' NodeId)* ']']           (* Dispatch node ids *)
                 [',' '"entry_actions":[' Action (',' Action)* ']']
                 [',' '"exit_actions":[' Action (',' Action)* ']']
                 [',' '"outcome":[' Str (',' Str)* ']']
                 [',' '"context_to_preserve":[' Str (',' Str)* ']']
                 [',' '"required":' Bool] [',' '"estimated_time":' Str]
                 [',' '"rules":[' Str (',' Str)* ']']
                 '}'
InputRef     ::= '{' '"symbol":' SymbolId [',' '"qualified":' QualifiedRef] '}'
Block        ::= '{' '"id":' NodeId ',' '"items":[' [NodeId (',' NodeId)*] ']'
                 [',' '"declared":' Bool] '}'                            (* true = authored block() *)
Transition   ::= '{' ['"when":' BoolExpr ','] '"to":' KebabId
                 [',' '"is_default":' Bool] '}'
Action       ::= '{' '"do":' ActionKind [',' '"target":' Str] [',' '"message":' Str]
                 [',' '"value":' ValueSource]                            (* var | qualified | literal,
                                                                            mirroring Binding *)
                 [',' '"description":' Str]
                 [',' '"when":' BoolExpr] [',' '"validate":' BoolExpr] '}'
ActionKind   ::= '"set"' | '"log"' | '"message"' | '"validate"' | '"emit"'

(* ============ envelope (R-IR-ENV) ============ *)
NodeEnvelope ::= '{' '"id":' NodeId ',' '"node":' Node ',' '"policy":' Policy '}'
Policy       ::= '{' '"audit":' Bool                                     (* Phase 1: false *)
                 [',' '"required_role":' KebabId]                        (* Phase 2+ *)
                 [',' '"capability_scope":[' Str (',' Str)* ']']
                 [',' '"approval":' Json] [',' '"retry":' Json] [',' '"timeout":' Int]
                 '}'

(* ============ nodes (closed set) ============ *)
Node         ::= Invoke | AwaitInput | BranchMatch | BranchCond | Route
               | Iterate | InvokeBlock | EmitMessage | GotoActivity | LoopExit | LoopRestart
               | ReEvaluate | PassThrough | Terminate
               | Checkpoint | Dispatch | EmitArtifact
               | RequireApproval | CapabilityGate | Delegate              (* reserved *)

Invoke       ::= '{' '"kind":"invoke"' [',' '"description":' Str]        (* omitted when unauthored *)
                 [',' '"technique_ref":' Str]                            (* absent = trivial step *)
                 [',' '"bindings":[' Binding (',' Binding)* ']']         (* sorted by input *)
                 [',' '"technique_args":[' Pair (',' Pair)* ']']         (* sorted by key *)
                 [',' '"when":' BoolExpr] [',' '"required":' Bool]
                 [',' '"actions":[' Action (',' Action)* ']']
                 [',' '"triggers":[' NodeId (',' NodeId)* ']']
                 '}'
Binding      ::= '{' '"input":' SymbolId ',' '"source":' ValueSource '}'
ValueSource  ::= '{' '"var":' VarPath '}'
               | '{' '"qualified":' QualifiedRef '}'
               | '{' '"literal":' Json '}'

AwaitInput   ::= '{' '"kind":"await_input"' ',' '"prompt":' Str
                 ',' '"arms":[' [Arm (',' Arm)*] ']' '}'                 (* zero arms = ack gate *)
Arm          ::= '{' '"key":' Str ',' '"items":[' [NodeId (',' NodeId)*] ']' '}'

BranchMatch  ::= '{' '"kind":"branch_match"' ',' '"variable":' (VarPath | QualifiedRef)
                 ',' '"cases":[' Arm (',' Arm)* ']'                      (* authored order *)
                 [',' '"otherwise":[' [NodeId (',' NodeId)*] ']'] '}'
BranchCond   ::= '{' '"kind":"branch_cond"' ',' '"condition":' BoolExpr
                 ',' '"then":[' [NodeId (',' NodeId)*] ']'
                 [',' '"else":[' [NodeId (',' NodeId)*] ']'] '}'
Route        ::= '{' '"kind":"route"' ',' '"name":' Str [',' '"description":' Str]
                 ',' '"branches":[' RouteArm ',' RouteArm (',' RouteArm)* ']' '}'
RouteArm     ::= '{' '"id":' KebabId ',' '"label":' Str
                 [',' '"when":' BoolExpr] [',' '"to":' KebabId]          (* absent to = Terminate *)
                 [',' '"is_default":' Bool] '}'

Iterate      ::= '{' '"kind":"iterate"' ',' '"loop_kind":' LoopKind
                 [',' '"name":' Str]                                     (* TOON loop name; omitted iff = id *)
                 [',' '"description":' Str]
                 [',' '"var":' SymbolId] [',' '"over":' (VarPath | QualifiedRef)]
                 [',' '"condition":' BoolExpr] [',' '"break_when":' BoolExpr]
                 [',' '"max_iterations":' Int]                           (* > 0; omitted iff = 100 *)
                 ',' '"body":' LoopBodyIR '}'
LoopKind     ::= '"for_each"' | '"while"' | '"do_while"'
LoopBodyIR   ::= '{' '"block":' NodeId '}'
               | '{' '"activities":[' KebabId (',' KebabId)* ']' '}'

InvokeBlock  ::= '{' '"kind":"invoke_block"' ',' '"block":' NodeId '}'   (* legacy inline '- flow: <id>';
                                                                            target must be a Block id (REF-001) *)

EmitMessage  ::= '{' '"kind":"emit_message"' ',' '"text":' Str '}'
GotoActivity ::= '{' '"kind":"goto_activity"' ',' '"to":' KebabId '}'
LoopExit     ::= '{' '"kind":"loop_exit"' [',' '"loop":' NodeId] '}'     (* absent = dynamic innermost *)
LoopRestart  ::= '{' '"kind":"loop_restart"' ',' '"loop":' NodeId
                 [',' '"bound":' Bool] '}'                               (* true = authored it.restart token;
                                                                            absent = rerun() by-reference (§6.3) *)
ReEvaluate   ::= '{' '"kind":"reevaluate"' ',' '"decision":' NodeId '}'
PassThrough  ::= '{' '"kind":"pass_through"' '}'
Terminate    ::= '{' '"kind":"terminate"' '}'

Checkpoint   ::= '{' '"kind":"checkpoint"' ',' '"name":' Str ',' '"message":' Str
                 [',' '"condition":' BoolExpr]
                 ',' '"options":[' Option (',' Option)* ']'              (* authored order *)
                 ',' '"blocking":' Bool
                 [',' '"default_option":' KebabId] [',' '"auto_advance_ms":' Int]
                 ',' '"required":' Bool '}'
                 (* default_option/auto_advance_ms only with blocking:false (CKPT-006
                    normalization); auto_advance_ms > 0 and requires default_option *)
Option       ::= '{' '"id":' KebabId ',' '"label":' Str [',' '"description":' Str]
                 [',' '"effect":' Effect] '}'
Effect       ::= '{' ['"set_variable":[' Pair (',' Pair)* ']']           (* sorted by key *)
                 [',' '"transition_to":' KebabId]
                 [',' '"skip_activities":[' KebabId (',' KebabId)* ']'] '}'

Dispatch     ::= '{' '"kind":"dispatch"' ',' '"workflow_id":' KebabId
                 [',' '"pass_context":[' SymbolId (',' SymbolId)* ']']
                 [',' '"description":' Str] '}'

EmitArtifact ::= '{' '"kind":"emit_artifact"' ',' '"name":' Str
                 [',' '"location":' Str]                                 (* contains '/' or '.' = path;
                                                                            else artifactLocations key (ART-001) *)
                 ',' '"action":' ('"create"' | '"update"')
                 [',' '"description":' Str] '}'

(* ============ reserved governance nodes (Phase 2+; R-IR-4) ============ *)
RequireApproval ::= '{' '"kind":"require_approval"' ',' '"role":' KebabId
                    ',' '"message":' Str
                    [',' '"options":[' Option (',' Option)* ']']
                    [',' '"on_deny":' ('"fail_node"' | '"fail_workflow"' | '"escalate"')] '}'
CapabilityGate  ::= '{' '"kind":"capability_gate"'
                    ',' '"capability_scope":[' Str (',' Str)* ']'
                    ',' '"on_violation":' ViolationAction
                    ',' '"body":' NodeId '}'                             (* a Block id *)
ViolationAction ::= '"deny"' | '"fail_node"' | '"fail_workflow"' | '"escalate"' | '"nudge"'
Delegate        ::= '{' '"kind":"delegate"' ',' '"role":' KebabId
                    ',' '"workflow_id":' KebabId
                    [',' '"pass_context":[' SymbolId (',' SymbolId)* ']'] '}'

(* ============ expressions ============ *)
BoolExpr     ::= Simple | AndE | OrE | NotE
Simple       ::= '{' '"op":' CmpOp ',' '"var":' (VarPath | QualifiedRef)
                 [',' '"value":' (Str | Num | Bool | 'null')] '}'        (* absent iff op is an exists op;
                                                                            Num: condition.schema values are
                                                                            JSON numbers, floats included *)
CmpOp        ::= '"=="' | '"!="' | '">"' | '"<"' | '">="' | '"<="'
               | '"exists"' | '"not_exists"'
AndE         ::= '{' '"all":[' BoolExpr ',' BoolExpr (',' BoolExpr)* ']' '}'
OrE          ::= '{' '"any":[' BoolExpr ',' BoolExpr (',' BoolExpr)* ']' '}'
NotE         ::= '{' '"not":' BoolExpr '}'
```

### 6.3 Notes

1. **Trivial steps** are `Invoke` without `technique_ref` (R-IR-2 maps technique-backed steps to `Invoke`; the trivial step is the degenerate case, performed directly by the agent from `description`). **Invoke carries no `outputs` slot** — a recorded deviation from the design spec's R-IR-2 row (`Invoke { technique_ref, bindings, outputs }`): outputs are re-derived from the technique contract at delivery, keeping markdown the single contract truth (§4.5). `description` is omitted when unauthored (no fabricated default — the contract capability prose is the agent's guidance).
2. **Step-level `checkpoint:`** never appears as a step field in IR — the checkpoint node lowers to **one** `Checkpoint` envelope in the node table, and its `NodeId` is inserted immediately before each referencing step's `NodeId` in the owning sequence (one declaration, N yield sites; §3.3.1).
3. **`LoopExit.loop`** present ⇔ the authored form was a loop-bound token; absent ⇔ the dynamic-innermost sentinel. Symmetrically, **`LoopRestart.bound`** is `true` ⇔ the authored form was `it.restart`; absent ⇔ `rerun()` by reference. The transpiler emits only the token-free forms, matching the reader, preserving byte equality (§9.2). Runtime semantics are identical (LOOP-101/LOOP-102 guarantee containment either way).
4. **`Block.declared`** is `true` only for authored `block()` values (and reader-ingested named flows); structural blocks omit it. `main` is always first and never `declared`. A `Block` is **never itself a sequence item**: inline invocation is the `InvokeBlock` node (the legacy `- flow: <id>`), so `Block.items` NodeIds always resolve to node envelopes.
5. **Branch identity (trace parity, normative):** the runtime records `decisionOutcomes.branchId` as: the arm key (`AwaitInput`/`BranchMatch` cases), the literal strings `"true"`/`"false"` for `BranchCond` then/else, `"default"` for a taken `BranchMatch.otherwise`, and the `RouteArm.id` for routes — exactly the strings the live server records for the legacy forms. (A `match` with a literal case key `"default"` *and* an `otherwise:` makes the two trace-indistinguishable; the compiler emits an INFO note.)
6. **Graph projection** (R-IR-5): every production above projects onto the derived graph view — `BoolExpr` → `Guard`; `Invoke`/`Checkpoint`/`Dispatch`/`EmitArtifact`/actions → `Effect` kinds; `Transition`/`GotoActivity`/route arms → `Edge`. The tree above is the authoring-faithful Phase-1 form; the graph is derived, never serialized canonically.
7. **Reserved nodes** are grammar-legal so Phase-2 artifacts need no format bump; the Phase-1 validator rejects their *presence* (GOV-001) — the grammar admits them, the constraint layer forbids them, mirroring how `Policy` carries inert reserved fields.
8. **Prose constraints carried by the d.ts and re-checked at compile** (the grammar alone cannot express them): `for_each` ⇒ `var` + `over` present, `condition` absent; `while`/`do_while` ⇒ `condition` present, `over` absent; `Action` kind/field coupling (`set`/`emit` ⇒ `target`; `log`/`message`/`validate` ⇒ `message`; `validate` ⇒ `validate` expr); `Simple.value` absent iff exists-op. The reader path produces these productions too, so the couplings are restated as L3 facts (§7.1) — surface DbC alone does not cover reader-produced IR.

---

## 7. Semantic constraints (L3)

### 7.1 Alloy module

Signatures correspond 1:1 to the §6 productions **over constraint-relevant structure**; descriptive metadata fields are deliberately abstracted away and enumerated here so any future rule touching one forces a sig update: workflow `description/author/tags/rules/techniques`, activity `version/description/problem/techniques/outcome/context_to_preserve/required/estimated_time/rules/name`, mode `name/description/recognition`, location `description/gitignored`, option `description`, `Invoke.description`, `Dispatch.description`, `EmitArtifact.description`, `VarDecl.description`, `Iterate.name/description`. Reference fields are modeled as **resolved object refs** (`one Activity`, `one Block`, …): a dangling reference is unrepresentable in an instance, so the dangling-ref halves of REF-001/TRN-001/CKPT-003/WF-002 are **validator-only** (listed in the closing note) — the facts below constrain *kind and containment*, which resolved refs do not give for free. Abstract helper functions (`scopeAt`, `resolve`, `contractOf`, `pad2`) mark the contract surface the TypeScript validator implements, as in the legacy module.

```alloy
module score/ir   -- v0.1, constraints over canonical wp-ir

// ===== identity =====
sig NodeId, SymbolId, KebabId, VarPath, QualifiedRef, Text {}
// Operand positions admit dotted paths or qualified refs (§6.1 disambiguation).

// ===== document =====
sig Workflow {
  id: one KebabId, version: one Text, title: one Text,
  roles: some Role,                                  -- ExecModel: >= 1 (WF-003)
  variables: set VarDecl, modes: set Mode, locations: set Location,
  initialActivity: lone Activity,
  activities: seq Activity                           -- ordinal = index + 1
}
sig Role { roleId: one KebabId }
sig VarDecl { name: one SymbolId, vtype: one VarType, default: lone Value, required: one Bool }
abstract sig VarType {} one sig TStr, TNum, TBool, TArr, TObj extends VarType {}
sig Mode { modeId: one KebabId, activationVariable: one SymbolId,
           skipActivities: set Activity, defaults: set SPair, resource: lone Text }
sig Location { key: one KebabId, path: one Text }
sig SPair { pkey: one Text, pvalue: one Value }
abstract sig Bool {} one sig True, False extends Bool {}
sig Value {}

sig Activity {
  actId: one KebabId, ordinal: one Int, artifactPrefix: one Text,
  recognition: set Text,
  inputs: seq InputRef,
  nodes: set Envelope, blocks: seq Block, entry: one Block,
  transitions: seq Transition,
  artifacts: set Envelope, triggers: set Envelope,
  entryActions: seq Action, exitActions: seq Action
}
sig InputRef { symbol: one SymbolId, qualified: lone QualifiedRef }
sig Block { blockId: one NodeId, items: seq Envelope, declared: one Bool }
sig Transition { guard: lone BoolExpr, to: one Activity, isDefault: one Bool }
sig Action { kind: one ActionKind, target: lone SymbolId, message: lone Text,
             value: lone ValueSource, validateExpr: lone BoolExpr, gate: lone BoolExpr }
abstract sig ActionKind {} one sig ASet, ALog, AMessage, AValidate, AEmit extends ActionKind {}

// ===== envelope (R-IR-ENV) =====
sig Envelope { nid: one NodeId, node: one Node, policy: one Policy }
sig Policy { audit: one Bool, requiredRole: lone Role, capabilityScope: set Text,
             approval: lone Value, retryPolicy: lone Value, timeout: lone Int }

// ===== nodes (closed) =====
abstract sig Node {}
sig Invoke extends Node { techniqueRef: lone Text, bindings: set Binding,
                          techniqueArgs: set SPair, gate: lone BoolExpr,
                          stepRequired: one Bool, actions: seq Action,
                          stepTriggers: set Envelope,
                          techContract: lone Contract }   -- populated by re-derivation (§4.5)
sig Binding { input: one SymbolId, source: one ValueSource }
abstract sig ValueSource {}
sig SrcVar extends ValueSource { varPath: one VarPath }
sig SrcQualified extends ValueSource { qref: one QualifiedRef }
sig SrcLiteral extends ValueSource { lit: one Value }

sig AwaitInput extends Node { prompt: one Text, arms: seq Arm }
sig Arm { key: one Text, armItems: seq Envelope }
sig BranchMatch extends Node { variable: one (VarPath + QualifiedRef),
                               cases: seq Arm, otherwiseItems: seq Envelope }
sig BranchCond extends Node { condition: one BoolExpr, thenItems: seq Envelope,
                              elseItems: seq Envelope }
sig Route extends Node { routeName: one Text, routeBranches: seq RouteArm }
sig RouteArm { raId: one KebabId, label: one Text, guard: lone BoolExpr,
               raTo: lone Activity, raDefault: one Bool }
sig Iterate extends Node { loopKind: one LoopKind, loopVar: lone SymbolId,
                           over: lone (VarPath + QualifiedRef), loopCond: lone BoolExpr,
                           breakWhen: lone BoolExpr, maxIterations: lone Int,
                           body: one LoopBodyIR }
abstract sig LoopKind {} one sig ForEach, While, DoWhile extends LoopKind {}
abstract sig LoopBodyIR {}
sig BodyBlock extends LoopBodyIR { bodyBlock: one Block }
sig BodyActivities extends LoopBodyIR { bodyActivities: seq Activity }

sig InvokeBlock extends Node { invokedBlock: one Block }   -- legacy '- flow: <id>'
sig EmitMessage extends Node { text: one Text }
sig GotoActivity extends Node { gotoTarget: one Activity }
sig LoopExit extends Node { boundLoop: lone Envelope }
sig LoopRestart extends Node { restartLoop: one Envelope, restartBound: lone Bool }
sig ReEvaluate extends Node { decision: one Envelope }
sig PassThrough, Terminate extends Node {}

sig Checkpoint extends Node { cpName: one Text, message: one Text,
                              presentGate: lone BoolExpr, options: seq Option,
                              blocking: one Bool, defaultOption: lone Option,
                              autoAdvanceMs: lone Int, cpRequired: one Bool }
sig Option { optId: one KebabId, label: one Text, effect: lone Effect }
sig Effect { setVariable: set SPair, transitionTo: lone Activity,
             skipActivities: set Activity }
sig Dispatch extends Node { workflowId: one KebabId, passContext: set SymbolId }
sig EmitArtifact extends Node { artifactName: one Text, location: lone Text,
                                action: one ArtifactAction }
abstract sig ArtifactAction {} one sig Create, Update extends ArtifactAction {}

// reserved (Phase 2+)
sig RequireApproval extends Node { apprRole: one Role, apprMessage: one Text,
                                   apprOptions: seq Option, onDeny: lone Text }
sig CapabilityGate extends Node { gateScope: set Text, onViolation: lone Text,
                                  gateBody: one Block }
sig Delegate extends Node { delRole: one Role, delWorkflowId: one KebabId,
                            delPassContext: set SymbolId }

// ===== expressions =====
abstract sig BoolExpr {}
sig Simple extends BoolExpr { op: one CmpOp, exprVar: one (VarPath + QualifiedRef),
                              exprValue: lone Value }
sig AndE extends BoolExpr { allOf: seq BoolExpr }
sig OrE  extends BoolExpr { anyOf: seq BoolExpr }
sig NotE extends BoolExpr { negated: one BoolExpr }
abstract sig CmpOp {}
one sig Eq, Ne, Gt, Lt, Gte, Lte, Exists, NotExists extends CmpOp {}

// ===== contracts (abstract mirror of the markdown re-derivation) =====
sig Contract { reqInputs: set SymbolId,            -- required AND defaultless
               declInputs: set SymbolId,
               qualifiedOf: SymbolId -> lone QualifiedRef }   -- technique-def qualifications
fun contractOf[n: Node]: lone Contract { n.techContract }  -- empty for non-Invoke

// ===== helpers (validator-implemented contract surface) =====
fun decisionNodes[a: Activity]: set Envelope {
  { e: a.nodes | e.node in AwaitInput + BranchMatch + BranchCond + Route } }
fun loopNodes[a: Activity]: set Envelope { { e: a.nodes | e.node in Iterate } }
fun stepNodes[a: Activity]: set Envelope { { e: a.nodes | e.node in Invoke } }
fun terminals[]: set Node { GotoActivity + Terminate + LoopExit }          -- TERM-002 partition
-- One structural edge relation, totally defined over the closed node set:
fun itemEdges[]: Envelope -> Envelope {
  { e1, e2: Envelope |
       e2 in e1.node.arms.elems.armItems.elems            -- AwaitInput arms
    or e2 in e1.node.cases.elems.armItems.elems           -- BranchMatch cases
    or e2 in e1.node.otherwiseItems.elems                 -- BranchMatch otherwise
    or e2 in e1.node.thenItems.elems + e1.node.elseItems.elems   -- BranchCond
    or e2 in e1.node.body.bodyBlock.items.elems           -- Iterate body block
    or e2 in e1.node.invokedBlock.items.elems }           -- InvokeBlock target
    -- (control-flow edges only; step triggers are containment, not flow — NodeTableClosure)
fun reachableItems[e: Envelope]: set Envelope { e.^(itemEdges) }           -- branch/body closure
fun loopReach[l: Envelope]: set Envelope {                                 -- l's reachable body
  l.node.body.bodyBlock.items.elems.*(itemEdges) }
fun armsOf[d: Envelope]: set Arm { d.node.arms.elems + d.node.cases.elems }
pred retryFree[items: set Envelope, d: Envelope] {
  no e: items + items.^(itemEdges) | e.node in ReEvaluate and e.node.decision = d }
fun resolve[s: SymbolId, at: Envelope]: lone Value { none } -- ABSTRACT: 4-level chain
  -- (local flow, loop variable, activity, workflow — SCOPE-001; validator-implemented)
fun pad2[i: Int]: Text { none }                             -- ABSTRACT: zero-padded ordinal
pred isCrossActivity[i: InputRef] { some i.qualified }      -- ABSTRACT in legacy ALS; the
  -- validator derives cross-activity-ness from producer analysis, not from the field

// ===== carried rules =====
// PROV-001 (ERROR): every required, defaultless contract input resolves at the
// invocation point via bindings, technique-def qualification, or the scope chain.
fact InputProvenance { all a: Activity, e: stepNodes[a], s: contractOf[e.node].reqInputs |
     (some b: e.node.bindings | b.input = s)
  or some contractOf[e.node].qualifiedOf[s]
  or some resolve[s, e] }
// PROV-002 (ERROR): cross-activity references use the qualified form, and the
// ordinal names a PRECEDING activity (producer existence is validator-checked).
fact QualifiedCrossRef { all a: Activity, i: a.inputs.elems |
  isCrossActivity[i] implies some i.qualified }
// ID-001 (ERROR; absorbs SYM-001..004): id uniqueness within an activity.
fact IdUniqueness { all a: Activity {
  all disj e1, e2: a.nodes | e1.nid != e2.nid
  all disj b1, b2: a.blocks.elems | b1.blockId != b2.blockId } }
// FLOW-001 (ERROR): entry block exists and is 'main'.
fact MainEntry { all a: Activity | a.entry in a.blocks.elems and a.blocks.first = a.entry }
// ACT-001 (ERROR): the node table is non-empty (run: must be non-empty).
fact NodesNonEmpty { all a: Activity | some a.nodes }
// Node-table closure: artifact/trigger envelopes live in the node table (§5.2).
fact NodeTableClosure { all a: Activity |
  a.artifacts + a.triggers in a.nodes
  and (all e: stepNodes[a] | e.node.stepTriggers in a.nodes) }
// FLOW-002 (WARN): declared non-entry blocks are referenced (loop body or InvokeBlock).
pred OrphanBlock[a: Activity, b: Block] {
  b in a.blocks.elems and b != a.entry and b.declared = True
  and no e: a.nodes | (e.node in Iterate and e.node.body.bodyBlock = b)
                   or (e.node in InvokeBlock and e.node.invokedBlock = b) }
// REF-001 (ERROR; FLOW-003 class): reference KINDS are right and same-activity.
// (Dangling refs are unrepresentable under resolved-object modeling — the
// existence half of REF-001 is validator-only; see the closing note.)
fact RefKinds { all a: Activity |
      (all e: a.nodes | e.node in LoopRestart implies e.node.restartLoop in loopNodes[a])
  and (all e: a.nodes | e.node in ReEvaluate implies e.node.decision in decisionNodes[a])
  and (all e: a.nodes | e.node in InvokeBlock implies e.node.invokedBlock in a.blocks.elems) }
// LOOP-002 (ERROR): a dynamic LoopExit is reachable only via some loop's body.
fact BreakContext { all a: Activity, e: a.nodes | (e.node in LoopExit and no e.node.boundLoop)
  implies some l: loopNodes[a] | e in loopReach[l] }
// LOOP-003 (INFO): runtime exits the innermost loop only — semantic, documented.
// LOOP-101 (ERROR): a bound token occurs within its own loop's body and not
// within a nested loop's body (no multi-level break; covers closure-leaked tokens).
fact BoundTokenContainment { all a: Activity, e: a.nodes {
  (e.node in LoopExit and some e.node.boundLoop) implies
    (e in loopReach[e.node.boundLoop]
     and no l2: loopNodes[a] - e.node.boundLoop |
        e in loopReach[l2] and l2 in loopReach[e.node.boundLoop])
  (e.node in LoopRestart and e.node.restartBound = True) implies
    (e in loopReach[e.node.restartLoop]
     and no l2: loopNodes[a] - e.node.restartLoop |
        e in loopReach[l2] and l2 in loopReach[e.node.restartLoop]) } }
// LOOP-102 (ERROR): every LoopRestart (token or by-reference) lies within the
// named loop's reachable body — out-of-body legacy '- loop:' is a RUN site,
// lowered as a node reference, never as LoopRestart (§3.3.5, §9.1).
fact RestartEnclosure { all a: Activity, e: a.nodes |
  e.node in LoopRestart implies e in loopReach[e.node.restartLoop] }
// LOOP-004 / CKPT-005 (ERROR): positivity of bounded counters.
fact PositiveCounters {
  (all i: Iterate | some i.maxIterations implies i.maxIterations > 0)
  and (all c: Checkpoint | some c.autoAdvanceMs implies c.autoAdvanceMs > 0) }
// DEC-001 (WARN): match without otherwise.
pred MissingDefault[d: Envelope] { d.node in BranchMatch and no d.node.otherwiseItems.elems }
// DEC-005 (ERROR): match has >= 1 case.
fact MatchNonEmpty { all m: BranchMatch | some m.cases.elems }
// DEC-002 (ERROR): a self-referencing decision keeps >= 1 transitively
// retry-free branch (quantified per arm; BranchCond branches enumerated).
fact RetryTermination { all a: Activity, d: decisionNodes[a] |
  (some r: a.nodes | r.node in ReEvaluate and r.node.decision = d) implies (
       (some arm: armsOf[d] | retryFree[arm.armItems.elems, d])
    or (d.node in BranchMatch and retryFree[d.node.otherwiseItems.elems, d])
    or (d.node in BranchCond and
         (retryFree[d.node.thenItems.elems, d] or retryFree[d.node.elseItems.elems, d]))) }
// RET-001 (ERROR): a ReEvaluate occurs only within the branch closure of its target.
fact RetryEnclosure { all a: Activity, r: a.nodes | r.node in ReEvaluate
  implies r in reachableItems[r.node.decision] }
// TERM-101 (WARN): items after a terminal in the same sequence are unreachable.
// Quantified over EVERY item sequence: block items, arms, then/else, otherwise.
pred UnreachableAfterTerminal[s: seq Envelope] { some i: s.inds |
  s[i].node in terminals and i != s.lastIdx }
pred ActivityHasDeadItems[a: Activity] {
     (some b: a.blocks.elems | UnreachableAfterTerminal[b.items])
  or (some arm: a.nodes.node.arms.elems + a.nodes.node.cases.elems |
        UnreachableAfterTerminal[arm.armItems])
  or (some n: a.nodes.node & BranchMatch | UnreachableAfterTerminal[n.otherwiseItems])
  or (some n: a.nodes.node & BranchCond |
        UnreachableAfterTerminal[n.thenItems] or UnreachableAfterTerminal[n.elseItems]) }
// CKPT-001/CKPT-002/CKPT-006 (ERROR): option membership; auto-advance coupling;
// default_option/auto_advance_ms only on non-blocking checkpoints.
fact CheckpointShape { all c: Checkpoint {
  some c.defaultOption implies c.defaultOption in c.options.elems
  some c.autoAdvanceMs implies (c.blocking = False and some c.defaultOption)
  (some c.defaultOption or some c.autoAdvanceMs) implies c.blocking = False } }
// CKPT-003 (ERROR): effect targets exist — validator-only under resolved-ref modeling.
// CKPT-004 (runtime/IR): condition_not_met response valid iff presentGate present.
// Shape couplings the d.ts discharges for Score but the reader path must also obey:
fact IterateShape { all i: Iterate {
  i.loopKind = ForEach implies (some i.loopVar and some i.over and no i.loopCond)
  i.loopKind in While + DoWhile implies (some i.loopCond and no i.over) } }
fact ActionShape { all x: Action {
  x.kind in ASet + AEmit implies some x.target
  x.kind in ALog + AMessage + AValidate implies some x.message
  x.kind = AValidate implies some x.validateExpr
  x.kind != AValidate implies no x.validateExpr } }
fact SimpleShape { all s: Simple | (s.op in Exists + NotExists) iff no s.exprValue }
fact ExprArity { (all e: AndE | #e.allOf > 1) and (all o: OrE | #o.anyOf > 1) }
// ART-002 (DbC): artifact_prefix is the zero-padded ordinal, recomputed.
fact ArtifactPrefix { all w: Workflow, a: w.activities.elems |
  a.artifactPrefix = pad2[a.ordinal] }
// TRN-002 (ERROR): at most one default transition; every default is last.
fact TransitionDefault { all a: Activity {
  lone t: a.transitions.elems | t.isDefault = True
  all t: a.transitions.elems | t.isDefault = True implies a.transitions.last = t } }
// TRN-003 (WARN): rows after the default — or after an unconditioned,
// non-default row (always()) — are unreachable.
pred RowsAfterDefault[a: Activity] { some i: a.transitions.inds |
  (a.transitions[i].isDefault = True or no a.transitions[i].guard)
  and i != a.transitions.lastIdx }
// RTE-001 (ERROR): route has >= 2 branches.
fact RouteMinBranches { all r: Route | #r.routeBranches > 1 }
// WF-001 (ERROR): initial activity unless all activities independent-entry.
fact InitialActivity { all w: Workflow | no w.initialActivity implies
  all a: w.activities.elems | some a.recognition }
// WF-003 (ERROR): role ids unique.
fact RoleUniqueness { all w: Workflow | all disj r1, r2: w.roles | r1.roleId != r2.roleId }
// ID-005 (ERROR): ordinals dense and unique.
fact OrdinalDense { all w: Workflow, i: w.activities.inds | w.activities[i].ordinal = i.plus[1] }
// GOV-001 (ERROR, Phase 1): no reserved nodes; policy inert INCLUDING reserved fields.
fact PhaseOneInert { no RequireApproval and no CapabilityGate and no Delegate
  and all p: Policy | p.audit = False and no p.requiredRole and no p.capabilityScope
                      and no p.approval and no p.retryPolicy and no p.timeout }
// SCOPE-001 (INFO): resolve order is the 4-level cascade — encoded in `resolve`.
// SCOPE-002 (ERROR): every Simple operand resolvable at its evaluation point (validator).
// TERM-001 (INFO): GotoActivity terminates loop + flow + activity (semantic).
```

(As in the legacy module, helpers marked ABSTRACT require cross-file or scope-chain context that Alloy models abstractly; they define the implementation contract for the compile passes. **Validator-only rules** — checks that resolved-object reference modeling makes unrepresentable or that need cross-file/lexical context: the existence halves of REF-001/TRN-001/CKPT-003/WF-002 (dangling targets), GotoActivity target existence, SCOPE-002 name resolution, PROV-001's contract re-derivation, PROV-002's producer-existence half, ID-002/003/004/006/008 lexical checks, INT-001, ART-001, ADDR/BIND/CTR/DSP/RES families, VAL-001, and the DET/GEN families. DEC-002 and FLOW-002 remain the only transitive-closure rules; PROV-001 remains the only cross-file rule.)

### 7.2 Tri-layer closure

| Surface construct (§3) | IR production (§6) | Alloy signature (§7.1) |
|---|---|---|
| `workflow()` / `activity()` | `Workflow` / `Activity` | `Workflow` / `Activity` |
| `step()` | `Invoke` (+ `Binding`) | `Invoke`, `Binding` |
| `ask()` | `AwaitInput` | `AwaitInput`, `Arm` |
| `match()` / `ifElse()` | `BranchMatch` / `BranchCond` | `BranchMatch` / `BranchCond` |
| `route()` | `Route` | `Route`, `RouteArm` |
| `forEach()`/`whileLoop()`/`doWhile()` | `Iterate` | `Iterate` |
| `msg()` / `goTo()` / `end()` | `EmitMessage` / `GotoActivity` / `Terminate` | same |
| `breakLoop()`/`it.break` | `LoopExit` | `LoopExit` |
| `rerun()`/`it.restart` | `LoopRestart` | `LoopRestart` |
| `retry()` | `ReEvaluate` | `ReEvaluate` |
| `passThrough()` | `PassThrough` | `PassThrough` |
| `block()` / anonymous Seq | `Block` | `Block` |
| block value / `byId.block(id)` **as a sequence item** | `InvokeBlock` | `InvokeBlock` |
| `checkpoint()` | `Checkpoint` | `Checkpoint`, `Option`, `Effect` |
| `dispatch()` | `Dispatch` | `Dispatch` |
| `artifact()` | `EmitArtifact` | `EmitArtifact` |
| `on()`/`always()`/`otherwise()` | `Transition` | `Transition` |
| Action literals | `Action` | `Action` |
| expression builders | `BoolExpr` | `BoolExpr` family |
| `approve()`/`gate()`/`delegate()` | reserved productions | reserved sigs |
| every node | `NodeEnvelope`/`Policy` | `Envelope`/`Policy` |

### 7.3 Severity-graded rule table

**CARRIED** = same rule, possibly relocated stage; **DbC** = discharged by construction (unrepresentable); **NEW** = introduced by this surface. Legacy id → new id noted where renamed.

| Rule | Sev | Status | Stage | Statement |
|---|---|---|---|---|
| PROV-001 | ERROR | CARRIED | compile (+tsc partial) | required, defaultless contract inputs resolvable at the invocation point |
| PROV-002 | ERROR | CARRIED (DbC for `outputOf`) | DbC / compile | cross-activity refs qualified; shape + existence verified at compile (ID-006) |
| SYM-001..004 → **ID-001** | ERROR | CARRIED (renamed) | compile | per-kind id uniqueness within an activity (identity-aware: one value, N refs) |
| FLOW-001 | ERROR | DbC | tsc | `run:` required property |
| FLOW-002 | WARN | CARRIED | compile | declared block unreachable (orphan) |
| FLOW-003 → **REF-001** | ERROR | CARRIED (values DbC) | compile | byId (incl. block)/goTo/rerun/step-checkpoint/transition targets resolve |
| LOOP-001 | ERROR | DbC | — | loop body is an inline value |
| LOOP-002 | ERROR | CARRIED | compile | LoopExit (sentinel **and** token — tokens can leak via closure capture) reachable only via loop bodies |
| LOOP-003 | INFO | CARRIED | doc/IR | break exits innermost loop only |
| DEC-001 | WARN | CARRIED | compile | match without `otherwise:` (pass-through at runtime) |
| DEC-002 | ERROR | CARRIED | compile | self-referencing decision keeps ≥1 transitively retry-free branch |
| DEC-003 | ERROR | DbC | — | `ask` takes no discriminators |
| DEC-004 | ERROR | DbC | — | `match`/`ifElse` distinct constructors |
| TERM-001 | INFO | CARRIED | doc/IR | goTo = layered terminal |
| TERM-002 | ERROR | DbC | — | rejoin-unless-terminal is the array semantics |
| SCOPE-001 | INFO | CARRIED | IR/runtime | 4-level resolution order verbatim |
| SCOPE-002 | ERROR | CARRIED (structure DbC) | compile | expression operands resolvable |
| **ADDR-001** | ERROR | NEW | tsc + compile | technique address ∈ per-workflow registry |
| **ADDR-002** | ERROR | NEW | compile | rule-segment / `group-*` references resolve |
| **BIND-001** | ERROR | NEW | tsc + compile | bind key not a contract input (tsc: excess-property on fresh literals only; compile: key-membership re-check against the re-derived contract) |
| **BIND-002** | ERROR | NEW | compile | bind reference unresolvable |
| **BIND-003** | WARN | NEW | compile | bind key ≠ source symbol (rename; prefer canonical rename) |
| **BIND-004** | ERROR | NEW | compile | caller bind conflicts with technique-def `qualifiedSource` |
| **BIND-005** | WARN | NEW | compile | migration-tier `args:` key not a contract input (legacy free-form deviation map) |
| **CTR-001** | ERROR | NEW | compile | generated registry digest ≠ markdown corpus (regenerate) |
| **ID-002** | ERROR (default) / off (parity) | NEW | compile | artifact-authored symbols snake_case; contract-sourced symbols exempt; never auto-renamed |
| **ID-003** | ERROR | NEW | compile | node-id kebab grammar |
| **ID-004** | ERROR | NEW | compile | array-index keys (`k === String(n)`, `0 ≤ n ≤ 2^32−2`) in case/record literals; `'__proto__'` reserved (insertion-order / prototype-setter guards) |
| **ID-005** | ERROR | NEW | compile | activity ordinals dense + unique |
| **ID-006** | ERROR | NEW | compile | raw qualified ref shape (regex) + existence; all raw refs ERROR under `--strict-refs` (stateless — no compile snapshots) |
| **ID-007** | ERROR | NEW | compile | node value reachable from two activities (ownership) |
| **ID-008** | WARN (default) / ERROR (`--strict-refs`) | NEW | compile (transformer) | constructor id arguments are call-site string literals (computed/positional ids churn NodeIds on unrelated edits) |
| **RET-001** | ERROR | NEW | compile | `retry` target encloses the occurrence site |
| **RTE-001** | ERROR | NEW | tsc (tuple) + compile | `route` ≥ 2 branches |
| **ACT-001** | ERROR | NEW | compile | `run:` non-empty (the IR node table requires ≥ 1 envelope) |
| **LOOP-004** | ERROR | NEW | compile | `maxIterations` integer > 0 |
| **LOOP-101** | ERROR | NEW | compile | bound token within its own loop's body and not within a nested loop's body (incl. closure-leaked tokens) |
| **LOOP-102** | ERROR | NEW | compile | `rerun`/`it.restart` occurs within the named loop's reachable body (out-of-body legacy `- loop:` is a run site → node reference) |
| **TERM-101** | WARN | NEW | compile | unreachable items after a terminal (all item sequences: blocks, arms, then/else, otherwise) |
| **DEC-005** | ERROR | NEW | compile | `match` has ≥ 1 case (empty record has no lowering) |
| **DEC-101** | INFO (opt-in lint) | NEW | compile | match non-exhaustive over a closed variable union |
| **CKPT-001** | ERROR | NEW | compile | defaultOption names an option |
| **CKPT-002** | ERROR | DbC (union type) + IR | tsc | autoAdvanceMs ⇒ ¬blocking ∧ defaultOption |
| **CKPT-003** | ERROR | NEW | compile | effect transitionTo / skipActivities / setVariable targets resolve |
| **CKPT-004** | — | NEW | IR/runtime | condition_not_met ⇔ presentation gate present; no nested active checkpoints; respond modes mutually exclusive |
| **CKPT-005** | ERROR | NEW | compile | autoAdvanceMs integer > 0 |
| **CKPT-006** | WARN | NEW | reader/transpiler | legacy defaultOption/autoAdvanceMs on a blocking checkpoint normalized away (identically on both paths — §3.3.6) |
| **TRN-001** | ERROR | NEW | compile | transition targets exist |
| **TRN-002** | ERROR | NEW | compile | ≤ 1 default transition; last |
| **TRN-003** | WARN | NEW | compile | rows after the default or after an unconditioned `always()` row are unreachable |
| **INT-001** | ERROR (default) / WARN (parity) | NEW | compile | `{token}` interpolation resolves (token grammar + `{{` escape per §3.1; specials `{n}`, `{decision-title}` whitelisted; non-token brace text is literal) |
| **ART-001** | ERROR | NEW | compile | artifact location key exists (a location containing `/` or `.` is a path, exempt) |
| **ART-002** | — | DbC | — | artifactPrefix not authorable (recomputed as zero-padded `NN`) |
| **WF-001** | ERROR | NEW | compile | initialActivity required unless all activities have recognition |
| **WF-002** | ERROR | NEW | compile | mode activationVariable/skipActivities/defaults resolve |
| **WF-003** | ERROR | NEW | tsc (≥1) + compile (unique) | executionModel roles |
| **RES-001** | ERROR | NEW | compile | mode `resource` slug (+ `#anchor`) resolves (legacy: unresolved refs surface explicitly, never dropped) |
| **DSP-001** | WARN | NEW | compile | dispatch `passContext` symbol unresolvable in the dispatching scope |
| **EXPR-101** | ERROR (parity profile only) | NEW | compile | ordering comparators in `ifElse()` conditions only (Orchestra boolean algebra had none; route guards/transitions/`when:`/`breakWhen:` are condition.schema lineage and exempt) |
| **VAL-001** | ERROR | NEW | lowering | non-finite numbers; non-integers or out-of-safe-range integers in `Int` positions; `undefined`/array holes in walked values (§6.1) |
| **DET-001..007** | ERROR | NEW | sandbox | §5.1 |
| **GEN-002** | ERROR (generator CI) | NEW | generation | expect-error fixtures asserting the salient error line as a substring; literal-key assertions |
| **GOV-001** | ERROR | NEW | compile | reserved governance constructs present in Phase 1 |
| **MIG-001** | WARN (default) / off (parity) | NEW | compile | migration-tier construct outside `--parity` |

---

## 8. Worked example — `requirements-elicitation`

The complete port of the legacy specification's §3.4 exemplar (orchestra-specification.md:686–836), as the transpiler emits it (`--parity` profile). Every legacy id, branch key, flow id, and symbol string is **byte-identical** to the source — including the kebab-case symbols (`current-domain`, `raw-responses`): symbols bind by exact string match and are never renamed (§4.6). Annotations cite rules exactly as the legacy spec does.

```ts
// workflows/work-package/activities/02-requirements-elicitation.ts
import {
  activity, step, ask, match, ifElse, forEach,
  msg, goTo, breakLoop, rerun, retry, block,
  eq, ne, and,
} from '../score.gen';

// --- nodes referenced from more than one site (legacy declare-once/reference-many) ---

const stakeholderDiscussion = step('stakeholder-discussion', {        // [ID-001 (was SYM-001)]
  describe: 'Prompt user to initiate discussion with key stakeholders.',
}); // trivial step — no technique binding

const postAssumptionsToJira = step('post-assumptions-to-jira', {
  describe: 'Prepare assumptions as Jira comment, get approval, post to ticket.',
  technique: 'jira-comment',                                          // [ADDR-001]
  // contract inputs: categorized-assumptions <- local flow (implicit, PROV-001);
  // issue-number <- qualifiedSource '01.create-issue.issue-number' in the
  // technique definition — carried by the contract, lowered into bindings [PROV-002, BIND-004]
});

const jiraCommentReview = ask('jira-comment-review',
  'Review the Jira comment before posting.', {
    'post-comment': [],                                               // empty = pass-through
    'edit-comment': [postAssumptionsToJira, retry('jira-comment-review')],
                                          // [DEC-002] self-ref; exit branches exist [RET-001]
    'skip-posting': [],
  });

const stakeholderTranscript = ask('stakeholder-transcript',
  'Provide the stakeholder transcript or summary here.', {
    'provide-transcript': [stakeholderDiscussion],
    'skip-discussion':    [],                                         // empty = pass-through
  });

// --- loop body: legacy flow `domain-body`, id preserved ----------------------

const domainBody = block('domain-body',                               // [FLOW-002] ref'd by loop
  step('ask-question', {                                              // [PROV-001]
    describe: 'Present ONE question from current domain. Wait for response.',
    technique: 'domain-question',
    // inputs [current-domain, elicitation-log] resolve from loop var + scope chain (implicit)
    // outputs [question-text, user-response] injected into scope
  }),
  ask('user-intent', 'How would you like to proceed?', {
    answered: [
      step('record-response', {
        describe: 'Capture answer or mark as skipped. Adapt follow-up.',
        technique: 'response-capture',
        // output elicitation-log injected; accumulates across iterations
      }),
    ],                                                                // rejoins [TERM-002]
    'skip-question': [],                                              // empty = pass-through
    'skip-domain':   [breakLoop()],                                   // [LOOP-002, LOOP-003]
    done:            [breakLoop()],
  }),
  ask('domain-complete', "Domain '{current-domain}' complete.", {     // [INT-001] interpolation
    'next-domain':  [],                                               // empty = pass-through
    revisit:        [rerun('domain-iteration')],                      // legacy `- loop:` re-entry [REF-001]
    'finish-early': [breakLoop()],                                    // [LOOP-003]
  }),
);

// --- activity ----------------------------------------------------------------

export default activity('requirements-elicitation', {
  version: '3.0.0',
  describe: 'Discover and clarify what the work package should accomplish through structured sequential conversation.',
  // Activity-level inputs: external data only [PROV-001, PROV-002]
  inputs: ['raw-responses', '01.create-issue.issue-number', '01.check-issue.issue-platform'],
  blocks: [domainBody],                                               // [FLOW-002] accounting

  run: [                                                              // [FLOW-001] (was flow `main`)
    msg('Starting requirements elicitation'),

    // Mode branching — workflow-level variable (scope level 4) [SCOPE-001]
    match('mode-elicitation-path', 'mode', {
      implement: [stakeholderDiscussion],
      review:    [goTo('implementation-analysis')],                   // [TERM-001]
    }),                                       // no otherwise: -> [DEC-001] WARN, pass-through

    stakeholderTranscript,

    forEach('domain-iteration', {                                     // [LOOP-001 discharged]
      each: 'current-domain',                 // iteration symbol, verbatim [ID-002 exempt: parity]
      over: 'question-domains',                                       // [SCOPE-002]
      max: 5,
    }, () => [domainBody]),                   // body = the named block (transpiler form)

    step('collect-assumptions', {
      describe: 'Identify assumptions made when interpreting user responses.',
      technique: 'assumptions-review',
      // input raw-responses resolves from activity inputs (implicit) [PROV-001]
    }),

    // Programmatic — route by platform; operand is a qualified cross-activity ref
    match('platform-routing', '01.check-issue.issue-platform', {      // [PROV-002, ID-006]
      jira:   [postAssumptionsToJira, jiraCommentReview],
      github: [
        step('post-assumptions-to-github', {
          describe: 'Post assumptions as GitHub issue comment.',
          technique: 'github-comment',
        }),
      ],
    }),                                       // validator warns: no otherwise [DEC-001]

    step('create-document', {
      describe: 'Create requirements document using elicitation output template.',
      technique: 'artifact-management',
      // input elicitation-log produced inside the loop; implicit scope-chain
      // resolution, loop-carried — classified OK by PROV-001
    }),

    step('update-assumptions-log', {
      describe: 'Add requirements-phase assumptions to the assumptions log.',
      technique: 'assumptions-log-update',
    }),

    // Programmatic — boolean condition [SCOPE-002 via builders]
    ifElse('requirements-confirmed',
      and(eq('elicitation-complete', true), ne('requirements-document', null)),
      [goTo('research')],                                             // [TERM-001]
      [stakeholderTranscript],                // retry path — by-value backward reference
    ),

    msg('Requirements elicitation complete'),
  ],
});
```

### 8.1 Fidelity ledger

- **Every legacy node present:** 8 steps, 7 decisions (1 variable-mode, 4 interactive incl. the self-ref retry and two with break branches, 1 variable-platform, 1 condition), 1 forEach loop (max 5), both flows (`main` → `run:`, `domain-body` → named block, id preserved), 2 messages, 2 activity terminals, all empty pass-through branches, the missing-default WARN on both `match` decisions.
- **Reference graph preserved:** `stakeholder-discussion` (2 sites), `post-assumptions-to-jira` (2 sites), `jira-comment-review` (platform-routing + self-retry), `stakeholder-transcript` (run + requirements-confirmed false branch) — each one declaration with N references (ID-001 identity-aware).
- **Symbols byte-verbatim:** `current-domain`, `elicitation-log`, `question-domains`, `raw-responses`, `elicitation-complete`, `requirements-document`, `01.create-issue.issue-number`, `01.check-issue.issue-platform`. No kebab→snake conversion (tenet 5); ID-002 silent under `--parity`.
- **`{current-domain}` interpolation** is now an official compile-checked feature (INT-001); legacy had it by example only (SPEC:792).
- **Lowered IR is node-for-node the reader's output** for the legacy file — the §9.2 golden check holds: same NodeIds, same Block ids (`main`, `domain-body`), same `LoopExit` form (sentinel ⇒ `loop` absent).

### 8.2 Idiomatic variant (default profile)

New authoring of the same activity would differ only in: snake_case symbols (requires the technique markdown to declare them so — §4.6), `it.break`/`it.restart` tokens instead of `breakLoop()`/`rerun()`, an anonymous loop body instead of `block('domain-body')`, `outputOf('issue-setup', 'create-issue', 'issue_number')` instead of the raw qualified strings, and an `otherwise:` on `platform-routing` (silencing DEC-001). None of these change the runtime semantics; all of them change the IR bytes — which is exactly why the transpiler never makes those substitutions itself.

---

## 9. Migration from TOON

### 9.1 Mechanical mapping table

Every row is a zero-analysis rewrite (the transpiler never restructures, reorders, duplicates, or renames). Two rows require a *bounded local determination*, named here so the zero-analysis claim is honest: the `- loop:` row needs the loop-body containment test (is this occurrence inside the named loop's reachable body?), and the `technique_args` row needs a per-key contract-input lookup. Neither restructures anything.

| TOON / Orchestra construct | Score construct |
|---|---|
| `id:`/`version:`/`description:` header | `activity(id, { version, describe })` |
| activity `name` (TOON-required) | `name: '<value>'` (verbatim; IR omits it iff equal to the id) |
| `inputs: a, 01.s.n` | `inputs: ['a', '01.s.n']` (strings verbatim) |
| trivial step (`description:` only) | `step(id, { describe })` |
| id-less step (`technique` present) | `step('<last-::-segment-of-technique>', …)` — the loader's derivation rule, verbatim; two id-less steps bound to the same technique collide into ID-001 ERROR (matching the loader) |
| `skill: <path>` / step `technique` | `technique: '<path>'` (slash form normalized to `::`) |
| `technique_args: {k: lit}` | `bind: { k: lit }` when **every** key is a composed-contract input (per-key lookup); otherwise `args: {k: lit}` (migration tier, BIND-005 WARN). Both lower to the `technique_args` slot |
| step `when` string / structured `condition` | `when: <Expr>` (both parsed into builders) |
| step `checkpoint: <id>` | `checkpoint: <node value>` — the referenced `checkpoints[]` entry's constructed node (map lookup); N referencing steps share one `const` |
| step `required`/`actions`/`triggers` | same-named `step()` options |
| interactive decision (`message:`) | `ask(id, message, branches)`; branchless → `ask(id, message)` |
| `variable:` decision | `match(id, operand, cases)`; `default:` → `otherwise:` |
| `condition:` decision | `ifElse(id, expr, then, else?)` (`false:` optional) |
| `- decision: <self>` | `retry('<self>')` |
| `- decision: <other>` | the decision value (backward) / `byId.decision(id)` (forward) |
| TOON automated `decisions[]` | `route(id, { name, branches })`; omitted `transitionTo` → branch without `to` (⇒ Terminate) |
| `forEach` loop | `forEach(id, { each, over, max, name }, () => [block])` (loop `name` verbatim; IR omits it iff equal to the id) |
| TOON `while` / `doWhile` / `breakCondition` / `activities[]` body | `whileLoop` / `doWhile` / `breakWhen:` / `{ activities: […] }` |
| `- break` | `breakLoop()` — always the sentinel, never tokens |
| `- step: <id>` | the step value (backward) / `byId.step(id)` (forward) |
| `- loop: <id>` **inside the named loop's reachable body** | `rerun('<id>')` (re-entry — LoopRestart) |
| `- loop: <id>` **elsewhere** (run site, incl. the defining occurrence) | the loop node value (backward) / `byId.loop(id)` (forward) — runs the loop |
| `flows:` entry | `const x = block('<id>', …)` + listed in `blocks:` |
| `main` flow | `run:` |
| `- flow: <id>` | the block value (backward) / `byId.block(id)` (forward) — lowers to `InvokeBlock` |
| `- flow: continue` | `passThrough()` |
| `- message:` | `msg(text)` |
| `- activity: <id>` | `goTo('<id>')` |
| TOON terminal route branch / implicit end | `end()` / branch without `to` |
| boolean algebra strings / Condition objects / `when` strings | expression builders |
| `transitions[]` | `next: [on(expr, id), …, otherwise(id)?]`; a row with no `condition` and `isDefault:false` → `always(id)` (lowers to `{to}` — no `when`, no `is_default`) |
| `checkpoints[]` entry referenced by a step | `const cp = checkpoint(id, message, opts)` + `checkpoint: cp` on each referencing step (array options, union shape; one declaration, N references) |
| `checkpoints[]` entry referenced by **no** step | placed per the §9.1.1 synthesis rule (after the steps segment, declaration order) — never dropped |
| `triggers[]` (WorkflowTrigger) | `dispatch(id, { workflow, passContext })` |
| `entryActions`/`exitActions` | `entry:`/`exit:` action literals |
| `artifacts[]` | `artifact(id, name, { location, action })` |
| `artifactPrefix` | dropped (recomputed from ordinal) |
| `activitiesDir` | dissolved — the workflow module imports its activity modules (DET-001 sibling imports) |
| workflow `variables`/`modes`/`artifactLocations`/`initialActivity`/`rules`/`techniques` | same-named `workflow()` fields |
| missing `executionModel` | the **pinned** synthesized literal, byte-identical in reader and transpiler: `{ id: 'agent', description: 'Default single-agent execution (synthesized; legacy workflow declared no executionModel).' }` + WARN (covered by a golden fixture — every live workflow takes this path) |
| mode `resource` path form | normalized `ResourceRef` |
| all ids, branch keys, flow ids, symbol strings | **byte-verbatim** |

#### 9.1.1 TOON section → `run:` synthesis (normative)

TOON activities are flat sections (`steps[]`, `checkpoints[]`, `decisions[]`, `loops[]`) with no flow layer; the reader and the transpiler **must** compose them into the single `run:` sequence by the same rule or the §9.2 golden check is unverifiable. The rule:

1. `run:` opens with `steps[]` in declaration order. A step's `checkpoint:` reference lowers per §6.3 note 2 (checkpoint envelope precedes the referencing step). This makes Invoke node-table order equal TOON step declaration order, which is what the §5.3 `stepIndex` rule and the live `completedSteps` integers key on.
2. `checkpoints[]` entries referenced by no step follow, in declaration order (observed corpus shape: a trailing activity-gate checkpoint after the steps — e.g. `prism-update/05-verify`).
3. `loops[]` follow, in declaration order (each an `Iterate` with its inline body).
4. `decisions[]` follow last, in declaration order, as `route()` nodes (TOON automated decisions evaluate after the activity's work, feeding `transitions[]`).
5. `transitions[]` lower to `next:` unchanged (they are not `run:` items).

The legacy server never executes this order itself (workers interpret the delivered definition), so the binding obligations are: (a) reader ≡ transpiler, by this rule; (b) plane ≡ live behavior, verified by the Phase-A golden trace-diff suite (§9.3). If trace-diff shows the live worker convention deviating from this rule for some section interleaving, the rule — not the per-construct rows — is what gets amended.

### 9.2 The golden check

For every corpus file: `canonical(reader(TOON)) == canonical(compile(transpile(TOON)))`, byte-equal. This holds by construction because the transpiler (a) preserves all identifiers verbatim, (b) always emits named blocks for named flows, (c) always emits the token-free `LoopExit`/`LoopRestart` forms, (d) keeps declarations in source order with `byId` for forward references, (e) lowers `skill:` and `technique:` to the same `technique_ref` slot, and (f) shares with the reader every normative joint rule this depends on: the §9.1.1 synthesis order, the §6.1 default-materialization table, the CKPT-006 normalization, the pinned synthesized `executionModel` literal, the zero-padded `NN` format, and the §5.3 structural-id derivation. The byte-equal corpus then feeds the live trace-diff suite (R-PAR-3: visited nodes, branch choices per §6.3 note 5, step indices per §5.3, checkpoint states, dispatch lineage, final state, termination path).

### 9.3 Recommendation: reader through parity, then transpile once (OQ-3)

**Phase A (parity proving):** the TOON compatibility reader is the production front-end; the transpiler + golden check run continuously in CI as evidence, not as the source of truth.
**Phase B (after trace-diff parity gates pass):** transpile the corpus once, commit the Score artifacts as the sole source, retire the reader to a frozen test fixture.

Rationale: the reader is indispensable while parity is being *proven* (it is the reference semantics), but keeping two production front-ends forever doubles every future semantic change. Transpile-once is only safe because this surface is corpus-complete (§3.6) — the migration tier (`route`, `whileLoop`/`doWhile`, `byId`, `block`, `passThrough`, `always`, `args:`, raw qualified strings, the `breakLoop()` sentinel) exists precisely so that no grammar-legal corpus shape lacks a surface form. If OQ-S1's corpus scan (mutual decision recursion) or the golden check ever surfaces an unrepresentable shape, Phase B blocks until the surface (not the transpiler) is extended. After Phase B, the migration tier remains in the language (artifacts using it stay valid under `--parity`) but is a candidate for demotion in a later major version.

---

## 10. Governance surface (Phase 2+, designed now, deferred)

The three governed constructs are **declared in the L1 surface today** (§3.7), have **reserved IR productions** (§6.2) and **Alloy signatures** (§7.1), and are **rejected by the Phase-1 compiler** (GOV-001 ERROR, message naming the activation phase). This guarantees activation never reshapes control flow (R-IR-4): each layers on a Phase-1 node.

| Construct | Layers on | Reserved IR node | Shape commitments |
|---|---|---|---|
| `approve(id, { role, message, options?, onDeny? })` | Checkpoint | `RequireApproval` | role keys into `executionModel.roles` (compile-checked on activation); options reuse `CheckpointOption`; denial routing from the closed `on_deny` set |
| `gate(id, { capabilityScope, onViolation?, run })` | Block scoping | `CapabilityGate` | scope strings are capability ids (Phase-2 vocabulary); `onViolation` from the design spec's `ViolationAction` set incl. `nudge`; body is a Block id |
| `delegate(id, { role, workflow, passContext? })` | Dispatch | `Delegate` | bounded context, allowed tools, and stop conditions live in the Phase-2 *task packet*, never as new authoring fields |

Supporting seams already live in Phase 1: the per-node `NodeEnvelope.policy` (inert `ExecutionPolicy`; PhaseOneInert fact), the required `executionModel` (roles as the policy anchor, R-GOV-2), stable NodeIds (policy keying, R-GOV-1), and the canonical content hash (signable artifacts; `workflow_compile` as a governed MCP tool, R-GOV-4).

---

## 11. Open questions

| ID | Question | Bearing |
|---|---|---|
| OQ-S1 | **Corpus scan for mutual decision recursion.** The claim that every corpus self-reference is direct is unverified. `byId.decision()` keeps mutual recursion representable either way; the scan decides whether §9.3 Phase B needs it on day one. | §9.3 gate |
| OQ-S2 | **Kebab→snake symbol normalization.** If undertaken: one audited, simultaneous migration across Score artifacts + technique markdown, with a corpus-wide exact-match verification pass. Until then the verbatim rule stands. | §4.6 |
| OQ-S3 | **Workflow-id registry for `dispatch` targets.** `workflow:` is an unchecked string today; a generated cross-workflow registry would make it ADDR-class. Deferred — requires a corpus-level generation step. | §3.3.7 |
| OQ-S4 | **AP-60 shape-derived value typing** (predicate→boolean, plural→array) as a contract refinement layer. Markdown declares no types; anything beyond opaque `ValueRef` is inference. Deferred as an optional lint. | §4.4 |
| OQ-S5 | **Strict-binding profile** for new authoring (explicit `bind:` required for non-inherited required inputs). Must remain a profile; the L1 d.ts carries exactly one posture (implicit-with-optional-bind). | §2.5 item 4 |
| OQ-S6 | **Tagged-template `msg` sugar** with typed interpolation. Rejected for 0.1 (one interpolation rule); revisit if INT-001 diagnostics prove insufficient in practice. | §2.5 item 11 |
| OQ-S7 | **`route`/`match` unification** post-parity. A topology change with id-mapping consequences; deferred deliberately. | §3.6 |
| OQ-S8 | **Technique authoring TS surface** (OQ-2 of the design spec). This design neither forecloses nor depends on it; the contract generator is the only coupling point. | §4 |
| OQ-S9 | **Ordered-pairs case form** (`cases: [['key', seq], …]`) as the escape for genuinely numeric match values (ID-004) **and** the reserved `'__proto__'` key (§3.3.4) — one construct closes both representability gaps. No corpus pressure; revisit on demand. | §3.3.4 |
| OQ-S10 | **Workflow/Resource Orchestra variants** (design spec OQ-5): this spec fixes the workflow *authoring* shape; the Orchestra-level workflow formalization (own EBNF/Alloy) remains TBD upstream. | §3.5 |
| OQ-S11 | **Corpus scan for context-ambiguous shared decision references.** A shared flow fragment containing `- decision: d`, reachable both from within `d`'s branch closure (self-retry semantics) and from outside it (plain evaluation), is grammar-legal legacy with exactly one Score lowering — `retry()` fails RET-001 from the outside site; a plain node reference loses retry semantics from the inside site (the same shared-fragment argument that mandated the `breakLoop()` sentinel, §2.5 item 5). If the scan finds an instance, either define `ReEvaluate`-when-not-enclosed runtime semantics (relaxing RET-001 to WARN, making `retry` the dynamic analogue of the sentinel) or document the shape as a Phase-B blocker like OQ-S1. | §9.3 gate |

---

## 12. Glossary

| Term | Meaning |
|---|---|
| **Score** | This TypeScript authoring surface (an orchestra plays from a score). |
| **Orchestra** | The surface-independent semantic model (primitives + constraint families). |
| **Artifact** | One authored `.ts` module default-exporting a `WorkflowDef`/`ActivityDef`. |
| **Executed builder** | The compile model: the artifact runs once in the sandbox; constructors record structure; output is canonical IR. |
| **Canonical IR** | The deterministic JSON serialization defined by the L2 EBNF; the only form the runtime executes; the hash/signing target. |
| **NodeId** | Stable node identity. Canonical bytes carry the **short** form (authored id verbatim, or structural `<owner>#<index>`); the qualified address `<workflow>/<activity>/<kind>:<id>` is derived for diagnostics, manifests, and traces (§5.3) and never serialized. |
| **Symbol** | A runtime variable name (snake_case for new authoring); binds by exact string match; never renamed. |
| **Contract** | The generated, types-only mirror of one markdown technique's name algebra, composed for the executing workflow. |
| **Registry** | The per-workflow literal-keyed map of contracts (own-shadows-meta, pre-composed); the `technique:` inference point. |
| **Migration tier** | Surface constructs existing for corpus completeness; MIG-001 WARN outside `--parity`. |
| **`--parity` profile** | Diagnostic profile for transpiled/corpus-equivalence work: MIG-001/ID-002 silent, INT-001 demoted to WARN, EXPR-101 active. Profiles re-route severities, never semantics. |
| **Block** | An IR item sequence; named (authored `block()`/legacy flow) or structural (anonymous). |
| **Sentinel** | `breakLoop()` — dynamic-innermost loop exit, the transpiler's only break form. |
| **Token** | A loop-bound `it.break`/`it.restart` value obtainable only inside the owning loop's body callback. |
| **Envelope** | `NodeEnvelope { id, node, policy }` — the per-node governance seam, inert in Phase 1. |
| **Golden check** | `canonical(reader(TOON)) == canonical(compile(transpile(TOON)))`, byte-equal, per corpus file. |
| **DbC** | Discharged by construction — the defect class is unrepresentable in the surface. |
| **Reader** | The TOON compatibility front-end lowering legacy files to the same AST/IR. |
| **Transpiler** | The mechanical one-shot TOON→Score rewriter (§9.1); never restructures or renames. |
