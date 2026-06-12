# Design A — Workflow Plane Authoring DSL under LENS A (Maximal Static Safety)

Status: candidate design, 2026-06-12.
Inputs: `/tmp/wp-dsl-work/inventory-legacy-semantics.md`, `inventory-technique-contracts.md`, `inventory-runtime-model.md`, `inventory-newspec-requirements.md`; spec sources `docs/orchestra-specification.md` (§3.4 ported in full below), `.engineering/proposals/workflow-plane/design-specification.md` (§5.1, §6, §12), `schemas/activity.schema.json`, `schemas/condition.schema.json`, `workflows/work-package/workflow.toon`.
Locked decisions honored: (1) executed builder, single-shot, sealed deterministic sandbox, output = canonical IR; (2) techniques stay markdown + GENERATED TS contracts; (3) tri-layer formal definition (L1 .d.ts / L2 EBNF over IR / L3 Alloy over IR).

Lens A optimization target: maximize what **tsc proves at editor time**; next preference, deterministic **builder-execution diagnostics** (still compile-time per locked decision 1); only then IR/Alloy checks. Ceremony and generic complexity accepted where they buy proof.

Throughout, three check stages are distinguished:

- **tsc** — provable by the TypeScript compiler before the builder ever runs (editor-time).
- **build** — deterministic diagnostic emitted while the artifact executes once in the sandbox or during lowering (compile-time, not editor-time).
- **ir** — semantic validation over canonical IR (L3 Alloy-derived passes); also covers runtime-enforced semantics.

---

## 0. Verdicts on the candidate topology moves

| Move | Verdict | Reasoning |
|---|---|---|
| (a) Composition by value | **ADOPT WITH MODIFICATION** | In an executed builder, node values are references, so declare-then-reference and named flows dissolve: FLOW-001 (body required by signature), FLOW-003, LOOP-001 (inline body) and all dangling-ref errors become unrepresentable. **Modification 1 — cycles:** value composition cannot construct the three legal legacy cycles (decision self-ref retry, loop self-re-entry from a body branch, mutual decision recursion). The first two are restored via context tokens (`d.retry`, `it.restart` — see moves (b)/(c)); mutual decision recursion is deliberately **not representable** in the TS surface (it remains representable in IR via the TOON compatibility reader; DEC-002 already demanded an exit path, and every corpus use is direct self-ref). **Modification 2 — SYM:** uniqueness does NOT fully discharge: two constructor calls with the same explicit id are representable, so SYM-001..003 move from "checked over a reference table" to a build-stage duplicate-id check (SYM-004 becomes N/A — no flow ids). **Modification 3 — ownership:** with no ambient registration, a node belongs to the activity from whose `body`/`exports` it is *reachable*; one node reachable from two activities is a build ERROR (new ID-104). |
| (b) Decision split by constructor | **ADOPT** | Three constructors — `ask` (interactive incl. branchless ack-gate and callback-provided `retry` token), `match`/`matchPartial` (variable multi-way), `cond` (boolean) — make DEC-003/DEC-004 unrepresentable. Lens-A extension: `match` over a closed-union-typed handle **requires** exhaustive-or-default branches at the type level (upgrading DEC-001 from WARN to tsc error); `matchPartial` is the explicit legacy pass-through form and keeps the DEC-001 build WARN for parity. |
| (c) Loop body callback + break token | **ADOPT** | `forEach(id, {over, as, max}, (it) => Seq)`; `it.break` is obtainable only inside the callback, discharging LOOP-002. `it.break` is bound to *its* loop, so "which loop breaks" is explicit, retiring LOOP-003's ambiguity; using an *outer* loop's token inside an inner loop's body would be a new capability (multi-level break) not in the baseline, so Phase 1 rejects it at build (new LOOP-101) per P10. Extension: `it.restart` token restores the legacy `- loop: <self>` re-entry used by `domain-complete.revisit`. |
| (d) Typed handles + expression builders | **ADOPT** | `eq/ne/gt/gte/lt/lte/exists/notExists/and/or/not` over typed handles; literal operands type-checked against the handle's value type (SCOPE-002 and operand typing become tsc). The expression surface unifies the legacy activity boolean algebra (`==`,`!=`,`&&`,`||`,`!`) with `condition.schema.json` (adds ordering + existence operators) into one `BoolExpr` lowering to IR `Guard`-compatible form (R-IR-5). The string grammar (`when:` strings, legacy condition text) survives only in the TOON reader and the `rawExpr()` escape hatch (build-checked). |
| (e) Typed activity-output handles | **ADOPT (late ordinal binding)** | An activity module exports typed output refs (`issueSetup.out.issue_number`), each carrying `(activityId, producingStepId, symbolId, valueType)`. Ordinals (`NN`) are assigned at workflow registration (position or explicit), so the qualified `NN.step-id.name` string is *derived at lowering*, never authored — PROV-002 discharged by construction for typed refs. Escape hatch `xref('01.check-issue.issue_platform')` whose parameter type is the template literal `` `${number}.${string}.${string}` `` — tsc proves even the escape hatch is shape-qualified; existence resolves at build. |
| (f) Explicit stable ids retained | **ADOPT** | Every trace-visible node (step, decision, loop, checkpoint, artifact, activity, workflow) takes an explicit id as its first constructor argument, preserved verbatim into IR `NodeId` (R-PAR-3 trace-diff parity; manifests; policy keying R-GOV-1). Value composition removed reference-*by*-id, not ids. Only legacy-id-less constructs (inline messages) get derived ids — positional within the owning sequence, deterministic from canonical structure. |
| (g) Workflow + Activity retained | **ADOPT** | Activity stays the unit of L2 dispatch, checkpoint scoping, `artifactPrefix`, manifests, and the transition graph; Workflow stays the unit of variables/modes/executionModel/artifactLocations/session. Neither collapses. |

**Own moves beyond the list:**

| Move | Summary |
|---|---|
| (h) Explicit typed bindings with a `scoped()` dynamic marker | Step→technique binding is an explicit record keyed by the technique's input ids (mapped type from the generated contract; required-without-default inputs are required keys — PROV-001's "all required inputs satisfiable" becomes tsc for statically bound inputs). Where legacy relied on dynamic scope-chain accumulation (e.g. loop-carried `elicitation_log`), the author writes `scoped('elicitation_log')` — an explicit assertion "resolve by name at runtime", whose *name* is tsc-checked against the contract and whose *producibility* is a build-stage scope-chain analysis (PROV-001 residue). Key≠source-symbol-name bindings are a build WARN and lower to a `technique_args` rename — per the standing canonical-rename-over-args policy. |
| (i) Generated contracts are **values + types**, precomposed per (workflow × technique) | Because the builder executes, contracts must exist at build-run time: generation emits `techniques.gen.ts` (const objects `as const` + the L1 types), not a bare `.d.ts`. Composition (keyed-section union, local wins, along the *executing* workflow's root + container chain) is pre-applied at generation time — the DSL artifact belongs to a workflow, so the executing workflow is statically known; this picks option (a) from inventory-technique-contracts §8 deliberately for maximal type concreteness. A corpus-hash drift guard makes a stale registry a build ERROR. |
| (j) Activity-id union module | Each workflow has an `ids.ts` declaring its activity-id set once (`activityIds('requirements-elicitation', 'research', …)`), yielding branded `ActivityRef<Id>` consts. `goTo`/transitions/mode-`skipActivities` accept only members of the union — transition-target existence is tsc-proved; build verifies declared set ≡ registered set. This solves forward references (transitions to later activities) without lazy thunks. |
| (k) Terminal-tail sequence typing | Item sequences are typed `readonly [...NonTerminalItem[], Item] | readonly []`: a terminal (`goTo`, `it.break`) may appear only in tail position; items after a terminal — dead code in the legacy semantics — are a tsc error (new DEAD-001). TERM-002's rejoin-unless-terminal stays IR semantics; its authoring-side defect class is discharged. |
| (l) Checkpoint constructor split | `checkpoint.blocking(...)` vs `checkpoint.autoAdvance(...)`: the runtime-model coupling (autoAdvanceMs ⇒ ¬blocking ∧ defaultOption; defaultOption ∈ option ids) is discharged by construction + `keyof`-typed `defaultOption`. Effects (`setVar`, `transitionTo`, `skipActivities`) take typed handles. |
| (m) No ambient registration | Constructors are pure value factories; an activity's content = reachability closure of its returned `body`/`transitions`/`exports`. The sandboxed run therefore needs no mutable global builder state; determinism and the no-IO discipline get simpler to prove. |

---

## 1. Topology decision table — every legacy primitive

| Legacy primitive / construct | Decision | New form | Justification |
|---|---|---|---|
| `workflow` (id, version, title, description, author, tags, rules) | **keep** | `workflow(id, semver, spec)` top-level | Unit of session/variables/modes (move g); R-X-5 parity fields. |
| `executionModel.roles` | **keep (made first-class)** | `spec.executionModel.roles` nonempty tuple | Documented-required but absent from workflow.schema.json (inventory-runtime §10.1) — DSL fixes the drift; Phase-2 `RoleRef` keys off it (R-GOV-2). |
| `variables[]` (name/type/description/defaultValue/required) | **keep, typed** | `variables({...})` → record of `VarHandle<Name, T>`; enum/object shapes declared | Handles feed bindings, expressions, effects, interpolation — the static spine of the whole design (move d). |
| `modes[]` | **keep, typed** | `mode(id, {activationVariable: boolHandle, skipActivities: ActivityRef[], defaults: setVar(...)[], recognition, resource})` | Activation variable proved boolean; skip targets proved ∈ activity union; defaults type-checked per variable. |
| `artifactLocations` | **keep, typed** | record literal; `{variable}` paths as tagged template over handles | Location keys become a literal union typing `artifact.location`; path tokens proved in scope. |
| `initialActivity` | **keep** | `spec.initial?: ActivityRef` | Optional iff every activity has `recognition` (independent entries) — build INIT-001. |
| `activity` (id, version, description…) | **keep** | `activity(id, semver, meta, (a) => ({body, transitions?, exports?, artifacts?, …}))` module-level export | Move g. `body` required ⇒ FLOW-001 discharged by signature. |
| `activityPrefix` / ordinal | **keep (derived)** | assigned at `workflow.activities` registration (position or explicit `[n, module]`) | Server-computed in legacy (readOnly); authoring never writes it; cross-activity refs bind it late (move e). |
| `inputs:` (activity) | **keep, typed** | `a.inputs({ symbol_id: external() \| <ActivityModule>.out.x \| xref('NN.step.name') })` | Keys are snake_case symbol ids (verbatim → IR, R-BIND); values carry provenance; typed cross-refs discharge PROV-002. |
| `steps:` section | **dissolve** | step values created where needed | Move a. |
| trivial step | **keep (constructor)** | `trivial(id, description)` | Distinct kind; no contract. |
| technique-backed step (`skill:` field) | **replace** | `invoke(id, T['<address>'], bindings, description?)` — binding by *contract value*, not by string | The `skill:`-vs-`technique` naming question (OQ-4) dissolves at the surface: there is no field name, only a contract object. IR keeps `technique_ref`; the TOON reader maps `skill:`. Bindings: move h. |
| `technique_args` | **replace** | key↔source-name mismatch in the bindings record (build WARN; lowers to args rename) | Canonical-rename-over-args policy; renames stay representable for parity but are diagnostically discouraged. |
| `decisions:` section | **dissolve** | decision values | Move a. |
| interactive decision (`message:`) | **split** | `ask(id, message)` (ack-gate) / `ask(id, message, branches)` / `ask(id, message, (d) => branches)` (retry) | Move b; DEC-003 unrepresentable; branchless ack-gate is the no-branches overload; `d.retry` is the only self-reference. |
| `variable:` decision | **split** | `match(id, handle, exhaustiveOrDefaultBranches)` and `matchPartial(id, handle, partialBranches)` | Move b; DEC-004 unrepresentable; DEC-001 upgraded to tsc where the handle's type is a closed union, preserved as build WARN on `matchPartial`. |
| `condition:` decision | **split** | `cond(id, BoolExpr, {true, false?})` | Move b; resolves the spec-internal EBNF inconsistency (grammar file wins: `false` optional). |
| boolean algebra strings | **replace** | expression builders (move d); `rawExpr(string)` escape hatch | String grammar survives only in TOON reader + escape hatch. |
| branch (`key: FlowFragment`) | **keep** | record entries `'branch-key': Seq`; empty branch = `[]` | Pass-through preserved; terminal-tail typing (move k). |
| self-ref retry | **replace** | `d.retry` token from the `ask` callback | DEC-002: tsc refinement requires ≥1 retry-free branch + build transitive check. |
| `default:` branch key | **keep** | `default:` key in match branches | Reserved key of the branch record, not a magic Id. |
| `loops:` section | **dissolve** | loop values | Move a. |
| `forEach` loop | **keep** | `forEach(id, {over, as, max?}, (it) => Seq)` | Move c; `as` is the explicit snake_case symbol id (techniques resolve it by name); `it.item` is its typed handle. `while`/`doWhile` from activity.schema.json are *not* surfaced in Phase 1 (Orchestra defines only forEach; the TOON reader still lowers them for parity corpora — flagged open). |
| `maxIterations` | **keep** | `max?: number` (build: integer > 0) | Parity. |
| `break` | **replace** | `it.break` token | Move c; LOOP-002 discharged; LOOP-101 (innermost discipline) at build. |
| loop re-entry from branch (`- loop:`) | **split** | other (earlier) loops: the loop *value* as a branch item; self: `it.restart` | Value reuse covers the DAG case; token covers the cycle. |
| `flows:` section, named flows | **dissolve** | `body` Seq (was `main`) + host `const` arrays for shared fragments | Move a; FLOW-001 by signature; FLOW-002 ≈ tsc `noUnusedLocals`; FLOW-003 unrepresentable. |
| `- flow:` ref | **dissolve** | array spread / const reuse | Host language. |
| `- flow: continue` | **dissolve** | empty branch `[]` (optionally `passThrough` alias const) | Was sugar for pass-through. |
| `- message:` | **keep** | `msg('text')` / tagged template ``msg`Domain '${it.item}' complete.'`` | Interpolation becomes typed (handle existence proved); `{name}` strings only via TOON reader / build-checked plain strings. |
| `- activity:` transition terminal | **keep** | `goTo(ACT['research'])` terminal item | TERM-001 semantics unchanged; target ∈ activity union (tsc). |
| activity `transitions[]` (ordered, first-match) | **keep** | `transitions: [transition(when, to), …, otherwise(to)?]` | Order = array order by construction (R-RT-2); `otherwise` only in tail position by signature; targets tsc-proved. |
| activity-schema automated `decisions[]` (branch.transitionTo, minItems 2) | **replace (subsumed)** | `cond`/`match` with `goTo` terminals in branches | One decision surface; the TOON reader lowers the schema form to the same IR. |
| `checkpoints[]` + option effects | **keep, split constructors** | `checkpoint.blocking(...)` / `checkpoint.autoAdvance(...)`; placed inline in `body` | Move l; R-IR-3, R-RT-4. |
| step `checkpoint:` (yield-before-step) | **dissolve** | place the checkpoint item before the step in the sequence | Same IR; one mechanism. |
| step `when:` / structured `condition:` gate | **replace** | `onlyWhen(BoolExpr, ...items)` wrapper item | Unifies dual condition forms (inventory-runtime §10.3). |
| `entryActions`/`exitActions`/step `actions` | **keep, typed** | `actions.set(handle, value)`, `.log/.message/.validate/.emit` | `set` proved against variable type. |
| `triggers[]` / dispatch_child | **keep, typed** | `dispatchChild({workflow, description?, passContext: handles[]})` at activity or step option | R-IR-3 `Dispatch`; passContext names proved (handles). agent_id/planning_slug are runtime-supplied, not authored. |
| `artifacts[]` | **keep, typed** | `artifact(id, {name: string \| tpl\`...\`, location?, action?})` | Tokens in `tpl` templates are handles (tsc); plain-string `{token}`s build-checked; `artifactPrefix` excluded from authoring (server/lowering-computed). |
| `recognition[]` | **keep** | `meta.recognition` | Independent-entry activities. |
| qualified `NN.step-id.name` | **replace** | typed cross-activity refs (move e) + `xref()` template-literal escape hatch | PROV-002 discharged / shape-proved. |
| resource refs | **keep, typed** | generated resource registry `R['meta/activity-worker-prompt']` (+ `#section`), string escape hatch | R-RT-7 addressing unchanged. |
| technique `::` address strings | **replace** | generated registry keys `T['gitnexus-operations::impact']` | Unresolved refs unrepresentable (registry literal keys); `techniqueRef(string)` escape hatch build-checked. |
| `RequireApproval` / `CapabilityGate` / `Delegate` | **reserve** | `approve()` / `capabilityGate()` / `delegate()` declared, Phase-1 build-rejected (GOV-001) | R-IR-4/R-SCOPE-2: declared so the surface never needs reshaping; typed against `RoleRef` from executionModel. |

---

## 2. Authoring surface — d.ts sketch (L1 normative layer)

Conventions: `const` type parameters preserve literal/tuple inference; constraint-violation helper types are named so tsc errors read like rule citations (e.g. `ERR_DEC002_RetryDecisionNeedsExitBranch`). Snake/kebab format checks are *partial* at the type level (reject the wrong separator and uppercase); full regex at build (ID-102/ID-103).

```ts
// ============================================================================
// @workflow-plane/dsl — authoring surface (Lens A)  [L1 of the tri-layer def]
// ============================================================================

// ---------- brands & lexical refinements ------------------------------------
declare const __brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** Partial type-level lint: rejects uppercase and the wrong separator.
 *  Full conformance (regex, AP-60) is verified at build (ID-102/ID-103, BIND-103). */
export type SnakeCaseId<S extends string> =
  S extends Lowercase<S> ? (S extends `${string}-${string}` | `${string} ${string}` ? never : S) : never;
export type KebabCaseId<S extends string> =
  S extends Lowercase<S> ? (S extends `${string}_${string}` | `${string} ${string}` ? never : S) : never;
export type SemVer = `${number}.${number}.${number}`;

// ---------- readable references (the typed scope algebra) -------------------
export interface VarHandle<N extends string, T> {
  readonly kind: 'var'; readonly symbol: N; readonly __t?: T;
  /** Typed dotted-path read into a declared object shape (lowers to 'n.k'). */
  dot<K extends keyof T & string>(k: K): VarHandle<`${N}.${K}`, T[K]>;
}
export interface OutRef<N extends string, T>   { readonly kind: 'out';   readonly symbol: N; readonly __t?: T;
  readonly step: string; }                       // producing step id (same activity)
export interface CrossRef<N extends string, T> { readonly kind: 'xref';  readonly symbol: N; readonly __t?: T;
  readonly activity: string; readonly step: string; }  // ordinal bound at lowering → 'NN.step.name'
export interface ScopeRef<N extends string, T> { readonly kind: 'scope'; readonly symbol: N; readonly __t?: T; }

export type Readable<T = unknown> =
  VarHandle<string, T> | OutRef<string, T> | CrossRef<string, T> | ScopeRef<string, T>;
export type ValueOf<H> = H extends Readable<infer T> ? T : never;

/** Explicit dynamic scope-chain resolution (legacy SCOPE-001 semantics).
 *  Name is tsc-checked at the binding site; producibility is a build pass (PROV-101). */
export declare function scoped<N extends string>(name: SnakeCaseId<N>): ScopeRef<N, unknown>;
export declare function scopedAs<T>(): <N extends string>(name: SnakeCaseId<N>) => ScopeRef<N, T>;

/** Cross-activity escape hatch: even the string form is shape-qualified by tsc (PROV-002). */
export declare function xref(q: `${number}.${string}.${string}`): CrossRef<string, unknown>;

// ---------- condition expression builders (lowers to IR BoolExpr/Guard) -----
export interface BoolExpr { readonly kind: 'expr'; }
export declare function eq <H extends Readable>(l: H, r: ValueOf<H> | null): BoolExpr;
export declare function ne <H extends Readable>(l: H, r: ValueOf<H> | null): BoolExpr;
export declare function gt <H extends Readable<number>>(l: H, r: number): BoolExpr;  // gte/lt/lte alike
export declare function gte<H extends Readable<number>>(l: H, r: number): BoolExpr;
export declare function lt <H extends Readable<number>>(l: H, r: number): BoolExpr;
export declare function lte<H extends Readable<number>>(l: H, r: number): BoolExpr;
export declare function exists(h: Readable): BoolExpr;
export declare function notExists(h: Readable): BoolExpr;
export declare function and(...e: [BoolExpr, BoolExpr, ...BoolExpr[]]): BoolExpr;
export declare function or (...e: [BoolExpr, BoolExpr, ...BoolExpr[]]): BoolExpr;
export declare function not(e: BoolExpr): BoolExpr;
/** Escape hatch for legacy `when:` strings; parsed + SCOPE-002-checked at build. */
export declare function rawExpr(expr: string): BoolExpr;

// ---------- generated technique contracts (shape; values come from codegen) -
export interface InputSpec<T, Req extends boolean, Def> {
  readonly value?: T; readonly required: Req; readonly default: Def;
  /** `#### <member>` component names; descriptions ride as JSDoc in the generated module. */
  readonly components?: Record<string, string>;
}
export interface ArtifactOut<Name extends string, Tok extends string> {
  readonly name: Name; readonly action: 'create' | 'update'; readonly tokens: readonly Tok[];
}
export interface OutputSpec<T, Art extends ArtifactOut<string, string> | undefined = undefined> {
  readonly value?: T; readonly artifact: Art;
}
export interface TechniqueContract<
  Addr  extends string,                                   // canonical '::' address (registry key)
  Shape extends 'standalone' | 'container' | 'nested' | 'workflow-root',
  I     extends Record<string, InputSpec<any, boolean, any>>,   // keys: verbatim snake_case ids
  O     extends Record<string, OutputSpec<any, any>>,           // same id may appear in I and O
  Rule  extends string                                    // rule-NAME literal union ('.'-citation, group-*)
> {
  readonly address: Addr; readonly version: string; readonly shape: Shape;
  readonly inputs: I; readonly outputs: O; readonly rules: readonly Rule[];
}
export type AnyContract = TechniqueContract<string, any, any, any, string>;

type RequiredInputIds<C extends AnyContract> = {
  [K in keyof C['inputs'] & string]:
    C['inputs'][K] extends InputSpec<any, true, undefined> ? K : never }[keyof C['inputs'] & string];
type OptionalInputIds<C extends AnyContract> =
  Exclude<keyof C['inputs'] & string, RequiredInputIds<C>>;
type SourceFor<S> = S extends InputSpec<infer T, any, any> ? Readable<T> | T : never;

/** PROV-001 (static face): required-without-default inputs are REQUIRED keys.
 *  Key ≠ source-symbol-name ⇒ build WARN BIND-102 (canonical-rename policy) and lowers to a rename. */
export type BindingsFor<C extends AnyContract> =
  { readonly [K in RequiredInputIds<C>]:  SourceFor<C['inputs'][K]> } &
  { readonly [K in OptionalInputIds<C>]?: SourceFor<C['inputs'][K]> };

// ---------- items, sequences, terminals -------------------------------------
export interface Item { readonly __item: true; }
export interface TerminalItem extends Item { readonly __terminal: true; }   // goTo, break
export type NonTerminalItem = Item & { readonly __terminal?: false };
/** DEAD-001: a terminal may only be the LAST item of a sequence (tsc via tuple inference). */
export type Seq = readonly [] | readonly [...NonTerminalItem[], Item];

export interface MessageItem extends Item { readonly kind: 'message'; }
export declare function msg(text: string): MessageItem;                                  // {x} build-checked
export declare function msg(parts: TemplateStringsArray, ...vars: Readable[]): MessageItem; // typed interp

export interface GoToItem<A extends string = string> extends TerminalItem { readonly kind: 'goto'; readonly to: A; }
export interface BreakToken   extends TerminalItem { readonly kind: 'break';   readonly loop: string; }
export interface RestartToken extends Item         { readonly kind: 'restart'; readonly loop: string; }
export interface RetryToken   extends Item         { readonly kind: 'retry';   readonly decision: string; }

/** Conditional inline gate (unifies legacy step `when:`/`condition:`). */
export declare function onlyWhen(when: BoolExpr, ...items: Seq): Item;

// ---------- steps ------------------------------------------------------------
export interface StepHandle<Id extends string, C extends AnyContract | undefined> extends Item {
  readonly kind: 'step'; readonly id: Id;
  /** Typed output handles from the contract (local-flow scope, statically). */
  readonly out: C extends AnyContract
    ? { readonly [K in keyof C['outputs'] & string]: OutRef<K, C['outputs'][K] extends OutputSpec<infer T, any> ? T : never> }
    : {};
}
export interface StepOptions {
  readonly required?: boolean;
  readonly actions?: readonly ActionSpec[];
  readonly triggers?: readonly TriggerSpec[];
}
export declare function trivial<Id extends string>(
  id: KebabCaseId<Id>, description: string, opts?: StepOptions): StepHandle<Id, undefined>;
export declare function invoke<Id extends string, C extends AnyContract>(
  id: KebabCaseId<Id>, technique: C, bindings: BindingsFor<C>,
  description?: string, opts?: StepOptions): StepHandle<Id, C>;
/** Dynamic-address escape hatch; resolution + binding checks move to build (TEC-101). */
export declare function invokeDynamic<Id extends string>(
  id: KebabCaseId<Id>, technique: string, bindings: Record<string, Readable | unknown>,
  description?: string): StepHandle<Id, undefined>;

// ---------- decisions --------------------------------------------------------
export interface DecisionHandle<Id extends string> extends Item { readonly kind: 'decision'; readonly id: Id; }
export type BranchMap = Record<string, Seq>;

/** DEC-002 (static face): at least one branch must not contain the retry token. */
type ContainsRetry<S> = S extends readonly (infer U)[] ? ([RetryToken] extends [Extract<U, RetryToken>] ? (RetryToken extends U ? true : false) : false) : false;
export type ERR_DEC002_RetryDecisionNeedsExitBranch<B extends BranchMap> =
  true extends { [K in keyof B]: ContainsRetry<B[K]> extends true ? never : true }[keyof B] ? B : never;

export interface RetryCtx<Id extends string> { readonly retry: RetryToken; }

/** Interactive decisions (legacy `message:`). DEC-003 unrepresentable. */
export declare function ask<Id extends string>(                       // branchless = blocking ack-gate
  id: KebabCaseId<Id>, message: string | MessageItem): DecisionHandle<Id>;
export declare function ask<Id extends string, const B extends BranchMap>(
  id: KebabCaseId<Id>, message: string | MessageItem, branches: B): DecisionHandle<Id>;
export declare function ask<Id extends string, const B extends BranchMap>( // self-ref retry form
  id: KebabCaseId<Id>, message: string | MessageItem,
  branches: (d: RetryCtx<Id>) => ERR_DEC002_RetryDecisionNeedsExitBranch<B>): DecisionHandle<Id>;

/** Variable match (legacy `variable:`). DEC-004 unrepresentable.
 *  Closed-union handle ⇒ exhaustive-or-default REQUIRED (DEC-001 → tsc). */
type MatchKey<T> = T extends string | number ? `${T}` : never;
export type ExhaustiveOrDefault<T, B> =
  [T] extends [string | number]
    ? (B extends Record<MatchKey<T>, Seq> ? B
       : B extends Partial<Record<MatchKey<T>, Seq>> & { default: Seq } ? B
       : never /* ERR_DEC001_MatchMustBeExhaustiveOrHaveDefault */)
    : Record<string, Seq>;  // open-typed handle: any keys, default optional (build WARN if absent? no — see matchPartial)
export declare function match<Id extends string, H extends Readable, const B>(
  id: KebabCaseId<Id>, on: H, branches: ExhaustiveOrDefault<ValueOf<H>, B> & { default?: Seq }): DecisionHandle<Id>;
/** Legacy parity form: unmatched value = pass-through; emits build WARN DEC-001. */
export declare function matchPartial<Id extends string, H extends Readable>(
  id: KebabCaseId<Id>, on: H, branches: BranchMap & { default?: Seq }): DecisionHandle<Id>;

/** Boolean decision (legacy `condition:`); `false` optional per grammar/activity.ebnf:65. */
export declare function cond<Id extends string>(
  id: KebabCaseId<Id>, when: BoolExpr, branches: { readonly true: Seq; readonly false?: Seq }): DecisionHandle<Id>;

// ---------- loops --------------------------------------------------------------
export interface LoopCtx<As extends string, T> {
  readonly item: VarHandle<As, T>;   // iteration variable; symbol id = `as` (scope level 2)
  readonly break: BreakToken;        // ONLY here ⇒ LOOP-002 by construction; loop-bound ⇒ LOOP-003 explicit
  readonly restart: RestartToken;    // legacy `- loop: <self>` re-entry
}
type ElementOf<C> = C extends Readable<readonly (infer E)[]> ? E : unknown;
export interface LoopHandle<Id extends string> extends Item { readonly kind: 'loop'; readonly id: Id; }
export declare function forEach<Id extends string, As extends string, C extends Readable<readonly any[]> | Readable>(
  id: KebabCaseId<Id>,
  opts: { readonly over: C; readonly as: SnakeCaseId<As>; readonly max?: number },
  body: (it: LoopCtx<As, ElementOf<C>>) => Seq): LoopHandle<Id>;

// ---------- checkpoints ----------------------------------------------------------
export interface VarAssignment { readonly __assign: true; }
export declare function setVar<H extends VarHandle<string, any>>(h: H, value: ValueOf<H>): VarAssignment;
export interface EffectSpec<A extends string = string> {
  readonly set?: readonly VarAssignment[];
  readonly transitionTo?: ActivityRef<A>;
  readonly skipActivities?: readonly ActivityRef<A>[];
}
export interface OptionDef { readonly label: string; readonly description?: string; readonly effect?: EffectSpec; }
export interface CheckpointHandle<Id extends string> extends Item { readonly kind: 'checkpoint'; readonly id: Id; }
export declare const checkpoint: {
  /** blocking (default legacy shape); `required` default true; `condition` = presentation gate (dismissible via condition_not_met). */
  blocking<Id extends string, const O extends Record<string, OptionDef>>(
    id: KebabCaseId<Id>,
    opts: { name: string; message: string | MessageItem; options: O;
            condition?: BoolExpr; required?: boolean }): CheckpointHandle<Id>;
  /** non-blocking auto-advance: autoAdvanceMs ⇒ ¬blocking ∧ defaultOption — by construction (CKP-101);
   *  defaultOption ∈ options — tsc via keyof. */
  autoAdvance<Id extends string, const O extends Record<string, OptionDef>>(
    id: KebabCaseId<Id>,
    opts: { name: string; message: string | MessageItem; options: O;
            defaultOption: keyof O & string; autoAdvanceMs: number; condition?: BoolExpr }): CheckpointHandle<Id>;
};

// ---------- transitions, activity refs --------------------------------------------
export type ActivityRef<Id extends string = string> = Brand<{ readonly id: Id }, 'activity-ref'>;
export declare function activityIds<const Ids extends readonly string[]>(
  ...ids: Ids): { readonly [K in Ids[number]]: ActivityRef<K> };
export declare function goTo<Id extends string>(to: ActivityRef<Id>): GoToItem<Id>;

export interface Transition       { readonly __transition: true; }
export interface DefaultTransition{ readonly __default: true; }
export declare function transition(when: BoolExpr, to: ActivityRef): Transition;
export declare function otherwise(to: ActivityRef): DefaultTransition;
/** Ordered, first-match (R-RT-2); default only in tail position — by signature. */
export type TransitionList = readonly [...Transition[], DefaultTransition] | readonly Transition[];

// ---------- actions, dispatch, artifacts, resources --------------------------------
export interface ActionSpec { readonly __action: true; }
export declare const actions: {
  set<H extends VarHandle<string, any>>(h: H, value: ValueOf<H> | { describe: string }, when?: BoolExpr): ActionSpec;
  log(message: string, when?: BoolExpr): ActionSpec;
  message(markdown: string | MessageItem, when?: BoolExpr): ActionSpec;
  validate(target: BoolExpr, failureMessage: string): ActionSpec;
  emit(target: string, value: unknown, when?: BoolExpr): ActionSpec;
};

export interface TriggerSpec { readonly __trigger: true; }
/** Lowers to IR Dispatch {workflow_id,…}; agent_id/planning_slug are runtime-supplied (R-RT-5). */
export declare function dispatchChild(opts: {
  readonly workflow: string;                       // workflow id; registry-typed when a workflow registry is generated
  readonly description?: string;
  readonly passContext?: readonly Readable[];      // names proved by handles
}): TriggerSpec;

export interface NameTemplate { readonly __tpl: true; }
/** `{token}` interpolation with PROVED tokens (ART-101). */
export declare function tpl(parts: TemplateStringsArray, ...tokens: Readable[]): NameTemplate;
export interface ArtifactDecl { readonly __artifact: true; }
/** `LocKeys` = keyof workflow artifactLocations (bound via Wf<…> helper below);
 *  `artifactPrefix` is NOT authorable — derived from the activity ordinal at lowering. */
export declare function artifact<Id extends string, LocKeys extends string = string>(
  id: KebabCaseId<Id>,
  opts: { name: string | NameTemplate; location?: LocKeys;
          action?: 'create' | 'update'; description?: string }): ArtifactDecl;

export type ResourceRef = Brand<string, 'resource-ref'>;     // generated registry preferred:
export declare function resourceRef(ref: string): ResourceRef; // R['meta/activity-worker-prompt#section']

// ---------- activity ------------------------------------------------------------------
export interface InputDecl { readonly __input: true; }
export declare function external<T = unknown>(): InputDecl;   // bare symbol: workflow/parent scope
export type InputDeclMap = Record<string, InputDecl | OutRef<string, any> | CrossRef<string, any>>;
type InputHandles<M extends InputDeclMap> = {
  readonly [K in keyof M & string]:
    M[K] extends OutRef<string, infer T> | CrossRef<string, infer T> ? VarHandle<K, T>
    : M[K] extends InputDecl ? VarHandle<K, unknown> : never;
};
export interface ActivityCtx {
  /** Keys = snake_case symbol ids, verbatim → IR (R-BIND). Typed cross-refs discharge PROV-002. */
  inputs<const M extends InputDeclMap>(m: { [K in keyof M]: M[K] } & { [K in keyof M & string as SnakeCaseId<K>]: unknown }): InputHandles<M>;
}
export interface ActivityMeta {
  readonly description: string; readonly problem?: string;
  readonly recognition?: readonly string[];          // independent-entry intent patterns
  readonly outcome?: readonly string[];
  readonly context_to_preserve?: readonly string[];
  readonly required?: boolean;
  readonly estimatedTime?: `${number}${'m' | 'min' | 'h' | 'hr' | 'd'}` | `${number}-${number}${'m' | 'min' | 'h' | 'hr' | 'd'}`;
  readonly rules?: readonly string[];
  readonly techniques?: { primary?: AnyContract; supporting?: readonly AnyContract[] };
}
export interface ActivityResult {
  readonly body: Seq;                                // FLOW-001 discharged: required
  readonly transitions?: TransitionList;
  readonly artifacts?: readonly ArtifactDecl[];
  readonly triggers?: readonly TriggerSpec[];
  readonly entryActions?: readonly ActionSpec[];
  readonly exitActions?: readonly ActionSpec[];
  readonly exports?: Record<string, OutRef<string, any>>;  // cross-activity output surface
}
export interface ActivityModule<Id extends string, X extends Record<string, OutRef<string, any>>> {
  readonly id: Id; readonly version: SemVer;
  /** Typed cross-activity refs; ordinal bound at workflow registration (lowering → 'NN.step.name'). */
  readonly out: { readonly [K in keyof X & string]: CrossRef<K, ValueOf<X[K]>> };
}
export declare function activity<Id extends string, const R extends ActivityResult>(
  id: KebabCaseId<Id>, version: SemVer, meta: ActivityMeta,
  build: (a: ActivityCtx) => R
): ActivityModule<Id, R['exports'] extends Record<string, OutRef<string, any>> ? R['exports'] : {}>;

// ---------- workflow ----------------------------------------------------------------------
export interface VarDecl<T> { readonly __var: true; readonly __t?: T; }
export declare const v: {
  string(opts?: { default?: string; description?: string; required?: boolean }): VarDecl<string>;
  boolean(opts?: { default?: boolean; description?: string }): VarDecl<boolean>;
  number(opts?: { default?: number; description?: string }): VarDecl<number>;
  enumOf<const U extends readonly string[]>(values: U, opts?: { default?: U[number]; description?: string }): VarDecl<U[number]>;
  array<T = unknown>(opts?: { description?: string }): VarDecl<readonly T[]>;
  object<T extends Record<string, unknown>>(opts?: { description?: string }): VarDecl<T>;  // enables typed .dot()
};
export declare function variables<const D extends Record<string, VarDecl<any>>>(
  d: { [K in keyof D]: D[K] } & { [K in keyof D & string as SnakeCaseId<K>]: unknown }
): { readonly [K in keyof D & string]: VarHandle<K, D[K] extends VarDecl<infer T> ? T : never> };

export interface RoleDef { readonly id: string; readonly description: string; }
export type RoleRef<R extends string = string> = Brand<{ readonly role: R }, 'role-ref'>;
export interface ModeDef { readonly __mode: true; }
export declare function mode<Id extends string>(id: KebabCaseId<Id>, opts: {
  readonly name: string; readonly description?: string;
  readonly activationVariable: VarHandle<string, boolean>;   // proved boolean
  readonly recognition?: readonly string[];
  readonly skipActivities?: readonly ActivityRef[];          // proved ∈ activity union
  readonly defaults?: readonly VarAssignment[];              // typed per-variable
  readonly resource?: ResourceRef;
}): ModeDef;

export interface PathTemplate { readonly __path: true; }
export declare function path(parts: TemplateStringsArray, ...tokens: Readable[]): PathTemplate;
export interface WorkflowSpec {
  readonly title: string; readonly description?: string; readonly author?: string;
  readonly tags?: readonly string[]; readonly rules?: readonly string[];
  /** First-class (fixes workflow.schema.json drift); min 1 role by tuple type. */
  readonly executionModel: { readonly roles: readonly [RoleDef, ...RoleDef[]] };
  readonly variables: Record<string, VarHandle<string, any>>;
  readonly modes?: readonly ModeDef[];
  readonly artifactLocations?: Record<string, string | PathTemplate |
    { path: string | PathTemplate; description?: string; gitignored?: boolean }>;
  /** Optional iff every activity declares `recognition` (build INIT-001). */
  readonly initial?: ActivityRef;
  /** Ordinals = 1-based position, or explicit `[ordinal, module]` for corpus parity (build ID-105: dense+unique). */
  readonly activities: readonly (ActivityModule<string, any> | readonly [number, ActivityModule<string, any>])[];
  readonly techniques?: { primary?: AnyContract; supporting?: readonly AnyContract[] };
}
export interface WorkflowModule { readonly __workflow: true; }
export declare function workflow<Id extends string>(
  id: KebabCaseId<Id>, version: SemVer, spec: WorkflowSpec): WorkflowModule;

// ---------- RESERVED — Phase 2+ governance (declared, build-rejected GOV-001) ---------------
/** @reserved Phase 2+ (design spec §6.2/§8/§13). Layers on Checkpoint. Phase-1 build: ERROR GOV-001. */
export declare function approve<R extends string>(id: string, opts: {
  readonly role: RoleRef<R>; readonly prompt: string; readonly onDeny?: Seq }): Item;
/** @reserved Phase 2+. Lowers to IR CapabilityGate; ViolationAction per design spec §6.3. */
export declare function capabilityGate(id: string, opts: {
  readonly scope: readonly string[];
  readonly onViolation: 'deny' | 'fail_node' | 'fail_workflow' | 'escalate' | 'nudge' }): Item;
/** @reserved Phase 2+. Layers on Dispatch; bounded context/tools/stop conditions live in the task packet. */
export declare function delegate<R extends string>(id: string, opts: {
  readonly role: RoleRef<R>; readonly workflow: string; readonly packet?: unknown }): Item;
```

### 2.1 Generated technique contract module — shape and binding type-check

Generation (`wp-contracts`) parses the technique markdown corpus with the existing loader semantics (plural `## Inputs`/`## Outputs`, `*(optional)*` marker, `#### default`, `#### artifact` with `{token}` extraction, `## Rules` names, container chains) and emits **one module per workflow** at `workflows/<wf>/.gen/techniques.gen.ts` — values + literal types, because the executed builder needs the contract *objects* at build-run time:

- Keys = canonical `::` addresses resolved **workflow-relatively** (own techniques shadow meta; slashes normalized; workflow-root `TECHNIQUE` excluded as an address but composed in).
- Composition **pre-applied** per (executing-workflow × technique): keyed-section union, local wins, along workflow root + group containers. Maximal type concreteness; the runtime's late-composition behavior is mirrored, not replaced.
- Optionality made structural (`required`/`default` type params); `#### default` values as literal types; AP-60 shape-derived value types (predicate → `boolean`, plural → `ReadonlyArray<unknown>`, map-singular → `Record<string, unknown>`) with conservative `unknown` fallback and a per-corpus override file for non-conformant external-tool ids (e.g. `cloudId`).
- Rule-name literal unions per technique (`.`-citations, `::` rule-segment addresses, materialized `group-*` expansions).
- Embedded corpus hash → build drift guard (GEN-001): stale registry = compile ERROR.

How a binding type-checks end-to-end: `invoke(id, T['response-capture'], bindings)` instantiates `BindingsFor<C>` — tsc requires every required-without-default input id as a key (PROV-001 static face), rejects unknown keys, and checks each source's value type against the input's derived type. Sources are typed handles (`OutRef` from a previous `invoke`'s `.out`, loop `it.item`, workflow `VarHandle`, activity-input handle, `CrossRef`) or the explicit `scoped('name')` dynamic marker. Unresolvable technique addresses are unrepresentable (registry literal keys) — the bundle's `unresolved` bucket is discharged to tsc.

---

## 3. Complete port — `requirements-elicitation` (orchestra-specification.md §3.4)

Conversion conventions: node ids stay kebab-case verbatim (trace parity); symbol ids converted to snake_case per the technique protocol + design-spec §5.1's own conversion (`raw-responses` → `raw_responses`, etc.). Legacy comments preserved as `//` comments with original rule annotations.

### 3.1 Context modules (workflow-side, shown for completeness)

```ts
// workflows/work-package/variables.ts
import { variables, v } from '@workflow-plane/dsl';
export const wpv = variables({
  mode:                 v.enumOf(['implement', 'review'], { default: 'implement' }),
  elicitation_complete: v.boolean({ default: false }),
  question_domains:     v.array<string>({ description: 'Domains to elicit, iterated by requirements-elicitation' }),
});

// workflows/work-package/ids.ts
import { activityIds } from '@workflow-plane/dsl';
export const ACT = activityIds(
  'issue-setup', 'requirements-elicitation', 'implementation-analysis', 'research',
);

// workflows/work-package/activities/01-issue-setup.ts (excerpt — producer of the cross-activity refs)
export const issueSetup = activity('issue-setup', '3.0.0', { description: '…' }, (a) => {
  const createIssue = invoke('create-issue', T['issue-create'], { /* … */ });
  const checkIssue  = invoke('check-issue',  T['issue-platform-check'], { /* … */ });
  return {
    body: [createIssue, checkIssue],
    exports: {
      issue_number:   createIssue.out.issue_number,   // → '01.create-issue.issue_number' at lowering
      issue_platform: checkIssue.out.issue_platform,  // → '01.check-issue.issue_platform'
    },
  };
});
```

Generated contract excerpt assumed by the port (`workflows/work-package/.gen/techniques.gen.ts`), derived from the technique markdown the legacy comments describe:

```ts
export declare const T: {
  'domain-question': TechniqueContract<'domain-question', 'standalone',
    { current_domain: InputSpec<string, true, undefined>;
      elicitation_log: InputSpec<unknown, false, undefined> },          // optional: empty on first iteration
    { question_text: OutputSpec<string>; user_response: OutputSpec<string> }, never>;
  'response-capture': TechniqueContract<'response-capture', 'standalone',
    { user_response: InputSpec<string, true, undefined>; current_domain: InputSpec<string, true, undefined> },
    { elicitation_log: OutputSpec<unknown> },                           // accumulates across iterations
    never>;
  'assumptions-review': TechniqueContract<'assumptions-review', 'standalone',
    { raw_responses: InputSpec<unknown, true, undefined> },
    { categorized_assumptions: OutputSpec<readonly unknown[]> },        // AP-60 plural → array
    never>;
  'jira-comment': TechniqueContract<'jira-comment', 'standalone',
    { categorized_assumptions: InputSpec<readonly unknown[], true, undefined>;
      issue_number: InputSpec<string, true, undefined> },               // qualified by the CALLER, not the contract
    { comment_posted: OutputSpec<boolean> },                            // AP-60 predicate → boolean
    never>;
  'github-comment': TechniqueContract<'github-comment', 'standalone',
    { categorized_assumptions: InputSpec<readonly unknown[], true, undefined>;
      issue_number: InputSpec<string, true, undefined> },
    { comment_posted: OutputSpec<boolean> }, never>;
  'artifact-management': TechniqueContract<'artifact-management', 'standalone',
    { elicitation_log: InputSpec<unknown, true, undefined> },
    { requirements_document: OutputSpec<string, ArtifactOut<'requirements.md', never>> }, never>;
  'assumptions-log-update': TechniqueContract<'assumptions-log-update', 'standalone',
    { categorized_assumptions: InputSpec<readonly unknown[], true, undefined> },
    { assumptions_log: OutputSpec<unknown, ArtifactOut<'assumptions-log.md', never>> },  // action: 'update'
    never>;
  // … issue-create, issue-platform-check elided (activity 01)
};
```

### 3.2 The activity — full port, no elisions

```ts
// workflows/work-package/activities/02-requirements-elicitation.ts
import {
  activity, trivial, invoke, ask, match, matchPartial, cond, forEach,
  msg, goTo, scoped, xref, eq, ne, and,
} from '@workflow-plane/dsl';
import { T }          from '../.gen/techniques.gen';
import { ACT }        from '../ids';
import { wpv as v }   from '../variables';
import { issueSetup } from './01-issue-setup';

export const requirementsElicitation = activity(
  'requirements-elicitation', '3.0.0',
  { description: 'Discover and clarify what the work package should accomplish through structured sequential conversation.' },
  (a) => {

    // Activity-level inputs: external data this activity needs [PROV-001, PROV-002]
    // Only data not produced within this activity's own flow.
    const inp = a.inputs({
      raw_responses:  external(),                                  // bare symbol — workflow/parent scope
      issue_number:   issueSetup.out.issue_number,                 // typed cross-ref → '01.create-issue.issue_number'
      issue_platform: xref('01.check-issue.issue_platform'),       // escape hatch (shape proved by template-literal type)
    });

    // -------------------------------------------------------------- steps
    // Trivial step — no technique binding
    const stakeholderDiscussion = trivial('stakeholder-discussion',
      'Prompt user to initiate discussion with key stakeholders.');             // [SYM-001 → build ID-101]

    const collectAssumptions = invoke('collect-assumptions', T['assumptions-review'], {
      raw_responses: inp.raw_responses,                            // resolves from activity inputs
    }, 'Identify assumptions made when interpreting user responses.');

    const postAssumptionsToJira = invoke('post-assumptions-to-jira', T['jira-comment'], {
      categorized_assumptions: collectAssumptions.out.categorized_assumptions,  // local flow scope, statically
      issue_number:            inp.issue_number,                   // legacy: qualified in technique def; now caller-side typed ref
    }, 'Prepare assumptions as Jira comment, get approval, post to ticket.');

    const postAssumptionsToGithub = invoke('post-assumptions-to-github', T['github-comment'], {
      categorized_assumptions: collectAssumptions.out.categorized_assumptions,
      issue_number:            inp.issue_number,
    }, 'Post assumptions as GitHub issue comment.');

    const createDocument = invoke('create-document', T['artifact-management'], {
      elicitation_log: scoped('elicitation_log'),                  // produced inside the loop; dynamic scope-chain resolution
    }, 'Create requirements document using elicitation output template.');

    const updateAssumptionsLog = invoke('update-assumptions-log', T['assumptions-log-update'], {
      categorized_assumptions: collectAssumptions.out.categorized_assumptions,
    }, 'Add requirements-phase assumptions to the assumptions log.');

    // -------------------------------------------------------------- decisions (out-of-loop)
    // Mode branching — workflow-level variable. v.mode: 'implement' | 'review' ⇒ exhaustive
    // match REQUIRED by tsc (legacy DEC-001 WARN retired by exhaustiveness over the closed union).
    const modeElicitationPath = match('mode-elicitation-path', v.mode, {
      implement: [stakeholderDiscussion],
      review:    [goTo(ACT['implementation-analysis'])],           // [TERM-001] terminal — tail position (DEAD-001)
    });

    // Interactive — user provides transcript; empty branch = pass-through
    const stakeholderTranscript = ask('stakeholder-transcript',
      'Provide the stakeholder transcript or summary here.', {
        'provide-transcript': [stakeholderDiscussion],
        'skip-discussion':    [],                                  // empty = pass-through
      });

    // Interactive — self-referencing retry. Callback form is the ONLY way to obtain d.retry;
    // type ERR_DEC002_RetryDecisionNeedsExitBranch + build pass enforce a non-recursive exit. [DEC-002]
    const jiraCommentReview = ask('jira-comment-review',
      'Review the Jira comment before posting.', (d) => ({
        'post-comment': [],                                        // empty = pass-through (exit branch)
        'edit-comment': [postAssumptionsToJira, d.retry],          // re-run step, re-evaluate decision
        'skip-posting': [],
      }));

    // Programmatic — route by platform. issue_platform is open-typed (escape-hatch xref),
    // and legacy has no default: matchPartial preserves pass-through + emits build WARN DEC-001.
    const platformRouting = matchPartial('platform-routing', inp.issue_platform, {
      jira:   [postAssumptionsToJira, jiraCommentReview],
      github: [postAssumptionsToGithub],
      // validator warns: no default branch                        // [DEC-001 → build WARN]
    });

    // -------------------------------------------------------------- loop  [LOOP-001 discharged: body inline]
    const domainIteration = forEach('domain-iteration',
      { over: v.question_domains, as: 'current_domain', max: 5 },
      (it) => {
        // Dynamic question — technique-backed, context-dependent
        const askQuestion = invoke('ask-question', T['domain-question'], {
          current_domain:  it.item,                                // loop variable (scope level 2), typed
          elicitation_log: scoped('elicitation_log'),              // loop-carried accumulation (record-response output)
        }, 'Present ONE question from current domain. Wait for response.');     // [PROV-001]

        const recordResponse = invoke('record-response', T['response-capture'], {
          user_response:  askQuestion.out.user_response,           // local flow scope, statically typed
          current_domain: it.item,
        }, 'Capture answer or mark as skipped. Adapt follow-up.');
        // output elicitation_log injected into scope, accumulates across iterations

        // Interactive — mid-loop user intent; break exits the INNERMOST loop only,
        // proved by token provenance (it.break is bound to 'domain-iteration'). [LOOP-002/003 discharged]
        const userIntent = ask('user-intent', 'How would you like to proceed?', {
          answered:        [recordResponse],                       // rejoins after the decision
          'skip-question': [],                                     // empty = pass-through
          'skip-domain':   [it.break],
          done:            [it.break],
        });

        // Interactive — end-of-domain control; typed message interpolation replaces '{current-domain}'
        const domainComplete = ask('domain-complete',
          msg`Domain '${it.item}' complete.`, {
            'next-domain':  [],                                    // empty = pass-through → next iteration
            revisit:        [it.restart],                          // legacy `- loop: domain-iteration` self re-entry
            'finish-early': [it.break],
          });

        return [askQuestion, userIntent, domainComplete];          // was flow `domain-body`
      });

    // Programmatic — boolean algebra; operands are typed handles (SCOPE-002 → tsc)
    const requirementsConfirmed = cond('requirements-confirmed',
      and(
        eq(v.elicitation_complete, true),
        ne(createDocument.out.requirements_document, null),
      ), {
        true:  [goTo(ACT['research'])],                            // [TERM-001]
        false: [stakeholderTranscript],                            // value reuse = re-evaluate earlier decision (retry)
      });

    // -------------------------------------------------------------- body (was flow `main`) [FLOW-001 by signature]
    return {
      body: [
        msg('Starting requirements elicitation'),
        modeElicitationPath,
        stakeholderTranscript,
        domainIteration,
        collectAssumptions,
        platformRouting,
        createDocument,
        updateAssumptionsLog,
        requirementsConfirmed,
        msg('Requirements elicitation complete'),
      ],
    };
  });
```

Port notes (fidelity ledger):

1. Every legacy node is present: 8 steps, 7 decisions, 1 loop, both flows (as `body` + loop callback), both messages, both `- activity:` terminals, both empty-branch pass-throughs, the self-ref retry, the loop self-re-entry, and the missing-default WARN on `platform-routing`.
2. `record-response` is constructed inside the loop callback and referenced only from `user-intent.answered` — exactly the legacy topology (declared but not in `domain-body`'s top level).
3. `requirements-confirmed.false → stakeholder-transcript` re-evaluates an earlier decision by value reuse; lowering emits a reference to the existing node id (shared value ⇒ one IR node, N refs).
4. `elicitation_log` is the deliberate dynamic case: optional input on first iteration, loop-carried thereafter; `scoped()` keeps the binding-name tsc-checked while provenance moves to the build pass (PROV-101 classifies it loop-carried-OK).
5. Symbol renames vs legacy: kebab→snake only (`current-domain`→`current_domain` etc.), matching design-spec §5.1's own conversion; node ids byte-identical for trace-diff parity (R-PAR-3) — the TOON transpiler applies the same symbol mapping table.

---

## 4. Constraint disposition table

Stages: **DbC** = discharged by construction (unrepresentable); **tsc** = TypeScript compile error; **build** = deterministic builder/lowering diagnostic; **ir** = IR validation (Alloy-derived) or runtime semantics.

| Legacy rule | Sev | Disposition | Detail |
|---|---|---|---|
| PROV-001 | ERROR | **tsc + build** | Required-input coverage and source typing: tsc via `BindingsFor<C>`. Residue: `scoped()`/`invokeDynamic` provenance → build PROV-101 (scope-chain analysis incl. loop-carried classification); runtime resolution order unchanged (ir). |
| PROV-002 | ERROR | **DbC (typed refs) / tsc-shape + build (escape hatch)** | Typed `CrossRef` derives `NN.step.name` at lowering; `xref()` parameter type proves the qualified shape, existence checked at build (XAC-101). |
| SYM-001 | ERROR | **build** (ID-101) | Duplicate explicit step ids within one activity. Dangling refs DbC (values). |
| SYM-002 | ERROR | **build** (ID-101) | Same for decision ids. |
| SYM-003 | ERROR | **build** (ID-101) | Same for loop ids. |
| SYM-004 | ERROR | **N/A** | Flows dissolved; no flow ids exist. |
| FLOW-001 | ERROR | **DbC/tsc** | `ActivityResult.body` is a required property — missing entry sequence is a type error. |
| FLOW-002 | WARN | **N/A → tsc-adjacent** | Orphan flows unrepresentable; the analogue (unused const sequence) is caught by `noUnusedLocals` in the recommended tsconfig. |
| FLOW-003 | ERROR | **DbC** | No by-name flow references exist. |
| LOOP-001 | ERROR | **DbC** | Loop body is an inline callback; no flow ref to dangle. |
| LOOP-002 | ERROR | **DbC** | `break` token obtainable only from the loop context callback. |
| LOOP-003 | INFO | **DbC + build** | Token is loop-bound — innermost-ness is explicit, not positional. New LOOP-101 (ERROR, build): a loop's `break`/`restart` token may not appear inside a *nested* loop's body items (multi-level break is post-baseline; P10). |
| DEC-001 | WARN | **tsc (upgraded) / build WARN (parity)** | `match` over closed-union handles requires exhaustive-or-default at the type level; `matchPartial` preserves legacy pass-through + build WARN. Runtime unmatched-no-default = pass-through unchanged (ir). |
| DEC-002 | ERROR | **DbC + tsc + build** | Mutual decision recursion unconstructible (value DAG); direct self-ref only via `d.retry`; `ERR_DEC002_RetryDecisionNeedsExitBranch` requires a retry-free branch (tsc); build pass re-verifies transitively through nested decisions reachable in branches. |
| DEC-003 | ERROR | **DbC** | `ask` has no variable/condition parameters. |
| DEC-004 | ERROR | **DbC** | `match`/`cond` are distinct constructors; exactly-one-of holds structurally. |
| TERM-001 | INFO | **ir (semantics) + tsc (typing)** | `goTo` typed `TerminalItem`; layered-terminal behavior is IR/runtime semantics, documented on the type. |
| TERM-002 | ERROR | **tsc (new DEAD-001) + ir** | Items after a terminal are a type error (terminal-tail tuple typing). Rejoin-unless-terminal semantics live in IR/runtime. |
| SCOPE-001 | INFO | **ir** | Resolution order (local flow → loop var → activity → workflow) preserved verbatim in IR/runtime; the build PROV-101 pass *implements* it for static analysis. |
| SCOPE-002 | ERROR | **DbC/tsc + build (escape hatch)** | Handle-built expressions cannot reference nonexistent variables; `rawExpr()` strings parsed + resolved at build. |

### New rule families required by this surface

| ID family | Stage | Rules |
|---|---|---|
| **BIND-1xx** (binding conformance) | tsc/build | BIND-101 (tsc): required inputs bound / unknown keys rejected / value-type compatibility where AP-60-derivable. BIND-102 (build WARN): binding key ≠ source symbol id ⇒ rename lowered to `technique_args`; prefer canonical rename (standing policy). BIND-103 (build ERROR): symbol-id regex + AP-60 lint (full check behind the partial type-level one). BIND-104 (build ERROR): `invokeDynamic` address resolution + full binding check at build. |
| **ID-1xx** (stable-id discipline) | build | ID-101: per-kind id uniqueness within activity (replaces SYM-001..003 mechanism). ID-102/103: full kebab/snake regex conformance. ID-104: node value reachable from >1 activity (ownership). ID-105: activity ordinals dense, unique, matching declared `ids.ts` union (with tsc proving target membership). ID-106: derived message ids deterministic-positional (documented, never authored). |
| **CKP-1xx** (checkpoint gating) | DbC/tsc/ir | CKP-101 (DbC): autoAdvanceMs ⇒ ¬blocking ∧ defaultOption — constructor split. CKP-102 (tsc): defaultOption ∈ options (`keyof O`). CKP-103 (tsc): effect `setVar` name+type proved by handles; transition/skip targets ∈ activity union. CKP-104 (ir): no nested active checkpoints; respond modes mutually exclusive; condition_not_met ⇒ condition present (runtime-enforced, Alloy-stated). |
| **DET-1xx** (sandbox determinism) | build | DET-101: import allowlist violation (only `@workflow-plane/dsl`, sibling definition modules, `.gen/*`). DET-102: poisoned ambient access (`Date.now`, `Math.random`, `process`, network/fs) throws ⇒ compile ERROR. DET-103: no functions/closures may survive into the definition (all callbacks executed during the single build run; the value graph must be pure data — verified by a post-run walk). DET-104: byte-identical canonical IR for identical source (CI re-run hash compare). |
| **XAC-1xx** (cross-activity refs) | tsc/build | XAC-101: `xref` string resolves to an existing (ordinal, step, output) at build. XAC-102 (tsc): typed `Module.out.x` existence by construction. XAC-103 (build): exported output's producing step is reachable from the exporter's body. |
| **TRN-1xx** (transitions) | DbC/tsc/build | TRN-101 (DbC): order = array order; `otherwise` tail-only by signature. TRN-102 (tsc): targets ∈ activity-id union. TRN-103 (build): `initial` present unless all activities have `recognition` (INIT-001 alias). |
| **ART-1xx** (artifacts) | tsc/build | ART-101 (tsc): `tpl` tokens are handles (in scope by construction); (build) `{token}`s in plain-string names resolve against scope. ART-102 (tsc): `location` ∈ artifactLocations keys. ART-103 (build): `artifactPrefix` never authored; derived from ordinal. |
| **GEN-0xx** (generation fidelity) | build | GEN-001: contract-registry corpus-hash drift ⇒ ERROR (mirrors the repo's existing binding-fidelity drift guard, cf. commit ed514218). GEN-002: generated module is the only legal provider of `TechniqueContract` values (hand-rolled contract objects rejected by brand + build check). |
| **GOV-0xx** (reserved constructs) | build | GOV-001: `approve`/`capabilityGate`/`delegate` present in a Phase-1 artifact ⇒ ERROR (declared-but-disabled; signatures stable for Phase 2). |

---

## 5. Compile-pipeline implications

**Sandbox (locked decision 1, operationalized).** The artifact's module graph is evaluated exactly once inside an isolated realm (SES/ShadowRealm or `node:vm` with frozen intrinsics): no `fs`/network/`process`; `Date`, `Math.random`, `performance`, timers poisoned to throw (DET-102); module resolution restricted to the DSL package, sibling definition modules of the same workflow, and `.gen/*` (DET-101). No ambient registration exists (move m): builders are pure factories, so the run's output is a plain value graph; a post-run structural walk rejects retained functions/closures (DET-103). Same source ⇒ same bytes (DET-104, CI-verified).

**Canonicalization & stable ids.** Activity content = deterministic reachability walk of `body`/`transitions`/`exports` in item order. Shared values dedupe to one IR node + references; duplicate ids across distinct values are ID-101 errors. IR `NodeId` = (workflow, activity, kind, authored id); authored ids verbatim (R-PAR-3, manifests, trace tokens, policy keying). Only inline messages get derived ids (positional within their owning sequence — deterministic from canonical structure, independent of builder internals). Every node is emitted wrapped in `NodeEnvelope` with inert `ExecutionPolicy` (R-IR-ENV). Serialization follows the L2 EBNF: fixed field order per production, declaration order for sequences, sorted order for keyed sets, NFC strings, decimal integers; sha256 over canonical bytes yields the signable artifact hash (R-GOV-4, R-X-1). Lowering table = R-IR-2 verbatim: `invoke→Invoke`, `ask→AwaitInput`, `match/cond→Branch(MatchVar|Condition)`, `forEach→Iterate`, `msg→EmitMessage`, `goTo→GotoActivity`, `break→LoopExit`, `body→Block(main)`, end-of-body→`Terminate`, plus `Checkpoint`/`Dispatch`/`EmitArtifact` from R-IR-3.

**Contract generation from markdown.** `wp-contracts` reuses the loader's parse (`markdown-technique-loader.ts` semantics) and emits per-workflow `techniques.gen.ts` (values `as const` + types), pre-composed along the executing workflow's ancestor chain, with AP-60 shape derivation + override file, rule-name unions, artifact token extraction, and the GEN-001 corpus hash. Regeneration is a watch/CI step; the DSL never parses markdown itself. A parallel small `resources.gen.ts` registry types resource refs (optional; string escape hatch remains).

**Source mapping & diagnostics.** Preferred: a tiny TS transformer injects `(file, line, col)` spans into constructor calls (engine-independent; stack-capture fallback noted but rejected for canonical output). One diagnostic format across stages: `{ code, stage: 'tsc'|'build'|'ir', severity: ERROR|WARN|INFO, node: {workflow, activity, kind, id}, span, message }`. Legacy rule ids retained as codes wherever the rule survives (DEC-001 WARN from `matchPartial` reads identically to today); tsc-stage failures use self-describing never-type aliases (`ERR_DEC002_…`) so editor errors cite the rule. Severity grading survives hoisting into types (P4): anything upgraded to tsc keeps its legacy code in the alias name and in the parity mapping table shipped with `wp-dsl`.

**TOON compatibility reader.** A separate front-end onto the same AST/IR (R-PAR-1); it may express what the TS surface deliberately cannot (named flows, mutual decision recursion, `while`/`doWhile` from activity.schema, string conditions, `skill:` field, `technique_args` renames). Trace-diff parity is defined over IR, so the surface narrowings are safe; the one-time transpiler (OQ-3) applies the kebab→snake symbol mapping and converts flows→consts, self-refs→`d.retry`, breaks→tokens.

**Risks under this lens (acknowledged).** Heavy use of `const` type parameters, variadic tuple types, and mapped/conditional contract types raises error-message complexity — mitigated by the self-describing alias convention and by every construct having exactly one canonical spelling (R-X-4 LLM-writability). Type-instantiation cost is bounded: per-activity scope, registries are flat literal maps. The exhaustive-`match` upgrade is the only place the surface is *stricter* than legacy semantics at authoring time; runtime semantics are unchanged, and `matchPartial` preserves the legacy-shaped escape (P10).
