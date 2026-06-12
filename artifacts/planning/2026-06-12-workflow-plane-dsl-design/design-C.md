# Workflow Plane authoring DSL — Design C (Lens: MAXIMAL MIGRATION FIDELITY)

Status: candidate design for orchestrator synthesis. Author: subagent C, 2026-06-12.

Optimization target: mechanical 1:1 transpile from the legacy corpus (both lineages: the
Orchestra v3 activity language, `docs/orchestra-specification.md` + `grammar/activity.ebnf` +
`constraints/activity.als`; and the TOON corpus shapes, `schemas/workflow.schema.json` +
`schemas/activity.schema.json` + `schemas/condition.schema.json`), with trace-diff trivially
aligned (R-PAR-3) and zero semantic extension (R-ORC-1, P10). Topology moves are adopted only
where they provably cost nothing in parity; everywhere a move would force the transpiler to
restructure, reorder, duplicate, or rename, this design retains a 1:1 escape form and makes the
idiomatic form optional.

Inputs read in full: `/tmp/wp-dsl-work/inventory-legacy-semantics.md`,
`/tmp/wp-dsl-work/inventory-technique-contracts.md`, `/tmp/wp-dsl-work/inventory-runtime-model.md`,
`/tmp/wp-dsl-work/inventory-newspec-requirements.md`; legacy exemplar
`docs/orchestra-specification.md:686-836` (requirements-elicitation).

---

## 1. Adjudication of candidate topology moves

### (a) Composition by value, not by name — **MODIFY, then adopt**

Adopt value composition as the primary mechanism, but with two fidelity-preserving retentions:

1. **Named blocks survive.** `a.flow(id, ...items)` is a first-class constructor producing a
   reusable `FlowBlock` value with a mandatory explicit id. Every legacy `flows:` entry transpiles
   to exactly one `const x = a.flow('<legacy-id>', ...)`; every `- flow: x` reference transpiles to
   the value `x`. Flow ids survive verbatim into IR `Block` ids, so round-trip to TOON and any
   future flow-keyed tooling stays exact. Pure-anonymous arrays are allowed where legacy is also
   anonymous (decision-branch `FlowFragment`s, TOON inline loop steps).
2. **A by-id escape (`a.byId.*`) is retained.** Legacy reference graphs may be forward or mutually
   recursive (a decision branch may reference a decision declared later; transitively recursive
   retry webs are grammar-legal). Pure by-value cannot express forward references without
   reordering declarations — and reordering is a transpiler restructuring step Lens C forbids.
   `a.byId.decision('x')` / `a.byId.flow('x')` / `a.byId.step('x')` / `a.byId.loop('x')` are lazy
   references resolved at activity finalize; an unresolved one is a compile ERROR (the exact
   FLOW-003-class check, scoped to the escape hatch only).

Consequence for the rule families: SYM-001..004 are **not** discharged by value composition — ids
remain author-supplied strings (required by R-PAR-3), so two `a.step('x', …)` calls can collide.
They become fail-fast builder-registration errors (still "checked", but at artifact-compile time,
which under the executed-builder model is authoring time). FLOW-001/003 and LOOP-001 are
discharged for value references and remain compile checks for the `byId` escape. FLOW-002
(orphan flows) keeps exact parity because `a.flow()` registers eagerly on the activity:
registered-but-unreachable ⇒ WARN, same severity, same meaning.

`- flow: continue` (legacy pass-through sugar) gets a literal counterpart `passThrough()` so the
transpiler never has to decide whether to drop author intent; it lowers to a no-op annotation in
IR (trace-invisible, identical to empty branch — SPEC:292 declares them functionally equivalent).

**Refuted portion of (a):** "named flows dissolve into plain functions" — refused. A host-language
function that *returns* items has no stable identity, breaks FLOW-002 parity, and makes round-trip
transpile non-mechanical. Named blocks are kept as values *with ids* (move (f) dominates here).

### (b) Decision split by constructor — **ADOPT**

Three constructors replace the structurally-discriminated legacy decision:

- `a.ask(id, message, branches?)` — interactive (legacy `message:`); zero-branch call = branchless
  acknowledgment gate (SPEC:116) — same constructor, arity-discriminated, so transpile is 1:1.
- `a.match(id, operand, branches)` — programmatic multi-way (legacy `variable:`), reserved
  `default` key for the default branch.
- `a.when(id, boolExpr, { true, false? })` — programmatic boolean (legacy `condition:`); `false`
  optional, matching the standalone grammar (EBNF:65), resolving the spec-internal inconsistency
  (SPEC:133-135) in the permissive direction with a reader WARN when legacy text omitted `false:`.

DEC-003 and DEC-004 become unrepresentable (each constructor takes exactly one discriminator).
Transpile is a trivial 3-way switch on which legacy field is present. Zero parity cost: the three
constructors lower to the same `AwaitInput` / `Branch{MatchVar|Condition}` IR rows (R-IR-2).

Self-reference (retry) is expressed by an optional callback form: branches may be given as
`(self) => ({...})` where `self.retry` is a `FlowItem` token meaning "re-evaluate this decision"
— the by-value answer to the chicken-and-egg of a value referencing itself during construction.
It lowers to the identical IR self-edge as legacy `- decision: <own-id>`. DEC-002 (≥1
non-recursive exit, transitive) remains a compile check — it requires transitive closure over the
branch graph and cannot be discharged by construction without forbidding legal legacy shapes.

A **fourth constructor, `a.route(id, def)`**, is added for the *TOON-corpus* decision primitive
(`activity.schema.json` decisions: branches `{id, label, condition?, transitionTo?, isDefault?}`,
omit `transitionTo` ⇒ workflow ends). This is a different primitive from Orchestra decisions
(its branches are transition rows, not flow fragments); collapsing it into `match`/`when` chains
would be a restructuring transpile. Lens C keeps it 1:1.

### (c) Loop body as callback with iteration handle + loop-scoped break token — **MODIFY, then adopt**

Adopt the callback: `a.forEach(id, opts, (loop) => body)` where `loop` carries:
- `loop.var` — typed handle for the iteration variable (scope level 2);
- `loop.break` — `FlowItem` token: exit THIS loop, resume parent flow after the loop reference;
- `loop.restart` — `FlowItem` token: re-enter this loop (legacy `- loop: <own-id>` from inside
  its own body, SPEC:794-795 `revisit:` pattern).

Two modifications forced by parity analysis:

1. **No labeled/multi-level break.** Legacy break is *dynamically innermost* (LOOP-003). A token
   from an *outer* loop used inside an inner loop's body would express multi-level break — a
   semantic extension legacy cannot represent (violates R-ORC-1). New compile rule LOOP-101
   (ERROR): a `loop.break`/`loop.restart` token may only appear within its own loop's body and
   not inside a nested loop's body. This restriction costs nothing (it forbids only what legacy
   also cannot say) and preserves LOOP-003 exactly.
2. **A dynamic sentinel `breakLoop()` is retained** beside the token. Reason: legacy flows are
   shareable; a flow containing `- break` may be reachable from *two different loops* (legal under
   LOOP-002), where "innermost" is decided at runtime. The token design would force duplicating
   the shared decision/flow per loop — an id-breaking restructuring. `breakLoop()` carries the
   exact legacy semantics (innermost at runtime), with LOOP-002 as the compile check (reachable
   only via loop bodies). **Transpiler policy: always emit `breakLoop()`** (zero graph analysis,
   100% mechanical); `loop.break` is the new-authoring idiom. Both lower to the same `LoopExit` IR.

TOON-corpus loop kinds are kept 1:1: `a.whileLoop(id, {condition, maxIterations?, …})`,
`a.doWhile(...)`, plus `breakCondition` on all three, and the alternative body form
`{ activities: ['id', …] }` (loop over activity ids). Orchestra has only forEach; the reader maps
each TOON `type:` to its constructor.

### (d) Typed variable handles + condition expression builders — **ADOPT** (with by-name escape)

`wf.variables({...})` returns typed `VarRef` handles; expression builders
`eq/ne/gt/lt/gte/lte/exists/notExists/and/or/not` construct the canonical condition tree
(condition.schema.json lineage, a superset of the Orchestra string algebra's `==/!=/&&/||/!`).
Both legacy condition forms — the Orchestra string grammar and TOON structured `condition` /
inline `when` strings — are parsed by the legacy reader into the same `BoolExpr`; the string
grammar does not exist on the new surface. Operands accept: `VarRef` (declared workflow vars,
loop vars via `loop.var`), `OutputHandle`, qualified-ref strings, and the **by-name escape
`ref('name')`** with optional dotted paths (`ref('validation_results.validation_passed')`) —
mandatory under Lens C because most Orchestra operands are step-output symbols that exist only in
the runtime scope chain, never as declared workflow variables. `ref()` operands are SCOPE-002
compile-checked; `VarRef` operands are discharged by construction (the handle proves
declaration). Zero parity cost: IR conditions carry variable-name strings either way.

### (e) Typed activity-output handles for cross-activity refs — **ADOPT** (escape hatch mandatory)

`wf.activity(...)` returns an `ActivityHandle`; `handle.output('create-issue', 'issue-number')`
yields an `OutputHandle` lowering to the exact qualified string `NN.create-issue.issue-number`
(ordinal from declaration order, overridable via `{ ordinal }` for corpora with gaps). PROV-002
discharged for handle uses. The string escape `qualified('01.check-issue.issue-platform')`
(template-literal-typed `` `${number}.${string}.${string}` ``) is retained and compile-checked —
required for: forward references, transpiled output where the producing activity is in another
file/excerpt, and dynamic cases. **Refuted portion:** full type-level inference of output *names*
from the producing step's technique contract is NOT adopted — it would require activity bodies to
return typed step maps (a builder-shape restructuring with no parity payoff); instead the compile
pass checks `output()`/`qualified()` against the producing activity's step set and that step's
technique contract outputs (PROV-001/002 refinement, exact legacy severity).

### (f) Explicit stable ids on every node — **ADOPT, unconditionally**

Every constructor takes the id as its first argument; ids survive verbatim into IR `NodeId`s,
step/activity manifests, and trace events (R-PAR-3). Anonymous inline items that legacy also
leaves id-less (messages, terminals, pass-throughs) get deterministic structural ids
(`<owner-block-id>#<index>`) that never surface in traces (no trace event class references them —
the 21-event vocabulary keys on activity/step/checkpoint/decision/loop only).

### (g) Workflow and Activity retained as primitives — **ADOPT**

Activity is the dispatch unit (L2 worker), the checkpoint scope, the artifact-prefix scope, and
the transition-graph node; Workflow is the session/variable/mode/executionModel scope. Both keep
dedicated builders. `artifactPrefix` stays out of the authoring surface (server-computed,
recomputed canonically from ordinal at compile: `02` for ordinal 2).

### Additional moves (own)

- **(h) Field naming `technique` (OQ-4):** the DSL surface says `technique:`; the legacy reader
  accepts `skill:` and normalizes; the IR field is `technique_ref` (R-IR-2 `Invoke`). Parity is
  semantic + IR-level, not spelling-level (sanctioned by R-PAR-2's "naming questions logged").
- **(i) Symbol ids verbatim, lint layered:** symbols bind by exact string match, so the DSL never
  renames. Orchestra-era kebab symbols (`current-domain`, `elicitation-log`) are preserved
  byte-for-byte; the snake_case/AP-60 discipline is a WARN-severity lint (ID-102) with a
  legacy-compat exemption flag set by the transpiler. Renaming during migration would silently
  break technique input resolution — the single worst fidelity hazard in this whole design space.
- **(j) TOON `technique_args` → typed `bindings`:** same per-step deviation map, now keyed by the
  callee contract's input ids (tsc-checked). Reader maps `technique_args` 1:1. (Project policy
  prefers canonical renames over bridging args, but the *reader* must still represent existing
  corpus args faithfully.)
- **(k) Explicit `end()`:** authoring form for IR `Terminate` (R-IR-2 row 9) and the counterpart
  of TOON route-branches without `transitionTo`.

---

## 2. Topology decision table (every legacy primitive)

| Legacy primitive / construct | Source | Verdict | New-surface counterpart | Justification |
|---|---|---|---|---|
| Workflow | workflow.schema | **keep** | `workflow(id, version, body)` | (g); session/variable/mode/executionModel scope |
| Activity | both lineages | **keep** | `wf.activity(id, opts?, body)` → `ActivityHandle` | (g); dispatch/checkpoint/prefix/transition unit |
| `activitiesDir` / separate activity files | TOON repos | **dissolve** | activities declared in the workflow builder (or per-file modules composed by import) | host module system replaces the file-pointer field; ordinal preserved via declaration order / `{ordinal}` |
| Step (trivial) | Orchestra `description:` only | **keep** | `a.step(id, {description})` | 1:1 |
| Step (technique-backed) | Orchestra `skill:` / TOON `technique` | **keep** (field renamed) | `a.step(id, {description, technique: '<::path>', bindings?})` | (h); address is a registry-keyed literal type |
| Step `technique_args` | TOON | **replace** | `bindings` typed by callee contract inputs | (j) |
| Step `when` / `condition` | TOON dual forms | **replace** | single `when?: BoolExpr` | (d); reader parses both legacy forms |
| Step `checkpoint` (yield-before-step) | TOON | **keep** | `checkpoint: CheckpointNode \| string` | 1:1 |
| Step `actions`, `required`, `triggers` | TOON | **keep** | same-named fields | 1:1 |
| Decision: interactive (`message:`) | Orchestra | **split** | `a.ask(id, message, branches?)` | (b); DEC-003 by construction |
| Decision: branchless interactive (ack gate) | Orchestra SPEC:116 | **keep** | `a.ask(id, message)` (no branches arg) | arity-discriminated, 1:1 |
| Decision: `variable:` match | Orchestra | **split** | `a.match(id, operand, {...,'default'?})` | (b); DEC-004 by construction |
| Decision: `condition:` boolean | Orchestra | **split** | `a.when(id, expr, {true, false?})` | (b) |
| Decision self-reference (retry) | Orchestra DEC-002 | **keep** | `(self) => ({branch: [..., self.retry]})` callback form | value-safe self-edge; identical IR |
| Decision (TOON automated, transition-table) | activity.schema | **keep** | `a.route(id, {name, branches: RouteBranch[]})` | distinct primitive; collapsing = restructuring |
| Loop forEach (flow body) | Orchestra | **keep** | `a.forEach(id, {variable, over, maxIterations?}, (loop) => body)` | (c) |
| Loop while / doWhile / `breakCondition` / `activities[]` body | TOON | **keep** | `a.whileLoop` / `a.doWhile` / `breakCondition` opt / `{activities}` body | 1:1; Orchestra-only corpus never emits them |
| `- break` | Orchestra | **replace (dual form)** | `loop.break` token (idiomatic) + `breakLoop()` sentinel (transpiler default) | (c); shared-flow-multi-loop case forces the sentinel |
| `- loop: <self>` re-entry | Orchestra SPEC:794 | **replace** | `loop.restart` | value-safe self-edge |
| Flow (named) | Orchestra `flows:` | **modify** | `a.flow(id, ...items)` → `FlowBlock` value, eagerly registered | (a); ids retained; declare-then-reference table dissolves into consts |
| `main` flow | FLOW-001 | **keep** | `a.main(...items)` (≡ `a.flow('main', …)` + entry) | 1:1 |
| FlowItem refs `- step/- decision/- loop/- flow` | Orchestra | **dissolve** | node values in arrays (+ `a.byId.*` escape) | (a); declare-once-reference-many preserved as value sharing |
| `- flow: continue` | Orchestra SPEC:292 | **replace** | `passThrough()` | author-intent-preserving no-op |
| `- message:` | Orchestra | **keep** | `msg('text with {tokens}')` | 1:1; interpolation now compile-checked (INTERP-101) |
| `- activity:` (layered terminal) | Orchestra TERM-001 | **keep** | `goTo(target)` (`ActivityHandle \| id`) | 1:1; also the transition/effect target form |
| implicit activity end / TOON terminal route branch | both | **keep (made explicit)** | `end()` → IR `Terminate` | R-IR-2 row 9 |
| `inputs:` (activity) | Orchestra | **keep** | `a.inputs(...symbols/qualified/handles)` | (e) |
| Qualified `NN.step-id.name` | PROV-002 | **keep + sugar** | `qualified('NN.s.n')` string + `handle.output(s, n)` | (e) |
| Boolean string algebra / structured Condition / `when` strings | all three | **replace** | `BoolExpr` builders | (d); strings live only in the legacy reader |
| 4-level scope chain | SCOPE-001 | **keep (runtime semantics)** | unchanged; `ref()` reads it by name | R-BIND: exact preservation |
| Checkpoint (+options/effects/blocking/autoAdvanceMs/defaultOption/condition) | TOON | **keep** | `a.checkpoint(id, def)`; blocking/non-blocking discriminated union | 1:1; CHK family typed |
| Checkpoint option effects (`setVariable`/`transitionTo`/`skipActivities`) | TOON | **keep** | same record shape (targets accept handles) | 1:1 |
| Transitions (ordered, first-match, isDefault) | TOON | **keep** | `a.transitions(transition({when?, to, isDefault?}), …)` — array order = evaluation order | R-RT-2 |
| Triggers (sub-workflow spawn, passContext) | TOON | **keep** | `a.trigger({workflow, passContext?})` / step `triggers` | 1:1; lowers to IR `Dispatch` (agent_id/planning_slug runtime-supplied) |
| Actions (log/validate/set/emit/message) | TOON | **keep** | `ActionDecl` record, same enum | 1:1 |
| entryActions / exitActions | TOON | **keep** | `a.entryActions(...)` / `a.exitActions(...)` | 1:1 |
| Artifacts (name template, location, create/update) | TOON | **keep** | `a.artifact(id, {name, location?, action?})` | 1:1; `{token}` + `{n}`/`{decision-title}` specials checked |
| `artifactPrefix` | TOON readOnly | **dissolve (authoring)** | none — recomputed from ordinal at compile, present in IR | server-computed today |
| Variables / modes / artifactLocations / initialActivity / executionModel / rules / techniques refs | workflow.schema + README | **keep** | `wf.variables/modes/artifactLocations/initialActivity/executionModel/rules/techniques` | R-X-5; executionModel made first-class (schema drift resolved) |
| recognition / problem / outcome / context_to_preserve / estimatedTime / required | TOON activity | **keep** | same-named builder fields | 1:1; recognition enables independent-entry activities |
| Resource refs (bare slug / `wf/slug` / `#anchor` / mode path form) | resource model | **keep** | `resource('slug' \| 'wf/slug#anchor')` → `ResourceRef`; mode `resource` accepts it or legacy path | reader normalizes the path-style third form |
| Technique `::` addressing, current-then-meta, rule segments, `group-*` | technique protocol | **keep** | registry-keyed literal types (generated) | locked decision 2 |
| Governance (approve/gate/delegate, roles) | design spec Phase 2+ | **reserve** | declared, compiler-rejected (GOV-001) in Phase 1 | R-IR-4/R-SCOPE-2 |

---

## 3. Authoring-surface d.ts sketch (L1 normative declarations)

```ts
// ============================================================================
// wp-dsl — authoring surface (Lens C). Module 'wp-dsl'.
// The artifact executes ONCE in the deterministic sandbox; every call below
// RECORDS definition structure. Nothing here survives to workflow runtime.
// ============================================================================

// ---------- lexical brands ----------
/** kebab-case node id (legacy Id grammar: ^[a-z][a-z0-9-]*$). Validated at builder run. */
export type NodeId = string;
/** symbol id bound to runtime variables by EXACT string match — preserved verbatim.
 *  snake_case for new authoring (ID-102 WARN otherwise; legacy-compat exempt). */
export type SymbolId = string;
export type SemVer = `${number}.${number}.${number}`;
/** PROV-002 qualified cross-activity reference. */
export type QualifiedRefString = `${number}.${string}.${string}`;
export type Scalar = string | number | boolean | null;
export type Json = Scalar | Json[] | { [k: string]: Json };
/** message / artifact-name text; `{token}` occurrences are INTERP-checked at compile. */
export type InterpolatedText = string;

// ---------- value & condition expressions ----------
declare const VAR: unique symbol;
export interface VarRef<T = unknown> {
  readonly [VAR]: 'var';
  readonly name: string;               // verbatim symbol id (dotted path allowed)
  /** dotted-path read into an object variable, e.g. v.validation_results.path('validation_passed') */
  path(dotted: string): VarRef<unknown>;
}
export interface OutputHandle<Name extends string = string> {
  readonly [VAR]: 'output';
  readonly qualified: QualifiedRefString;   // lowers to NN.step-id.name
}
export type Operand = VarRef | OutputHandle | QualifiedRefString;

/** by-name scope-chain read (local flow > loop var > activity > workflow). SCOPE-002 compile-checked. */
export function ref(name: SymbolId): VarRef;
/** qualified-string escape hatch; compile-checked against the producing activity (PROV-001/002). */
export function qualified(ref: QualifiedRefString): OutputHandle;

export interface BoolExpr { readonly [VAR]: 'bool'; }
export function eq(v: Operand, value: Scalar): BoolExpr;
export function ne(v: Operand, value: Scalar): BoolExpr;
export function gt(v: Operand, value: number): BoolExpr;   // TOON condition.schema operators
export function lt(v: Operand, value: number): BoolExpr;
export function gte(v: Operand, value: number): BoolExpr;
export function lte(v: Operand, value: number): BoolExpr;
export function exists(v: Operand): BoolExpr;
export function notExists(v: Operand): BoolExpr;
export function and(...e: [BoolExpr, BoolExpr, ...BoolExpr[]]): BoolExpr;
export function or(...e: [BoolExpr, BoolExpr, ...BoolExpr[]]): BoolExpr;
export function not(e: BoolExpr): BoolExpr;

// ---------- generated technique contracts (shape; see §4) ----------
export interface InputSpec {
  readonly required: boolean;
  readonly default?: Scalar;              // '#### default' presence ⇒ required:false + literal
  readonly components?: readonly string[]; // documentary member names
}
export interface ArtifactSpec<Tokens extends string = string> {
  readonly name: string;                  // literal or '{token}' template
  readonly action: 'create' | 'update';
  readonly tokens: readonly Tokens[];     // extracted; each must resolve at binding scope
}
export interface OutputSpec { readonly artifact?: ArtifactSpec; readonly components?: readonly string[]; }
export interface TechniqueContract {
  readonly address: string;               // canonical '::' path (workflow-relative key)
  readonly version: string;
  readonly shape: 'standalone' | 'container' | 'nested' | 'workflow-root';
  readonly inputs: { readonly [id: SymbolId]: InputSpec };
  readonly outputs: { readonly [id: SymbolId]: OutputSpec }; // same id may appear in both maps
  readonly rules: string;                 // literal union of rule names ('.' citation / group-* sets)
}
/** Per-workflow resolved namespace (own-shadows-meta, slashes normalized, groups expanded),
 *  emitted by the contract generator via module augmentation. */
export interface Registry { /* augmented: { 'work-package': { 'domain-question': {...}, ... } } */ }
type TR<W extends keyof Registry> = Registry[W];

// ---------- flow items ----------
declare const ITEM: unique symbol;
export interface FlowItem { readonly [ITEM]: string; }
export interface TerminalItem extends FlowItem { readonly terminal: true; }   // TERM-002 partition
export interface StepNode<C extends TechniqueContract | undefined = undefined> extends FlowItem {
  readonly id: NodeId;
  /** typed output refs for same-activity wiring; lower to bare symbol names */
  readonly outputs: C extends TechniqueContract
    ? { readonly [K in keyof C['outputs'] & string]: VarRef } : {};
}
export interface DecisionNode extends FlowItem { readonly id: NodeId; }
export interface LoopNode extends FlowItem { readonly id: NodeId; }
export interface FlowBlock extends FlowItem { readonly id: NodeId; }
export interface CheckpointNode extends FlowItem { readonly id: NodeId; }

/** inline message ('- message:'); lowers to EmitMessage. */
export function msg(text: InterpolatedText): FlowItem;
/** activity transition ('- activity:'); layered terminal — exits loop+flow+activity (TERM-001). */
export function goTo(target: ActivityHandle | NodeId): TerminalItem;
/** explicit completion; lowers to Terminate. */
export function end(): TerminalItem;
/** legacy '- flow: continue' — annotated no-op pass-through. */
export function passThrough(): FlowItem;
/** dynamic-innermost break — exact legacy semantics ('- break'); LOOP-002 compile-checked.
 *  Transpiler default. Prefer loop.break in new authoring. */
export function breakLoop(): TerminalItem;

// ---------- workflow ----------
export function workflow<W extends keyof Registry & string>(
  id: W, version: SemVer, body: (wf: WorkflowBuilder<TR<W>>) => void): WorkflowDefinition;

export interface WorkflowDefinition { readonly id: string; readonly version: SemVer; }

export interface VariableDecl {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string; defaultValue?: Json; required?: boolean;
}
type VarHandles<S extends Record<string, VariableDecl>> = {
  readonly [K in keyof S & string]: VarRef<
    S[K]['type'] extends 'string' ? string : S[K]['type'] extends 'number' ? number :
    S[K]['type'] extends 'boolean' ? boolean : S[K]['type'] extends 'array' ? readonly unknown[] : object>;
};

export interface RoleDecl { readonly id: string; readonly description: string; }
export interface RoleRef { readonly roleId: string; }   // Phase-2 policy anchor (R-GOV-2)

export interface ModeDecl {
  id: NodeId; name: string; description?: string;
  activationVariable: VarRef | SymbolId;
  recognition?: string[]; skipActivities?: (NodeId | ActivityHandle)[];
  defaults?: Record<SymbolId, Json>;
  resource?: ResourceRef | string;        // legacy path form accepted by reader, normalized
}

export interface WorkflowBuilder<T> {
  title(t: string): void; description(d: string): void;
  author(a: string): void; tags(...t: string[]): void;
  rules(...r: string[]): void;
  /** first-class (resolves workflow.schema drift); returns role handles keyed by role id. */
  executionModel<R extends readonly RoleDecl[]>(def: { roles: R })
    : { readonly [K in R[number]['id']]: RoleRef };
  variables<S extends Record<string, VariableDecl>>(spec: S): VarHandles<S>;
  modes(...modes: ModeDecl[]): void;
  artifactLocations(locs: Record<string,
    string | { path: InterpolatedText; description?: string; gitignored?: boolean }>): void;
  techniques(refs: { primary?: keyof T & string; supporting?: (keyof T & string)[] }): void;
  activity(id: NodeId, body: (a: ActivityBuilder<T>) => void): ActivityHandle;
  activity(id: NodeId, opts: { version?: SemVer; ordinal?: number },
           body: (a: ActivityBuilder<T>) => void): ActivityHandle;
  /** required unless every activity is an independent entry point (WF-101). */
  initialActivity(a: ActivityHandle | NodeId): void;
}

export interface ActivityHandle {
  readonly id: NodeId; readonly ordinal: number;
  /** typed qualified cross-activity ref → 'NN.step-id.name' (PROV-002 by construction). */
  output(stepId: NodeId, name: SymbolId): OutputHandle;
}

// ---------- activity ----------
export interface TrivialStepDef {
  description: string;
  when?: BoolExpr; checkpoint?: CheckpointNode | NodeId; required?: boolean;
  actions?: ActionDecl[]; triggers?: TriggerDecl[];
}
export interface TechniqueStepDef<T, A extends keyof T & string> extends TrivialStepDef {
  technique: A;
  /** explicit per-step bindings (successor of technique_args): keys ⊆ contract inputs (tsc);
   *  unlisted inputs resolve implicitly by name through the scope chain (PROV-001 compile pass). */
  bindings?: { [K in keyof (T[A] & TechniqueContract)['inputs']]?: Operand | Scalar };
}

export type MatchBranches = { [literal: string]: FlowItem[] } & { default?: FlowItem[] };
export interface DecisionSelf { readonly retry: FlowItem; }   // self-edge ('- decision: <self>')

export interface RouteBranch {          // TOON-corpus automated decision branch
  id: NodeId; label: string; when?: BoolExpr;
  to?: ActivityHandle | NodeId;         // omitted ⇒ terminal branch ⇒ Terminate
  isDefault?: boolean;
}

export interface LoopHandle {
  readonly var: VarRef;                 // iteration variable (scope level 2)
  readonly break: TerminalItem;         // exits THIS loop only (LOOP-101: innermost-only)
  readonly restart: FlowItem;           // re-enter this loop
}
export type LoopBody = FlowBlock | FlowItem[] | { activities: (NodeId | ActivityHandle)[] };

export type CheckpointDef = {
  name: string; message: InterpolatedText;
  condition?: BoolExpr;                 // presentation gate; absent ⇒ condition_not_met invalid
  options: readonly [CheckpointOption, ...CheckpointOption[]];
  required?: boolean;
} & (
  | { blocking?: true; defaultOption?: never; autoAdvanceMs?: never }   // CHK-101 typed
  | { blocking: false; defaultOption: string; autoAdvanceMs?: number }
);
export interface CheckpointOption {
  id: NodeId; label: string; description?: string;
  effect?: {
    setVariable?: Record<SymbolId, Json>;
    transitionTo?: ActivityHandle | NodeId;
    skipActivities?: (ActivityHandle | NodeId)[];
  };
}

export interface TransitionDecl { readonly [ITEM]: 'transition'; }
/** ordered, first-match-wins (R-RT-2); at most one isDefault, last (TRN-102). */
export function transition(def: { when?: BoolExpr; to: ActivityHandle | NodeId; isDefault?: boolean }): TransitionDecl;

export interface ActionDecl {
  action: 'log' | 'validate' | 'set' | 'emit' | 'message';
  target?: SymbolId | VarRef; message?: InterpolatedText; value?: Json;
  description?: string; condition?: BoolExpr;
}
export interface TriggerDecl {          // lowers to IR Dispatch (workflow_id authored;
  workflow: string;                     // agent_id/planning_slug runtime-supplied — R-RT-5)
  description?: string; passContext?: SymbolId[];
}
export interface ArtifactDecl {
  name: InterpolatedText;               // '{var}' + specials '{n}', '{decision-title}'; bare name
  location?: string;                    //   gets '<ordinal>-' prefix at write time (recomputed)
  description?: string; action?: 'create' | 'update';
}
export interface ResourceRef { readonly ref: string; }
/** 'slug' | 'workflow/slug' | either + '#heading-anchor' */
export function resource(ref: string): ResourceRef;

export interface ActivityBuilder<T> {
  description(d: string): void; problem(p: string): void;
  recognition(...patterns: string[]): void;        // independent-entry activities
  outcome(...o: string[]): void; contextToPreserve(...c: string[]): void;
  required(b: boolean): void; estimatedTime(t: string): void;
  rules(...r: string[]): void;
  techniques(refs: { primary?: keyof T & string; supporting?: (keyof T & string)[] }): void;
  inputs(...refs: (SymbolId | QualifiedRefString | OutputHandle)[]): void;

  step(id: NodeId, def: TrivialStepDef): StepNode;
  step<A extends keyof T & string>(id: NodeId, def: TechniqueStepDef<T, A>)
    : StepNode<T[A] & TechniqueContract>;

  /** interactive decision; no branches arg ⇒ branchless acknowledgment gate. */
  ask(id: NodeId, message: InterpolatedText): DecisionNode;
  ask(id: NodeId, message: InterpolatedText,
      branches: Record<string, FlowItem[]> | ((self: DecisionSelf) => Record<string, FlowItem[]>)): DecisionNode;
  /** programmatic multi-way match; reserved 'default' key; absence ⇒ DEC-001 WARN + runtime pass-through. */
  match(id: NodeId, variable: Operand,
        branches: MatchBranches | ((self: DecisionSelf) => MatchBranches)): DecisionNode;
  /** programmatic boolean decision; false optional (pass-through), per grammar EBNF:65. */
  when(id: NodeId, condition: BoolExpr,
       branches: { true: FlowItem[]; false?: FlowItem[] }
                | ((self: DecisionSelf) => { true: FlowItem[]; false?: FlowItem[] })): DecisionNode;
  /** TOON automated decision (transition table); ≥2 branches (RTE-101). */
  route(id: NodeId, def: { name: string; description?: string;
        branches: [RouteBranch, RouteBranch, ...RouteBranch[]] }): DecisionNode;

  forEach(id: NodeId, opts: { variable: SymbolId; over: Operand;
          maxIterations?: number; breakCondition?: BoolExpr; description?: string },
          body: (loop: LoopHandle) => LoopBody): LoopNode;
  whileLoop(id: NodeId, opts: { condition: BoolExpr; variable?: SymbolId;
            maxIterations?: number; breakCondition?: BoolExpr; description?: string },
            body: (loop: LoopHandle) => LoopBody): LoopNode;
  doWhile(id: NodeId, opts: { condition: BoolExpr; variable?: SymbolId;
          maxIterations?: number; breakCondition?: BoolExpr; description?: string },
          body: (loop: LoopHandle) => LoopBody): LoopNode;

  checkpoint(id: NodeId, def: CheckpointDef): CheckpointNode;
  artifact(id: NodeId, def: ArtifactDecl): void;
  trigger(def: TriggerDecl): void;
  entryActions(...a: ActionDecl[]): void;
  exitActions(...a: ActionDecl[]): void;

  /** named reusable block; eagerly registered (FLOW-002 orphan WARN parity). */
  flow(id: NodeId, ...items: FlowItem[]): FlowBlock;
  /** the entry flow (FLOW-001); exactly one per activity. */
  main(...items: FlowItem[]): void;
  /** ordered activity transitions, first-match (R-RT-2). */
  transitions(...t: TransitionDecl[]): void;

  /** lazy by-id references — forward/cyclic graphs; resolved at finalize (ERROR if dangling). */
  readonly byId: {
    step(id: NodeId): FlowItem; decision(id: NodeId): FlowItem;
    loop(id: NodeId): FlowItem; flow(id: NodeId): FlowItem;
  };

  // ----- RESERVED, Phase 2+ (R-IR-4 / R-SCOPE-2). Typed for forward-compat;
  // ----- Phase-1 compiler rejects with GOV-001 ERROR. No control-flow reshaping needed later:
  /** @reserved layers on Checkpoint → IR RequireApproval */
  approve(id: NodeId, def: { role: RoleRef; message: InterpolatedText;
          options?: CheckpointOption[] }): CheckpointNode;
  /** @reserved → IR CapabilityGate */
  gate(id: NodeId, def: { capabilities: string[];
       onViolation?: 'deny' | 'fail_node' | 'fail_workflow' | 'escalate' | 'nudge' }): FlowItem;
  /** @reserved layers on Dispatch → IR Delegate */
  delegate(id: NodeId, def: { role: RoleRef; workflow: string;
           passContext?: SymbolId[] }): FlowItem;
}
```

## 4. Generated technique contract — shape and type-check story

Generator input: the existing markdown loader semantics (`src/loaders/markdown-technique-loader.ts`
`parseEntrySubsections`: plural `## Inputs`/`## Outputs` headers, `### <id>` entries,
`*(optional)*` prose marker, reserved `#### default` (inputs) / `#### artifact` (outputs),
`#### <member>` components, `### <rule-name>` under `## Rules`). Output: one ambient module per
workflow, augmenting `Registry` with the workflow's **resolved namespace** — own techniques
shadowing meta, slash forms normalized to `::`, `group-*` expansions materialized as rule-name
unions, contract composition (keyed-section union, local wins) pre-applied along the EXECUTING
workflow's ancestor chain (workflow-root `TECHNIQUE.md` + group containers). Per-workflow
pre-composition is chosen over the generic-composition encoding because it gives tsc flat literal
key maps (simpler errors for LLM authors); cost: regenerate dependent workflows when meta changes
(the generator stamps source hashes; staleness is compile ERROR CON-101).

```ts
// GENERATED from workflows/work-package/**/*.md + workflows/meta — DO NOT EDIT. hash:sha256:…
declare module 'wp-dsl' {
  interface Registry {
    'work-package': {
      'domain-question': {
        address: 'domain-question'; version: '1.0.0'; shape: 'standalone';
        inputs: {
          /** The domain currently being elicited. */
          'current-domain': { required: true };
          /** *(optional)* Accumulated Q/A log. */
          'elicitation-log': { required: false };
          // + inherited workflow-root entries (planning_folder_path, …), local wins
        };
        outputs: { 'question-text': {}; 'user-response': {} };
        rules: never;
      };
      'gitnexus-operations::impact': {
        address: 'gitnexus-operations::impact'; version: '2.1.0'; shape: 'nested';
        inputs: { /* composed: container + root entries unioned, local wins */ };
        outputs: { /* … */ };
        rules: 'query-not-grep' | 'detect-changes-after-edit' | 'index-freshness-first' | 'must-use-operations';
      };
      // … every addressable technique; workflow-root 'TECHNIQUE' excluded from keys (not invocable)
    };
  }
}
```

What tsc checks end-to-end (the rest stays compiler passes, §6):

1. **Address validity** — `technique:` must be a key of the workflow's registry slice; the runtime
   `unresolved` bundle bucket becomes unrepresentable for DSL-authored artifacts (ADDR-101 at tsc).
2. **Binding-key conformance** — `bindings` keys ⊆ contract input ids (excess-property check);
   value positions accept `Operand | Scalar`. Same for `wf.techniques`/`a.techniques` refs.
3. **Typed output wiring** — `stepNode.outputs.<id>` only exists for declared outputs; misspelled
   same-activity wiring is a type error.
4. **Both-direction symbols** — inputs and outputs are separate keyed maps over one symbol
   vocabulary, so idempotent-resolver symbols (same id in both) type cleanly.
5. **Rule citations** — `'.'`-citation and rule-segment forms validate against the `rules` union.

Not hoisted to tsc (deliberately, Lens C): implicit by-name input resolution through the 4-level
scope chain — that is PROV-001's compile pass over the lowered IR, using the same generated
contracts as data. Hoisting it would require modeling the whole scope chain in the type system,
restructuring the builder for no parity gain.

## 5. Complete port — `requirements-elicitation` (orchestra-specification.md:686-836)

Every step (8), decision (7, all three kinds, incl. branchless-adjacent empty branches, self-ref
retry, mode branching), the loop (with break/restart), both flows, both messages, all activity
inputs, and every legacy annotation are carried over. Ids and symbol strings are byte-identical
to the legacy source (Lens C: no kebab→snake renaming — symbols bind by exact string match).

```ts
import {
  workflow, msg, goTo, ref, qualified, eq, ne, and,
} from 'wp-dsl';

export default workflow('work-package', '3.0.0', (wf) => {
  const v = wf.variables({
    mode: { type: 'string', description: 'implement | review' },   // workflow-level (scope L4)
  });

  // Activity 01 (issue intake: create-issue / check-issue) is outside the §3.4 excerpt, as in
  // the legacy source; its outputs are referenced below via qualified() — the string escape —
  // exactly mirroring the legacy qualified ids. With activity 01 in scope this would be
  //   act01.output('check-issue', 'issue-platform')  (typed handle form).

  wf.activity('requirements-elicitation', { version: '3.0.0', ordinal: 2 }, (a) => {
    a.description('Discover and clarify what the work package should accomplish through structured sequential conversation.');

    // Activity-level inputs: external data only [PROV-001, PROV-002]
    a.inputs(
      'raw-responses',
      qualified('01.create-issue.issue-number'),
      qualified('01.check-issue.issue-platform'),
    );

    // ===== steps ======================================================= [SYM-001]
    const stakeholderDiscussion = a.step('stakeholder-discussion', {
      description: 'Prompt user to initiate discussion with key stakeholders.',
    }); // trivial step — no technique binding

    const askQuestion = a.step('ask-question', {                       // [PROV-001]
      description: 'Present ONE question from current domain. Wait for response.',
      technique: 'domain-question',
      // inputs [current-domain, elicitation-log] resolve implicitly: loop var + scope chain
      // outputs [question-text, user-response] injected into scope (askQuestion.outputs.*)
    });

    const recordResponse = a.step('record-response', {
      description: 'Capture answer or mark as skipped. Adapt follow-up.',
      technique: 'response-capture',
      // inputs [user-response, current-domain] ← local flow + loop var (implicit)
      // output [elicitation-log] injected; accumulates across iterations
    });

    const collectAssumptions = a.step('collect-assumptions', {
      description: 'Identify assumptions made when interpreting user responses.',
      technique: 'assumptions-review',
      // input [raw-responses] ← activity inputs (implicit)
    });

    const postAssumptionsToJira = a.step('post-assumptions-to-jira', {
      description: 'Prepare assumptions as Jira comment, get approval, post to ticket.',
      technique: 'jira-comment',
      // input [categorized-assumptions] ← local flow; [issue-number] qualified in technique def
    });

    const postAssumptionsToGithub = a.step('post-assumptions-to-github', {
      description: 'Post assumptions as GitHub issue comment.',
      technique: 'github-comment',
    });

    const createDocument = a.step('create-document', {
      description: 'Create requirements document using elicitation output template.',
      technique: 'artifact-management',
    });

    const updateAssumptionsLog = a.step('update-assumptions-log', {
      description: 'Add requirements-phase assumptions to the assumptions log.',
      technique: 'assumptions-log-update',
    });

    // ===== decisions ===================================================
    // Mode branching — workflow-level variable (match form)
    const modeElicitationPath = a.match('mode-elicitation-path', v.mode, {
      implement: [stakeholderDiscussion],
      review: [goTo('implementation-analysis')],                       // [TERM-001]
    }); // no 'default' key ⇒ DEC-001 WARN, runtime pass-through — severity parity preserved

    // Interactive — user provides transcript; empty branch = pass-through
    const stakeholderTranscript = a.ask('stakeholder-transcript',
      'Provide the stakeholder transcript or summary here.', {
        'provide-transcript': [stakeholderDiscussion],
        'skip-discussion': [],                                         // empty = pass-through
      });

    // Interactive — self-referencing retry [DEC-002]
    const jiraCommentReview = a.ask('jira-comment-review',
      'Review the Jira comment before posting.', (self) => ({
        'post-comment': [],                                            // empty = pass-through
        'edit-comment': [postAssumptionsToJira, self.retry],           // [DEC-002] self-ref
        'skip-posting': [],
      })); // compile pass proves ≥1 transitively non-recursive exit branch

    // Programmatic — route by platform (match on qualified cross-activity ref)
    const platformRouting = a.match('platform-routing',
      qualified('01.check-issue.issue-platform'), {
        jira: [postAssumptionsToJira, jiraCommentReview],
        github: [postAssumptionsToGithub],
      }); // no default ⇒ DEC-001 WARN (verbatim legacy annotation)

    // ===== loop ======================================================== [LOOP-001]
    const domainIteration = a.forEach('domain-iteration', {
      variable: 'current-domain',
      over: ref('question-domains'),       // by-name scope-chain read, SCOPE-002 checked
      maxIterations: 5,
    }, (loop) => {
      // Interactive — mid-loop user intent; break tokens [LOOP-002/003 by construction]
      const userIntent = a.ask('user-intent', 'How would you like to proceed?', {
        answered: [recordResponse],                                    // rejoins
        'skip-question': [],                                           // empty = pass-through
        'skip-domain': [loop.break],
        done: [loop.break],
      });

      // Interactive — end-of-domain control; {current-domain} interpolation INTERP-checked
      const domainComplete = a.ask('domain-complete',
        "Domain '{current-domain}' complete.", {
          'next-domain': [],                                           // empty = pass-through
          revisit: [loop.restart],                  // legacy '- loop: domain-iteration'
          'finish-early': [loop.break],                                // [LOOP-003]
        });

      // legacy flow id preserved for round-trip + FLOW-002 reference accounting
      return a.flow('domain-body',                                     // [FLOW-002]
        askQuestion,
        userIntent,
        domainComplete,
      );
    });

    // Programmatic — boolean algebra (condition form)
    const requirementsConfirmed = a.when('requirements-confirmed',
      and(
        eq(ref('elicitation-complete'), true),
        ne(ref('requirements-document'), null),
      ), {
        true: [goTo('research')],                                      // [TERM-001]
        false: [stakeholderTranscript],          // retry — by-value backward reference
      });

    // ===== main flow =================================================== [FLOW-001]
    a.main(
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
    );
  });
});
```

Trace-diff alignment: every id in the legacy file (`requirements-elicitation`,
`stakeholder-discussion` … `domain-iteration`, `main`, `domain-body`, all branch keys) appears
verbatim; declare-once/reference-many is preserved as value sharing (`stakeholderDiscussion` and
`postAssumptionsToJira` each referenced from two branch sites, exactly like legacy); the lowered
IR is node-for-node the legacy reader's output. Mechanical-transpiler variant: identical except
`breakLoop()` replaces `loop.break` / `a.byId.loop('domain-iteration')` replaces `loop.restart`
(zero-analysis policy, §6.6), with the decisions emitted at activity level instead of inside the
loop callback.

## 6. Constraint disposition table

Legend: **DBC** discharged-by-construction (unrepresentable) · **TSC** checked by tsc ·
**CMP** wp-dsl compile pass (severity preserved) · **IR** checked over canonical IR (Alloy L3).

| Rule | Legacy sev | Disposition | Detail |
|---|---|---|---|
| PROV-001 | ERROR | CMP (+TSC partial) | implicit by-name inputs: scope-chain pass over lowered IR using generated contracts; explicit `bindings` keys/values: TSC |
| PROV-002 | ERROR | DBC for `handle.output()` / TSC template-literal for `qualified()` / CMP existence (ordinal, step, output name) | |
| SYM-001..004 | ERROR | CMP (builder-registration fail-fast) | ids stay author-supplied strings (R-PAR-3) ⇒ collisions representable; duplicate registration throws during the sandbox run |
| FLOW-001 | ERROR | CMP (finalize: `a.main` called exactly once) | |
| FLOW-002 | WARN | CMP (registered FlowBlock unreachable from main/loop bodies) + tsc noUnusedLocals assist | exact severity parity |
| FLOW-003 | ERROR | DBC for values; CMP for `a.byId.flow()` escape | |
| LOOP-001 | ERROR | DBC (body is a value) | |
| LOOP-002 | ERROR | DBC for `loop.break` token; CMP for `breakLoop()` sentinel (reachable only via loop bodies) | |
| LOOP-003 | INFO | DBC for token (belongs to exactly one loop) + new LOOP-101; INFO diagnostic retained for sentinel | |
| DEC-001 | WARN | CMP (`match` without `default` key) | runtime pass-through semantics unchanged |
| DEC-002 | ERROR | CMP (transitive closure over branch values + `self.retry` tokens + byId edges) | |
| DEC-003 | ERROR | **DBC** (`ask` has no variable/condition parameter) | |
| DEC-004 | ERROR | **DBC** (`match`/`when` take exactly one discriminator) | |
| TERM-001 | INFO | N/A semantics preserved (`goTo` typed `TerminalItem`); INFO doc retained | |
| TERM-002 | ERROR | CMP (unreachable-items-after-terminal in a branch/flow) + TSC partial (`TerminalItem` type distinction) | rejoin-unless-terminal semantics fixed in lowering |
| SCOPE-001 | INFO | N/A — runtime resolution order preserved verbatim in IR semantics (R-BIND) | |
| SCOPE-002 | ERROR | DBC for `VarRef`/`OutputHandle` operands; CMP for `ref()` by-name escape | |

**New rule families this surface needs:**

| ID family | Sev | Checks |
|---|---|---|
| ADDR-1xx | ERROR | technique address ∈ registry (TSC; CMP re-verifies post-generation); rule-segment / `group-*` forms resolve; stale registry (CON-101) |
| BIND-1xx | ERROR | binding keys ⊆ contract inputs (TSC); required inputs satisfiable at invocation point (CMP, = PROV-001 refined); binding value kind admissible |
| CHK-1xx | ERROR/WARN | autoAdvanceMs ⇒ blocking:false ∧ defaultOption (TSC union); defaultOption ∈ options (CMP); effect targets exist — transitionTo/skipActivities activities, setVariable symbol declarations (CMP); `condition_not_met` admissibility ⇔ `condition` present (IR/Alloy, runtime contract) |
| TRN-1xx | ERROR/WARN | transition targets exist; ≤1 isDefault and last (TRN-102); transitions after an unconditional/default row unreachable (WARN) |
| RTE-101 | ERROR | `route` ≥2 branches (schema minItems parity) |
| LOOP-101 | ERROR | break/restart token used only in its own loop's body, not in nested loop bodies (forbids multi-level break — semantic-extension guard) |
| ID-1xx | ERROR/WARN | node ids kebab-case (legacy Id grammar) ERROR; symbol ids snake_case WARN (ID-102, legacy-compat exempt — never auto-renamed); ordinal uniqueness/stability; branch keys non-numeric-like (insertion-order determinism guard, ID-103 ERROR) |
| INTERP-1xx | ERROR | `{token}` in messages / checkpoint messages / artifact names / artifactLocation paths resolves in scope (specials `{n}`, `{decision-title}` whitelisted) |
| ART-1xx | ERROR | artifact `location` key ∈ artifactLocations; action ∈ create\|update |
| WF-1xx | ERROR | initialActivity exists (or all activities independent-entry); executionModel ≥1 role, unique role ids; mode activationVariable/skipActivities resolve |
| GOV-001 | ERROR | reserved constructs (`approve`/`gate`/`delegate`) rejected in Phase 1 with a forward-compat message |
| DET-1xx | ERROR | sandbox violations (IO/clock/random/ambient access — trapped, see §7); builder re-run hash mismatch (DET-102: compile runs the artifact twice, byte-compares canonical IR) |
| CON-1xx | ERROR | generated-contract staleness vs markdown hash; markdown loader defects surfacing as contract gaps |

## 7. Compile-pipeline implications

1. **Sandbox (executed builder).** The artifact module is evaluated once per compile in an
   isolated realm (node `vm`/`isolated-vm` class): frozen intrinsics; module graph restricted to
   `'wp-dsl'` plus generated contract modules (ambient types — erased, no runtime body); `Date`,
   `Math.random`, `crypto`, `process`, `fetch`, fs, timers absent or trapped → DET-101 ERROR with
   the offending call site. Determinism relies on ECMA-262-specified string-key insertion order
   (branch/option records); ID-103 forbids numeric-like keys, the one case where insertion order
   is not authorial order. DET-102 double-runs the builder and byte-compares canonical IR.
2. **Canonicalization (L2 EBNF target).** Order-bearing sequences (flow items, branches, options,
   transitions, inputs) serialize in authored order; unordered key sets (variables,
   artifactLocations, contract maps) sort lexicographically; UTF-8 NFC; fixed field order per
   node kind; every node wrapped in `NodeEnvelope { id, node, policy: INERT }` (R-IR-ENV).
   The canonical bytes are the hash/signing target (R-GOV-4) and the trace-diff anchor.
3. **Stable-id strategy.** All author-visible nodes: explicit ids, verbatim → `NodeId =
   <workflow>/<activity>/<kind>:<id>`. Activity ordinals: declaration order, `{ordinal}`
   override; `artifactPrefix` recomputed (`02`), excluded from authoring (parity with server
   behavior). Anonymous items: structural ids `<block-id>#<index>` — identical for the TOON
   reader and the DSL by construction, and absent from the trace-event vocabulary.
4. **Contract generation.** `wp-contracts-gen`: markdown → local contracts → per-workflow
   pre-composed registry (own-shadows-meta; executing-workflow ancestor chain pre-applied;
   `group-*` rule unions materialized; workflow-root excluded from invocable keys). Emits
   source-hash stamps; compile verifies (CON-101). Markdown remains the single source of truth;
   `Initial`/`Final` protocol wrapping and rule text never enter the contract (name algebra only).
5. **Diagnostics model.** Two stages, one report: (i) tsc — address/binding/shape errors mapped to
   ADDR/BIND/CHK codes via a diagnostic-translation layer keyed on branded types; (ii) wp-dsl
   semantic passes over AST/IR emitting `{ruleId, severity, nodeId, sourceLoc}` with legacy
   severities preserved verbatim (P4). Source locations are captured at builder-call time inside
   the sandbox (stack introspection) into a **sidecar source map** — diagnostic metadata only,
   excluded from canonical IR so engine-dependent stack formats cannot perturb hashes.
6. **Legacy reader / transpiler policy (OQ-3 input).** The TOON/Orchestra reader lowers directly
   to the same AST. The one-shot transpiler to DSL text is purely mechanical: per-section constant
   emission in source order; by-value references where backward, `a.byId.*` where forward/cyclic;
   `breakLoop()` always (never loop tokens — zero graph analysis); `skill:`→`technique`;
   condition strings → builder calls; `- flow: continue` → `passThrough()`; ids and symbol
   strings byte-preserved. Golden corpus check: reader-IR ≡ transpiled-DSL-IR, byte-equal after
   canonicalization, then trace-diff vs live server (R-PAR-1/3).
7. **Phase-1 shippability (R-PAR-4).** The whole pipeline (sandbox-eval → AST → rule passes →
   canonical IR + diagnostics) runs with no runtime present; `workflow_compile` is exposed later
   as a governed MCP tool over the same entry point (R-GOV-4).

## 8. Residual risks / notes for synthesis

- Kebab (Orchestra) vs snake (technique protocol) symbol drift is real in the corpus
  (`current-domain` vs design-spec example `issue_number`). This design's verbatim-preservation +
  WARN-lint posture is the only one that cannot break exact-match binding; any lens proposing
  normalization needs a corpus-wide rename audit across technique markdown simultaneously.
- Per-workflow pre-composed registries trade regeneration cost (meta edits fan out) for flat tsc
  ergonomics; the generic-composition alternative (inventory §8 option b) is type-heavier but
  incremental — swappable later without authoring-surface change.
- `route` (TOON decision) and Orchestra decisions coexist as distinct constructors; a future lens
  may unify them once trace parity vs the live server is proven, but unification is a topology
  change with id-mapping consequences — deferred deliberately.
- The `breakLoop()` sentinel and `byId` escapes are load-bearing for mechanical transpile; if
  OQ-3 resolves to "permanent compatibility reader, no transpile", they shrink to authoring
  conveniences and could be demoted in a later major version.
